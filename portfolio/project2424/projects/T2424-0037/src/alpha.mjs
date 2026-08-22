import { validatePlateSpec } from "./core.mjs";
export * from "./alpha/schema.mjs";
export * from "./alpha/engine.mjs";
export * from "./alpha/export.mjs";
import { validateCADDocument as validate } from "./alpha/schema.mjs";
import { assertCADDocument as assert } from "./alpha/schema.mjs";
export const validateCADDocument=(input)=>validate(input,validatePlateSpec);
export const assertCADDocument=(input)=>assert(input,validatePlateSpec);
