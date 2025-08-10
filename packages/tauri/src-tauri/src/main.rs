// Prevents additional console window on Windows in release, DO NOT REMOVE!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde_json::json;
use reqwest;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct ProxyRequest {
    url: String,
    method: String,
    headers: serde_json::Value,
    body: Option<String>,
}

#[tauri::command]
async fn api_request(request: ProxyRequest) -> Result<String, String> {
    let client = reqwest::Client::new();
    
    let mut req_builder = match request.method.as_str() {
        "GET" => client.get(&request.url),
        "POST" => client.post(&request.url),
        "PUT" => client.put(&request.url),
        "DELETE" => client.delete(&request.url),
        "PATCH" => client.patch(&request.url),
        _ => return Err(format!("Unsupported method: {}", request.method)),
    };

    // Add headers
    if let Some(headers_obj) = request.headers.as_object() {
        for (key, value) in headers_obj {
            if let Some(val_str) = value.as_str() {
                req_builder = req_builder.header(key, val_str);
            }
        }
    }

    // Add body if present
    if let Some(body) = request.body {
        req_builder = req_builder.body(body);
    }

    // Send request
    match req_builder.send().await {
        Ok(response) => {
            let status = response.status().as_u16();
            let headers = response.headers().clone();
            let body = response.text().await.map_err(|e| e.to_string())?;
            
            let mut headers_map = serde_json::Map::new();
            for (key, value) in headers.iter() {
                if let Ok(val_str) = value.to_str() {
                    headers_map.insert(key.to_string(), json!(val_str));
                }
            }
            
            let result = json!({
                "status": status,
                "headers": headers_map,
                "body": body
            });
            
            Ok(result.to_string())
        }
        Err(e) => Err(e.to_string())
    }
}

#[tauri::command]
async fn test_proxy() -> Result<String, String> {
    Ok("Proxy is working!".to_string())
}

#[tauri::command]
fn test_echo(message: String) -> String {
    format!("Echo: {}", message)
}

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate_handler![
        api_request,
        test_proxy,
        test_echo
    ])
    .setup(|_app| {
        #[cfg(debug_assertions)]
        {
            let window = _app.get_webview_window("main").unwrap();
            window.open_devtools();
        }
        Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
