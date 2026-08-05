import { readFile, writeFile } from "node:fs/promises";

const sourcePath = new URL("../src/pages/StudyNotebook.tsx", import.meta.url);
let source = await readFile(sourcePath, "utf8");

const replacements = [
  [
    `                        onClick={() => setActiveId(nb.id)}\n                        className={\`notebook-list-item w-full text-left \${nb.id === activeId ? 'notebook-list-item-active' : ''}\`}`,
    `                        onClick={() => setActiveId(nb.id)}\n                        aria-pressed={nb.id === activeId}\n                        className={\`notebook-list-item w-full text-left \${nb.id === activeId ? 'notebook-list-item-active' : ''}\`}`,
  ],
  [
    `                        aria-label="Preview source"\n                      >\n                        <Eye className="h-3.5 w-3.5" />`,
    `                        aria-label={\`Preview \${src.title}\`}\n                      >\n                        <Eye className="h-3.5 w-3.5" aria-hidden />`,
  ],
  [
    `                        aria-label="Remove source"\n                      >\n                        <Trash2 className="h-3.5 w-3.5" />`,
    `                        aria-label={\`Remove \${src.title}\`}\n                      >\n                        <Trash2 className="h-3.5 w-3.5" aria-hidden />`,
  ],
  [
    `                    type="text"\n                    placeholder="Source title (optional)"`,
    `                    type="text"\n                    aria-label="Source title"\n                    placeholder="Source title (optional)"`,
  ],
  [
    `                  <textarea\n                    placeholder="Paste notes, excerpts, or lecture transcripts…"`,
    `                  <textarea\n                    aria-label="Source content"\n                    placeholder="Paste notes, excerpts, or lecture transcripts…"`,
  ],
  [
    `                    <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-glass text-xs px-2.5" title="Upload .txt or .md">\n                      <Upload className="h-3.5 w-3.5" />\n                    </button>`,
    `                    <button\n                      type="button"\n                      onClick={() => fileInputRef.current?.click()}\n                      className="btn-glass text-xs px-2.5"\n                      aria-label="Upload a text, Markdown, or CSV source"\n                      title="Upload .txt, .md, or .csv"\n                    >\n                      <Upload className="h-3.5 w-3.5" aria-hidden />\n                    </button>`,
  ],
  [
    `                    <button type="button" onClick={() => void loadImportable()} className="btn-glass text-xs px-2.5" title="Import saved work">\n                      <BookOpen className="h-3.5 w-3.5" />\n                    </button>`,
    `                    <button\n                      type="button"\n                      onClick={() => void loadImportable()}\n                      className="btn-glass text-xs px-2.5"\n                      aria-label="Import saved work as a source"\n                      title="Import saved work"\n                    >\n                      <BookOpen className="h-3.5 w-3.5" aria-hidden />\n                    </button>`,
  ],
  [
    `                    ref={fileInputRef}\n                    type="file"`,
    `                    ref={fileInputRef}\n                    type="file"\n                    aria-label="Choose a source file"`,
  ],
  [
    `                    type="text"\n                    value={active.title}`,
    `                    type="text"\n                    aria-label="Notebook title"\n                    value={active.title}`,
  ],
];

for (const [before, after] of replacements) {
  if (!source.includes(before)) {
    throw new Error(`StudyNotebook control-label anchor not found: ${before.slice(0, 80)}`);
  }
  source = source.replace(before, after);
}

await writeFile(sourcePath, source, "utf8");
console.log(`Applied ${replacements.length} Study Notebook control-label improvements`);
