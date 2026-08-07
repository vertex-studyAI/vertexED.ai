#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '');
if (!root || !fs.existsSync(path.join(root, 'package.json'))) {
  throw new Error('usage: apply-lint-recovery.mjs TARGET_FINANCEMETA_CHECKOUT');
}

function update(relativePath, transform) {
  const file = path.join(root, relativePath);
  const before = fs.readFileSync(file, 'utf8');
  const after = transform(before);
  if (after === before) throw new Error(`${relativePath}: expected source pattern was not changed`);
  fs.writeFileSync(file, after, 'utf8');
}

update('src/pages/portal/network/MemberProfile.tsx', (source) => {
  const oldBlock = `  const { id } = useParams<{ id: string }>();\n  const { user } = useAuth();\n  if (!id) return <EmptyState message="Profile not found." />;\n  const { data: profile, isLoading } = useProfileById(id);\n  const { data: connections } = useConnectionRequests();\n  const sendRequest = useSendConnectionRequest();`;
  const newBlock = `  const { id } = useParams<{ id: string }>();\n  const { user } = useAuth();\n  const { data: profile, isLoading } = useProfileById(id);\n  const { data: connections } = useConnectionRequests();\n  const sendRequest = useSendConnectionRequest();\n\n  if (!id) return <EmptyState message="Profile not found." />;`;
  if (!source.includes(oldBlock)) throw new Error('MemberProfile hook-order source changed unexpectedly');
  return source.replace(oldBlock, newBlock);
});

update('src/components/ui/command.tsx', (source) => {
  if (!source.includes('interface CommandDialogProps extends DialogProps {}')) {
    throw new Error('CommandDialogProps source changed unexpectedly');
  }
  return source.replace('interface CommandDialogProps extends DialogProps {}', 'type CommandDialogProps = DialogProps;');
});

update('src/components/ui/textarea.tsx', (source) => {
  const oldLine = 'export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}';
  if (!source.includes(oldLine)) throw new Error('TextareaProps source changed unexpectedly');
  return source.replace(oldLine, 'export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;');
});

update('tailwind.config.ts', (source) => {
  if (!source.includes('import type { Config } from "tailwindcss";')) throw new Error('Tailwind import changed unexpectedly');
  if (!source.includes('plugins: [require("tailwindcss-animate")],')) throw new Error('Tailwind plugin source changed unexpectedly');
  return source
    .replace('import type { Config } from "tailwindcss";', 'import type { Config } from "tailwindcss";\nimport tailwindcssAnimate from "tailwindcss-animate";')
    .replace('plugins: [require("tailwindcss-animate")],', 'plugins: [tailwindcssAnimate],');
});

update('src/components/FluidCursor.tsx', (source) => {
  const replacements = [
    ['const config: any = {', 'const config = {'],
    ['let halfFloat: any = null;', 'let halfFloat: { HALF_FLOAT_OES: number } | null = null;'],
    ['const { gl, ext } = getWebGLContext(canvas) as { gl: WebGL2RenderingContext | null; ext: any };', 'const { gl, ext } = getWebGLContext(canvas);'],
    ['window.removeEventListener("touchstart", onTouchStart as any);', 'window.removeEventListener("touchstart", onTouchStart);'],
    ['window.removeEventListener("touchmove", onTouchMove as any);', 'window.removeEventListener("touchmove", onTouchMove);'],
    ['window.removeEventListener("touchend", onTouchEnd as any);', 'window.removeEventListener("touchend", onTouchEnd);'],
  ];
  let out = source;
  for (const [before, after] of replacements) {
    if (!out.includes(before)) throw new Error(`FluidCursor expected pattern missing: ${before}`);
    out = out.replace(before, after);
  }
  return out;
});

console.log('FinanceMeta lint recovery applied');
