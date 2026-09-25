export const SOURCE_FILE_ACCEPT = '.txt,.md,.markdown,.csv,text/plain,text/markdown,text/csv';

export function validateSourceFile(file) {
  if (!/\.(txt|md|markdown|csv)$/i.test(file.name)) throw new Error('Choose a text, Markdown or CSV file. For a PDF or slide deck, paste the relevant text excerpt.');
  if (file.size > 200_000) throw new Error('This file is larger than 200 KB. Split it into smaller sources.');
  if (!file.size) throw new Error('This file is empty. Choose a source containing text.');
}

export function decodeSourceFile(buffer) {
  let content;
  try { content = new TextDecoder('utf-8', { fatal: true }).decode(buffer).trim(); }
  catch { throw new Error('This file is not readable UTF-8 text. Export it as a text file and try again.'); }
  if ([...content].some(character => character.charCodeAt(0) < 32 && ![9, 10, 12, 13].includes(character.charCodeAt(0)))) throw new Error('This looks like a binary file. Choose a text, Markdown or CSV source.');
  if (!content) throw new Error('This file contains no text.');
  if (content.length > 50_000) throw new Error('Each source can contain up to 50,000 characters. Split it into smaller sources.');
  return content;
}
