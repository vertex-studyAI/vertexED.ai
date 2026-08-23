import { parsePlatePrompt, validatePlateSpec } from "../core.mjs";
import { CADValidationError, NEUROCAD_SCOPE_NOTICE, NEUROCAD_VERSION, assertCADDocument, diagnostic, isPlainRecord, makeAssembly, makeObject, objectRef, assemblyRef, validateCADDocument, validateNumeric } from "./schema.mjs";

export const DEFAULT_JET_ENGINE_PARAMETERS=Object.freeze({engineLengthMm:900,outerDiameterMm:320,shaftDiameterMm:45,compressorStages:6,turbineStages:2,inletLengthRatio:.12,compressorLengthRatio:.32,combustorLengthRatio:.20,turbineLengthRatio:.18,nozzleLengthRatio:.18,casingVisible:true,explodedSpacingMm:0});
const validate=(doc)=>assertCADDocument(doc,validatePlateSpec);
const diag=(doc)=>validateCADDocument(doc,validatePlateSpec);

function parameters(input={}){
  if(!isPlainRecord(input))throw new TypeError("jet-engine parameters must be an object");
  const p={...DEFAULT_JET_ENGINE_PARAMETERS,...input};
  const out={
    engineLengthMm:validateNumeric(p.engineLengthMm,"engineLengthMm",400,1600), outerDiameterMm:validateNumeric(p.outerDiameterMm,"outerDiameterMm",160,600), shaftDiameterMm:validateNumeric(p.shaftDiameterMm,"shaftDiameterMm",12,140),
    compressorStages:validateNumeric(p.compressorStages,"compressorStages",3,12,true), turbineStages:validateNumeric(p.turbineStages,"turbineStages",1,4,true),
    inletLengthRatio:validateNumeric(p.inletLengthRatio,"inletLengthRatio",.06,.30), compressorLengthRatio:validateNumeric(p.compressorLengthRatio,"compressorLengthRatio",.18,.50), combustorLengthRatio:validateNumeric(p.combustorLengthRatio,"combustorLengthRatio",.10,.35), turbineLengthRatio:validateNumeric(p.turbineLengthRatio,"turbineLengthRatio",.08,.30), nozzleLengthRatio:validateNumeric(p.nozzleLengthRatio,"nozzleLengthRatio",.08,.35), casingVisible:p.casingVisible!==false, explodedSpacingMm:typeof p.explodedSpacingMm === "number"&&Number.isFinite(p.explodedSpacingMm)&&p.explodedSpacingMm>=0&&p.explodedSpacingMm<=180?p.explodedSpacingMm:null
  };
  const errors=[];
  if(out.explodedSpacingMm===null)errors.push(diagnostic("OUT_OF_RANGE","explodedSpacingMm must be finite and in [0, 180]",null,"explodedSpacingMm"));
  if(out.shaftDiameterMm>=out.outerDiameterMm*.45)errors.push(diagnostic("SHAFT_EXCEEDS_CASING_LIMIT","shaftDiameterMm must stay below 45% of outerDiameterMm",null,"shaftDiameterMm"));
  const sum=out.inletLengthRatio+out.compressorLengthRatio+out.combustorLengthRatio+out.turbineLengthRatio+out.nozzleLengthRatio;
  if(Math.abs(sum-1)>1e-9)errors.push(diagnostic("SECTION_RATIOS_NOT_NORMALIZED",`section length ratios must sum to 1.0; received ${sum}`,null,"sectionRatios"));
  if(errors.length)throw new CADValidationError({status:"FAIL",errors,warnings:[],document:null}); return out;
}
const shift=(section,spacing)=>({inlet:-2,compressor:-1,combustor:0,turbine:1,nozzle:2}[section]??0)*spacing;

