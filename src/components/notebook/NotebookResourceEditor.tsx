import { useState } from 'react';
import type { NotebookOutput } from '@/lib/notebook';

export default function NotebookResourceEditor({ output, onSave }: { output: NotebookOutput; onSave: (content: string) => void }) {
  const [content, setContent] = useState(output.content);
  const [error, setError] = useState('');
  if (['quiz', 'flashcards', 'suggested-questions', 'mind-map'].includes(output.kind)) return null;
  return <details className="mb-4 border-b border-border pb-3">
    <summary className="cursor-pointer text-sm min-h-11">Edit a copy of these notes</summary>
    <label className="block text-sm" htmlFor="notebook-resource-editor">Resource text (Markdown)</label>
    <textarea id="notebook-resource-editor" className="form-control-input w-full mt-2 text-base min-h-64" maxLength={50_000} value={content} onChange={event => setContent(event.target.value)} />
    <p className="text-sm text-muted-foreground my-2">The original stays in saved versions. Check your changes against the source.</p>
    <button type="button" className="btn-glass min-h-11 text-sm" onClick={() => { try { onSave(content); setError(''); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Your edited copy could not be saved.'); } }}>Save edited copy</button>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </details>;
}
