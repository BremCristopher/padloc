import { setPlatform } from "@padloc/core/src/platform";
import { ElectronPlatform } from "./platform";
import { ElectronProxyAjaxSender } from "./electron-ajax-sender";

// Define process for service worker compatibility
if (typeof window.process === "undefined") {
    // @ts-ignore
    window.process = {
        env: {
            PL_SERVER_URL: process.env.PL_SERVER_URL || "http://localhost:3000",
            PL_BILLING_ENABLED: process.env.PL_BILLING_ENABLED || "false",
            PL_BILLING_DISABLE_PAYMENT: process.env.PL_BILLING_DISABLE_PAYMENT || "false",
            PL_BILLING_STRIPE_PUBLIC_KEY: process.env.PL_BILLING_STRIPE_PUBLIC_KEY || "",
            PL_SUPPORT_EMAIL: process.env.PL_SUPPORT_EMAIL || "support@padloc.app",
            PL_DISABLE_SW: process.env.PL_DISABLE_SW || "true",
        },
    };
}

// Log the server URL for debugging
console.log("[Electron] Server URL:", process.env.PL_SERVER_URL);

function createApp() {
    try {
        const app = document.createElement("pl-app");
        document.body.appendChild(app);
        console.log("App element created successfully");
    } catch (error) {
        console.error("Error creating app element:", error);
    }
}

(async () => {
    try {
        console.log("[Electron] Initializing Padloc...");
        
        // Set platform
        setPlatform(new ElectronPlatform());
        
        // Import app components
        await import("@padloc/app/src/elements/app");
        
        // Set up proxy for API requests
        const { app } = await import("@padloc/app/src/globals");
        
        // Wait a bit for app to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (app && app.api) {
            const serverUrl = process.env.PL_SERVER_URL || "http://localhost:3000";
            console.log("[Electron] Setting up IPC proxy for API requests to", serverUrl);
            // @ts-ignore - accessing private property for proxy setup
            app.api._sender = new ElectronProxyAjaxSender("/api/");
            // Also set the base URL
            // @ts-ignore
            app.api.baseURL = serverUrl;
            console.log("[Electron] API sender configured successfully");
        } else {
            console.warn("[Electron] App or API not available for proxy setup");
            // Try again after a delay
            setTimeout(async () => {
                const { app } = await import("@padloc/app/src/globals");
                if (app && app.api) {
                    const serverUrl = process.env.PL_SERVER_URL || "http://localhost:3000";
                    console.log("[Electron] Setting up IPC proxy for API requests (delayed) to", serverUrl);
                    // @ts-ignore - accessing private property for proxy setup
                    app.api._sender = new ElectronProxyAjaxSender("/api/");
                    // @ts-ignore
                    app.api.baseURL = serverUrl;
                    console.log("[Electron] API sender configured successfully (delayed)");
                }
            }, 1000);
        }
        
        // @ts-ignore
        if (window.router) {
            window.router.basePath = window.location.pathname.replace(/index.html$/, "");
        }
        
        // Create app when ready
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", createApp);
        } else {
            createApp();
        }
    } catch (error) {
        console.error("[Electron] Error during initialization:", error);
        // Display error in UI
        document.body.innerHTML = `
            <div style="padding: 20px; font-family: monospace; color: red;">
                <h2>Initialization Error</h2>
                <pre>${error}</pre>
                <pre>${error.stack || ""}</pre>
            </div>
        `;
    }
})();