export function createJetEngineDocument(input={}){
  const p=parameters(input), L=p.engineLengthMm, R=p.outerDiameterMm/2, shaftR=p.shaftDiameterMm/2, start=-L/2;
  const li=L*p.inletLengthRatio, lc=L*p.compressorLengthRatio, lb=L*p.combustorLengthRatio, lt=L*p.turbineLengthRatio, ln=L*p.nozzleLengthRatio;
  const cStart=start+li,bStart=cStart+lc,tStart=bStart+lb,nStart=tStart+lt;
  const objects=[], assemblies=[];
  objects.push(makeObject("inlet_casing","tube","Inlet casing",{outerRadius:R,innerRadius:R*.88,length:li},{position:[start+li/2+shift("inlet",p.explodedSpacingMm),0,0],visible:p.casingVisible,materialRole:"casing",section:"inlet"}));
  assemblies.push(makeAssembly("inlet","Inlet",[objectRef("inlet_casing")],{section:"inlet"}));
  objects.push(makeObject("compressor_casing","tube","Compressor casing",{outerRadius:R*.98,innerRadius:R*.90,length:lc},{position:[cStart+lc/2+shift("compressor",p.explodedSpacingMm),0,0],visible:p.casingVisible,materialRole:"casing",section:"compressor"}));
  const cChildren=[objectRef("compressor_casing")], pitch=lc/(p.compressorStages+.6);
  for(let i=0;i<p.compressorStages;i++){
    const stage=i+1,x=cStart+pitch*(i+.8)+shift("compressor",p.explodedSpacingMm),s=String(stage).padStart(2,"0"),rot=`compressor_rotor_${s}`,stat=`compressor_stator_${s}`;
    const tip=R*(.76+i/Math.max(1,p.compressorStages-1)*.07),hub=Math.max(shaftR*1.45,R*.18);
    objects.push(makeObject(rot,"blade_ring",`Compressor rotor ${s}`,{hubRadius:hub,tipRadius:tip,thickness:Math.max(4,pitch*.12),bladeChord:Math.max(5,pitch*.18),bladeCount:16},{position:[x-pitch*.12,0,0],materialRole:"compressor_rotor",section:"compressor",metadata:{stage}}));
    objects.push(makeObject(stat,"blade_ring",`Compressor stator ${s}`,{hubRadius:hub*1.02,tipRadius:tip*.98,thickness:Math.max(3,pitch*.09),bladeChord:Math.max(4,pitch*.15),bladeCount:14},{position:[x+pitch*.18,0,0],materialRole:"compressor_stator",section:"compressor",metadata:{stage}}));
    const id=`compressor_stage_${s}`; assemblies.push(makeAssembly(id,`Compressor stage ${s}`,[objectRef(rot),objectRef(stat)],{stage})); cChildren.push(assemblyRef(id));
  }
  assemblies.push(makeAssembly("compressor","Compressor",cChildren,{section:"compressor"}));
  objects.push(makeObject("central_shaft","cylinder","Central shaft",{radius:shaftR,length:L*.78},{materialRole:"shaft",section:"shaft"}));
  objects.push(makeObject("combustor_envelope","tube","Combustor envelope",{outerRadius:R*.76,innerRadius:R*.46,length:lb},{position:[bStart+lb/2,0,0],materialRole:"combustor",section:"combustor",metadata:{conceptual:true}}));
  objects.push(makeObject("combustor_casing","tube","Combustor casing",{outerRadius:R*.98,innerRadius:R*.90,length:lb},{position:[bStart+lb/2,0,0],visible:p.casingVisible,materialRole:"casing",section:"combustor"}));
  assemblies.push(makeAssembly("combustor","Combustor envelope",[objectRef("combustor_casing"),objectRef("combustor_envelope")],{section:"combustor",conceptual:true}));
  objects.push(makeObject("turbine_casing","tube","Turbine casing",{outerRadius:R*.98,innerRadius:R*.89,length:lt},{position:[tStart+lt/2+shift("turbine",p.explodedSpacingMm),0,0],visible:p.casingVisible,materialRole:"casing",section:"turbine"}));
  const tChildren=[objectRef("turbine_casing")],tp=lt/(p.turbineStages+.8);
  for(let i=0;i<p.turbineStages;i++){
    const stage=i+1,s=String(stage).padStart(2,"0"),id=`turbine_rotor_${s}`,x=tStart+tp*(i+.85)+shift("turbine",p.explodedSpacingMm);
    objects.push(makeObject(id,"blade_ring",`Turbine rotor ${s}`,{hubRadius:Math.max(shaftR*1.6,R*.22),tipRadius:R*(.72-i*.04),thickness:Math.max(5,tp*.16),bladeChord:Math.max(6,tp*.20),bladeCount:18},{position:[x,0,0],materialRole:"turbine",section:"turbine",metadata:{stage}}));
    const aid=`turbine_stage_${s}`; assemblies.push(makeAssembly(aid,`Turbine stage ${s}`,[objectRef(id)],{stage})); tChildren.push(assemblyRef(aid));
  }
  assemblies.push(makeAssembly("turbine","Turbine",tChildren,{section:"turbine"}));
  objects.push(makeObject("exhaust_nozzle","frustum","Exhaust nozzle",{startRadius:R*.76,endRadius:R*.46,length:ln},{position:[nStart+ln/2+shift("nozzle",p.explodedSpacingMm),0,0],materialRole:"nozzle",section:"nozzle"}));
  assemblies.push(makeAssembly("nozzle","Exhaust nozzle",[objectRef("exhaust_nozzle")],{section:"nozzle"}));
  assemblies.push(makeAssembly("engine","Turbojet Concept",[assemblyRef("inlet"),assemblyRef("compressor"),objectRef("central_shaft"),assemblyRef("combustor"),assemblyRef("turbine"),assemblyRef("nozzle")],{root:true}));
  return validate({version:NEUROCAD_VERSION,units:"mm",name:"Conceptual axial jet-engine assembly",objects,assemblies,metadata:{kind:"jet_engine_concept",conceptual:true,parameters:p,scopeNotice:NEUROCAD_SCOPE_NOTICE,rootAssemblyId:"engine"}});
}

