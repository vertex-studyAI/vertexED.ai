import { validatePlateSpec } from "./core.mjs";
export * from "./alpha/schema.mjs";
export {
  DEFAULT_JET_ENGINE_PARAMETERS,
  createJetEngineDocument,
  createFlangedTubeDocument,
  documentFromPlateSpec
} from "./alpha/engine.mjs";
export { interpretNeuroCadCommand } from "./alpha/intent.mjs";
export * from "./alpha/export.mjs";
import { validateCADDocument as validate } from "./alpha/schema.mjs";
import { assertCADDocument as assert } from "./alpha/schema.mjs";
export const validateCADDocument=(input)=>validate(input,validatePlateSpec);
export const assertCADDocument=(input)=>assert(input,validatePlateSpec);
