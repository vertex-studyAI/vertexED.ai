import { useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { SOURCE_FILE_ACCEPT, decodeSourceFile, validateSourceFile } from '@/lib/sourceFileImport.mjs';

type Props = {
  disabled: boolean;
  scopeKey: string;
  onImport: (title: string, content: string) => string;
};

export default function SourceFileImport({ disabled, scopeKey, onImport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const readerRef = useRef<FileReader | null>(null);
  const fileRef = useRef<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    setMessage(''); setError(false); setProgress(null); fileRef.current = null;
    return () => { const reader = readerRef.current; readerRef.current = null; reader?.abort(); };
  }, [scopeKey]);

  const read = (file: File) => {
    if (disabled || progress !== null) return;
    fileRef.current = file;
    setError(false); setMessage('');
    try { validateSourceFile(file); }
    catch (failure) { setError(true); setMessage((failure as Error).message); return; }
    const reader = new FileReader();
    readerRef.current = reader;
    setProgress(0);
    const fail = (text: string) => {
      if (readerRef.current !== reader) return;
      readerRef.current = null; setProgress(null); setError(true); setMessage(text);
    };
    reader.onprogress = event => { if (readerRef.current === reader && event.lengthComputable) setProgress(Math.round(event.loaded / event.total * 100)); };
    reader.onerror = () => fail('The file could not be read. Your existing sources are safe. Try again.');
    reader.onload = () => {
      if (readerRef.current !== reader) return;
      try {
        const content = decodeSourceFile(reader.result as ArrayBuffer);
        const result = onImport(file.name.replace(/\.[^.]+$/, ''), content);
        readerRef.current = null; setProgress(null); setMessage(result);
      } catch (failure) { fail(failure instanceof Error ? failure.message : 'This source could not be saved. Your existing sources are safe.'); }
    };
    reader.readAsArrayBuffer(file);
  };

  return <div className="notebook-file-import mt-3" data-dragging={dragging}
    onDragOver={event => { if (event.dataTransfer.types.includes('Files')) { event.preventDefault(); setDragging(true); } }}
    onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false); }}
    onDrop={event => {
      event.preventDefault(); setDragging(false);
      if (event.dataTransfer.files.length !== 1) { setError(true); setMessage('Choose one source at a time.'); return; }
      read(event.dataTransfer.files[0]);
    }}>
    <button type="button" disabled={disabled || progress !== null} onClick={() => inputRef.current?.click()} className="w-full flex items-center gap-3 text-left p-3 border border-dashed border-border rounded-lg disabled:opacity-50">
      <Upload className="h-5 w-5 shrink-0" aria-hidden /><span><strong className="block text-sm">Import a source file</strong><span className="text-xs text-muted-foreground">Drop here or browse. Text, Markdown or CSV, up to 200 KB.</span></span>
    </button>
    <input ref={inputRef} type="file" className="sr-only" tabIndex={-1} accept={SOURCE_FILE_ACCEPT} aria-label="Choose a source file" disabled={disabled || progress !== null}
      onChange={event => { const file = event.target.files?.[0]; if (file) read(file); event.target.value = ''; }} />
    {progress !== null && <div className="mt-2"><label className="text-sm">Reading source <progress className="w-full" max={100} value={progress} /></label><button type="button" className="text-link min-h-11" onClick={() => {
      const reader = readerRef.current; readerRef.current = null; reader?.abort(); setProgress(null); setMessage('Import cancelled. No source was added.');
    }}>Cancel import</button></div>}
    {message && <p className="mt-2 text-sm" role={error ? 'alert' : 'status'}>{message}</p>}
    {error && fileRef.current && <button type="button" disabled={disabled} className="text-link min-h-11" onClick={() => fileRef.current && read(fileRef.current)}>Retry import</button>}
  </div>;
}
