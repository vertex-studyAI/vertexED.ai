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
  const oldBlock = `  const { data: profile, isLoading } = useProfileById(id);\n\n  if (isLoading) return <div className="text-center py-20">Loading profile...</div>;\n  if (!profile) return <div className="text-center py-20">Member not found.</div>;\n\n  const isSelf = user?.id === profile.id;\n  const { data: connections = [] } = useConnectionRequests();\n  const sendRequest = useSendConnectionRequest();\n  const updateProfile = useUpdateMyProfile();`;
  const newBlock = `  const { data: profile, isLoading } = useProfileById(id);\n  const { data: connections = [] } = useConnectionRequests();\n  const sendRequest = useSendConnectionRequest();\n  const updateProfile = useUpdateMyProfile();\n\n  if (isLoading) return <div className="text-center py-20">Loading profile...</div>;\n  if (!profile) return <div className="text-center py-20">Member not found.</div>;\n\n  const isSelf = user?.id === profile.id;`;
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
  const marker = `interface Pointer {\n  id: number;\n  texcoordX: number;\n  texcoordY: number;\n  prevTexcoordX: number;\n  prevTexcoordY: number;\n  deltaX: number;\n  deltaY: number;\n  down: boolean;\n  moved: boolean;\n  color: ColorRGB;\n}\n`;
  if (!source.includes(marker)) throw new Error('FluidCursor pointer type source changed unexpectedly');
  const typed = `${marker}\ninterface FluidConfig {\n  SIM_RESOLUTION: number;\n  DYE_RESOLUTION: number;\n  CAPTURE_RESOLUTION: number;\n  DENSITY_DISSIPATION: number;\n  VELOCITY_DISSIPATION: number;\n  PRESSURE: number;\n  PRESSURE_ITERATIONS: number;\n  CURL: number;\n  SPLAT_RADIUS: number;\n  SPLAT_FORCE: number;\n  SHADING: boolean;\n  COLOR_UPDATE_SPEED: number;\n  PAUSED: boolean;\n  BACK_COLOR: ColorRGB;\n  TRANSPARENT: boolean;\n}\n\ninterface OESHalfFloatExtension {\n  HALF_FLOAT_OES: number;\n}\n\ninterface RenderTextureFormat {\n  internalFormat: number;\n  format: number;\n}\n\ninterface FluidExtensions {\n  formatRGBA: RenderTextureFormat | null;\n  formatRG: RenderTextureFormat | null;\n  formatR: RenderTextureFormat | null;\n  halfFloatTexType: number;\n  supportLinearFiltering: boolean;\n}\n`;
  let out = source.replace(marker, typed);
  const replacements = [
    ['const config: any = {', 'const config: FluidConfig = {'],
    ['let halfFloat: any = null;', 'let halfFloat: OESHalfFloatExtension | null = null;'],
    ['halfFloat = gl.getExtension("OES_texture_half_float");', 'halfFloat = gl.getExtension("OES_texture_half_float") as OESHalfFloatExtension | null;'],
    ['const { gl, ext } = getWebGLContext(canvas) as { gl: WebGL2RenderingContext | null; ext: any };', 'const { gl, ext } = getWebGLContext(canvas) as { gl: WebGL2RenderingContext | null; ext: FluidExtensions | null };'],
    ['window.removeEventListener("touchstart", onTouchStart as any);', 'window.removeEventListener("touchstart", onTouchStart);'],
    ['window.removeEventListener("touchmove", onTouchMove as any);', 'window.removeEventListener("touchmove", onTouchMove);'],
    ['window.removeEventListener("touchend", onTouchEnd as any);', 'window.removeEventListener("touchend", onTouchEnd);'],
  ];
  for (const [before, after] of replacements) {
    if (!out.includes(before)) throw new Error(`FluidCursor expected pattern missing: ${before}`);
    out = out.replace(before, after);
  }
  return out;
});

console.log('FinanceMeta lint recovery applied');
