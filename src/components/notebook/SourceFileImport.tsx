import { useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import AccessibleModal from '@/components/AccessibleModal';
import { SOURCE_FILE_ACCEPT, decodeSourceFile, validateSourceFile } from '@/lib/sourceFileImport.mjs';
import { importPdfText } from '@/lib/pdfImport';

type Props = {
  disabled: boolean;
  scopeKey: string;
  onImport: (title: string, content: string) => string;
};

export default function SourceFileImport({ disabled, scopeKey, onImport }: Props) {
  const openerRef = useRef<HTMLButtonElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const readerRef = useRef<FileReader | null>(null);
  const fileRef = useRef<File | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const scopeRef = useRef(scopeKey);
  scopeRef.current = scopeKey;
  const [progress, setProgress] = useState<number | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [preview, setPreview] = useState<{ title: string; content: string; pageCount: number; blankPages: number[]; scope: string } | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [textPreview, setTextPreview] = useState<{ title: string; content: string; scope: string } | null>(null);

  useEffect(() => {
    setMessage(''); setError(false); setProgress(null); setPreview(null); setTextPreview(null); setExtracting(false); fileRef.current = null;
    return () => { const reader = readerRef.current; readerRef.current = null; reader?.abort(); controllerRef.current?.abort(); controllerRef.current = null; };
  }, [scopeKey]);

  const read = (file: File) => {
    if (disabled || progress !== null || preview || textPreview) return;
    fileRef.current = file;
    setError(false); setMessage(''); setPreview(null);
    try { validateSourceFile(file); }
    catch (failure) { setError(true); setMessage((failure as Error).message); return; }
    const reader = new FileReader();
    readerRef.current = reader;
    const controller = new AbortController();
    controllerRef.current = controller;
    const current = () => readerRef.current === reader && scopeRef.current === scopeKey && !controller.signal.aborted;
    setProgress(0);
    const fail = (text: string) => {
      if (!current()) return;
      readerRef.current = null; controllerRef.current = null; setProgress(null); setExtracting(false); setError(true); setMessage(text);
    };
    reader.onprogress = event => { if (current() && event.lengthComputable) setProgress(Math.round(event.loaded / event.total * 100)); };
    reader.onerror = () => fail('The file could not be read. Your existing sources are safe. Try again.');
    reader.onload = async () => {
      if (!current()) return;
      try {
        if (/\.pdf$/i.test(file.name)) {
          setExtracting(true);
          const result = await importPdfText(reader.result as ArrayBuffer, controller.signal);
          if (!current()) return;
          setPreview({ ...result, title: file.name.replace(/\.[^.]+$/, ''), scope: scopeKey });
          readerRef.current = null; controllerRef.current = null; setProgress(null); setExtracting(false);
          return;
        }
        const content = decodeSourceFile(reader.result as ArrayBuffer);
        setTextPreview({ title: file.name.replace(/\.[^.]+$/, ''), content, scope: scopeKey });
        readerRef.current = null; controllerRef.current = null; setProgress(null); setMessage('File read. Review the source before adding it.');
      } catch (failure) { fail(failure instanceof Error ? failure.message : 'This source could not be saved. Your existing sources are safe.'); }
    };
    reader.readAsArrayBuffer(file);
  };

  const discard = () => { setPreview(null); fileRef.current = null; setError(false); setMessage('Preview discarded. No source was added.'); };

  return <div className="notebook-file-import mt-3" data-dragging={dragging}
    onDragOver={event => { if (event.dataTransfer.types.includes('Files')) { event.preventDefault(); setDragging(true); } }}
    onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false); }}
    onDrop={event => {
      event.preventDefault(); setDragging(false);
      if (event.dataTransfer.files.length !== 1) { setError(true); setMessage('Choose one source at a time.'); return; }
      read(event.dataTransfer.files[0]);
    }}>
    <button ref={openerRef} type="button" disabled={disabled || progress !== null || !!textPreview} onClick={() => inputRef.current?.click()} className="w-full flex items-center gap-3 text-left p-4 border border-dashed border-primary/40 bg-primary/5 rounded-lg disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
      <Upload className="h-5 w-5 shrink-0 text-primary" aria-hidden /><span><strong className="block text-sm">Import a source file</strong><span className="text-xs text-muted-foreground">PDF up to 1 MB and 25 pages. Text, Markdown or CSV up to 200 KB.</span></span>
    </button>
    <p className="mt-2 text-xs text-muted-foreground">PDFs are sent to VertexED for text extraction; the original file is discarded. Review the text before adding it. Images and handwriting are not extracted.</p>
    <input ref={inputRef} type="file" className="sr-only" tabIndex={-1} accept={SOURCE_FILE_ACCEPT} aria-label="Choose a source file" disabled={disabled || progress !== null || !!preview || !!textPreview}
      onChange={event => { const file = event.target.files?.[0]; if (file) read(file); event.target.value = ''; }} />
    {progress !== null && <div className="mt-2" role="status"><label className="text-sm">{extracting ? 'Extracting selectable text' : 'Reading source'} <progress className="w-full" max={100} value={extracting ? undefined : progress} /></label><button type="button" className="text-link min-h-11" onClick={() => {
      const reader = readerRef.current; readerRef.current = null; reader?.abort(); controllerRef.current?.abort(); controllerRef.current = null; setExtracting(false); setProgress(null); setMessage('Import cancelled. No source was added.');
    }}>Cancel import</button></div>}
    {preview && preview.scope === scopeKey && <AccessibleModal titleId="pdf-review-title" descriptionId="pdf-review-help" onClose={discard} openerRef={openerRef} initialFocusRef={textRef} overlayClassName="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" className="w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded-xl border border-border bg-background text-foreground p-5 sm:p-7 shadow-xl">
      <p className="text-xs uppercase tracking-widest text-primary mb-2">Source / PDF</p>
      <h2 id="pdf-review-title" className="text-xl font-semibold">Review PDF text</h2>
      <p className="text-sm text-muted-foreground break-words">{preview.title} · {preview.pageCount} {preview.pageCount === 1 ? 'page' : 'pages'}</p>
      {preview.blankPages.length > 0 && <p role="status" className="text-sm mt-2">No text was found on {preview.blankPages.length === 1 ? 'page' : 'pages'} {preview.blankPages.join(', ')}. Add a transcription separately if needed.</p>}
      <label htmlFor="pdf-source-text" className="block text-sm mt-3">Extracted text</label><textarea id="pdf-source-text" ref={textRef} readOnly value={preview.content} rows={10} className="mt-1 w-full p-3 rounded border border-border bg-background text-foreground text-base" />
      <p id="pdf-review-help" className="text-sm text-muted-foreground mt-2">Page references are kept. Check equations and reading order against your document.</p>
      <div className="flex gap-2 flex-wrap mt-3"><button type="button" disabled={disabled} className="min-h-11 px-3 rounded-lg bg-primary text-primary-foreground" onClick={() => {
        if (preview.scope !== scopeRef.current) return;
        try { const result = onImport(preview.title, preview.content); setPreview(null); fileRef.current = null; setError(false); setMessage(result); }
        catch (failure) { setError(true); setMessage(failure instanceof Error ? failure.message : 'This source could not be added.'); }
      }}>Add PDF source</button><button type="button" className="min-h-11 px-3 rounded-lg border border-border" onClick={discard}>Discard preview</button></div>
      {error && message && <p role="alert" className="mt-3 text-sm">{message}</p>}
    </AccessibleModal>}
    {message && !preview && <p className="mt-2 text-sm" role={error ? 'alert' : 'status'}>{message}</p>}
    {error && fileRef.current && !preview && <button type="button" disabled={disabled} className="text-link min-h-11" onClick={() => fileRef.current && read(fileRef.current)}>Retry import</button>}
    {textPreview && textPreview.scope === scopeKey && <section className="mt-3 grid gap-3 rounded-lg border border-border bg-background p-3" aria-label="Review imported source">
      <h3 className="font-semibold">Review before adding</h3>
      <p className="text-sm">Read {textPreview.content.length.toLocaleString()} characters. Edit the title and included text below. No study materials have been generated.</p>
      {textPreview.content.split(/\r?\n/).some(line => /^#{1,6}\s+/.test(line)) && <details><summary className="min-h-11 cursor-pointer">Detected Markdown headings</summary><ul className="list-disc pl-5">{textPreview.content.split(/\r?\n/).filter(line => /^#{1,6}\s+/.test(line)).slice(0, 20).map((line, i) => <li key={i}>{line.replace(/^#{1,6}\s+/, '')}</li>)}</ul><p className="text-sm">Up to 20 headings shown. These are document headings, not verified syllabus topics.</p></details>}
      <label htmlFor="import-source-title" className="grid gap-1">Source title</label><input id="import-source-title" className="neu-input-el min-h-11" value={textPreview.title} maxLength={160} onChange={e => setTextPreview({ ...textPreview, title: e.target.value })} />
      <label htmlFor="import-source-text" className="grid gap-1">Included source text</label><textarea id="import-source-text" className="neu-input-el min-h-40" value={textPreview.content} maxLength={50000} onChange={e => setTextPreview({ ...textPreview, content: e.target.value })} />
      <p className="text-sm text-muted-foreground">Keep the passages you want to study. Once added, select a study guide, quiz, flashcards or topic map in the notebook. Source links refer to this excerpt; no PDF page numbers are inferred.</p>
      <div className="flex flex-wrap gap-2"><button className="btn-solid min-h-11" disabled={disabled || !textPreview.title.trim() || !textPreview.content.trim()} onClick={() => {
        if (textPreview.scope !== scopeRef.current) return;
        try { const result = onImport(textPreview.title.trim(), textPreview.content.trim()); setTextPreview(null); fileRef.current = null; setError(false); setMessage(result); }
        catch (failure) { setError(true); setMessage(failure instanceof Error ? failure.message : 'Source could not be saved. Your preview is preserved.'); }
      }}>Add reviewed source</button><button className="text-link min-h-11" onClick={() => { setTextPreview(null); setMessage('Import cancelled. No source was added.'); }}>Discard preview</button></div>
    </section>}
  </div>;
}
