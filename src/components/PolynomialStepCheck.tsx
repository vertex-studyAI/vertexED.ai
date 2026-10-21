import { useState } from 'react';
type CheckResult = ReturnType<typeof import('@/lib/polynomialReview.mjs')['reviewPolynomialDerivative']>;

export default function PolynomialStepCheck() {
  const [original, setOriginal] = useState('');
  const [working, setWorking] = useState('');
  const [result, setResult] = useState<CheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [loadError, setLoadError] = useState('');
  async function check() {
    setChecking(true);
    setLoadError('');
    try {
      const { reviewPolynomialDerivative } = await import('@/lib/polynomialReview.mjs');
      setResult(reviewPolynomialDerivative(original, working));
    } catch {
      setLoadError('The checker could not load. Your working is still here. Try again when connected.');
    } finally { setChecking(false); }
  }
  return <details className="rounded-xl border border-border bg-background p-5 my-6">
    <summary className="cursor-pointer text-base font-semibold text-primary py-2">Check polynomial derivative steps without AI</summary>
    <p className="text-sm text-muted-foreground my-3">Enter a polynomial in x, then one claimed derivative expression per line. Expanded and factored forms are accepted. Use ^ for powers and / for fractions. Trigonometry, variable denominators, negative powers and images need a separate review.</p>
    <div className="grid md:grid-cols-2 gap-4">
      <label className="grid content-start gap-2 text-sm font-medium">Original polynomial<input disabled={checking} aria-label="Original polynomial" className="neu-input-el text-base border border-border rounded-lg p-3" placeholder="For example: 3x^4 - 2x + 7" maxLength={500} value={original} onChange={event => { setOriginal(event.target.value); setResult(null); }} /></label>
      <label className="grid content-start gap-2 text-sm font-medium">Your derivative expressions<textarea disabled={checking} aria-label="Your derivative expressions" className="neu-input-el text-base border border-border rounded-lg p-3" rows={4} maxLength={15000} placeholder="One expression per line. Omit f'(x) =." value={working} onChange={event => { setWorking(event.target.value); setResult(null); }} /></label>
    </div>
    <button className="btn-solid mt-4 min-h-11 px-4 py-2" type="button" disabled={checking || !original.trim() || !working.trim()} onClick={check}>Check derivative steps</button>
    <div role="status" aria-live="polite" className="mt-4 space-y-2 text-sm">
      {checking && <p>Loading the exact checker...</p>}
      {loadError && <p>{loadError}</p>}
      {result && <><p className="font-semibold">{result.status === 'verified' ? 'Expressions verified' : result.status === 'different' ? `First mismatch: line ${result.line}` : 'More information needed'}</p><p>{result.message}</p>{'expected' in result && <p>Exact derivative: <code>{result.expected}</code></p>}{'next' in result && <p>{result.next}</p>}</>}
    </div>
    <p className="text-xs text-muted-foreground mt-3">Runs on this device using exact fractions. No AI request, saved mark or mastery update.</p>
  </details>;
}
