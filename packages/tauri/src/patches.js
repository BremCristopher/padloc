// Patches for library compatibility issues

// Fix for @simplewebauthn/browser
if (typeof window !== 'undefined') {
    const originalModule = require('@simplewebauthn/browser');
    if (originalModule && originalModule.browserSupportsWebAuthn && !originalModule.browserSupportsWebauthn) {
        originalModule.browserSupportsWebauthn = originalModule.browserSupportsWebAuthn;
    }
}

// Fix for DOMPurify
if (typeof window !== 'undefined') {
    const DOMPurify = require('dompurify');
    if (DOMPurify && DOMPurify.default) {
        const purify = DOMPurify.default;
        if (!DOMPurify.sanitize) {
            DOMPurify.sanitize = purify.sanitize.bind(purify);
        }
        if (!DOMPurify.addHook) {
            DOMPurify.addHook = purify.addHook.bind(purify);
        }
    }
}

// Fix for UAParser
if (typeof window !== 'undefined') {
    const UAParser = require('ua-parser-js');
    if (UAParser && UAParser.default && !UAParser.UAParser) {
        window.UAParser = UAParser.default;
    } else if (UAParser && !window.UAParser) {
        window.UAParser = UAParser.UAParser || UAParser;
    }
}
