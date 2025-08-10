// Compatibility module to handle lit-element imports in Tauri build
// This re-exports everything from the app's lit wrapper

export * from "../../../app/src/elements/lit";

// Also re-export from lit-html for compatibility
export { render } from "lit-html";
export { html, svg, css, LitElement } from "@lit/reactive-element";
export { TemplateResult } from "lit-html";
export { unsafeCSS, CSSResult } from "@lit/reactive-element/css-tag.js";