export function createFlangedTubeDocument(input={}){
  const length=input.length??180,outerRadius=input.outerRadius??42,wall=input.wallThickness??4,flangeOuter=input.flangeOuterRadius??58,flangeThickness=input.flangeThickness??10,inner=outerRadius-wall,offset=length/2-flangeThickness/2;
  return validate({version:NEUROCAD_VERSION,units:"mm",name:"Flanged tube assembly",objects:[makeObject("tube_body","tube","Tube body",{outerRadius,innerRadius:inner,length}),makeObject("front_flange","ring","Front flange",{outerRadius:flangeOuter,innerRadius:inner,length:flangeThickness},{position:[-offset,0,0]}),makeObject("rear_flange","ring","Rear flange",{outerRadius:flangeOuter,innerRadius:inner,length:flangeThickness},{position:[offset,0,0]})],assemblies:[makeAssembly("flanged_tube","Flanged tube",[objectRef("front_flange"),objectRef("tube_body"),objectRef("rear_flange")],{root:true})],metadata:{kind:"flanged_tube",conceptual:true,rootAssemblyId:"flanged_tube",scopeNotice:"Conceptual parametric geometry; manufacturing tolerances and material requirements are not modeled."}});
}

export function documentFromPlateSpec(spec){const p=validatePlateSpec(spec);return validate({version:NEUROCAD_VERSION,units:"mm",name:"Validated mounting plate",objects:[makeObject("plate","rectangular_plate","Mounting plate",{width:p.width,height:p.height,thickness:p.thickness,holes:p.holes})],assemblies:[makeAssembly("plate_assembly","Mounting plate",[objectRef("plate")],{root:true})],metadata:{kind:"plate",conceptual:false,rootAssemblyId:"plate_assembly"}});}

