import { readFile, writeFile } from "node:fs/promises";

const sourcePath = new URL("../src/pages/StudyNotebook.tsx", import.meta.url);
const source = await readFile(sourcePath, "utf8");

const importAnchor = "import LiquidGlass from '@/components/LiquidGlass';";
const accessibleImport = "import AccessibleModal from '@/components/AccessibleModal';";

if (!source.includes(importAnchor)) {
  throw new Error("StudyNotebook import anchor was not found");
}

const oldModal = `      {previewSource && (
        <div className="notebook-modal-backdrop" role="dialog" aria-modal="true" aria-label="Source preview">
          <div className="notebook-modal">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="font-semibold truncate">{previewSource.title}</h3>
              <button type="button" onClick={() => setPreviewSourceId(null)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <pre className="text-xs text-foreground/85 whitespace-pre-wrap max-h-[60vh] overflow-y-auto leading-relaxed">
              {previewSource.content}
            </pre>
          </div>
        </div>
      )}`;

const newModal = `      {previewSource && (
        <AccessibleModal
          titleId="notebook-source-preview-title"
          descriptionId="notebook-source-preview-description"
          onClose={() => setPreviewSourceId(null)}
          overlayClassName="notebook-modal-backdrop"
          className="notebook-modal"
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 id="notebook-source-preview-title" className="font-semibold truncate">
              {previewSource.title}
            </h3>
            <button
              type="button"
              onClick={() => setPreviewSourceId(null)}
              className="p-1 text-muted-foreground hover:text-foreground"
              aria-label={\`Close preview for \${previewSource.title}\`}
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <p id="notebook-source-preview-description" className="sr-only">
            Source preview content. Press Escape to close and return to the preview button.
          </p>
          <pre
            className="text-xs text-foreground/85 whitespace-pre-wrap max-h-[60vh] overflow-y-auto leading-relaxed"
            tabIndex={0}
          >
            {previewSource.content}
          </pre>
        </AccessibleModal>
      )}`;

if (!source.includes(oldModal)) {
  throw new Error("Expected Study Notebook source-preview modal was not found");
}

const importCount = source.split(accessibleImport).length - 1;
if (importCount > 1) {
  throw new Error("AccessibleModal import appears more than once");
}

const nextSource = source
  .replace(
    importAnchor,
    source.includes(accessibleImport) ? importAnchor : `${importAnchor}\n${accessibleImport}`,
  )
  .replace(oldModal, newModal);

if (nextSource === source) {
  throw new Error("Study Notebook source was not changed");
}

await writeFile(sourcePath, nextSource, "utf8");
console.log("Applied Study Notebook source-preview accessibility patch");
