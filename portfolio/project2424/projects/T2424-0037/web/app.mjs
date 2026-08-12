import { parsePlatePrompt, summarizeSpec, toOpenScad, toSvg } from "../src/core.mjs";

const promptElement = document.querySelector("#prompt");
const previewElement = document.querySelector("#preview");
const summaryElement = document.querySelector("#summary");
const scadElement = document.querySelector("#scad");
const errorElement = document.querySelector("#error");
const compileButton = document.querySelector("#compile");

function compile() {
  errorElement.textContent = "";
  try {
    const spec = parsePlatePrompt(promptElement.value);
    previewElement.innerHTML = toSvg(spec);
    summaryElement.textContent = JSON.stringify(summarizeSpec(spec), null, 2);
    scadElement.textContent = toOpenScad(spec);
  } catch (error) {
    previewElement.replaceChildren();
    summaryElement.textContent = "";
    scadElement.textContent = "";
    errorElement.textContent = error instanceof Error ? error.message : String(error);
  }
}

compileButton.addEventListener("click", compile);
compile();
