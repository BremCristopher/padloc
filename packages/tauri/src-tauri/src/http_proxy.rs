use serde::{Deserialize, Serialize};
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize)]
pub struct ProxyRequest {
    pub url: String,
    pub method: String,
    pub headers: Vec<(String, String)>,
    pub body: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProxyResponse {
    pub status: u16,
    pub headers: Vec<(String, String)>,
    pub body: String,
}

#[tauri::command]
pub async fn proxy_request(
    _app: AppHandle,
    request: ProxyRequest,
) -> Result<ProxyResponse, String> {
    // Create HTTP client
    let client = reqwest::Client::builder()
        .danger_accept_invalid_certs(false)
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    // Build request
    let mut req_builder = match request.method.as_str() {
        "GET" => client.get(&request.url),
        "POST" => client.post(&request.url),
        "PUT" => client.put(&request.url),
        "DELETE" => client.delete(&request.url),
        "PATCH" => client.patch(&request.url),
        _ => return Err(format!("Unsupported HTTP method: {}", request.method)),
    };

    // Add headers
    for (key, value) in request.headers {
        // Skip origin and host headers as they'll be set by reqwest
        if key.to_lowercase() != "origin" && key.to_lowercase() != "host" {
            req_builder = req_builder.header(key, value);
        }
    }

    // Add body if present
    if let Some(body) = request.body {
        req_builder = req_builder.body(body);
    }

    // Send request
    let response = req_builder
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    // Get response status
    let status = response.status().as_u16();

    // Collect headers
    let mut headers = Vec::new();
    for (key, value) in response.headers() {
        if let Ok(value_str) = value.to_str() {
            headers.push((key.to_string(), value_str.to_string()));
        }
    }

    // Get response body
    let body = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response body: {}", e))?;

    Ok(ProxyResponse {
        status,
        headers,
        body,
    })
}

#[tauri::command]
pub async fn api_request(
    app: AppHandle,
    url: String,
    body: String,
) -> Result<String, String> {
    // This is a simplified version specifically for the Padloc API
    let request = ProxyRequest {
        url,
        method: "POST".to_string(),
        headers: vec![
            ("Content-Type".to_string(), "application/json".to_string()),
            ("Accept".to_string(), "application/json".to_string()),
        ],
        body: Some(body),
    };

    let response = proxy_request(app, request).await?;

    if response.status >= 200 && response.status < 300 {
        Ok(response.body)
    } else {
        Err(format!("HTTP {}: {}", response.status, response.body))
    }
}
