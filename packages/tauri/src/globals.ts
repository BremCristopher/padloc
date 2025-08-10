import { App } from "@padloc/core/src/app";
import { getPlatform } from "@padloc/core/src/platform";
import { Router } from "@padloc/app/src/lib/route";
import { Err, ErrorCode } from "@padloc/core/src/error";
import { marshal, unmarshal } from "@padloc/core/src/encoding";
import { Request, Response, Sender, RequestProgress } from "@padloc/core/src/transport";
import { translate as $l } from "@padloc/locale/src/translate";

// Define invoke function - it will be available at runtime in Tauri environment
declare global {
    interface Window {
        __TAURI_INTERNALS__?: {
            invoke(cmd: string, args?: any): Promise<any>;
        };
    }
}

// Use a fallback for development/testing
const invoke = async <T = any>(cmd: string, args?: any): Promise<T> => {
    if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
        return window.__TAURI_INTERNALS__.invoke(cmd, args);
    }
    // Try using the @tauri-apps/api if available
    try {
        // @ts-ignore
        const tauriAPI = await import('@tauri-apps/api/core');
        return tauriAPI.invoke(cmd, args);
    } catch (e) {
        throw new Error('Tauri API not available');
    }
};

/**
 * Tauri-specific AJAX sender that uses Tauri invoke to proxy requests through Rust
 * This completely bypasses browser CORS restrictions
 */
class TauriInvokeAjaxSender implements Sender {
    constructor(public url: string) {}

    async send(req: Request, _progress?: RequestProgress): Promise<Response> {
        const body = marshal(req.toRaw());
        
        try {
            // Use Tauri invoke to send the request through Rust
            const result = await invoke<string>('api_request', {
                request: {
                    url: this.url,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Client-Type': 'tauri',
                        'X-Original-Origin': window.location.origin
                    },
                    body: body
                }
            });
            
            // Parse the result from the Rust proxy
            const proxyResponse = JSON.parse(result);
            
            // Check the status code
            if (proxyResponse.status >= 400) {
                if (proxyResponse.status === 404) {
                    throw new Err(ErrorCode.NOT_FOUND, "Resource not found");
                }
                if (proxyResponse.status === 401 || proxyResponse.status === 403) {
                    throw new Err(ErrorCode.INVALID_CREDENTIALS, "Authentication failed");
                }
                if (proxyResponse.status >= 500) {
                    throw new Err(ErrorCode.SERVER_ERROR, `Server error: HTTP ${proxyResponse.status}`);
                }
                throw new Err(ErrorCode.SERVER_ERROR, `HTTP ${proxyResponse.status}`);
            }
            
            return new Response().fromRaw(unmarshal(proxyResponse.body));
        } catch (error: any) {
            // Handle errors from the Rust side
            const errorMessage = error.toString();
            
            if (errorMessage.includes("HTTP 404")) {
                throw new Err(ErrorCode.NOT_FOUND, "Resource not found");
            }
            
            if (errorMessage.includes("HTTP 401") || errorMessage.includes("HTTP 403")) {
                throw new Err(ErrorCode.INVALID_CREDENTIALS, "Authentication failed");
            }
            
            if (errorMessage.includes("HTTP 5")) {
                throw new Err(ErrorCode.SERVER_ERROR, "Server error occurred");
            }
            
            if (errorMessage.includes("Request failed")) {
                throw new Err(
                    ErrorCode.FAILED_CONNECTION,
                    $l(
                        "The app could not establish a connection with our servers, please check your internet connection or try again later!"
                    )
                );
            }
            
            throw new Err(
                ErrorCode.SERVER_ERROR,
                $l("An unexpected error occurred: {0}", errorMessage)
            );
        }
    }
}

// Use the actual production server URL through proxy
// The PL_SERVER_URL should be set to the actual server, not localhost
const serverUrl = process.env.PL_SERVER_URL || "https://example.com/server";
const sender = new TauriInvokeAjaxSender(serverUrl);

// Ensure we only initialize once
if ((window as any).__tauriGlobalsInitialized) {
    console.warn('[Tauri Globals] Already initialized, skipping...');
} else {
    (window as any).__tauriGlobalsInitialized = true;
    
    // Create app with Tauri sender - but only if not already initialized
    if (!(window as any).app) {
        (window as any).app = new App(sender);
        console.log('[Tauri Globals] Created new app with TauriInvokeAjaxSender', {
            serverUrl,
            senderType: sender.constructor.name
        });
    } else {
        // Replace the sender on existing app
        const existingApp = (window as any).app as App;
        // Use any type to access private property
        (existingApp.api as any)._sender = sender;
        console.log('[Tauri Globals] Replaced sender on existing app with TauriInvokeAjaxSender', {
            serverUrl,
            senderType: sender.constructor.name
        });
    }
    
    // Create router if not exists
    if (!(window as any).router) {
        (window as any).router = new Router();
        console.log('[Tauri Globals] Created new router');
    }
    
    (window as any).getPlatform = getPlatform;
}

export const app = ((window as any).app as App);
export const router = ((window as any).router as Router);
