import { Request, Response, Sender, RequestProgress } from "@padloc/core/src/transport";
import { marshal, unmarshal } from "@padloc/core/src/encoding";
import { Err, ErrorCode } from "@padloc/core/src/error";

const { ipcRenderer } = window.require("electron");

export class ElectronProxyAjaxSender implements Sender {
    constructor(public url: string = "") {}
    
    async send(request: Request, progress?: RequestProgress): Promise<Response> {
        const serverUrl = process.env.PL_SERVER_URL || "http://localhost:3000";
        
        // Build full URL - remove duplicate slashes
        const url = serverUrl.replace(/\/$/, '') + this.url;
        
        console.log(`[ElectronProxy] Sending ${request.method} request to ${url}`);
        console.log(`[ElectronProxy] Request data:`, request.toRaw());
        
        try {
            const body = marshal(request.toRaw());
            
            // Send request through IPC to main process
            const result = await ipcRenderer.invoke("proxy-request", {
                url,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: body,
            });
            
            console.log(`[ElectronProxy] Received response with status ${result.status}`);
            
            if (progress) {
                progress.complete();
            }
            
            // Parse and return response
            try {
                return new Response().fromRaw(unmarshal(result.body));
            } catch (e) {
                console.error("[ElectronProxy] Failed to parse response:", e);
                throw new Err(ErrorCode.SERVER_ERROR, "Failed to parse server response");
            }
        } catch (error) {
            console.error(`[ElectronProxy] Error:`, error);
            if (progress) {
                progress.error = error as any;
            }
            throw error;
        }
    }
}
