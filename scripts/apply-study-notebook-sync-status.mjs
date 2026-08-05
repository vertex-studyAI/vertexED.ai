import { readFile, writeFile } from "node:fs/promises";

const sourcePath = new URL("../src/pages/StudyNotebook.tsx", import.meta.url);
let source = await readFile(sourcePath, "utf8");

const replacements = [
  [
    `  const [notebookCloudSynced, setNotebookCloudSynced] = useState(true);\n  const [notebookSyncError, setNotebookSyncError] = useState<string | null>(null);`,
    `  const [notebookCloudSynced, setNotebookCloudSynced] = useState(true);\n  const [notebookSaving, setNotebookSaving] = useState(false);\n  const [notebookSyncError, setNotebookSyncError] = useState<string | null>(null);`,
  ],
  [
    `  useEffect(() => {\n    if (notebookSaveTimerRef.current !== null) window.clearTimeout(notebookSaveTimerRef.current);\n    notebookSaveTimerRef.current = window.setTimeout(() => {\n      void saveNotebookSnapshot({\n        notebooks,\n        updatedAt: new Date().toISOString(),\n      }).then((result) => {\n        setNotebookCloudSynced(result.cloudSynced);\n        setNotebookSyncError(result.error ?? null);\n      });\n    }, 800);\n    return () => {\n      if (notebookSaveTimerRef.current !== null) window.clearTimeout(notebookSaveTimerRef.current);\n    };\n  }, [notebooks]);`,
    `  useEffect(() => {\n    let cancelled = false;\n    setNotebookSaving(true);\n    if (notebookSaveTimerRef.current !== null) window.clearTimeout(notebookSaveTimerRef.current);\n    notebookSaveTimerRef.current = window.setTimeout(() => {\n      void saveNotebookSnapshot({\n        notebooks,\n        updatedAt: new Date().toISOString(),\n      }).then((result) => {\n        if (cancelled) return;\n        setNotebookCloudSynced(result.cloudSynced);\n        setNotebookSyncError(result.error ?? null);\n        setNotebookSaving(false);\n      });\n    }, 800);\n    return () => {\n      cancelled = true;\n      if (notebookSaveTimerRef.current !== null) window.clearTimeout(notebookSaveTimerRef.current);\n    };\n  }, [notebooks]);`,
  ],
  [
    `                  <button\n                    type="button"\n                    className="btn-glass text-xs"\n                    onClick={() => exportNotebookJson(active)}\n                  >\n                    Export JSON\n                  </button>`,
    `                  <span\n                    role="status"\n                    aria-live="polite"\n                    aria-atomic="true"\n                    className={\`text-xs rounded-full border px-2.5 py-1 \${\n                      notebookSaving\n                        ? 'border-amber-400/30 text-amber-300'\n                        : notebookCloudSynced\n                          ? 'border-emerald-400/30 text-emerald-300'\n                          : 'border-border/60 text-muted-foreground'\n                    }\`}\n                    title={\n                      notebookCloudSynced\n                        ? 'Your notebook is saved locally and synced to your account.'\n                        : 'Cloud sync is unavailable; your notebook is still saved on this device.'\n                    }\n                  >\n                    {notebookSaving ? 'Saving…' : notebookCloudSynced ? 'Cloud synced' : 'Saved locally'}\n                    {!notebookSaving && !notebookCloudSynced && notebookSyncError && (\n                      <span className="sr-only">. Cloud sync is currently unavailable.</span>\n                    )}\n                  </span>\n                  <button\n                    type="button"\n                    className="btn-glass text-xs"\n                    onClick={() => exportNotebookJson(active)}\n                  >\n                    Export JSON\n                  </button>`,
  ],
];

for (const [before, after] of replacements) {
  if (!source.includes(before)) {
    throw new Error(`StudyNotebook sync-status anchor not found: ${before.slice(0, 100)}`);
  }
  source = source.replace(before, after);
}

await writeFile(sourcePath, source, "utf8");
console.log(`Applied ${replacements.length} Study Notebook sync-status improvements`);
