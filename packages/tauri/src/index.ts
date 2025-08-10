// Ensure platform is set before any other imports
import { setPlatform } from "@padloc/core/src/platform";
import { WebPlatform } from "@padloc/app/src/lib/platform";

// Create Tauri-specific platform
class TauriPlatform extends WebPlatform {
    async getDeviceInfo() {
        const device = await super.getDeviceInfo();
        device.runtime = "tauri";
        device.description = `${device.platform} Device`;
        return device;
    }
}

// Set platform immediately
setPlatform(new TauriPlatform());

function createApp() {
    try {
        const app = document.createElement("pl-app");
        document.body.appendChild(app);
    } catch (error) {
        console.error("Error creating app element:", error);
    }
}

// Load app components after platform is set
(async () => {
    try {
        console.log("Loading app elements...");
        // Import globals to set up Tauri proxy
        await import("./globals");
        await import("@padloc/app/src/elements/app");

        console.log("Document ready state:", document.readyState);
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", createApp);
        } else {
            createApp();
        }
    } catch (error) {
        console.error("Error during app initialization:", error);
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
