import { readFile, writeFile } from "node:fs/promises";

const sourcePath = new URL("../src/pages/StudyNotebook.tsx", import.meta.url);
let source = await readFile(sourcePath, "utf8");

const replacements = [
  [
    `  const [notebookCloudSynced, setNotebookCloudSynced] = useState(true);\n  const [notebookSaving, setNotebookSaving] = useState(false);`,
    `  const [notebookCloudSynced, setNotebookCloudSynced] = useState(true);\n  const [notebookHydrated, setNotebookHydrated] = useState(false);\n  const [notebookSaving, setNotebookSaving] = useState(false);`,
  ],
  [
    `      setNotebookCloudSynced(cloudSynced);\n      setNotebookSyncError(error ?? null);`,
    `      setNotebookCloudSynced(cloudSynced);\n      setNotebookSyncError(error ?? null);\n      setNotebookHydrated(true);`,
  ],
  [
    `  useEffect(() => {\n    let cancelled = false;\n    setNotebookSaving(true);`,
    `  useEffect(() => {\n    if (!notebookHydrated) return;\n\n    let cancelled = false;\n    setNotebookSaving(true);`,
  ],
  [
    `  }, [notebooks]);`,
    `  }, [notebookHydrated, notebooks]);`,
  ],
  [
    `                    className={\`text-xs rounded-full border px-2.5 py-1 \${\n                      notebookSaving\n                        ? 'border-amber-400/30 text-amber-300'\n                        : notebookCloudSynced\n                          ? 'border-emerald-400/30 text-emerald-300'\n                          : 'border-border/60 text-muted-foreground'\n                    }\`}\n                    title={\n                      notebookCloudSynced\n                        ? 'Your notebook is saved locally and synced to your account.'\n                        : 'Cloud sync is unavailable; your notebook is still saved on this device.'\n                    }\n                  >\n                    {notebookSaving ? 'Saving…' : notebookCloudSynced ? 'Cloud synced' : 'Saved locally'}\n                    {!notebookSaving && !notebookCloudSynced && notebookSyncError && (`,
    `                    className={\`text-xs rounded-full border px-2.5 py-1 \${\n                      !notebookHydrated\n                        ? 'border-sky-400/30 text-sky-300'\n                        : notebookSaving\n                          ? 'border-amber-400/30 text-amber-300'\n                          : notebookCloudSynced\n                            ? 'border-emerald-400/30 text-emerald-300'\n                            : 'border-border/60 text-muted-foreground'\n                    }\`}\n                    title={\n                      !notebookHydrated\n                        ? 'Loading your latest notebook snapshot before enabling cloud saves.'\n                        : notebookCloudSynced\n                          ? 'Your notebook is saved locally and synced to your account.'\n                          : 'Cloud sync is unavailable; your notebook is still saved on this device.'\n                    }\n                  >\n                    {!notebookHydrated\n                      ? 'Loading…'\n                      : notebookSaving\n                        ? 'Saving…'\n                        : notebookCloudSynced\n                          ? 'Cloud synced'\n                          : 'Saved locally'}\n                    {notebookHydrated && !notebookSaving && !notebookCloudSynced && notebookSyncError && (`,
  ],
];

for (const [before, after] of replacements) {
  if (!source.includes(before)) {
    throw new Error(`StudyNotebook hydration-gate anchor not found: ${before.slice(0, 100)}`);
  }
  source = source.replace(before, after);
}

await writeFile(sourcePath, source, "utf8");
console.log(`Applied ${replacements.length} Study Notebook hydration-gate improvements`);
