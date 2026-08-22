import { assertValidCADDocument } from "./cad.mjs";

function transformOf(object) {
  return object.transform ?? { translate: [0, 0, 0], rotate: [0, 0, 0], scale: [1, 1, 1] };
}

export function toSceneDescription(document) {
  assertValidCADDocument(document);
  return {
    version: document.version,
    name: document.name,
    objects: document.objects.map((object) => ({
      id: object.id,
      type: object.type,
      visible: object.visible !== false,
      group: object.group ?? null,
      translucent: object.translucent === true,
      transform: transformOf(object),
      geometry: Object.fromEntries(Object.entries(object).filter(([key, value]) => !["id", "type", "visible", "group", "translucent", "transform"].includes(key) && typeof value !== "object"))
    })),
    assemblies: document.assemblies ?? []
  };
}

export function serializeCADDocument(document) {
  assertValidCADDocument(document);
  return JSON.stringify(document, null, 2);
}
