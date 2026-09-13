export interface DesmosCalculator {
  destroy(): void;
  setExpression(expression: { id: string; latex: string; color?: string }): void;
}
interface DesmosApi { GraphingCalculator(element: HTMLElement, options?: Record<string, unknown>): DesmosCalculator }
declare global { interface Window { Desmos?: DesmosApi } }
let loading: Promise<DesmosApi> | undefined;
export function loadDesmos(key: string): Promise<DesmosApi> {
  if (window.Desmos) return Promise.resolve(window.Desmos);
  if (loading) return loading;
  loading = new Promise<DesmosApi>((resolve, reject) => {
    const script = document.createElement('script');
    const fail = () => { clearTimeout(timer); script.remove(); loading = undefined; reject(new Error('Desmos could not load.')); };
    const timer = window.setTimeout(fail, 15000);
    script.src = `https://www.desmos.com/api/v1.11/calculator.js?apiKey=${encodeURIComponent(key)}`;
    script.async = true;
    script.onload = () => { clearTimeout(timer); if (window.Desmos) resolve(window.Desmos); else fail(); };
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return loading;
}
