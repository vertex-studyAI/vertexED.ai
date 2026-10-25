import type { StudyPack } from './studyPackTypes';

export type MypContentSource = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  use: 'programme-structure' | 'concept-reference';
  note: string;
};

export type MypPracticeQuestion = {
  id: string;
  difficulty: 'Foundation' | 'Standard' | 'Advanced' | 'Challenge';
  command: string;
  marks: number;
  prompt: string;
  hints: string[];
  solution: string[];
  successCriteria: string[];
};

export type MypLesson = {
  id: string;
  subjectSlug: string;
  topic: string;
  summary: string;
  explanation?: string[];
  prerequisiteIds?: string[];
  objectives: string[];
  keyIdeas: string[];
  definitions: Array<{ term: string; meaning: string }>;
  method: string[];
  workedExample: { prompt: string; steps: string[]; conclusion: string };
  misconceptions: Array<{ mistake: string; correction: string }>;
  practice: MypPracticeQuestion[];
  studyPack?: StudyPack;
  checklist: string[];
  sourceIds: string[];
  contentStatus: 'original-editorial-draft';
  curriculumVersion: 'vertexed-myp5-2026.1';
};

import { MYP5_LESSON_EXPANSION } from './myp5LessonExpansion';
import { MYP5_MATHEMATICS_COMPLETION } from './myp5MathematicsCompletion';
import { MYP5_PHYSICS_COMPLETION } from './myp5PhysicsCompletion';
import { MYP5_CHEMISTRY_COMPLETION } from './myp5ChemistryCompletion';
import { MYP5_BIOLOGY_COMPLETION } from './myp5BiologyCompletion';
import { MYP5_INTEGRATED_SCIENCES_COMPLETION } from './myp5IntegratedSciencesCompletion';
import { MYP5_ENGLISH_COMPLETION } from './myp5EnglishCompletion';
import { MYP5_HISTORY_COMPLETION } from './myp5HistoryCompletion';
import { MYP5_SPANISH_COMPLETION } from './myp5SpanishCompletion';
import { MYP5_DESIGN_COMPLETION } from './myp5DesignCompletion';
import { MYP5_ARTS_COMPLETION } from './myp5ArtsCompletion';
import { MYP5_PERSONAL_PROJECT_COMPLETION } from './myp5PersonalProjectCompletion';
import { MYP5_PHE_COMPLETION } from './myp5PheCompletion';
import { MYP5_INTEGRATED_HUMANITIES_COMPLETION } from './myp5IntegratedHumanitiesCompletion';
import { MYP5_GEOGRAPHY_COMPLETION } from './myp5GeographyCompletion';
import { MYP5_ECONOMICS_COMPLETION } from './myp5EconomicsCompletion';

