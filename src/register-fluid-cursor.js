// Legacy compatibility shim for the fluid cursor custom element.
// The interactive WebGL cursor is intentionally disabled in the current UI.
if (typeof window !== 'undefined' && typeof customElements !== 'undefined' && !customElements.get('fluid-cursor')) {
  customElements.define('fluid-cursor', class extends HTMLElement {});
}

export {};
