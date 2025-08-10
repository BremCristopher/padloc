// Compatibility wrapper for DOMPurify
import DOMPurifyDefault from "dompurify";

// Export default
export default DOMPurifyDefault;

// Also export named functions for compatibility
export const sanitize = DOMPurifyDefault.sanitize.bind(DOMPurifyDefault);
export const addHook = DOMPurifyDefault.addHook.bind(DOMPurifyDefault);
export const removeHook = DOMPurifyDefault.removeHook.bind(DOMPurifyDefault);
export const removeAllHooks = DOMPurifyDefault.removeAllHooks.bind(DOMPurifyDefault);
export const setConfig = DOMPurifyDefault.setConfig.bind(DOMPurifyDefault);
export const clearConfig = DOMPurifyDefault.clearConfig.bind(DOMPurifyDefault);
export const isValidAttribute = DOMPurifyDefault.isValidAttribute.bind(DOMPurifyDefault);
export const addAllowedAttribute = (tag: string, attr: string) => {
    const config = { ADD_ATTR: [`${attr}`] };
    DOMPurifyDefault.addHook('uponSanitizeElement', (node: any) => {
        if (node.tagName && node.tagName.toLowerCase() === tag.toLowerCase()) {
            DOMPurifyDefault.setConfig(config);
        }
    });
};

// Re-export everything else
export * from "dompurify";
