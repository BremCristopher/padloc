import { Err, ErrorCode } from "@padloc/core/src/error";
import { marshal, unmarshal } from "@padloc/core/src/encoding";
import { Request, Response, Sender, RequestProgress } from "@padloc/core/src/transport";
import { translate as $l } from "@padloc/locale/src/translate";

/**
 * Tauri-specific AJAX sender that uses fetch API with proper CORS handling
 */
export class TauriAjaxSender implements Sender {
    constructor(public url: string) {}

    async send(req: Request, _progress?: RequestProgress): Promise<Response> {
        const body = marshal(req.toRaw());
        
        try {
            // Use fetch API which works better with Tauri
            const response = await fetch(this.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    // Add custom header to identify Tauri client
                    "X-Client-Type": "tauri",
                    // You can also add a custom header with the actual origin if needed
                    "X-Original-Origin": window.location.origin
                },
                body: body,
                // Important: include credentials for cookies/auth
                credentials: "include",
                // Ensure proper CORS mode
                mode: "cors"
            });

            if (!response.ok) {
                if (response.status === 0) {
                    throw new Err(
                        ErrorCode.FAILED_CONNECTION,
                        $l(
                            "The app could not establish a connection with our servers, please check your internet connection or try again later!"
                        )
                    );
                }
                
                // Handle CORS errors specifically
                if (response.status === 405 || response.type === "opaque") {
                    throw new Err(
                        ErrorCode.SERVER_ERROR,
                        $l("Connection error: The server configuration may need to be updated to support desktop clients.")
                    );
                }
                
                throw new Err(ErrorCode.SERVER_ERROR, `HTTP ${response.status}`);
            }

            const responseText = await response.text();
            return new Response().fromRaw(unmarshal(responseText));
        } catch (e) {
            if (e instanceof Err) {
                throw e;
            }
            
            // Network errors typically indicate CORS issues in Tauri
            if (e instanceof TypeError && e.message.includes("Failed to fetch")) {
                throw new Err(
                    ErrorCode.FAILED_CONNECTION,
                    $l(
                        "Connection failed. This may be a CORS configuration issue. Please contact support."
                    )
                );
            }
            
            throw new Err(
                ErrorCode.FAILED_CONNECTION,
                $l(
                    "The app could not establish a connection with our servers, please check your internet connection or try again later!"
                )
            );
        }
    }
}