export const MYP_CONTENT_SOURCES: MypContentSource[] = [
{"id": "phe-openstax-cardiac", "title": "Anatomy and Physiology 2e: Cardiac physiology", "publisher": "OpenStax", "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/19-4-cardiac-physiology", "use": "concept-reference", "note": "Inspected 9 October 2026. Concepts of circulation and rate. Fictional arithmetic only; no diagnostic ranges, target heart rates or individual fitness inference adopted. These are original editorial drafts, not official MYP descriptors or teacher approval."},
{"id": "phe-openstax-muscle", "title": "Anatomy and Physiology 2e: Skeletal muscle", "publisher": "OpenStax", "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/10-2-skeletal-muscle", "use": "concept-reference", "note": "Inspected 9 October 2026. Muscle force, movement and stabilisation concepts. Original written examples; no claim to assess technique or prescribe activity. These are original editorial drafts, not official MYP descriptors or teacher approval."},
{"id": "phe-who-diet", "title": "Healthy diet", "publisher": "World Health Organization", "url": "https://www.who.int/news-room/fact-sheets/detail/healthy-diet", "use": "concept-reference", "note": "Inspected 9 October 2026. General variety and adequacy concepts. Original fictional label arithmetic; adult dietary quantities, restrictive diets and personal nutrition recommendations are not adopted. These are original editorial drafts, not official MYP descriptors or teacher approval."},
{"id": "phe-nhs-wellbeing", "title": "Five steps to mental wellbeing", "publisher": "NHS", "url": "https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/five-steps-to-mental-wellbeing/", "use": "concept-reference", "note": "Inspected 9 October 2026. General supportive connection and wellbeing concepts. No diagnosis, guaranteed cure or replacement for appropriate care. These are original editorial drafts, not official MYP descriptors or teacher approval."},
{"id": "phe-who-activity", "title": "Physical activity", "publisher": "World Health Organization", "url": "https://www.who.int/news-room/fact-sheets/detail/physical-activity", "use": "concept-reference", "note": "Inspected 9 October 2026. General activity, health and inclusion context. No age-specific dosage, universal progression percentage or personal exercise programme adopted. These are original editorial drafts, not official MYP descriptors or teacher approval."},
{"id": "phe-asc-game-sense", "title": "Game sense approach", "publisher": "Australian Sports Commission", "url": "https://www.ausport.gov.au/schools/resource-hub/p4l/game-sense-approach", "use": "concept-reference", "note": "Inspected 9 October 2026. Decision-making, contextual adjustment, participation and specific feedback concepts. Original fictional cases and datasets; no activity cards, images or practical assessments reproduced. These are original editorial drafts, not official MYP descriptors or teacher approval."},
  {"id": "project-ib-learning", "title": "What is an IB education? Approaches to learning", "publisher": "International Baccalaureate", "url": "https://www-prod.ibo.org/professional-development/free-learning/what-is-an-ib-education/", "use": "concept-reference", "note": "Inspected 9 October 2026. Public cross-programme reference for inquiry and the five ATL categories. Original fictional project cases and editorial practice criteria; not official Personal Project descriptors, submission requirements or teacher approval. The public MYP project overview could not be reopened, so no new current rubric claim is made."},
  {"id": "arts-nga-elements", "title": "The Elements of Art", "publisher": "National Gallery of Art", "url": "https://www.nga.gov/educational-resources/elements-art", "use": "concept-reference", "note": "Inspected 9 October 2026. Visual-element concept reference. Original fictional cases and responses; no source image, exercise or prose reproduced. Editorial practice, not an official rubric or teacher approval."},
  {"id": "arts-getty-analysis", "title": "Understanding Formal Analysis", "publisher": "J. Paul Getty Museum", "url": "https://www.getty.edu/education/teachers/classroom_resources/formal_analysis.html", "use": "concept-reference", "note": "Inspected 9 October 2026. Formal-analysis vocabulary reference. Original editorial exercises; no artwork or source activity copied. Editorial practice, not an official rubric or teacher approval."},
  {"id": "arts-vam-sketchbooks", "title": "Architects and their sketchbooks", "publisher": "Victoria and Albert Museum", "url": "https://www.vam.ac.uk/articles/architects-and-their-sketchbooks", "use": "concept-reference", "note": "Inspected 9 October 2026. Reference for sketchbooks as records of observation and developing ideas. No source quotation, image or case study reproduced. Editorial practice, not an official rubric or teacher approval."},
  {"id": "arts-carnegie-toolbox", "title": "Music Educators Toolbox", "publisher": "Carnegie Hall", "url": "https://www.carnegiehall.org/Education/Programs/Music-Educators-Toolbox", "use": "concept-reference", "note": "Inspected 9 October 2026. Elementary musical-element reference, not MYP alignment or practical assessment certification. All duration patterns and fictional cases are original; no audio, score or source exercise copied. Editorial practice, not an official rubric or teacher approval."},
  {"id": "arts-rsc-rehearsal", "title": "Rehearsal room approaches to Shakespeare", "publisher": "Royal Shakespeare Company", "url": "https://www.rsc.org.uk/learn/schools-and-teachers/teacher-resources/rehearsal-room-approaches-to-shakespeare", "use": "concept-reference", "note": "Inspected 9 October 2026. Concept reference for collaborative rehearsal and interpretation. Original non-contact cases and dialogue; no play text, licensed activity or learning-gain claim reproduced. Editorial practice, not an official rubric or teacher approval."},

  {"id": "design-double-diamond", "title": "The Double Diamond", "publisher": "Design Council", "url": "https://www.designcouncil.org.uk/resources/the-double-diamond/", "use": "concept-reference", "note": "Concept reference inspected 8–9 October 2026. Exercises and hypothetical data are original editorial material; no source prose or exercises are reproduced. Design criterion headings are local mapped practice, not official rubric descriptors."},
  {"id": "design-user-needs", "title": "Start by learning user needs", "publisher": "Government Digital Service", "url": "https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs", "use": "concept-reference", "note": "Concept reference inspected 8–9 October 2026. Exercises and hypothetical data are original editorial material; no source prose or exercises are reproduced. Design criterion headings are local mapped practice, not official rubric descriptors."},
  {"id": "design-research-planning", "title": "Plan user research for your service", "publisher": "Government Digital Service", "url": "https://www.gov.uk/service-manual/user-research/plan-user-research-for-your-service", "use": "concept-reference", "note": "Concept reference inspected 8–9 October 2026. Exercises and hypothetical data are original editorial material; no source prose or exercises are reproduced. Design criterion headings are local mapped practice, not official rubric descriptors."},
  {"id": "design-usability", "title": "Using moderated usability testing", "publisher": "Government Digital Service", "url": "https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing", "use": "concept-reference", "note": "Concept reference inspected 8–9 October 2026. Exercises and hypothetical data are original editorial material; no source prose or exercises are reproduced. Design criterion headings are local mapped practice, not official rubric descriptors."},
  {"id": "design-acceptance-criteria", "title": "Writing user stories and acceptance criteria", "publisher": "Government Digital Service", "url": "https://www.gov.uk/service-manual/agile-delivery/writing-user-stories", "use": "concept-reference", "note": "Concept reference inspected 8–9 October 2026. Exercises and hypothetical data are original editorial material; no source prose or exercises are reproduced. Design criterion headings are local mapped practice, not official rubric descriptors."},
  {"id": "econ-externalities", "title": "The economics of pollution and externalities", "publisher": "OpenStax, Rice University", "url": "https://openstax.org/books/principles-economics-3e/pages/12-1-the-economics-of-pollution", "use": "concept-reference", "note": "Concept reference inspected 9 October 2026. Existing original lesson examples retained; no source prose, data or exercises reproduced."},
  {"id": "spanish-conjugation", "title": "Spanish verb conjugation models", "publisher": "Real Academia Espa\u00f1ola and ASALE", "url": "https://www.rae.es/dpd/ayuda/modelos-de-conjugacion-verbal", "use": "concept-reference", "note": "Regular and irregular paradigms inspected 8 October 2026. Original teaching sentences; no literary examples or exercises reproduced."},
  {"id": "spanish-agreement", "title": "Spanish grammatical agreement", "publisher": "Real Academia Española and ASALE", "url": "https://www.rae.es/dpd/concordancia", "use": "concept-reference", "note": "Reference inspected 8 October 2026. Original teaching sentences and passages; no source literary examples or exercises reproduced. The editorial A2-to-early-B1 target is not an official alignment or proficiency certification."},
  {"id": "spanish-accents", "title": "Spanish written accents", "publisher": "Real Academia Española and ASALE", "url": "https://www.rae.es/dpd/tilde", "use": "concept-reference", "note": "Reference inspected 8 October 2026. Original teaching sentences and passages; no source literary examples or exercises reproduced. The editorial A2-to-early-B1 target is not an official alignment or proficiency certification."},
  {"id": "spanish-porque", "title": "Porque and por qué", "publisher": "Real Academia Española and ASALE", "url": "https://www.rae.es/dpd/porqu%C3%A9", "use": "concept-reference", "note": "Reference inspected 8 October 2026. Original teaching sentences and passages; no source literary examples or exercises reproduced. The editorial A2-to-early-B1 target is not an official alignment or proficiency certification."},
  {"id": "spanish-haber", "title": "Haber: existence and auxiliary uses", "publisher": "Real Academia Española and ASALE", "url": "https://www.rae.es/dpd/haber", "use": "concept-reference", "note": "Reference inspected 8 October 2026. Original teaching sentences and passages; no source literary examples or exercises reproduced. The editorial A2-to-early-B1 target is not an official alignment or proficiency certification."},
  {"id": "spanish-gustar", "title": "Gustar: meaning and agreement", "publisher": "Real Academia Española and ASALE", "url": "https://www.rae.es/dpd/gustar", "use": "concept-reference", "note": "Reference inspected 8 October 2026. Original teaching sentences and passages; no source literary examples or exercises reproduced. The editorial A2-to-early-B1 target is not an official alignment or proficiency certification."},
  {"id": "spanish-ir", "title": "Ir: constructions and usage", "publisher": "Real Academia Española and ASALE", "url": "https://www.rae.es/dpd/ir", "use": "concept-reference", "note": "Reference inspected 8 October 2026. Original teaching sentences and passages; no source literary examples or exercises reproduced. The editorial A2-to-early-B1 target is not an official alignment or proficiency certification."},
  {"id": "spanish-si", "title": "Si: conditional constructions", "publisher": "Real Academia Española and ASALE", "url": "https://www.rae.es/dpd/si", "use": "concept-reference", "note": "Reference inspected 8 October 2026. Original teaching sentences and passages; no source literary examples or exercises reproduced. The editorial A2-to-early-B1 target is not an official alignment or proficiency certification."},
  {"id": "spanish-mano", "title": "Mano: echar una mano", "publisher": "Real Academia Española and ASALE", "url": "https://dle.rae.es/mano", "use": "concept-reference", "note": "Reference inspected 8 October 2026. Original teaching sentences and passages; no source literary examples or exercises reproduced. The editorial A2-to-early-B1 target is not an official alignment or proficiency certification."},
  {"id": "spanish-nube", "title": "Nube: en las nubes and por las nubes", "publisher": "Real Academia Española and ASALE", "url": "https://dle.rae.es/nube", "use": "concept-reference", "note": "Reference inspected 8 October 2026. Original teaching sentences and passages; no source literary examples or exercises reproduced. The editorial A2-to-early-B1 target is not an official alignment or proficiency certification."},
  {"id": "spanish-cefr", "title": "The CEFR levels", "publisher": "Council of Europe", "url": "https://www.coe.int/en/web/common-european-framework-reference-languages/level-descriptions", "use": "concept-reference", "note": "Reference inspected 8 October 2026. Original teaching sentences and passages; no source literary examples or exercises reproduced. The editorial A2-to-early-B1 target is not an official alignment or proficiency certification."},

  {"id": "geog-net-migration", "title": "Net migration: definition and measurement", "publisher": "World Bank", "url": "https://databank.worldbank.org/metadataglossary/world-development-indicators/series/SM.POP.NETM", "use": "concept-reference", "note": "Concept reference inspected 8 October 2026. Examples and datasets are original hypothetical classroom material; no source charts, exercises or real-place statistics are reproduced."},
  {"id": "geog-urban-population", "title": "Urban population: definitions and comparability", "publisher": "World Bank", "url": "https://databank.worldbank.org/metadataglossary/world-development-indicators/series/SP.URB.TOTL.IN.ZS", "use": "concept-reference", "note": "Concept reference inspected 8 October 2026. Examples and datasets are original hypothetical classroom material; no source charts, exercises or real-place statistics are reproduced."},
  {"id": "geog-water-cycle", "title": "The water cycle: stores and flows", "publisher": "US Geological Survey", "url": "https://www.usgs.gov/water-science-school/water-cycle", "use": "concept-reference", "note": "Concept reference inspected 8 October 2026. Examples and datasets are original hypothetical classroom material; no source charts, exercises or real-place statistics are reproduced."},
  {"id": "geog-sustainable-consumption", "title": "Sustainable consumption and production policies", "publisher": "United Nations Environment Programme", "url": "https://www.unep.org/explore-topics/resource-efficiency/what-we-do/sustainable-consumption-and-production-policies", "use": "concept-reference", "note": "Concept reference inspected 8 October 2026. Examples and datasets are original hypothetical classroom material; no source charts, exercises or real-place statistics are reproduced."},
  {"id": "geog-risk", "title": "Disaster risk terminology", "publisher": "United Nations Office for Disaster Risk Reduction", "url": "https://www.undrr.org/terminology/disaster-risk", "use": "concept-reference", "note": "Concept reference inspected 8 October 2026. Examples and datasets are original hypothetical classroom material; no source charts, exercises or real-place statistics are reproduced."},
  {"id": "geog-hazard", "title": "Hazard terminology", "publisher": "United Nations Office for Disaster Risk Reduction", "url": "https://www.undrr.org/terminology/hazard", "use": "concept-reference", "note": "Concept reference inspected 8 October 2026. Examples and datasets are original hypothetical classroom material; no source charts, exercises or real-place statistics are reproduced."},
  {"id": "geog-exposure", "title": "Exposure terminology", "publisher": "United Nations Office for Disaster Risk Reduction", "url": "https://www.undrr.org/terminology/exposure", "use": "concept-reference", "note": "Concept reference inspected 8 October 2026. Examples and datasets are original hypothetical classroom material; no source charts, exercises or real-place statistics are reproduced."},
  {"id": "geog-vulnerability", "title": "Vulnerability terminology", "publisher": "United Nations Office for Disaster Risk Reduction", "url": "https://www.undrr.org/terminology/vulnerability", "use": "concept-reference", "note": "Concept reference inspected 8 October 2026. Examples and datasets are original hypothetical classroom material; no source charts, exercises or real-place statistics are reproduced."},
  {"id": "geog-globalisation", "title": "Globalization Today", "publisher": "International Monetary Fund", "url": "https://www.imf.org/en/publications/fandd/issues/2024/06/b2b-globalization-today-adam-jakubik-and-elizabeth-van-heuvelen", "use": "concept-reference", "note": "Concept reference inspected 8 October 2026. Examples and datasets are original hypothetical classroom material; no source charts, exercises or real-place statistics are reproduced."},
  {"id": "geog-map-scales", "title": "Map symbols and scale: OnDemand Topo guide", "publisher": "US Geological Survey", "url": "https://www.usgs.gov/ngp-standards-and-specifications/75-minute-ondemand-topo-cartographic-specifications-map-symbol", "use": "concept-reference", "note": "Concept reference inspected 8 October 2026. Examples and datasets are original hypothetical classroom material; no source charts, exercises or real-place statistics are reproduced."},

  {"id": "econ-choice", "title": "Choice and budget constraints", "publisher": "OpenStax, Rice University", "url": "https://openstax.org/books/principles-economics-3e/pages/2-1-how-individuals-make-choices-based-on-their-budget-constraint", "use": "concept-reference", "note": "Concept reference inspected 8 October 2026. VertexED explanations, numerical datasets and practice are original hypothetical material. No source prose, charts or exercises are reproduced."},
  {"id": "econ-systems", "title": "Economic systems", "publisher": "OpenStax, Rice University", "url": "https://openstax.org/books/principles-economics-3e/pages/1-4-how-to-organize-economies-an-overview-of-economic-systems", "use": "concept-reference", "note": "Concept reference inspected 8 October 2026. VertexED explanations, numerical datasets and practice are original hypothetical material. No source prose, charts or exercises are reproduced."},
  {"id": "econ-markets", "title": "Demand, supply and equilibrium", "publisher": "OpenStax, Rice University", "url": "https://openstax.org/books/principles-economics-3e/pages/3-1-demand-supply-and-equilibrium-in-markets-for-goods-and-services", "use": "concept-reference", "note": "Concept reference inspected 8 October 2026. VertexED explanations, numerical datasets and practice are original hypothetical material. No source prose, charts or exercises are reproduced."},
  {"id": "econ-shifts", "title": "Shifts in demand and supply", "publisher": "OpenStax, Rice University", "url": "https://openstax.org/books/principles-economics-3e/pages/3-2-shifts-in-demand-and-supply-for-goods-and-services", "use": "concept-reference", "note": "Concept reference inspected 8 October 2026. VertexED explanations, numerical datasets and practice are original hypothetical material. No source prose, charts or exercises are reproduced."},
  {"id": "econ-elasticity", "title": "Price elasticity of demand and supply", "publisher": "OpenStax, Rice University", "url": "https://openstax.org/books/principles-economics-3e/pages/5-1-price-elasticity-of-demand-and-price-elasticity-of-supply", "use": "concept-reference", "note": "Concept reference inspected 8 October 2026. VertexED explanations, numerical datasets and practice are original hypothetical material. No source prose, charts or exercises are reproduced."},
  {"id": "econ-revenue", "title": "Elasticity and pricing", "publisher": "OpenStax, Rice University", "url": "https://openstax.org/books/principles-economics-3e/pages/5-3-elasticity-and-pricing", "use": "concept-reference", "note": "Concept reference inspected 8 October 2026. VertexED explanations, numerical datasets and practice are original hypothetical material. No source prose, charts or exercises are reproduced."},
  {"id": "econ-controls", "title": "Price ceilings and floors", "publisher": "OpenStax, Rice University", "url": "https://openstax.org/books/principles-economics-3e/pages/3-4-price-ceilings-and-price-floors", "use": "concept-reference", "note": "Concept reference inspected 8 October 2026. VertexED explanations, numerical datasets and practice are original hypothetical material. No source prose, charts or exercises are reproduced."},
  {"id": "econ-labour", "title": "Demand and supply in labour markets", "publisher": "OpenStax, Rice University", "url": "https://openstax.org/books/principles-economics-3e/pages/4-1-demand-and-supply-at-work-in-labor-markets", "use": "concept-reference", "note": "Concept reference inspected 8 October 2026. VertexED explanations, numerical datasets and practice are original hypothetical material. No source prose, charts or exercises are reproduced."},
  {"id": "econ-unemployment", "title": "Defining and computing unemployment", "publisher": "OpenStax, Rice University", "url": "https://openstax.org/books/principles-economics-3e/pages/21-1-how-economists-define-and-compute-unemployment-rate", "use": "concept-reference", "note": "Concept reference inspected 8 October 2026. VertexED explanations, numerical datasets and practice are original hypothetical material. No source prose, charts or exercises are reproduced."},
  {"id": "econ-trade", "title": "Absolute and comparative advantage", "publisher": "OpenStax, Rice University", "url": "https://openstax.org/books/principles-economics-3e/pages/33-1-absolute-and-comparative-advantage", "use": "concept-reference", "note": "Concept reference inspected 8 October 2026. VertexED explanations, numerical datasets and practice are original hypothetical material. No source prose, charts or exercises are reproduced."},
  {"id": "econ-gdp", "title": "Measuring output with GDP", "publisher": "OpenStax, Rice University", "url": "https://openstax.org/books/principles-economics-3e/pages/19-1-measuring-the-size-of-the-economy-gross-domestic-product", "use": "concept-reference", "note": "Concept reference inspected 8 October 2026. VertexED explanations, numerical datasets and practice are original hypothetical material. No source prose, charts or exercises are reproduced."},
  {"id": "econ-real-values", "title": "Adjusting nominal values to real values", "publisher": "OpenStax, Rice University", "url": "https://openstax.org/books/principles-economics-3e/pages/19-2-adjusting-nominal-values-to-real-values", "use": "concept-reference", "note": "Concept reference inspected 8 October 2026. VertexED explanations, numerical datasets and practice are original hypothetical material. No source prose, charts or exercises are reproduced."},
  {"id": "econ-inflation", "title": "Tracking inflation", "publisher": "OpenStax, Rice University", "url": "https://openstax.org/books/principles-economics-3e/pages/22-1-tracking-inflation", "use": "concept-reference", "note": "Concept reference inspected 8 October 2026. VertexED explanations, numerical datasets and practice are original hypothetical material. No source prose, charts or exercises are reproduced."},
  {"id": "undp-hdi", "title": "Human Development Index: dimensions and limitations", "publisher": "United Nations Development Programme", "url": "https://hdr.undp.org/data-center/human-development-index", "use": "concept-reference", "note": "Reference for HDI dimensions and interpretive limits, inspected 8 October 2026. No country statistics or source exercises are reproduced; lesson data are hypothetical."},

  {"id": "archives-document-analysis", "title": "Document Analysis", "publisher": "National Archives and Records Administration", "url": "https://www.archives.gov/education/lessons/worksheets", "use": "concept-reference", "note": "Method and concept reference inspected 8 October 2026. VertexED explanations and fictional teaching cases are original; no archival quotation, exercise or official alignment is reproduced or implied."},
  {"id": "history-primary-evidence", "title": "Primary Source Evidence", "publisher": "Historical Thinking Project", "url": "https://historicalthinking.ca/primary-source-evidence", "use": "concept-reference", "note": "Method and concept reference inspected 8 October 2026. VertexED explanations and fictional teaching cases are original; no archival quotation, exercise or official alignment is reproduced or implied."},
  {"id": "history-cause-consequence", "title": "Cause and Consequence", "publisher": "Historical Thinking Project", "url": "https://historicalthinking.ca/cause-and-consequence", "use": "concept-reference", "note": "Method and concept reference inspected 8 October 2026. VertexED explanations and fictional teaching cases are original; no archival quotation, exercise or official alignment is reproduced or implied."},
  {"id": "history-continuity-change", "title": "Continuity and Change", "publisher": "Historical Thinking Project", "url": "https://historicalthinking.ca/continuity-and-change", "use": "concept-reference", "note": "Method and concept reference inspected 8 October 2026. VertexED explanations and fictional teaching cases are original; no archival quotation, exercise or official alignment is reproduced or implied."},
  {"id": "history-perspectives", "title": "Historical Perspectives", "publisher": "Historical Thinking Project", "url": "https://historicalthinking.ca/historical-perspectives", "use": "concept-reference", "note": "Method and concept reference inspected 8 October 2026. VertexED explanations and fictional teaching cases are original; no archival quotation, exercise or official alignment is reproduced or implied."},
  {"id": "history-significance", "title": "Historical Significance", "publisher": "Historical Thinking Project", "url": "https://historicalthinking.ca/historical-significance", "use": "concept-reference", "note": "Method and concept reference inspected 8 October 2026. VertexED explanations and fictional teaching cases are original; no archival quotation, exercise or official alignment is reproduced or implied."},

  {
    id: 'openstax-statistics', title: 'Introductory Statistics 2e', publisher: 'OpenStax, Rice University',
    url: 'https://openstax.org/books/introductory-statistics-2e/pages/1-introduction',
    use: 'concept-reference',
    note: 'Scope reference for sampling and statistical reasoning. No source prose, examples or exercises are reproduced.',
  },
  {
    id: 'ib-myp-programme',
    title: 'Middle Years Programme',
    publisher: 'International Baccalaureate',
    url: 'https://ibo.org/programmes/middle-years-programme/',
    use: 'programme-structure',
    note: 'Programme and subject-group structure reference. No protected course material is reproduced.',
  },
  {
    id: 'ib-myp-assessment',
    title: 'MYP assessment and exams',
    publisher: 'International Baccalaureate',
    url: 'https://ibo.org/programmes/middle-years-programme/assessment-and-exams/',
    use: 'programme-structure',
    note: 'Assessment-format reference. Practice tasks in VertexED are independently written.',
  },
  {
    id: 'openstax-algebra-trigonometry',
    title: 'Algebra and Trigonometry',
    publisher: 'OpenStax, Rice University',
    url: 'https://openstax.org/books/algebra-and-trigonometry/pages/preface',
    use: 'concept-reference',
    note: 'Scope and sequence reference only. VertexED prose and exercises are original.',
  },
  {
    id: 'openstax-biology',
    title: 'Biology 2e',
    publisher: 'OpenStax, Rice University',
    url: 'https://openstax.org/books/biology-2e/pages/1-introduction',
    use: 'concept-reference',
    note: 'Concept reference only. VertexED prose and exercises are original.',
  },
  {
    id: 'openstax-chemistry',
    title: 'Chemistry 2e',
    publisher: 'OpenStax, Rice University',
    url: 'https://openstax.org/books/chemistry-2e/pages/1-introduction',
    use: 'concept-reference',
    note: 'Concept reference only. VertexED prose and exercises are original.',
  },
  {
    id: 'openstax-physics',
    title: 'Physics',
    publisher: 'OpenStax, Rice University',
    url: 'https://openstax.org/books/physics/pages/1-introduction',
    use: 'concept-reference',
    note: 'Concept reference only. VertexED prose and exercises are original.',
  },
  {
    id: 'loc-primary-sources',
    title: 'Getting Started with Primary Sources',
    publisher: 'Library of Congress',
    url: 'https://www.loc.gov/programs/teachers/getting-started-with-primary-sources/',
    use: 'concept-reference',
    note: 'Source-analysis process reference. VertexED examples are original.',
  },
];

