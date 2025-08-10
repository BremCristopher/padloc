import { ipcMain, net } from "electron";
import { networkLogger } from "./network-logger";

export function setupProxy() {
    // Handle proxy requests from renderer
    ipcMain.handle("proxy-request", async (_event, options: {
        url: string;
        method: string;
        headers?: Record<string, string>;
        body?: string;
    }) => {
        console.log(`[Proxy] ${options.method} ${options.url}`);
        
        // Log the request
        networkLogger.logRequest(options.method, options.url, options.headers, options.body);
        const startTime = Date.now();
        
        try {
            const request = net.request({
                url: options.url,
                method: options.method,
            });

            // Set headers
            if (options.headers) {
                for (const [key, value] of Object.entries(options.headers)) {
                    // Skip origin header to avoid CORS issues
                    if (key.toLowerCase() !== 'origin') {
                        request.setHeader(key, value);
                    }
                }
            }

            // Send body if present
            if (options.body) {
                request.write(options.body);
            }

            return new Promise((resolve, reject) => {
                let responseData = '';
                let statusCode = 0;
                let headers: Record<string, string | string[]> = {};

                request.on('response', (response) => {
                    statusCode = response.statusCode;
                    headers = response.headers;

                    response.on('data', (chunk) => {
                        responseData += chunk.toString();
                    });

                    response.on('end', () => {
                        const duration = Date.now() - startTime;
                        console.log(`[Proxy] Response ${statusCode} for ${options.method} ${options.url}`);
                        
                        // Log the response
                        networkLogger.logResponse(
                            options.url,
                            statusCode,
                            headers as Record<string, string>,
                            responseData.length > 1000 ? responseData.substring(0, 1000) + '...' : responseData,
                            duration
                        );
                        
                        resolve({
                            status: statusCode,
                            headers: headers,
                            body: responseData,
                        });
                    });

                    response.on('error', (error) => {
                        console.error(`[Proxy] Response error:`, error);
                        reject(error);
                    });
                });

                request.on('error', (error) => {
                    console.error(`[Proxy] Request error:`, error);
                    networkLogger.logError(options.url, error.message);
                    reject(error);
                });

                request.end();
            });
        } catch (error) {
            console.error(`[Proxy] Error:`, error);
            throw error;
        }
    });
}