const WORDS={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12};
const token=(v)=>/^\d+$/u.test(v)?Number(v):WORDS[v]??null;
const integer=(text,re)=>{const m=text.match(re);return m?token(m[1]):null;}; const number=(text,re)=>{const m=text.match(re);return m?Number(m[1]):null;};
function edits(text,current={}){
  const p={...DEFAULT_JET_ENGINE_PARAMETERS,...current},num="(\\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)";
  const c=integer(text,new RegExp(`${num}\\s+compressor\\s*stages?`,"u"))??integer(text,/(?:compressor(?:\s+stages?)?)\s*(?:to|=|of|with)?\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)/u);
  const t=integer(text,/(\d+|one|two|three|four)\s+turbine\s*stages?/u)??integer(text,/(?:turbine(?:\s+stages?)?)\s*(?:to|=|of|with)?\s*(\d+|one|two|three|four)/u);
  if(c!==null)p.compressorStages=c;if(t!==null)p.turbineStages=t;
  const l=number(text,/(?:length|engine\s+length)\s*(?:to|=|of)?\s*(\d+(?:\.\d+)?)\s*mm/u),od=number(text,/(?:outer\s+diameter|diameter)\s*(?:to|=|of)?\s*(\d+(?:\.\d+)?)\s*mm/u),sd=number(text,/shaft\s+diameter\s*(?:to|=|of)?\s*(\d+(?:\.\d+)?)\s*mm/u); if(l!==null)p.engineLengthMm=l;if(od!==null)p.outerDiameterMm=od;if(sd!==null)p.shaftDiameterMm=sd;
  if(/\bmake\s+(?:the\s+)?engine\s+longer\b|\bmake\s+it\s+longer\b/u.test(text))p.engineLengthMm=Math.min(1600,Math.round(p.engineLengthMm*1.15));
  if(/\bshaft\s+(?:slightly\s+)?thicker\b|\bmake\s+the\s+shaft\s+slightly\s+thicker\b/u.test(text))p.shaftDiameterMm=Math.min(p.outerDiameterMm*.40,Math.round(p.shaftDiameterMm*1.12));
  if(/\bhide\s+(?:the\s+)?(?:outer\s+)?casing\b/u.test(text))p.casingVisible=false;if(/\bshow\s+(?:the\s+)?(?:outer\s+)?casing\b/u.test(text))p.casingVisible=true;
  if(/\bexploded(?:\s+view)?\b/u.test(text))p.explodedSpacingMm=Math.max(60,p.explodedSpacingMm||0);if(/\bcollapse\s+view\b|\bassembled\s+view\b/u.test(text))p.explodedSpacingMm=0;return p;
}

export function interpretNeuroCadCommand(prompt,current=null){
  if(typeof prompt!=="string"||!prompt.trim())throw new TypeError("prompt must be a non-empty string"); const text=prompt.toLowerCase().replace(/\s+/gu," ").trim(),kind=current?.metadata?.kind;
  if(/\breset\b/u.test(text)&&kind==="jet_engine_concept"){const document=createJetEngineDocument();return{intent:"RESET",document,diagnostics:diag(document)};}
  if(/\bflanged\s+tube\b/u.test(text)){const document=createFlangedTubeDocument();return{intent:"CREATE_ASSEMBLY",document,diagnostics:diag(document)};}
  if(/\b(plate|panel|bracket|rectangle)\b/u.test(text)&&!/\b(jet[ -]?engine|turbojet|axial\s+engine)\b/u.test(text)){const document=documentFromPlateSpec(parsePlatePrompt(prompt));return{intent:"CREATE_OBJECT",document,diagnostics:diag(document)};}
  const wants=/\b(jet[ -]?engine|turbojet|axial\s+engine)\b/u.test(text),follow=kind==="jet_engine_concept"&&/\b(compressor|turbine|casing|exploded|longer|shaft|assembled|collapse|length|diameter)\b/u.test(text);
  if(wants||follow){const document=createJetEngineDocument(edits(text,kind==="jet_engine_concept"?current.metadata.parameters:{}));return{intent:kind==="jet_engine_concept"?"MODIFY_PARAMETER":"CREATE_ASSEMBLY",document,diagnostics:diag(document)};}
  throw new Error("Supported alpha commands currently cover validated plates, a flanged-tube preset, the jet-engine concept, and bounded jet-engine follow-up edits.");
}