const common = {
  contentStatus: 'original-editorial-draft' as const,
  curriculumVersion: 'vertexed-myp5-2026.1' as const,
};

function lesson(value: Omit<MypLesson, keyof typeof common>): MypLesson {
  return { ...value, ...common };
}

function practice(
  id: string,
  difficulty: MypPracticeQuestion['difficulty'],
  command: string,
  marks: number,
  prompt: string,
  hints: string[],
  solution: string[],
  successCriteria: string[],
): MypPracticeQuestion {
  return { id, difficulty, command, marks, prompt, hints, solution, successCriteria };
}

export const MYP5_LESSONS: MypLesson[] = [
  lesson({
    id: 'myp5-mathematics-number', prerequisiteIds: [], subjectSlug: 'mathematics', topic: 'Number',
    summary: 'Use proportional, percentage and standard-form reasoning while keeping units and scale visible.',
    objectives: ['Move between fractions, decimals and percentages.', 'Use ratio and proportional reasoning.', 'Estimate to test whether a result is reasonable.'],
    keyIdeas: ['A percentage is a multiplicative comparison to 100.', 'Equivalent ratios preserve the same multiplicative relationship.', 'An estimate is a check, not a replacement for exact working.'],
    definitions: [{ term: 'Multiplier', meaning: 'The factor used to represent a percentage change, such as 1.08 for an 8% increase.' }, { term: 'Standard form', meaning: 'A number written as a × 10^n where 1 ≤ |a| < 10.' }, { term: 'Relative error', meaning: 'Absolute error divided by the accepted or reference value.' }],
    method: ['Translate the wording into an operation or multiplier.', 'Keep the original quantity and units visible.', 'Calculate without premature rounding.', 'Estimate independently and compare.'],
    workedExample: { prompt: 'A jacket priced at €72 is reduced by 15%, then taxed by 8%. Find the final price.', steps: ['Reduction multiplier: 1 - 0.15 = 0.85.', 'Tax multiplier: 1 + 0.08 = 1.08.', '72 × 0.85 × 1.08 = 66.096.'], conclusion: 'The final price is €66.10 to the nearest cent. Subtracting 15 and adding 8 would be invalid because both changes are percentages, not fixed amounts.' },
    misconceptions: [{ mistake: 'Adding percentage changes as if they act on the same base.', correction: 'Apply each multiplier in sequence because the second percentage acts on the changed value.' }, { mistake: 'Writing 4.2 × 10^5 as 42 × 10^4 and calling it standard form.', correction: 'The leading factor must have magnitude from 1 up to, but not including, 10.' }],
    practice: [practice('num-1', 'Foundation', 'Calculate', 3, 'Increase 240 by 12%.', ['Convert 12% to 0.12.', 'An increase uses a multiplier greater than 1.'], ['Multiplier = 1.12.', '240 × 1.12 = 268.8.'], ['Correct multiplier', 'Accurate calculation', 'Clear final value']), practice('num-2', 'Standard', 'Determine', 5, 'A map scale is 1:50,000. Two points are 7.4 cm apart. Determine the real distance in kilometres.', ['Multiply the map distance by 50,000.', 'Convert centimetres to kilometres.'], ['7.4 × 50,000 = 370,000 cm.', '370,000 cm = 3.7 km.'], ['Uses the scale', 'Correct unit conversion', 'States 3.7 km']), practice('num-3', 'Advanced', 'Evaluate', 6, 'A student claims that two successive 10% decreases produce a 20% decrease. Evaluate the claim.', ['Test with a convenient starting value.', 'Compare the final value with the original.'], ['Start with 100.', 'After two decreases: 100 × 0.9 × 0.9 = 81.', 'The total decrease is 19%, so the claim is false.'], ['Valid counterexample', 'Multiplicative reasoning', 'Supported judgement'])],
    checklist: ['I can choose and justify a percentage multiplier.', 'I can convert ratios into usable quantities.', 'I keep units through every step.', 'I use estimation to detect implausible answers.'],
    sourceIds: ['ib-myp-programme', 'openstax-algebra-trigonometry'],
  }),
  lesson({
    id: 'myp5-mathematics-algebra', prerequisiteIds: ['myp5-mathematics-number'], subjectSlug: 'mathematics', topic: 'Algebra',
    summary: 'Represent relationships with expressions and equations, then preserve equality while transforming them.',
    objectives: ['Simplify expressions accurately.', 'Solve linear and quadratic equations.', 'Interpret algebraic solutions in context.'],
    keyIdeas: ['An equation states that two expressions have equal value.', 'Inverse operations preserve equality when applied to both sides.', 'A solution must satisfy the original equation.'],
    definitions: [{ term: 'Coefficient', meaning: 'A numerical factor multiplying a variable.' }, { term: 'Root', meaning: 'A value that makes an equation or function equal to zero.' }, { term: 'Factor', meaning: 'An expression multiplied by another expression to form a product.' }],
    method: ['Simplify each side before moving terms.', 'Apply the same inverse operation to both sides.', 'Record restrictions introduced by denominators or roots.', 'Substitute the result into the original equation.'],
    workedExample: { prompt: 'Solve 3(2x - 5) = 4x + 7.', steps: ['Expand: 6x - 15 = 4x + 7.', 'Subtract 4x: 2x - 15 = 7.', 'Add 15 and divide by 2: x = 11.'], conclusion: 'Checking gives 3(22 - 5) = 51 and 44 + 7 = 51, so x = 11 is valid.' },
    misconceptions: [{ mistake: 'Changing a sign when moving a term without naming the operation.', correction: 'Describe the same addition or subtraction on both sides.' }, { mistake: 'Cancelling terms across addition.', correction: 'Cancellation applies to common factors, not separate added terms.' }],
    practice: [practice('alg-1', 'Foundation', 'Solve', 3, 'Solve 5x - 9 = 26.', ['Add 9 first.'], ['5x = 35.', 'x = 7.'], ['Balanced operations', 'Correct solution']), practice('alg-2', 'Standard', 'Factorise', 4, 'Factorise x² - 7x + 12.', ['Find two numbers with product 12 and sum -7.'], ['The numbers are -3 and -4.', 'x² - 7x + 12 = (x - 3)(x - 4).'], ['Correct factor pair', 'Complete factorisation']), practice('alg-3', 'Challenge', 'Justify', 7, 'The equation (x - 2)/(x + 1) = 3 has one solution. Find it and justify any excluded value.', ['State when the denominator is zero.', 'Clear the denominator only after stating the restriction.'], ['Restriction: x ≠ -1.', 'x - 2 = 3x + 3.', '-5 = 2x, so x = -2.5.', 'The solution does not violate the restriction.'], ['Restriction stated', 'Valid transformation', 'Checked conclusion'])],
    checklist: ['I preserve equality at each step.', 'I distinguish terms from factors.', 'I state excluded values.', 'I check solutions in the original equation.'],
    sourceIds: ['openstax-algebra-trigonometry'],
  }),
  lesson({
    id: 'myp5-mathematics-functions', prerequisiteIds: ['myp5-mathematics-algebra'], subjectSlug: 'mathematics', topic: 'Functions',
    summary: 'Treat a function as a rule that assigns one output to each permitted input.',
    objectives: ['Use function notation.', 'Connect symbolic, tabular and graphical representations.', 'Interpret rate of change and intercepts.'],
    keyIdeas: ['The domain is the permitted input set.', 'A graph represents all ordered pairs satisfying the rule.', 'For a linear function, slope is change in output divided by change in input.'],
    definitions: [{ term: 'Domain', meaning: 'The set of permitted input values.' }, { term: 'Range', meaning: 'The set of resulting output values.' }, { term: 'Intercept', meaning: 'The coordinate at which a graph crosses an axis.' }],
    method: ['Identify input and output quantities.', 'State the rule and any domain restriction.', 'Calculate key points or features.', 'Interpret those features in context.'],
    workedExample: { prompt: 'For f(x) = 3x - 4, find f(5) and the input when f(x) = 17.', steps: ['Substitute x = 5: f(5) = 15 - 4 = 11.', 'Set 3x - 4 = 17.', 'Solve 3x = 21, so x = 7.'], conclusion: 'The function sends input 5 to output 11, and output 17 comes from input 7.' },
    misconceptions: [{ mistake: 'Reading f(x) as f multiplied by x.', correction: 'Function notation names the output produced by input x.' }, { mistake: 'Using vertical change divided by horizontal change inconsistently.', correction: 'Choose two points and use the same order in numerator and denominator.' }],
    practice: [practice('fun-1', 'Foundation', 'Calculate', 3, 'For g(x) = x² + 2, calculate g(-3).', ['Square the whole input.'], ['g(-3) = (-3)² + 2 = 11.'], ['Correct substitution', 'Correct order of operations']), practice('fun-2', 'Standard', 'Determine', 5, 'A line passes through (2, 5) and (8, 17). Determine its equation.', ['Find the slope first.', 'Use y = mx + c.'], ['m = (17 - 5)/(8 - 2) = 2.', '5 = 2(2) + c, so c = 1.', 'The equation is y = 2x + 1.'], ['Correct slope', 'Correct intercept', 'Equation stated']), practice('fun-3', 'Advanced', 'Interpret', 6, 'A taxi cost in currency units is C(d) = 2.4d + 3.5 for distance d kilometres. Interpret both constants and state a sensible domain.', ['Separate rate from starting value.'], ['2.4 is the rate in currency units per kilometre.', '3.5 currency units is the fixed starting charge.', 'A sensible domain is d ≥ 0, with any upper bound set by the journey context.'], ['Both parameters interpreted', 'Units included', 'Domain justified'])],
    checklist: ['I use brackets when substituting negative values.', 'I connect equations, tables and graphs.', 'I interpret slope with units.', 'I state meaningful domains.'],
    sourceIds: ['openstax-algebra-trigonometry'],
  }),
  lesson({
    id: 'myp5-physics-motion', subjectSlug: 'physics', topic: 'Motion', prerequisiteIds: ['myp5-mathematics-number'],
    summary: 'Describe how position changes with time and distinguish scalar speed from vector velocity.',
    objectives: ['Calculate speed, velocity and acceleration.', 'Interpret motion graphs.', 'Connect gradient and area to physical quantities.'],
    keyIdeas: ['Average speed is total distance divided by total time.', 'Velocity includes direction.', 'Acceleration measures the rate of change of velocity.'],
    definitions: [{ term: 'Displacement', meaning: 'Change in position in a stated direction.' }, { term: 'Velocity', meaning: 'Rate of change of displacement.' }, { term: 'Acceleration', meaning: 'Rate of change of velocity.' }],
    method: ['List known values with SI units.', 'Choose a relationship that contains the unknown.', 'Rearrange before substituting.', 'Check sign, direction and scale.'],
    workedExample: { prompt: 'A cyclist increases velocity from 4 m/s to 10 m/s in 3 s. Find the average acceleration.', steps: ['Change in velocity = 10 - 4 = 6 m/s.', 'Acceleration = change in velocity ÷ time.', 'a = 6 ÷ 3 = 2 m/s².'], conclusion: 'The positive acceleration is 2 m/s² in the cyclist’s chosen positive direction.' },
    misconceptions: [{ mistake: 'Calling every horizontal graph segment stationary.', correction: 'A horizontal position-time segment means stationary; a horizontal velocity-time segment means constant velocity.' }, { mistake: 'Ignoring direction when calculating velocity change.', correction: 'Choose a positive direction and use signed velocities.' }],
    practice: [practice('mot-1', 'Foundation', 'Calculate', 3, 'A runner covers 600 m in 150 s. Calculate average speed.', ['Use distance ÷ time.'], ['600 ÷ 150 = 4 m/s.'], ['Formula', 'Substitution', 'Unit']), practice('mot-2', 'Standard', 'Analyse', 5, 'A velocity-time graph rises uniformly from 0 to 12 m/s in 6 s. Determine acceleration and distance travelled.', ['Gradient gives acceleration.', 'Area under the graph gives displacement.'], ['Acceleration = 12/6 = 2 m/s².', 'Distance = ½ × 6 × 12 = 36 m.'], ['Uses gradient', 'Uses triangular area', 'Correct units']), practice('mot-3', 'Challenge', 'Evaluate', 6, 'A GPS gives positions every 10 s. Evaluate whether it can reveal a runner’s maximum instantaneous speed.', ['Distinguish interval average from instantaneous value.'], ['Each calculated speed is an average across 10 s.', 'A short burst between samples may be hidden.', 'More frequent or continuous measurement would improve the estimate.'], ['Identifies sampling limitation', 'Explains consequence', 'Specific improvement'])],
    checklist: ['I distinguish distance from displacement.', 'I use signed velocity consistently.', 'I interpret graph gradient and area.', 'I include units in every calculated result.'],
    sourceIds: ['openstax-physics'],
  }),
  lesson({
    id: 'myp5-chemistry-atomic-structure', subjectSlug: 'chemistry', topic: 'Atomic structure', prerequisiteIds: [],
    summary: 'Use particle structure and electron arrangement to explain isotopes, ions and periodic behaviour.',
    objectives: ['Relate atomic and mass numbers to particles.', 'Represent ions and isotopes.', 'Use electron arrangement to explain chemical behaviour.'],
    keyIdeas: ['Atomic number equals proton number.', 'Isotopes share proton number but differ in neutron number.', 'Ions form when electrons are gained or lost.'],
    definitions: [{ term: 'Isotope', meaning: 'Atoms of one element with the same proton number but different neutron numbers.' }, { term: 'Ion', meaning: 'A charged particle formed when electrons are gained or lost.' }, { term: 'Mass number', meaning: 'The total number of protons and neutrons in a nucleus.' }],
    method: ['Read atomic and mass numbers carefully.', 'Calculate neutrons as mass number minus atomic number.', 'Adjust electron count using the ion charge.', 'Link outer electrons to likely chemical behaviour.'],
    workedExample: { prompt: 'Describe the particles in a magnesium-24 ion, Mg²⁺, atomic number 12.', steps: ['Protons = 12.', 'Neutrons = 24 - 12 = 12.', 'A 2+ ion has lost two electrons, so electrons = 10.'], conclusion: 'Mg²⁺ contains 12 protons, 12 neutrons and 10 electrons.' },
    misconceptions: [{ mistake: 'Changing proton number when an ion forms.', correction: 'Chemical ion formation changes electrons; changing protons changes the element.' }, { mistake: 'Treating relative atomic mass as the mass number of every atom.', correction: 'Relative atomic mass is a weighted mean across naturally occurring isotopes.' }],
    practice: [practice('atom-1', 'Foundation', 'Determine', 3, 'An atom has atomic number 17 and mass number 35. Determine its protons, neutrons and electrons.', ['A neutral atom has equal protons and electrons.'], ['17 protons, 18 neutrons and 17 electrons.'], ['All three counts correct', 'Neutron calculation uses mass number minus atomic number']), practice('atom-2', 'Standard', 'Explain', 5, 'Explain why chlorine-35 and chlorine-37 have similar chemical behaviour.', ['Focus on electrons, not neutrons.'], ['Both isotopes have atomic number 17.', 'Neutral atoms therefore have the same electron arrangement.', 'Chemical reactions depend mainly on outer electrons, so their behaviour is similar.'], ['Identifies same proton number', 'Connects electron arrangement', 'Explains behaviour']), practice('atom-3', 'Advanced', 'Calculate', 6, 'A sample contains 75% isotope X-10 and 25% isotope X-11. Calculate the relative atomic mass.', ['Use a weighted mean.'], ['(0.75 × 10) + (0.25 × 11) = 10.25.'], ['Correct weighting', 'Accurate result', 'No inappropriate unit'])],
    checklist: ['I calculate particle counts from isotope notation.', 'I explain ion charge using electrons.', 'I distinguish mass number from relative atomic mass.', 'I connect outer electrons to reactions.'],
    sourceIds: ['openstax-chemistry'],
  }),
  lesson({
    id: 'myp5-biology-cells', subjectSlug: 'biology', topic: 'Cells', prerequisiteIds: [],
    summary: 'Connect cell structures to functions and explain how specialised cells support larger systems.',
    objectives: ['Compare major cell structures.', 'Explain structure-function relationships.', 'Use scale and evidence when interpreting micrographs.'],
    keyIdeas: ['Cells exchange matter and energy with their surroundings.', 'Specialisation involves structures suited to a particular function.', 'Observations support claims only when scale and image limits are considered.'],
    definitions: [{ term: 'Organelle', meaning: 'A specialised structure within a cell that performs a particular function.' }, { term: 'Differentiation', meaning: 'The process through which a cell develops specialised features.' }, { term: 'Magnification', meaning: 'Image size divided by actual size.' }],
    method: ['Identify visible evidence before naming a structure.', 'State the structure’s feature.', 'Explain how that feature supports a process.', 'Link the process to the cell or organism.', 'For magnification, convert image size and actual size to the same length unit, then divide image size by actual size.'],
    workedExample: { prompt: 'Explain one way a root hair cell is adapted for mineral-ion uptake. In a separate hypothetical micrograph calculation, an image length is 30 mm and the corresponding actual length is 15 micrometres. Calculate magnification.', steps: ['A root hair cell has a long projection.', 'The projection increases surface area in contact with soil water.', 'More membrane area permits more transport proteins and exchange.', 'Convert image length: 30 mm × 1000 = 30000 micrometres.', 'Magnification = image length ÷ actual length = 30000 micrometres ÷ 15 micrometres = 2000×. The matching units cancel.'], conclusion: 'The projection supports mineral-ion uptake. The separate image has magnification 2000×; magnification alone does not identify a cell or prove that a dark region is a chloroplast.' },
    misconceptions: [{ mistake: 'Saying mitochondria create energy.', correction: 'Mitochondria transfer energy from respiratory substrates into usable cellular forms.' }, { mistake: 'Assuming every plant cell contains chloroplasts.', correction: 'Only photosynthetic plant tissues typically need many chloroplasts.' }],
    practice: [practice('cell-1', 'Foundation', 'Identify', 3, 'Name the structure that controls movement of substances into and out of a cell, then state its function.', ['It forms the cell boundary.'], ['Cell membrane.', 'It selectively regulates substances entering and leaving the cell.'], ['Correct structure', 'Accurate function']), practice('cell-2', 'Standard', 'Explain', 5, 'Explain how a sperm cell’s structure supports fertilisation.', ['Choose two structures and connect each to a process.'], ['A flagellum provides movement towards the egg.', 'Many mitochondria support the energy transfer needed for movement.', 'The acrosome contains substances involved in penetrating outer egg layers.'], ['Two valid adaptations', 'Mechanisms explained', 'Links to fertilisation']), practice('cell-3', 'Advanced', 'Evaluate', 6, 'A student identifies a cell as photosynthetic because a micrograph contains dark circular regions. Evaluate the conclusion.', ['Consider alternative explanations and missing evidence.'], ['Dark regions alone do not prove chloroplast identity.', 'Staining, section thickness or other organelles could produce similar regions.', 'A scale, labelled comparison or additional imaging evidence is needed.'], ['Questions the inference', 'Names alternatives', 'Requests specific evidence']), practice('cell-4', 'Standard', 'Calculate', 5, 'In an original hypothetical micrograph exercise, a cell image is 48 mm long and the actual cell is 24 micrometres long. Calculate magnification, showing a unit conversion. State whether magnification alone identifies the cell type.', ['Convert millimetres to micrometres before dividing.', 'Distinguish a scale ratio from structural evidence.'], ['48 mm × 1000 = 48000 micrometres.', 'Magnification = 48000 micrometres ÷ 24 micrometres = 2000×; the matching length units cancel.', 'Magnification alone does not identify the cell type. Visible structures, a labelled comparison or other appropriate evidence are needed.'], ['Correct conversion', 'Correct dimensionless ratio', 'Cell-identification limit retained'])],
    checklist: ['I connect structures to mechanisms.', 'I avoid absolute claims unsupported by an image.', 'I calculate magnification with consistent units.', 'I compare cells using both similarities and differences.'],
    sourceIds: ['openstax-biology'],
  }),
  lesson({
    id: 'myp5-integrated-sciences-systems', subjectSlug: 'integrated-sciences', topic: 'Systems and models', prerequisiteIds: [],
    summary: 'Use system boundaries, inputs, outputs and interactions to explain complex scientific behaviour.',
    objectives: ['Define a useful system boundary.', 'Construct and critique models.', 'Explain feedback and interaction across components.'],
    keyIdeas: ['A system model simplifies reality for a purpose.', 'Changing the boundary changes which transfers are counted.', 'A useful model states both what it represents and what it omits.'],
    definitions: [{ term: 'System boundary', meaning: 'The chosen division between the system being studied and its surroundings.' }, { term: 'Model', meaning: 'A purposeful representation used to describe, explain or predict.' }, { term: 'Feedback', meaning: 'A process in which a system output influences later system behaviour.' }],
    method: ['State the question the model must answer.', 'Choose a boundary and label inputs, stores, transfers and outputs.', 'Trace one causal pathway.', 'Identify an assumption and testable limitation.'],
    workedExample: { prompt: 'Model a closed bottle terrarium as a system.', steps: ['Boundary: the sealed bottle.', 'Energy enters mainly as light and leaves mainly as thermal radiation.', 'Matter cycles among organisms, water, gases and soil inside the boundary.'], conclusion: 'The terrarium is approximately closed to matter but open to energy; the model ignores small leaks and long-term material changes.' },
    misconceptions: [{ mistake: 'Calling a model wrong because it omits detail.', correction: 'Judge whether omitted detail matters for the model’s stated purpose.' }, { mistake: 'Confusing a system diagram with a causal explanation.', correction: 'Use labelled arrows and explain the mechanism behind each important link.' }],
    practice: [practice('sys-1', 'Foundation', 'Outline', 3, 'For a kettle heating water, identify one energy input, one store and one output.', ['Follow energy across the boundary.'], ['Input: electrical energy transfer.', 'Store: thermal energy of the water.', 'Output: thermal transfer to surroundings.'], ['Input', 'Store', 'Output']), practice('sys-2', 'Standard', 'Develop', 5, 'Develop a simple model of carbon movement between plants, animals and the atmosphere.', ['Use process labels on arrows.'], ['Atmospheric carbon dioxide enters plants through photosynthesis.', 'Carbon moves to animals through feeding.', 'Respiration returns carbon dioxide to the atmosphere.', 'Decomposition provides another return pathway.'], ['Components', 'Directed transfers', 'Process labels']), practice('sys-3', 'Challenge', 'Evaluate', 7, 'Evaluate a model that predicts lake temperature using only daily air temperature.', ['Name what it captures and what it misses.'], ['Air temperature is relevant and easy to measure.', 'The model omits solar radiation, depth, mixing, inflows and time lag.', 'It may track broad seasonal change but is weak for short-term or depth-specific prediction.'], ['Strength', 'Multiple limitations', 'Bounded conclusion'])],
    checklist: ['I define system boundaries explicitly.', 'I label transfers with processes.', 'I distinguish description from mechanism.', 'I state the purpose and limitation of a model.'],
    sourceIds: ['ib-myp-programme', 'openstax-physics', 'openstax-biology'],
  }),
  lesson({
    id: 'myp5-english-literary-analysis', subjectSlug: 'english-language-literature', topic: 'Literary analysis', prerequisiteIds: [],
    summary: 'Build interpretations from precise textual choices rather than naming techniques in isolation.',
    objectives: ['Develop an arguable interpretation.', 'Select concise evidence.', 'Explain how form and language shape meaning.'],
    keyIdeas: ['A technique is evidence, not an interpretation.', 'Context matters when it changes how a choice is understood.', 'Strong analysis considers patterns, tensions and alternatives.'],
    definitions: [{ term: 'Interpretation', meaning: 'A reasoned account of meaning supported by evidence.' }, { term: 'Connotation', meaning: 'An association carried by a word beyond its literal meaning.' }, { term: 'Form', meaning: 'The organising conventions and shape of a text.' }],
    method: ['Answer the task with a precise claim.', 'Embed a short, relevant detail.', 'Analyse the choice at word, sentence and structural level where useful.', 'Connect the effect to the wider interpretation.'],
    workedExample: { prompt: 'Analyse the line: “The clock cleared its throat before midnight.”', steps: ['Personification gives the clock a human action.', '“Cleared its throat” suggests an announcement is imminent.', 'The moment before midnight becomes tense and expectant.'], conclusion: 'The image turns time into an active presence preparing to interrupt the scene.' },
    misconceptions: [{ mistake: 'Writing that a technique “makes the reader want to read on”.', correction: 'Name the specific idea, feeling or expectation shaped by the choice.' }, { mistake: 'Using a long quotation without selecting language.', correction: 'Use the shortest evidence that still proves the claim.' }],
    practice: [practice('lit-1', 'Foundation', 'Explain', 4, 'Explain one effect of the phrase “the corridor swallowed every footstep”.', ['Focus on the verb.'], ['“Swallowed” personifies the corridor as consuming sound.', 'This makes the space feel unusually silent and threatening.'], ['Technique or choice identified', 'Meaning explained']), practice('lit-2', 'Standard', 'Analyse', 6, 'Analyse how sentence length could shift the pace of a chase scene.', ['Contrast long and short structures.'], ['Longer sentences can accumulate obstacles and sustain movement.', 'A sudden short sentence can mark impact, decision or danger.', 'The contrast matters more than either length alone.'], ['Structural analysis', 'Specific effects', 'Connection to scene']), practice('lit-3', 'Challenge', 'Evaluate', 8, 'A critic says an unreliable narrator only hides information. Evaluate this view.', ['Consider another function of unreliability.'], ['Withholding information is one effect.', 'Unreliability can also expose bias, self-deception or limited knowledge.', 'Its importance depends on how gaps alter the reader’s judgement of events.'], ['Addresses the view', 'Alternative interpretation', 'Qualified judgement'])],
    checklist: ['My claim is arguable, not a plot summary.', 'My evidence is precise.', 'I explain how a choice creates meaning.', 'I connect details to a wider interpretation.'],
    sourceIds: ['ib-myp-programme'],
  }),
  lesson({
    id: 'myp5-spanish-identity', prerequisiteIds: ['myp5-spanish-present-tense'], subjectSlug: 'spanish', topic: 'Identity and relationships',
    summary: 'Communicate about identity and relationships with controlled tense, agreement and supporting detail.',
    objectives: ['Describe identity using varied adjectives.', 'Explain relationships with reasons and examples.', 'Move between present and past experience.'],
    keyIdeas: ['Adjectives usually agree with the noun they describe.', 'Connectors turn separate facts into sustained communication.', 'A clear message matters more than forcing unfamiliar complexity.'],
    definitions: [{ term: 'Concordancia', meaning: 'Agreement in gender and number between related words.' }, { term: 'Conector', meaning: 'A word or phrase that links ideas, such as aunque, por eso or sin embargo.' }, { term: 'Opinión justificada', meaning: 'A viewpoint supported by a reason or example.' }],
    method: ['Identify audience, purpose and required tense.', 'Plan one main idea per sentence group.', 'Add reasons with porque, ya que or dado que.', 'Check verb endings and adjective agreement.'],
    workedExample: { prompt: 'Describe a friendship and explain why it matters.', steps: ['Opening: Mi amistad con Ana es importante para mí.', 'Detail: Nos conocemos desde hace cinco años y compartimos el interés por la música.', 'Reason: Aunque no siempre estamos de acuerdo, me escucha cuando tengo un problema.'], conclusion: 'The response communicates relationship, time, shared experience and a justified personal view.' },
    misconceptions: [{ mistake: 'Translating English word order directly.', correction: 'Build the Spanish phrase around its own agreement and placement patterns.' }, { mistake: 'Using porque and por qué interchangeably.', correction: 'Porque gives a reason; por qué introduces or embeds a question.' }],
    practice: [practice('spa-1', 'Foundation', 'Describe', 4, 'Escribe cuatro frases sobre tu personalidad y tus intereses. Puedes inventar los detalles.', ['Use two different adjective patterns.'], ['Possible fictional response: Soy una persona tranquila, pero a veces hablo mucho. Me interesa la música porque me ayuda a relajarme. En mi tiempo libre dibujo. Mis amigos dicen que soy amable.', 'Other coherent descriptions with four sentences and a reason are valid.'], ['Four relevant sentences', 'Agreement mostly controlled', 'At least one reason']), practice('spa-2', 'Standard', 'Explain', 6, 'Explica cómo ha cambiado una relación importante en tu vida. Puedes inventar una situación.', ['Use a past reference and a present comparison.'], ['Possible fictional response: Antes hablaba poco con mi prima. El año pasado hicimos un proyecto juntas. Ahora hablamos más porque tenemos intereses comunes.', 'Juntas describes two female participants in this model; juntos is appropriate for a different relevant group. Other coherent accounts are valid.'], ['Past and present', 'Specific example', 'Clear explanation']), practice('spa-3', 'Advanced', 'Discuss', 8, '¿Las redes sociales fortalecen o debilitan las amistades?', ['Give both a benefit and a limitation.'], ['Possible response: Creo que las redes sociales pueden fortalecer las amistades porque permiten mantener el contacto. Por ejemplo, puedo escribir a un amigo que vive lejos. Sin embargo, los mensajes no siempre sustituyen una conversación en persona. Su efecto depende de cómo las usemos.', 'Alternative supported positions are valid; this is a model opinion, not a research finding.'], ['Developed viewpoint', 'Contrasting perspective', 'Range of connectors', 'Relevant conclusion'])],
    checklist: ['I answer the stated purpose.', 'I control the main tense.', 'I justify opinions.', 'I check agreement and high-frequency verbs.'],
    sourceIds: ['ib-myp-programme', 'spanish-agreement', 'spanish-conjugation'],
  }),
  lesson({
    id: 'myp5-economics-scarcity', prerequisiteIds: [], subjectSlug: 'economics', topic: 'Scarcity',
    summary: 'Explain how limited resources create choices, opportunity costs and competing priorities.',
    objectives: ['Distinguish scarcity from a temporary shortage.', 'Identify opportunity cost.', 'Evaluate choices using stakeholder evidence.'],
    keyIdeas: ['Scarcity exists because wants exceed available resources.', 'Opportunity cost is the next-best alternative forgone.', 'A choice can distribute costs and benefits unevenly.'],
    definitions: [{ term: 'Scarcity', meaning: 'The condition in which available resources cannot satisfy every possible want.' }, { term: 'Opportunity cost', meaning: 'The value of the next-best alternative given up.' }, { term: 'Stakeholder', meaning: 'A person or group affected by a decision.' }],
    method: ['Identify the limited resource.', 'Name the realistic alternatives.', 'State the next-best alternative forgone.', 'Compare effects across stakeholders and time.'],
    workedExample: { prompt: 'A council uses vacant land for a sports centre instead of affordable housing.', steps: ['The scarce resource is usable urban land.', 'The chosen use is the sports centre.', 'If housing was the next-best option, its benefits are the opportunity cost.'], conclusion: 'The decision cannot be judged from construction cost alone; access, health, housing need and long-term effects matter.' },
    misconceptions: [{ mistake: 'Defining opportunity cost as all alternatives.', correction: 'It is the value of the next-best forgone alternative.' }, { mistake: 'Treating scarcity as the same as poverty.', correction: 'Scarcity applies whenever resources are limited relative to possible uses.' }],
    practice: [practice('eco-1', 'Foundation', 'Define', 3, 'Define opportunity cost and give one school-based example.', ['Name the next-best choice given up.'], ['Opportunity cost is the next-best alternative forgone; for example, spending a free period rehearsing means giving up the next-best use of that time.'], ['Accurate definition', 'Relevant example']), practice('eco-2', 'Standard', 'Explain', 5, 'Explain why clean water can be scarce in a region with high rainfall.', ['Scarcity can involve access and infrastructure.'], ['Rainfall does not guarantee safe storage, treatment or distribution.', 'Pollution, seasonal variation and unequal infrastructure can limit usable supply.'], ['Distinguishes water from usable water', 'Two causal factors']), practice('eco-3', 'Challenge', 'Evaluate', 8, 'A school can fund either smaller classes or a new sports hall. Evaluate the decision information needed.', ['Avoid choosing without evidence.'], ['Compare learning needs, facility condition, student access, recurring staffing costs and long-term use.', 'Identify affected groups and uncertainty.', 'Reach a conditional decision based on the strongest need and feasible costs.'], ['Relevant evidence', 'Stakeholder comparison', 'Opportunity cost', 'Qualified judgement'])],
    checklist: ['I identify the scarce resource.', 'I state a realistic next-best alternative.', 'I distinguish evidence from preference.', 'I compare short- and long-term effects.'],
    sourceIds: ['ib-myp-programme', 'econ-choice'],
  }),
  lesson({
    id: 'myp5-geography-population', subjectSlug: 'geography', topic: 'Population', prerequisiteIds: [],
    summary: 'Interpret population patterns using scale, rates, spatial evidence and interacting causes.',
    objectives: ['Read population structures and rates.', 'Explain spatial variation.', 'Evaluate demographic claims using evidence quality.'],
    keyIdeas: ['Population change reflects births, deaths and migration.', 'Rates allow fairer comparison than raw totals.', 'Patterns at national scale can hide regional differences.'],
    definitions: [{ term: 'Natural increase', meaning: 'Birth rate minus death rate, excluding migration.' }, { term: 'Dependency ratio', meaning: 'A comparison between conventionally dependent and working-age population groups.' }, { term: 'Population density', meaning: 'Population divided by land area.' }],
    method: ['Read title, date, scale and units.', 'Describe the dominant pattern with evidence.', 'Explain it using linked physical and human factors.', 'Identify anomalies and limitations.'],
    workedExample: { prompt: 'A city’s population rises while its national birth rate falls.', steps: ['Falling national birth rate does not determine one city’s population alone.', 'Internal or international migration may add population.', 'Lower death rates or changing boundaries may also contribute.'], conclusion: 'The two observations are compatible; a conclusion requires migration, mortality, time-period and boundary data.' },
    misconceptions: [{ mistake: 'Using total population to compare differently sized areas.', correction: 'Use density or another rate suited to the question.' }, { mistake: 'Treating correlation between two maps as proof of cause.', correction: 'Propose a mechanism and test competing explanations.' }],
    practice: [practice('geo-1', 'Foundation', 'Calculate', 3, 'A region has 2.4 million people and an area of 30,000 km². Calculate population density.', ['Population ÷ area.'], ['2,400,000 ÷ 30,000 = 80 people per km².'], ['Correct operation', 'Correct unit']), practice('geo-2', 'Standard', 'Analyse', 6, 'A population pyramid has a narrow base and a wider middle. Analyse two possible implications.', ['Separate description from implication.'], ['The narrow base suggests fewer recent births relative to older cohorts.', 'Future school-age demand may fall while ageing-related services may face more pressure.', 'Migration could alter this interpretation.'], ['Pattern described', 'Two implications', 'Caveat']), practice('geo-3', 'Challenge', 'Evaluate', 8, 'Evaluate the claim that high population density causes poor quality of life.', ['Consider measurement and counterexamples.'], ['Density alone does not determine housing, services, transport or inequality.', 'Well-planned dense areas may provide strong access, while low-density areas can lack services.', 'Use multiple quality-of-life indicators and comparisons before judging.'], ['Challenges causation', 'Uses counterexample logic', 'Evidence requirement', 'Judgement'])],
    checklist: ['I compare with rates when appropriate.', 'I quote spatial evidence accurately.', 'I explain mechanisms.', 'I test scale, date and data limitations.'],
    sourceIds: ['ib-myp-programme'],
  }),
  lesson({
    id: 'myp5-history-source-analysis', prerequisiteIds: [], subjectSlug: 'history', topic: 'Source analysis',
    summary: 'Interrogate what a source can reveal by connecting content, origin, purpose and historical context.',
    objectives: ['Infer from source content.', 'Evaluate value and limitation in relation to a question.', 'Corroborate across sources.'],
    keyIdeas: ['A source is valuable for some questions and limited for others.', 'Origin does not automatically determine reliability.', 'Corroboration compares both agreement and difference.'],
    definitions: [{ term: 'Provenance', meaning: 'Information about a source’s origin, creator, time and context.' }, { term: 'Corroboration', meaning: 'Comparison with other evidence to test or extend a claim.' }, { term: 'Purpose', meaning: 'The intended outcome or audience effect of a source.' }],
    method: ['Read content before provenance.', 'Make a specific inference and cite its evidence.', 'Connect origin or purpose to a precise value or limitation.', 'Compare with another source or missing perspective.'],
    workedExample: { prompt: 'Evaluate a mayor’s campaign speech as evidence about living conditions.', steps: ['Content may identify issues the campaign expects voters to recognise.', 'The public persuasive purpose can reveal political priorities.', 'The same purpose may encourage selective examples or exaggeration.', 'Resident records or independent data could corroborate the claims.'], conclusion: 'The speech can be valuable for political priorities and public messaging, but it cannot establish typical living conditions on its own.' },
    misconceptions: [{ mistake: 'Writing “biased, therefore useless”.', correction: 'Bias can itself provide evidence about viewpoint, priorities and intended audience.' }, { mistake: 'Listing origin, purpose, value and limitation without linking them.', correction: 'Explain why each feature matters for the exact historical question.' }],
    practice: [practice('his-1', 'Foundation', 'Infer', 3, 'A factory poster warns workers to protect machinery during wartime. Infer one priority of its creator.', ['Use a detail from the source description.'], ['The creator prioritises maintaining industrial production, shown by the instruction to protect machinery.'], ['Inference', 'Supporting detail']), practice('his-2', 'Standard', 'Evaluate', 6, 'Evaluate a soldier’s private letter as evidence of army morale.', ['Consider immediacy, audience and representativeness.'], ['A private letter may reveal personal feelings close to the event.', 'The writer may still self-censor to reassure family or avoid military censorship.', 'One soldier cannot represent the whole army.'], ['Specific value', 'Specific limitation', 'Question focus']), practice('his-3', 'Challenge', 'Compare', 8, 'Two newspapers report the same protest differently. Explain how you would use both accounts.', ['Difference can be evidence.'], ['Compare reported events, language, images, ownership, audience and publication timing.', 'Agreements may establish common facts.', 'Differences may reveal selection or political perspective and should be tested against independent evidence.'], ['Comparison method', 'Use of agreement', 'Use of difference', 'Corroboration'])],
    checklist: ['I make inferences from content.', 'I connect provenance to the question.', 'I avoid automatic reliability labels.', 'I corroborate before generalising.'],
    sourceIds: ['ib-myp-programme', 'loc-primary-sources'],
  }),
  lesson({
    id: 'myp5-integrated-humanities-inquiry', prerequisiteIds: [], subjectSlug: 'integrated-humanities', topic: 'Inquiry questions',
    summary: 'Design focused inquiries that connect spatial, historical, economic and social evidence.',
    objectives: ['Turn a broad theme into a focused question.', 'Choose evidence suited to the question.', 'Synthesize more than one disciplinary lens.'],
    keyIdeas: ['A strong inquiry names a relationship, context and workable scope.', 'Different disciplines make different evidence visible.', 'Synthesis explains what the combined view reveals.'],
    definitions: [{ term: 'Inquiry question', meaning: 'A focused, researchable question that guides evidence collection and reasoning.' }, { term: 'Scope', meaning: 'The boundaries of place, time, population and concept used in an inquiry.' }, { term: 'Synthesis', meaning: 'An integrated explanation built from multiple sources or disciplinary perspectives.' }],
    method: ['Name the issue and possible relationship.', 'Bound it by place, time and population.', 'Check that evidence could challenge the expected answer.', 'Select at least two disciplinary lenses and explain their contribution.'],
    workedExample: { prompt: 'Improve the question “Is tourism good?”', steps: ['Define location and time.', 'Replace “good” with measurable social, economic and environmental effects.', 'Allow competing outcomes.'], conclusion: 'A stronger question is: “To what extent did increased tourism from 2018 to 2025 change employment and coastal habitat quality in Region X?”' },
    misconceptions: [{ mistake: 'Writing a question that contains its desired conclusion.', correction: 'Use wording that permits evidence to support, weaken or complicate the claim.' }, { mistake: 'Collecting sources before defining scope.', correction: 'Set the boundaries first so evidence can be selected deliberately.' }],
    practice: [practice('inq-1', 'Foundation', 'Develop', 4, 'Turn “pollution in cities” into a focused inquiry question.', ['Add a city, time period, pollutant and affected outcome.'], ['Example: “How did roadside nitrogen dioxide levels relate to childhood asthma admissions in City X from 2020 to 2025?”'], ['Relationship', 'Place', 'Time', 'Researchable outcome']), practice('inq-2', 'Standard', 'Justify', 6, 'Justify two source types for investigating a new transport policy.', ['Connect each source to a different part of the question.'], ['Traffic-count data can show movement changes.', 'Resident interviews can reveal unequal access or lived effects.', 'Together they compare measured patterns with experience.'], ['Two suitable sources', 'Purpose of each', 'Combined value']), practice('inq-3', 'Challenge', 'Evaluate', 8, 'Evaluate whether economic growth alone can measure a redevelopment project’s success.', ['Bring in spatial and social evidence.'], ['Growth can show investment or income change but may hide distribution.', 'Displacement, travel access, housing cost and environmental quality may move differently.', 'A defensible evaluation needs multiple indicators and stakeholder evidence.'], ['Strength of economic measure', 'Multiple limitations', 'Interdisciplinary synthesis', 'Judgement'])],
    checklist: ['My question is focused and contestable.', 'My evidence can test the claim.', 'I justify source choice.', 'I synthesize rather than place disciplines side by side.'],
    sourceIds: ['ib-myp-programme', 'loc-primary-sources'],
  }),
  lesson({
    id: 'myp5-design-cycle', prerequisiteIds: [], subjectSlug: 'design', topic: 'Design cycle',
    summary: 'Trace a design decision from an evidenced need through specification, creation and evaluation.',
    objectives: ['Investigate a defined user need.', 'Develop measurable success criteria.', 'Use test evidence to justify iteration.'],
    keyIdeas: ['A design problem belongs to a user in a context.', 'Specifications must be testable.', 'Evaluation compares evidence with criteria rather than describing the final product.'],
    definitions: [{ term: 'Design specification', meaning: 'A measurable requirement used to guide and evaluate a solution.' }, { term: 'Prototype', meaning: 'A representation built to test selected aspects of a proposed solution.' }, { term: 'Iteration', meaning: 'A change made in response to evidence from testing or feedback.' }],
    method: ['Define user, context and observed problem.', 'Prioritise research questions.', 'Translate evidence into measurable criteria.', 'Prototype risky assumptions early and record why each revision occurs.'],
    workedExample: { prompt: 'Improve “The bottle should be easy to use” as a specification.', steps: ['Name the user and action.', 'Choose a measurable threshold.', 'State a test.'], conclusion: '“A Year 5 learner wearing gloves can open and reseal the bottle within 8 seconds in four of five trials” is testable and user-specific.' },
    misconceptions: [{ mistake: 'Treating a feature list as a specification.', correction: 'Each important requirement needs a measurable condition and test.' }, { mistake: 'Changing a design without recording why.', correction: 'Link every iteration to evidence, a failed criterion or new constraint.' }],
    practice: [practice('des-1', 'Foundation', 'Develop', 4, 'Write two measurable criteria for a reusable lunch container.', ['Include a threshold and test.'], ['Example: no leakage after 30 seconds upside down; mass below 450 g when empty.'], ['Two criteria', 'Measurable thresholds']), practice('des-2', 'Standard', 'Explain', 6, 'Explain why interviewing one user and observing the task can provide different evidence.', ['Compare reported preference with observed behaviour.'], ['An interview reveals priorities and explanations.', 'Observation can expose actions or difficulties the user does not mention.', 'Together they reduce reliance on one evidence type.'], ['Both methods explained', 'Difference identified', 'Combined value']), practice('des-3', 'Challenge', 'Evaluate', 8, 'A prototype passes strength tests but users avoid it. Evaluate the next design step.', ['Technical success is not complete success.'], ['Retain the validated structural decisions.', 'Investigate usability, appearance, effort and context through targeted observation or interviews.', 'Revise features that fail the criteria and test the changed prototype with representative users; change a criterion only when new evidence justifies it.'], ['Uses existing evidence', 'Identifies missing evidence', 'Specific iteration plan', 'Retest'])],
    checklist: ['I define a real user and context.', 'My criteria are measurable.', 'My tests match the criteria.', 'Every iteration has an evidence trail.'],
    sourceIds: ['ib-myp-programme', 'ib-myp-assessment', 'design-double-diamond', 'design-usability'],
  }),
  lesson({
    id: 'myp5-visual-arts-analysis', prerequisiteIds: [], subjectSlug: 'visual-arts', topic: 'Artwork analysis',
    summary: 'Interpret how material, composition and context contribute to meaning in an artwork.',
    objectives: ['Describe visible evidence precisely.', 'Analyse relationships among formal choices.', 'Develop contextual interpretations without treating them as certain.'],
    keyIdeas: ['Description records what is visible; analysis explains relationships.', 'Meaning emerges from choices working together.', 'Context can deepen an interpretation but should not replace visual evidence.'],
    definitions: [{ term: 'Composition', meaning: 'The arrangement and relationship of visual elements.' }, { term: 'Medium', meaning: 'The materials and processes used to make an artwork.' }, { term: 'Focal point', meaning: 'An area given particular visual emphasis.' }],
    method: ['Describe one precise feature.', 'Name the formal relationship it creates.', 'Explain a plausible effect or meaning.', 'Test the interpretation against another feature or context.'],
    workedExample: { prompt: 'Use this original imagined portrait description: the figure occupies the edge of a large empty field. Analyse its composition.', steps: ['The off-centre placement creates strong asymmetry.', 'Negative space dominates the frame.', 'The visual imbalance can suggest isolation or movement beyond the frame.'], conclusion: 'The interpretation remains provisional until colour, gaze, context and other choices are considered.' },
    misconceptions: [{ mistake: 'Listing colours and shapes without explaining relationships.', correction: 'Explain contrast, repetition, balance, emphasis or movement.' }, { mistake: 'Claiming one universal emotional effect.', correction: 'Offer a supported interpretation and acknowledge ambiguity where relevant.' }],
    practice: [practice('art-1', 'Foundation', 'Describe', 3, 'Describe three compositional features of an imagined poster with one large red circle above a row of small grey figures.', ['Use position, scale and contrast.'], ['Large red circle near the top; repeated small grey figures below; strong contrast in colour and scale.'], ['Three precise observations', 'Description stays separate from interpretation']), practice('art-2', 'Standard', 'Analyse', 6, 'Analyse how repetition and interruption can create emphasis.', ['Identify the pattern before the break.'], ['Repetition establishes expectation and rhythm.', 'A changed element interrupts the pattern and becomes a focal point.', 'Its meaning depends on what distinguishes it and the surrounding context.'], ['Pattern explained', 'Interruption analysed', 'Meaning connected']), practice('art-3', 'Challenge', 'Evaluate', 8, 'Evaluate whether an artist statement should determine the meaning of an artwork.', ['Balance intention with the work and viewer context.'], ['The statement can clarify process and intention.', 'Visual evidence may support, complicate or contradict it.', 'Interpretation should consider intention without making it the only authority.'], ['Value', 'Limitation', 'Visual evidence', 'Judgement'])],
    checklist: ['I separate observation from inference.', 'I analyse relationships among choices.', 'I use context selectively.', 'I support interpretations with visible evidence.'],
    sourceIds: ['ib-myp-programme', 'ib-myp-assessment', 'arts-nga-elements', 'arts-getty-analysis', 'arts-vam-sketchbooks'],
  }),
  lesson({
    id: 'myp5-music-analysis', prerequisiteIds: [], subjectSlug: 'music', topic: 'Musical analysis',
    summary: 'Explain how musical elements interact over time to shape structure, tension and character.',
    objectives: ['Use musical vocabulary accurately.', 'Track change across a passage.', 'Connect evidence to an interpretation.'],
    keyIdeas: ['Musical effect usually comes from interacting elements.', 'Analysis needs a location in the music.', 'Contrast and development help listeners perceive structure.'],
    definitions: [{ term: 'Texture', meaning: 'How simultaneous musical lines or layers relate.' }, { term: 'Timbre', meaning: 'The characteristic quality of a sound.' }, { term: 'Motif', meaning: 'A short musical idea that can recur or develop.' }],
    method: ['Locate the passage by time, section or rehearsal mark.', 'Describe a specific musical change.', 'Explain interaction with another element.', 'Connect the change to structure or expressive intention.'],
    workedExample: { prompt: 'Original written musical description: a four-note motif repeats, moving into a higher register on each repetition while gradually becoming louder. Analyse the described changes.', steps: ['Repetition establishes the motif as recognisable.', 'Each repetition moves the motif into a higher register.', 'The gradual increase in loudness is a crescendo and may contribute to growing intensity.'], conclusion: 'Together, rising pitch and dynamics develop the motif into a structural build rather than simple repetition.' },
    misconceptions: [{ mistake: 'Writing a vocabulary list instead of an analysis.', correction: 'Connect each term to audible evidence, change and effect.' }, { mistake: 'Calling tempo and rhythm the same thing.', correction: 'Tempo is overall pulse speed; rhythm is the pattern of durations and accents.' }],
    practice: [practice('mus-1', 'Foundation', 'Identify', 3, 'Identify three elements you could track when comparing two performances.', ['Choose measurable or audible features.'], ['Tempo, articulation and dynamics are three valid elements.'], ['Three valid elements', 'Elements can be located or compared in the recording']), practice('mus-2', 'Standard', 'Explain', 6, 'Explain how thinning texture can prepare a climax.', ['Think about contrast.'], ['Removing layers lowers density and can create expectation.', 'A later return of fuller texture gains impact through contrast.', 'Dynamics, register and silence may strengthen the preparation.'], ['Texture change', 'Contrast', 'Connection to climax']), practice('mus-3', 'Challenge', 'Evaluate', 8, 'Evaluate whether a faster performance is necessarily more energetic.', ['Separate tempo from energy.'], ['Faster tempo may contribute energy.', 'Weak articulation, narrow dynamics or low rhythmic emphasis can reduce intensity.', 'Energy should be judged from interacting performance choices.'], ['Considers tempo', 'Counterfactors', 'Integrated judgement'])],
    checklist: ['I locate evidence in the music.', 'I distinguish musical elements.', 'I analyse interactions and change.', 'I connect evidence to structure or intention.'],
    sourceIds: ['ib-myp-programme', 'ib-myp-assessment', 'arts-carnegie-toolbox'],
  }),
  lesson({
    id: 'myp5-drama-performance', prerequisiteIds: [], subjectSlug: 'drama', topic: 'Performance analysis',
    summary: 'Analyse how performer, space, design and audience relationships create meaning in live work.',
    objectives: ['Describe performance evidence.', 'Explain interaction among theatrical choices.', 'Evaluate choices against an artistic intention.'],
    keyIdeas: ['Performance choices occur in time and space.', 'Meaning can come from contrast between spoken text and physical action.', 'Evaluation needs a stated intention and evidence of audience effect.'],
    definitions: [{ term: 'Proxemics', meaning: 'The use of distance and spatial relationship between performers.' }, { term: 'Blocking', meaning: 'Planned movement and positioning on stage.' }, { term: 'Subtext', meaning: 'Meaning implied beneath or beside the spoken words.' }],
    method: ['Locate the moment.', 'Describe voice, body, space or design precisely.', 'Explain how choices interact.', 'Judge their effect in relation to intention and audience.'],
    workedExample: { prompt: 'Original fictional moment: a character says “I trust you” while stepping backwards. Analyse the relationship between words and movement.', steps: ['The words state trust.', 'Backward movement increases distance.', 'The contradiction creates subtext of fear, doubt or concealment.'], conclusion: 'The moment asks the audience to question the literal dialogue and attend to physical evidence.' },
    misconceptions: [{ mistake: 'Retelling the scene.', correction: 'Select a moment and analyse the choices that produce meaning.' }, { mistake: 'Calling a performance effective without criteria.', correction: 'State the intention, evidence and observed or plausible audience response.' }],
    practice: [practice('dra-1', 'Foundation', 'Describe', 3, 'Describe three performance choices that could show status without dialogue.', ['Consider level, gaze and pace.'], ['Higher physical level, sustained direct gaze and controlled slower movement could suggest status.'], ['Three specific choices', 'Choices are observable rather than inferred emotions']), practice('dra-2', 'Standard', 'Explain', 6, 'Explain how lighting and proxemics could isolate one performer.', ['Connect two design areas.'], ['A narrow pool of light can separate the performer visually.', 'Large distance from the ensemble reinforces social separation.', 'The combined choices direct audience attention and communicate isolation.'], ['Lighting', 'Proxemics', 'Combined effect']), practice('dra-3', 'Challenge', 'Evaluate', 8, 'A scene intends to create tension but the audience laughs. Evaluate what evidence the group should review.', ['Do not assume laughter means total failure.'], ['Review timing, vocal delivery, physical exaggeration, audience context and whether laughter occurred at intended moments.', 'Compare rehearsal recordings and feedback.', 'Revise the clearest mismatch, then retest.'], ['Multiple evidence sources', 'Connection to intention', 'Specific revision', 'Retest'])],
    checklist: ['I select exact moments.', 'I describe observable choices.', 'I analyse interactions.', 'I evaluate against intention and evidence.'],
    sourceIds: ['ib-myp-programme', 'ib-myp-assessment', 'arts-rsc-rehearsal'],
  }),
  {
  "id": "myp5-phe-fitness",
  "subjectSlug": "physical-health-education",
  "topic": "Fitness",
  "prerequisiteIds": [],
  "contentStatus": "original-editorial-draft",
  "curriculumVersion": "vertexed-myp5-2026.1",
  "summary": "Distinguish fitness qualities and evaluate what a fictional measure can establish without treating a result as a health diagnosis.",
  "objectives": [
    "Relate a fitness quality to a stated task.",
    "Distinguish validity and reliability.",
    "Identify limits of a proposed test or plan."
  ],
  "explanation": [
    "Fitness refers to capacities relevant to particular activities, rather than one score that ranks a whole person. Speed, strength, muscular endurance and cardiorespiratory endurance describe different demands. A measure chosen for one purpose may not answer a different question. The interpretation also depends on the conditions and on who the measure is suitable for. A classroom example of a test is not a request to attempt it.",
    "Validity concerns whether evidence supports the intended interpretation; reliability concerns consistency under comparable conditions. A consistently recorded result can still be an unsuitable measure of the chosen quality. Real testing requires appropriate instruction, suitability and school guidance. The original fictional records here support discussion of measures and evidence only. They cannot diagnose health, certify safe technique or establish an individual training workload. Keep performance observations separate from assumptions about wellbeing or personal worth."
  ],
  "keyIdeas": [
    "Different activities make different demands.",
    "Consistency does not guarantee validity.",
    "A result needs context and an appropriate interpretation."
  ],
  "definitions": [
    {
      "term": "Validity",
      "meaning": "The extent to which evidence supports the intended interpretation of a measure."
    },
    {
      "term": "Reliability",
      "meaning": "Consistency under comparable measurement conditions."
    },
    {
      "term": "Cardiorespiratory endurance",
      "meaning": "Capacity to sustain activity supported by the circulatory and respiratory systems."
    }
  ],
  "method": [
    "Name the stated activity demand.",
    "Identify the quality the measure aims to describe.",
    "Check comparable conditions and suitability information.",
    "State what the result cannot establish."
  ],
  "workedExample": {
    "prompt": "A fictional report uses a short sprint time as its only evidence that a learner can sustain a prolonged activity. Evaluate the interpretation.",
    "steps": [
      "The timed sprint provides information about performance over that short distance.",
      "Sustaining a prolonged activity involves demands not established by the short sprint alone.",
      "Consistent timing does not remove that validity problem.",
      "Identify relevant evidence with a qualified teacher rather than attempting a new test unsupervised."
    ],
    "conclusion": "The measure does not establish the broader endurance claim; further appropriate evidence would be needed."
  },
  "misconceptions": [
    {
      "mistake": "One fitness score describes all capacities.",
      "correction": "Relate each measure to its intended task and interpretation."
    },
    {
      "mistake": "Discomfort proves improvement.",
      "correction": "Discomfort is not evidence of improved capacity and should not be used as a target."
    }
  ],
  "practice": [
    {
      "id": "phe-1",
      "difficulty": "Foundation",
      "command": "Identify",
      "marks": 3,
      "prompt": "A fictional task concerns covering a short distance quickly. Name a relevant fitness quality and explain why this does not establish prolonged endurance.",
      "hints": [
        "Separate short-duration speed and sustained activity."
      ],
      "solution": [
        "Speed is relevant to covering the short distance quickly.",
        "That performance alone does not establish ability to sustain a prolonged activity."
      ],
      "successCriteria": [
        "Relevant quality",
        "Limit identified"
      ]
    },
    {
      "id": "phe-2",
      "difficulty": "Standard",
      "command": "Analyse",
      "marks": 5,
      "prompt": "Two fictional timings used different distances and different start signals. Explain why a smaller time does not by itself prove improvement.",
      "hints": [
        "Check comparable conditions."
      ],
      "solution": [
        "Distance and starting procedure changed, so the times do not represent the same task under comparable conditions.",
        "Use a defined, appropriate observation protocol and qualified guidance before interpreting a difference."
      ],
      "successCriteria": [
        "Conditions recognised",
        "Qualified interpretation"
      ]
    },
    {
      "id": "phe-3",
      "difficulty": "Advanced",
      "command": "Evaluate",
      "marks": 6,
      "prompt": "A template claims one automatic percentage increase makes every exercise plan suitable for every learner. Evaluate without prescribing a replacement workload.",
      "hints": [
        "Suitability depends on more than arithmetic."
      ],
      "solution": [
        "The claim ignores activity, experience, individual circumstances and recovery.",
        "A percentage calculation does not establish safety or suitability.",
        "Real plans require appropriate qualified review and a way to respond to concerns."
      ],
      "successCriteria": [
        "Universal claim rejected",
        "Arithmetic boundary",
        "Appropriate review"
      ]
    }
  ],
  "checklist": [
    "I connect a measure with a task.",
    "I check comparability.",
    "I distinguish performance and health.",
    "I recognise the need for appropriate guidance."
  ],
  "sourceIds": [
    "phe-who-activity",
    "phe-openstax-cardiac"
  ]
},
  lesson({
    id: 'myp5-personal-project-goal', prerequisiteIds: [], subjectSlug: 'personal-project', topic: 'Goal development',
    summary: 'Turn an interest into a feasible learning goal, product goal and evidence plan.',
    objectives: ['Separate learning and product goals.', 'Define meaningful success criteria.', 'Plan evidence of process and reflection.'],
    keyIdeas: ['The learning goal describes what the learner will understand or become able to do.', 'The product goal describes what will be created or performed.', 'Success criteria should be testable before production begins.'],
    definitions: [{ term: 'Learning goal', meaning: 'The knowledge or skill the learner intends to develop.' }, { term: 'Product goal', meaning: 'The intended outcome, artefact or performance.' }, { term: 'Process evidence', meaning: 'Dated records showing decisions, research, action, feedback and change.' }],
    method: ['Name the interest and intended learning.', 'Define a product that can demonstrate the learning.', 'Set measurable quality criteria.', 'Plan milestones, evidence and feedback points.'],
    workedExample: { prompt: 'Improve “I want to make an app about recycling.”', steps: ['Learning goal: learn to design and test accessible information architecture.', 'Product goal: create a working prototype for local recycling decisions.', 'Criteria: users complete three sorting tasks accurately; text works at 200% zoom; content sources are recorded.'], conclusion: 'The revised goals distinguish learning from output and make evaluation possible.' },
    misconceptions: [{ mistake: 'Choosing a product before deciding what to learn.', correction: 'Make the product serve the learning goal.' }, { mistake: 'Writing criteria after the product is finished.', correction: 'Freeze criteria early, then document justified changes.' }],
    practice: [practice('pp-1', 'Foundation', 'Distinguish', 4, 'Distinguish a learning goal from a product goal using one example.', ['Use “learn to” and “create”.'], ['Learning goal: learn to conduct oral-history interviews ethically.', 'Product goal: create a ten-minute edited audio documentary.'], ['Clear distinction', 'Connected example']), practice('pp-2', 'Standard', 'Develop', 6, 'Develop three success criteria for an illustrated beginner’s cooking guide.', ['Include content, usability and testing.'], ['Examples: every recipe is tested twice; a beginner completes one recipe using only the guide; allergen information is visible for every recipe.'], ['Three measurable criteria', 'User relevance', 'Testability']), practice('pp-3', 'Challenge', 'Evaluate', 8, 'A learner changes the project goal halfway through but has no dated record. Evaluate the evidence problem and recovery action.', ['Separate the quality of the change from the missing trace.'], ['The change may be justified, but without dated evidence the reasoning and sequence cannot be established.', 'Reconstruct only from existing messages, drafts or files, label uncertainty, and document future decisions contemporaneously.'], ['Evidence limitation', 'No fabrication', 'Recovery method', 'Future process'])],
    checklist: ['My learning and product goals are distinct.', 'My scope is feasible.', 'My criteria are measurable.', 'My process evidence records decisions when they happen.'],
    sourceIds: ['ib-myp-programme', 'ib-myp-assessment', 'project-ib-learning'],
  }),
  ...MYP5_LESSON_EXPANSION,
  ...MYP5_MATHEMATICS_COMPLETION,
  ...MYP5_PHYSICS_COMPLETION,
  ...MYP5_CHEMISTRY_COMPLETION,
  ...MYP5_BIOLOGY_COMPLETION,
  ...MYP5_INTEGRATED_SCIENCES_COMPLETION,
  ...MYP5_ENGLISH_COMPLETION,
  ...MYP5_HISTORY_COMPLETION,
  ...MYP5_ECONOMICS_COMPLETION,
  ...MYP5_GEOGRAPHY_COMPLETION,
  ...MYP5_INTEGRATED_HUMANITIES_COMPLETION,
  ...MYP5_SPANISH_COMPLETION,
  ...MYP5_DESIGN_COMPLETION,
  ...MYP5_ARTS_COMPLETION,
  ...MYP5_PERSONAL_PROJECT_COMPLETION,
  ...MYP5_PHE_COMPLETION,
];

const lessonByKey = new Map(MYP5_LESSONS.map((entry) => [`${entry.subjectSlug}:${entry.topic}`, entry]));

export function findMypLesson(subjectSlug: string, topic: string): MypLesson | null {
  return lessonByKey.get(`${subjectSlug}:${topic}`) ?? null;
}

export function sourcesForLesson(lessonEntry: MypLesson): MypContentSource[] {
  const ids = new Set(lessonEntry.sourceIds);
  return MYP_CONTENT_SOURCES.filter((source) => ids.has(source.id));
}

const lessonById = new Map(MYP5_LESSONS.map((entry) => [entry.id, entry]));

export function prerequisitesForLesson(entry: MypLesson): MypLesson[] {
  return (entry.prerequisiteIds ?? []).map((id) => {
    const prerequisite = lessonById.get(id);
    if (!prerequisite) throw new Error(`Unknown prerequisite: ${id}`);
    return prerequisite;
  });
}
