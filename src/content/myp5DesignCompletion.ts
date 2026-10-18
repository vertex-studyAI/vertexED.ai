import type { MypLesson } from './myp5Lessons';

const design = (value: Omit<MypLesson, 'subjectSlug' | 'contentStatus' | 'curriculumVersion'>): MypLesson => ({ ...value, subjectSlug: 'design', contentStatus: 'original-editorial-draft', curriculumVersion: 'vertexed-myp5-2026.1' });

export const MYP5_DESIGN_COMPLETION: MypLesson[] = [
design({
  "id": "myp5-design-problem-identification",
  "topic": "Problem identification",
  "prerequisiteIds": [
    "myp5-design-cycle"
  ],
  "summary": "Frame a specific user difficulty before choosing a product.",
  "objectives": [
    "Separate a need from a proposed solution.",
    "Use observations to define a bounded problem.",
    "Write a brief with users, context and constraints."
  ],
  "explanation": [
    "A design problem describes a gap between what people need to do and what happens in a particular context. “Make an app” selects a solution before showing a need. “New visitors cannot locate the book return point without asking staff” identifies people, a task and a difficulty to investigate. Distinguish an observation from its possible cause: stopping at a junction does not prove that someone cannot read a sign.",
    "Define a manageable scope using evidence and practical constraints. In an original hypothetical library case, three of five first-time visitors asked where to return books. This motivates investigation; it is not a population-wide failure rate or proof that a new sign will help. A useful brief states the outcome sought, the setting and limits while leaving room for different solutions. Revisit the brief when research challenges the first explanation."
  ],
  "keyIdeas": [
    "State the user goal before the artefact.",
    "Separate assumptions from observations.",
    "A small sample does not establish prevalence."
  ],
  "definitions": [
    {
      "term": "Need",
      "meaning": "An outcome a user must achieve in a context."
    },
    {
      "term": "Constraint",
      "meaning": "A limit such as space, time or available materials."
    },
    {
      "term": "Design brief",
      "meaning": "A concise statement of the problem, users, intended outcome and scope."
    }
  ],
  "method": [
    "Describe the observed task and difficulty.",
    "Record who, where and when without identifying individuals.",
    "List plausible explanations and missing evidence.",
    "Write a solution-open brief with constraints."
  ],
  "workedExample": {
    "prompt": "Hypothetical evidence: three of five first-time library visitors asked staff where to return books. The entrance noticeboard is crowded. Write a brief.",
    "steps": [
      "Identify the user and goal: first-time visitors returning books.",
      "Asking for directions was observed; clutter causing it is a hypothesis.",
      "Specify the outcome within the existing entrance area, with no construction.",
      "Leave placement, wording and other possible solutions open until research."
    ],
    "conclusion": "Investigate how to help first-time visitors find the return point independently within the existing entrance layout."
  },
  "misconceptions": [
    {
      "mistake": "Calling “build a kiosk” the need.",
      "correction": "A kiosk is a proposed solution; describe the task first."
    },
    {
      "mistake": "Treating five observations as proof about everyone.",
      "correction": "Report the sample and context; investigate other users and circumstances."
    }
  ],
  "practice": [
    {
      "id": "des-problem-identification-1",
      "difficulty": "Foundation",
      "command": "Rewrite",
      "marks": 3,
      "prompt": "Rewrite “Our school needs a new organiser app” as a user-centred problem. Hypothetical evidence: four of six interviewed pupils could not locate the current homework deadline.",
      "hints": [
        "Name the task and observed difficulty."
      ],
      "solution": [
        "Some interviewed pupils could not locate the current homework deadline; investigate how pupils can find the correct deadline when planning work.",
        "These interviews do not establish that all pupils have the problem or that an app is necessary."
      ],
      "successCriteria": [
        "User and goal identified",
        "Solution not predetermined"
      ]
    },
    {
      "id": "des-problem-identification-2",
      "difficulty": "Standard",
      "command": "Distinguish",
      "marks": 5,
      "prompt": "In a hypothetical corridor two visitors pause at a junction; a designer writes “They cannot understand English.” Separate observation from inference and propose a follow-up.",
      "hints": [
        "Pausing has several possible explanations."
      ],
      "solution": [
        "The observation is that two visitors paused. Language understanding is an untested inference.",
        "Ask what they were trying to do and observe how they use the directions; they may simply be waiting."
      ],
      "successCriteria": [
        "Observation separated from inference",
        "Neutral follow-up"
      ]
    },
    {
      "id": "des-problem-identification-3",
      "difficulty": "Advanced",
      "command": "Formulate",
      "marks": 6,
      "prompt": "Write a brief for a hypothetical classroom where shared scissors are hard to find. There is 200 mm of shelf width and only card and tape for a first prototype. Include a limitation if only one class was observed.",
      "hints": [
        "State goal, users, context and limits."
      ],
      "solution": [
        "Help pupils locate and return shared scissors using a first prototype within 200 mm of shelf width, made from card and tape.",
        "Investigate current storage and routines before choosing the form; one class does not establish other classes’ needs.",
        "Any handling trial follows the classroom’s normal supervision and storage rules."
      ],
      "successCriteria": [
        "Goal and constraints included",
        "Evidence limit stated"
      ]
    }
  ],
  "checklist": [
    "I describe a task and difficulty.",
    "I distinguish facts from assumptions.",
    "I leave solution choices open.",
    "I state the evidence boundary."
  ],
  "sourceIds": [
    "design-user-needs",
    "design-double-diamond"
  ]
}),
design({
  "id": "myp5-design-research",
  "topic": "Research",
  "prerequisiteIds": [
    "myp5-design-problem-identification"
  ],
  "summary": "Choose research that answers a design question and supports a decision.",
  "objectives": [
    "Match methods to questions.",
    "Distinguish primary and secondary evidence.",
    "Trace findings to design implications."
  ],
  "explanation": [
    "Research reduces uncertainty before design decisions. Observation can reveal where users hesitate during a task; interviews explore reasons and priorities; inspecting a comparable product can reveal construction or interaction choices. These methods answer different questions. A preference poll cannot show that a task is completed successfully. Secondary research needs an identifiable source, date and relevance to the actual context, rather than an unsupported image or copied claim.",
    "Plan an appropriate investigation around a specific question. For classroom practice use supplied fictional records or a teacher-approved activity rather than collecting unnecessary personal information. Record observations separately from interpretations, include contradictory evidence and avoid questions that suggest the desired answer. Synthesise findings into evidence, implication, possible requirement and remaining uncertainty. A convenience sample of classmates may miss the needs of younger pupils, visitors or people with different access requirements."
  ],
  "keyIdeas": [
    "Method choice follows the research question.",
    "Conflicting findings are useful evidence.",
    "A finding should inform a decision."
  ],
  "definitions": [
    {
      "term": "Primary research",
      "meaning": "Evidence gathered directly for the current investigation."
    },
    {
      "term": "Secondary research",
      "meaning": "Existing information produced for another purpose."
    },
    {
      "term": "Research bias",
      "meaning": "A systematic influence that can distort evidence or its interpretation."
    }
  ],
  "method": [
    "Name the decision and uncertainty.",
    "Choose an appropriate method and participants or sources.",
    "Use neutral prompts and record context.",
    "Link findings to provisional requirements and limitations."
  ],
  "workedExample": {
    "prompt": "Hypothetical question: why do visitors miss the library return point? Choose two methods.",
    "steps": [
      "Observe a return task without pointing out the route, recording pauses and requests for help.",
      "Afterwards ask what information visitors looked for and expected.",
      "Compare actions with explanations; remembered accounts can differ from behaviour.",
      "Use supplied anonymous notes in classroom practice and record context and sample limits."
    ],
    "conclusion": "Task observations and neutral follow-up questions provide complementary evidence, not automatic proof of cause."
  },
  "misconceptions": [
    {
      "mistake": "Asking “Would you like our clearer new sign?”",
      "correction": "Ask what the person noticed without praising a proposed design."
    },
    {
      "mistake": "Discarding a contradictory comment.",
      "correction": "Preserve it and investigate whether it reveals a different need."
    }
  ],
  "practice": [
    {
      "id": "des-research-1",
      "difficulty": "Foundation",
      "command": "Select",
      "marks": 3,
      "prompt": "To investigate whether a paper timetable can be read from a pupil’s usual seat, choose between observing a reading task and asking which colour looks nicest. Explain.",
      "hints": [
        "Match evidence to the intended claim."
      ],
      "solution": [
        "Observe the pupil reading specified entries from the usual seat under normal lighting.",
        "Colour preference does not establish legibility; record viewing conditions and errors."
      ],
      "successCriteria": [
        "Relevant method",
        "Reason and context"
      ]
    },
    {
      "id": "des-research-2",
      "difficulty": "Standard",
      "command": "Revise",
      "marks": 5,
      "prompt": "Rewrite the leading question “Don’t you agree our organiser is much easier?” and explain an advantage of the replacement.",
      "hints": [
        "Ask without suggesting the desired conclusion."
      ],
      "solution": [
        "After the task ask: “What, if anything, made it difficult to find the item?”",
        "This allows difficulty, no difficulty or an unexpected issue rather than inviting agreement with “easier”."
      ],
      "successCriteria": [
        "Neutral question",
        "Bias reduction explained"
      ]
    },
    {
      "id": "des-research-3",
      "difficulty": "Advanced",
      "command": "Synthesise",
      "marks": 6,
      "prompt": "Hypothetical notes: three pupils want more colour; two cannot distinguish colour-only tray labels; all five identify written labels correctly in one classroom trial. Propose a requirement and follow-up without claiming universal accessibility.",
      "hints": [
        "Prioritise task access and retain the sample limit."
      ],
      "solution": [
        "Use readable written labels as well as colour so colour is not the only identifier.",
        "Test them in the intended position with a broader range of relevant users and lighting conditions.",
        "The five-person trial supports a prototype choice; it does not certify accessibility for everyone."
      ],
      "successCriteria": [
        "Requirement linked to evidence",
        "Contrary need retained",
        "Bounded claim and follow-up"
      ]
    }
  ],
  "checklist": [
    "I state a research question.",
    "I justify the method.",
    "I preserve contrary evidence.",
    "I trace a finding to a decision."
  ],
  "sourceIds": [
    "design-research-planning",
    "design-user-needs"
  ]
}),
design({
  "id": "myp5-design-specifications",
  "topic": "Specifications",
  "prerequisiteIds": [
    "myp5-design-research"
  ],
  "summary": "Translate evidence into requirements that can be tested fairly.",
  "objectives": [
    "Write measurable requirements with conditions.",
    "Separate mandatory limits from preferences.",
    "Plan a matching test for each criterion."
  ],
  "explanation": [
    "A specification turns a brief and research into requirements for judging a design. “Attractive” or “easy to use” leaves the test undefined. A useful requirement identifies a property or task, a threshold, conditions and a reason. For a hypothetical tray, “external width no more than 180 mm to fit the measured shelf” can be checked with a ruler. User-task criteria also need a clear definition of success and of any permitted help.",
    "Choose thresholds because they serve the brief, not because a finished prototype happens to meet them. Mark essential constraints separately from desirable improvements. A product that breaches a mandatory size limit cannot be rescued by a high appearance score. Record units, measurement equipment or task instructions. Requirements can change when evidence changes, but document the reason and re-evaluate rather than quietly lowering a target after a failed test."
  ],
  "keyIdeas": [
    "A criterion needs an observable pass condition.",
    "Mandatory constraints cannot be averaged away.",
    "Set thresholds before evaluation."
  ],
  "definitions": [
    {
      "term": "Specification",
      "meaning": "A set of justified requirements for a solution."
    },
    {
      "term": "Acceptance criterion",
      "meaning": "An observable condition for deciding whether a requirement is met."
    },
    {
      "term": "Traceability",
      "meaning": "A recorded link from need to requirement, design choice and evidence."
    }
  ],
  "method": [
    "Extract a need or constraint from evidence.",
    "State threshold, units and conditions.",
    "Identify mandatory and desirable requirements.",
    "Choose a test and record the rationale."
  ],
  "workedExample": {
    "prompt": "A hypothetical shelf is 200 mm wide. The brief reserves 10 mm clearance on each side. Specify the maximum tray width and a test.",
    "steps": [
      "Available width = 200 − 10 − 10 = 180 mm.",
      "The finished tray’s greatest external width must be at most 180 mm.",
      "Measure the widest point with a suitable ruler and record the reading.",
      "Depth, height and stability need separate criteria."
    ],
    "conclusion": "Maximum width is 180 mm; passing this test alone does not establish complete suitability."
  },
  "misconceptions": [
    {
      "mistake": "Writing “small enough”.",
      "correction": "Include a dimension and testable limit."
    },
    {
      "mistake": "Lowering a target just to pass.",
      "correction": "Keep the failure; justify revised requirements and retest transparently."
    }
  ],
  "practice": [
    {
      "id": "des-specifications-1",
      "difficulty": "Foundation",
      "command": "Identify",
      "marks": 3,
      "prompt": "A hypothetical label must be found by at least four of five first-time trial users within 20 seconds without hints. Identify the threshold, conditions and success measure.",
      "hints": [
        "Include correctness and time."
      ],
      "solution": [
        "Success means locating the correct label within 20 seconds.",
        "At least four of five users must succeed; they are first-time users and receive no hints."
      ],
      "successCriteria": [
        "Complete threshold",
        "Conditions and outcome identified"
      ]
    },
    {
      "id": "des-specifications-2",
      "difficulty": "Standard",
      "command": "Calculate",
      "marks": 5,
      "prompt": "A hypothetical shelf is 260 mm wide and needs 15 mm clearance on each side. Find the maximum organiser width and decide whether a 234 mm prototype passes.",
      "hints": [
        "Subtract both clearances."
      ],
      "solution": [
        "Maximum width = 260 − 15 − 15 = 230 mm.",
        "234 mm exceeds the limit by 4 mm, so it fails."
      ],
      "successCriteria": [
        "230 mm with working",
        "Failure justified"
      ]
    },
    {
      "id": "des-specifications-3",
      "difficulty": "Advanced",
      "command": "Evaluate",
      "marks": 6,
      "prompt": "A hypothetical design has a mandatory £12 cost ceiling. Prototype A costs £14 and scores 5/5 for appearance; B costs £11 and scores 3/5. Can A be selected simply because its average score is higher? Propose a next step.",
      "hints": [
        "A mandatory gate differs from a preference."
      ],
      "solution": [
        "No: A breaches the mandatory cost ceiling; appearance cannot cancel that constraint.",
        "Consider B if it meets other mandatory requirements, or revise A’s materials and recalculate cost.",
        "If the budget changes, record authorisation and reason rather than assuming the limit disappeared."
      ],
      "successCriteria": [
        "Mandatory constraint respected",
        "Specific next step"
      ]
    }
  ],
  "checklist": [
    "I include thresholds and units.",
    "I justify each criterion.",
    "I distinguish mandatory and desirable.",
    "I specify how to collect evidence."
  ],
  "sourceIds": [
    "design-acceptance-criteria",
    "design-usability"
  ]
}),
design({
  "id": "myp5-design-ideation",
  "topic": "Ideation",
  "prerequisiteIds": [
    "myp5-design-specifications"
  ],
  "summary": "Generate distinct approaches and justify selection against the brief.",
  "objectives": [
    "Develop genuinely different concepts.",
    "Compare concepts using justified criteria.",
    "Identify uncertainties before selecting a prototype."
  ],
  "explanation": [
    "Ideation explores possible ways to meet the same need. Three colour versions of an identical object are variations, but they do little to investigate different mechanisms or interactions. For a hypothetical shared-materials station, alternatives might group items by task, give each item a labelled slot, or use a checkout card. Sketch enough of each approach to explain use, dimensions and likely constraints; drawing polish is not evidence that a concept works.",
    "Compare ideas against the specification rather than selecting a favourite and inventing reasons afterwards. A decision matrix can organise judgements, but scores require evidence or clearly labelled estimates. Check mandatory constraints first, then compare preferences. Weighted scores express the priorities chosen by the designer; they do not make uncertain estimates objective. If two ideas are close or depend on an untested assumption, prototype that uncertainty before committing."
  ],
  "keyIdeas": [
    "Generate alternatives in function as well as appearance.",
    "Annotate why each idea might meet the need.",
    "A score supports reasoning but cannot replace evidence."
  ],
  "definitions": [
    {
      "term": "Divergence",
      "meaning": "Exploring a range of possible approaches."
    },
    {
      "term": "Convergence",
      "meaning": "Narrowing options using evidence and requirements."
    },
    {
      "term": "Decision matrix",
      "meaning": "A table comparing options against selected criteria and, sometimes, weights."
    }
  ],
  "method": [
    "Restate the need and mandatory constraints.",
    "Sketch several distinct approaches.",
    "Compare each against the same criteria and label estimates.",
    "Choose a justified direction and name a prototype question."
  ],
  "workedExample": {
    "prompt": "Hypothetical concepts A and B both pass mandatory limits. Usability has weight 2 and ease of making weight 1. On a 1–5 scale where higher is better, A scores 3 and 5; B scores 4 and 2. Compare.",
    "steps": [
      "A totals 2 × 3 + 1 × 5 = 11.",
      "B totals 2 × 4 + 1 × 2 = 10.",
      "A leads under these weights, but the one-point difference depends on the scores and priorities.",
      "If usability estimates are uncertain, test both task flows before final selection."
    ],
    "conclusion": "A is the provisional choice, not a proven winner; document weights and unresolved evidence."
  },
  "misconceptions": [
    {
      "mistake": "Presenting three colours as three different mechanisms.",
      "correction": "Explore differences in use, structure or arrangement."
    },
    {
      "mistake": "Treating estimated scores as test results.",
      "correction": "Label estimates and test the uncertain properties."
    }
  ],
  "practice": [
    {
      "id": "des-ideation-1",
      "difficulty": "Foundation",
      "command": "Generate",
      "marks": 3,
      "prompt": "For a hypothetical desk where learners lose small reminder notes, propose two functionally distinct low-cost concepts.",
      "hints": [
        "Change how information is stored or displayed."
      ],
      "solution": [
        "One option is a divided paper pocket with labelled sections; another is a standing daily checklist card that replaces loose notes.",
        "They differ in retrieval and recording, not just colour. Other feasible approaches are valid."
      ],
      "successCriteria": [
        "Two distinct approaches",
        "Connection to the need"
      ]
    },
    {
      "id": "des-ideation-2",
      "difficulty": "Standard",
      "command": "Calculate",
      "marks": 5,
      "prompt": "Both hypothetical concepts pass mandatory constraints. Task clarity has weight 3 and ease of making weight 1, each scored 1–5 with higher better. A scores 4 and 2; B scores 3 and 5. Compare and state a limitation.",
      "hints": [
        "Multiply each score by its weight."
      ],
      "solution": [
        "A = 3 × 4 + 2 = 14; B = 3 × 3 + 5 = 14.",
        "The totals tie. Test task clarity or examine another justified criterion; these weighted judgements do not prove equal real performance."
      ],
      "successCriteria": [
        "Both totals 14",
        "Tie and evidence limit recognised"
      ]
    },
    {
      "id": "des-ideation-3",
      "difficulty": "Advanced",
      "command": "Justify",
      "marks": 6,
      "prompt": "A hypothetical team prefers a folding organiser because it looks unusual. Its hinge durability has not been tested and daily folding is essential. Propose a defensible selection decision.",
      "hints": [
        "Make the uncertain essential feature the next test."
      ],
      "solution": [
        "Keep the folding concept provisional and compare it with a fixed organiser against the same requirements.",
        "Build a hinge sample and test the predeclared repeated-folding requirement with suitable classroom materials and supervision.",
        "Record failures and choose or revise the concept based on that evidence; novelty alone cannot establish durability."
      ],
      "successCriteria": [
        "Essential uncertainty identified",
        "Specific evidence plan",
        "Conditional choice"
      ]
    }
  ],
  "checklist": [
    "My concepts differ meaningfully.",
    "I annotate use and constraints.",
    "I label estimated scores.",
    "I justify selection and the next test."
  ],
  "sourceIds": [
    "design-double-diamond"
  ]
}),
design({
  "id": "myp5-design-testing",
  "topic": "Testing",
  "prerequisiteIds": [
    "myp5-design-prototyping",
    "myp5-design-specifications"
  ],
  "summary": "Collect comparable observations against predefined success criteria.",
  "objectives": [
    "Match a test to a requirement.",
    "Control task conditions without coaching.",
    "Report failures and limits alongside successes."
  ],
  "explanation": [
    "Testing gathers evidence about a specific requirement. A dimension check measures fit; an observed user task examines whether someone can achieve a goal; an opinion question explores a preference. They are not interchangeable. Define the prototype version, task, measure, conditions and threshold before collecting results. If success means finding a named book without help within two minutes, a participant who succeeds only after a hint has not met that criterion.",
    "Keep task wording neutral so it states the goal without revealing the route. Record actual times, errors, help and non-completions instead of writing only “passed”. When comparing versions, consider familiarity: the same person may improve because they have learnt the task. A small classroom trial can reveal useful problems but cannot demonstrate a population success rate. Use supplied hypothetical data here; any real classroom testing follows the teacher’s approved procedure and records only needed information."
  ],
  "keyIdeas": [
    "A fair task states the goal without giving the answer.",
    "Record assistance and failures explicitly.",
    "Changed users or conditions can weaken comparisons."
  ],
  "definitions": [
    {
      "term": "Test protocol",
      "meaning": "A repeatable description of task, equipment, conditions and recording."
    },
    {
      "term": "Success threshold",
      "meaning": "The predeclared performance level required to pass."
    },
    {
      "term": "Confounding factor",
      "meaning": "Another change that could explain a difference in results."
    }
  ],
  "method": [
    "Select a specification and prototype version.",
    "Write a neutral task and explicit success rule.",
    "Record each attempt with conditions and any help.",
    "Compare with the threshold and state limitations."
  ],
  "workedExample": {
    "prompt": "Hypothetical task: find a book within 120 seconds without help. At least four of five must succeed. Times are 70, 95, 130, 80 and 110 seconds; the 80-second attempt used a hint.",
    "steps": [
      "70, 95 and 110 seconds qualify.",
      "130 exceeds the time limit; 80 with a hint fails the independence condition.",
      "Three of five succeed, below the required four.",
      "Keep all five records and inspect the two failure paths before revising."
    ],
    "conclusion": "The prototype fails this criterion in this trial; do not discard assisted or slow attempts."
  },
  "misconceptions": [
    {
      "mistake": "Using a helpful hint without recording it.",
      "correction": "Assistance changes the condition and must be recorded."
    },
    {
      "mistake": "Claiming a faster second attempt proves a better interface.",
      "correction": "Familiarity or other changed conditions may explain improvement."
    }
  ],
  "practice": [
    {
      "id": "des-testing-1",
      "difficulty": "Foundation",
      "command": "Rewrite",
      "marks": 3,
      "prompt": "Replace the leading instruction “Click the blue Returns button to return your book” with a neutral test task for a hypothetical interface.",
      "hints": [
        "Give a goal rather than a route."
      ],
      "solution": [
        "“You have finished this borrowed book. Show how you would record its return.”",
        "Do not name the button, colour or location; record the route and assistance."
      ],
      "successCriteria": [
        "Goal preserved",
        "Route not revealed"
      ]
    },
    {
      "id": "des-testing-2",
      "difficulty": "Standard",
      "command": "Determine",
      "marks": 5,
      "prompt": "Hypothetical criterion: at least four of five participants find a label independently within 30 seconds. Times: 20, 25, 31, 28 and 29 seconds. The 28-second attempt used a hint. Determine the result.",
      "hints": [
        "Apply both conditions to each attempt."
      ],
      "solution": [
        "20, 25 and 29 seconds qualify: three of five.",
        "31 seconds is too slow; 28 with a hint is not independent. The criterion fails."
      ],
      "successCriteria": [
        "Three qualifying attempts",
        "Both exclusions justified"
      ]
    },
    {
      "id": "des-testing-3",
      "difficulty": "Advanced",
      "command": "Evaluate",
      "marks": 6,
      "prompt": "In a hypothetical comparison, the same five pupils use version A, then repeat the identical task on B. B is faster for all five. Explain a limitation and improve the comparison.",
      "hints": [
        "Consider prior exposure to the task."
      ],
      "solution": [
        "Practice on A may help pupils perform the repeated task on B; speed alone does not isolate the design change.",
        "Use equivalent tasks and vary version order across participants, or use comparable first-time groups while recording group differences.",
        "Keep equipment and instructions consistent and report the small sample; no design removes every source of uncertainty."
      ],
      "successCriteria": [
        "Learning effect explained",
        "Feasible comparison improvement",
        "Remaining limit stated"
      ]
    }
  ],
  "checklist": [
    "My test matches the criterion.",
    "I avoid coaching.",
    "I record every attempt and assistance.",
    "I report comparison limits."
  ],
  "sourceIds": [
    "design-usability",
    "design-research-planning"
  ]
}),
design({
  "id": "myp5-design-evaluation",
  "topic": "Evaluation",
  "prerequisiteIds": [
    "myp5-design-testing"
  ],
  "summary": "Judge the solution against evidence and explain what remains unproven.",
  "objectives": [
    "Distinguish description from judgement.",
    "Combine measured results with relevant user evidence.",
    "Prioritise improvements without erasing failures."
  ],
  "explanation": [
    "Evaluation explains how well a solution meets its intended need. Description says what was made; evaluation compares evidence with each criterion and reaches a qualified judgement. Use a record with requirement, method, observed result, pass or fail and implication. If a property was not tested, mark it untested rather than treating silence as a pass. Positive appearance comments do not cancel a failure in a required task.",
    "An overall judgement must consider priority and the strength of evidence. A mandatory fit or access requirement can block suitability even if several preferences are met. Explain who was included, the conditions and the limits of the test. Propose improvements tied to observed problems and name what a retest would measure. Avoid universal claims from a small trial or environmental benefit claims without evidence about materials, use and disposal."
  ],
  "keyIdeas": [
    "Judge each requirement with evidence.",
    "Untested is different from passed.",
    "Overall suitability depends on mandatory needs and evidence quality."
  ],
  "definitions": [
    {
      "term": "Evaluation",
      "meaning": "A reasoned judgement against stated aims and evidence."
    },
    {
      "term": "Limitation",
      "meaning": "A boundary on what the evidence can establish."
    },
    {
      "term": "Prioritisation",
      "meaning": "Ordering changes according to their importance and evidence."
    }
  ],
  "method": [
    "List each requirement and corresponding result.",
    "Separate pass, fail and untested states.",
    "Explain how results affect the intended users.",
    "Prioritise a revision and define its retest."
  ],
  "workedExample": {
    "prompt": "Hypothetical tray criteria: width at most 180 mm, cost at most £6, all five trial users locate an item within 15 seconds. Results: 175 mm, £5.50, four of five succeed. Evaluate.",
    "steps": [
      "Width passes: 175 ≤ 180 mm.",
      "Cost passes: £5.50 ≤ £6.",
      "Finding fails: four of five is below all five.",
      "Inspect the failed search path, revise labelling if supported, and repeat the finding test."
    ],
    "conclusion": "The tray meets size and cost limits but has not met the finding criterion; it is not fully validated."
  },
  "misconceptions": [
    {
      "mistake": "Listing attractive features as an evaluation.",
      "correction": "Compare each feature’s performance with a requirement."
    },
    {
      "mistake": "Treating an untested criterion as passed.",
      "correction": "Label missing evidence and plan a suitable test."
    }
  ],
  "practice": [
    {
      "id": "des-evaluation-1",
      "difficulty": "Foundation",
      "command": "Distinguish",
      "marks": 3,
      "prompt": "Which is evaluation: “The card is blue” or “Four of five pupils read the date correctly from one metre, below the required five of five”? Explain.",
      "hints": [
        "Look for evidence compared with a target."
      ],
      "solution": [
        "The second statement evaluates a result against a requirement.",
        "The first describes colour without showing whether it meets a need."
      ],
      "successCriteria": [
        "Correct choice",
        "Evidence and criterion explained"
      ]
    },
    {
      "id": "des-evaluation-2",
      "difficulty": "Standard",
      "command": "Evaluate",
      "marks": 5,
      "prompt": "Hypothetical organiser limits: width at most 230 mm and cost at most £10. Results: 228 mm and £10.80. Durability was not tested. State each status.",
      "hints": [
        "Do not assume missing evidence is favourable."
      ],
      "solution": [
        "Width passes: 228 ≤ 230 mm.",
        "Cost fails by £0.80; durability is untested.",
        "The evidence does not establish that all requirements are met."
      ],
      "successCriteria": [
        "Three statuses correct",
        "Qualified overall judgement"
      ]
    },
    {
      "id": "des-evaluation-3",
      "difficulty": "Advanced",
      "command": "Recommend",
      "marks": 6,
      "prompt": "A hypothetical paper sign meets its size limit. Two of five visitors read the destination incorrectly because two place names share an abbreviation; all five like its colour. Recommend a revision and a test without claiming its success in advance.",
      "hints": [
        "Address the observed interpretation problem."
      ],
      "solution": [
        "Replace ambiguous abbreviations with clear full names, checking the size and legibility requirements.",
        "Retest destination identification with neutral tasks and the same predeclared threshold, recording errors and conditions.",
        "Colour preference may be retained, but it does not resolve the reading failure; the revised wording remains unvalidated until tested."
      ],
      "successCriteria": [
        "Revision linked to evidence",
        "Specific retest",
        "No premature success claim"
      ]
    }
  ],
  "checklist": [
    "I compare results with requirements.",
    "I identify untested properties.",
    "I justify improvement priorities.",
    "I qualify the overall judgement."
  ],
  "sourceIds": [
    "design-usability",
    "design-acceptance-criteria"
  ]
}),
design({
  "id": "myp5-design-iteration",
  "topic": "Iteration",
  "prerequisiteIds": [
    "myp5-design-evaluation"
  ],
  "summary": "Use a recorded failure to justify a change and a comparable retest.",
  "objectives": [
    "Link changes to evidence.",
    "Preserve original results and versions.",
    "Check that improvements do not break other requirements."
  ],
  "explanation": [
    "Iteration is a purposeful revision in response to evidence, not simply making a product look newer. A useful record identifies the version, observed problem, likely explanation, proposed change and expected effect. Distinguish the explanation from the observation: repeated wrong turns at a menu may suggest an unclear label, but do not prove it is the only cause. Choose a change that can test the explanation and retain the original evidence.",
    "A revision can introduce trade-offs. Larger text may improve reading but no longer fit a fixed sign area; stronger card may cost more or be harder to fold. Retest the affected requirement and any other property that the change could disturb. Compare versions under sufficiently similar conditions and report remaining differences. Improvement on one small trial supports a next decision, not a claim that the design works for every user."
  ],
  "keyIdeas": [
    "Every revision needs an evidence trail.",
    "Preserve failures and version identifiers.",
    "Check for regressions in other requirements."
  ],
  "definitions": [
    {
      "term": "Iteration",
      "meaning": "A revision made and assessed in response to evidence."
    },
    {
      "term": "Regression",
      "meaning": "A previously satisfactory property becoming worse after a change."
    },
    {
      "term": "Version record",
      "meaning": "An identifier and description that distinguish one design state from another."
    }
  ],
  "method": [
    "Record the observed failure and prototype version.",
    "Propose a cause and targeted change.",
    "Name intended benefit and possible trade-offs.",
    "Retest, compare and record the next decision."
  ],
  "workedExample": {
    "prompt": "Hypothetical sign v1: two of five users confuse “Rm” and “Rt”. A revision spells out “Room” and “Return”. Plan a decision log.",
    "steps": [
      "Evidence: two confusions in five attempts on v1; preserve the original notes.",
      "Hypothesis: abbreviations contribute to confusion; change only these labels in v2.",
      "Expected result: fewer destination errors; possible cost: more space needed.",
      "Repeat the identification test and check that the revised sign still fits its allowed area."
    ],
    "conclusion": "The change is justified as a testable hypothesis; v2 is not successful until evidence supports it."
  },
  "misconceptions": [
    {
      "mistake": "Replacing the old record with the improved result.",
      "correction": "Keep both versions so the evidence trail remains visible."
    },
    {
      "mistake": "Checking only the improved feature.",
      "correction": "Also test properties that the revision might disturb."
    }
  ],
  "practice": [
    {
      "id": "des-iteration-1",
      "difficulty": "Foundation",
      "command": "Connect",
      "marks": 3,
      "prompt": "A hypothetical organiser’s labels peel after a day. Give an evidence-linked revision and a matching retest.",
      "hints": [
        "Change the attachment, then test that property."
      ],
      "solution": [
        "Try a different teacher-approved label attachment or integrate labels into the card.",
        "Repeat the same one-day use check under recorded conditions and inspect peeling; retain the original failed record."
      ],
      "successCriteria": [
        "Relevant change",
        "Comparable retest"
      ]
    },
    {
      "id": "des-iteration-2",
      "difficulty": "Standard",
      "command": "Evaluate",
      "marks": 5,
      "prompt": "Hypothetical v1 sign width is 170 mm and v2 is 190 mm after enlarging text. Mandatory maximum width is 180 mm. Reading improves. Evaluate the change.",
      "hints": [
        "Check both intended benefit and regression."
      ],
      "solution": [
        "The reading result may support enlarged text, but v2 exceeds the width limit by 10 mm.",
        "Revise layout or wording while preserving necessary readability, then retest both width and reading."
      ],
      "successCriteria": [
        "Regression quantified",
        "Both requirements retested"
      ]
    },
    {
      "id": "des-iteration-3",
      "difficulty": "Advanced",
      "command": "Plan",
      "marks": 6,
      "prompt": "A hypothetical menu revision changes labels, order and colours at once. Errors fall in a second trial with different pupils. What can be concluded, and how would you investigate the label change specifically?",
      "hints": [
        "Separate a package comparison from attribution."
      ],
      "solution": [
        "The second version had fewer observed errors in that trial; the result does not isolate labels because design features and pupils changed.",
        "Compare versions differing only in labels with comparable tasks and varied order or comparable first-time groups.",
        "Record participant/context differences and keep both datasets; avoid claiming a single proven cause."
      ],
      "successCriteria": [
        "Bounded conclusion",
        "Controlled label comparison",
        "Evidence preserved"
      ]
    }
  ],
  "checklist": [
    "My revision cites evidence.",
    "I preserve both versions.",
    "I identify trade-offs.",
    "I retest affected requirements."
  ],
  "sourceIds": [
    "design-double-diamond",
    "design-usability"
  ]
}),
design({
  "id": "myp5-design-product-documentation",
  "topic": "Product documentation",
  "prerequisiteIds": [
    "myp5-design-iteration"
  ],
  "summary": "Create records that let another person understand, reproduce and evaluate a design.",
  "objectives": [
    "Distinguish process evidence from user instructions.",
    "Specify dimensions, versions and dependencies.",
    "Document limitations and attribution."
  ],
  "explanation": [
    "Product documentation serves different readers. A maker needs labelled dimensions, materials, assembly order and checks; a user needs clear instructions for the intended task; a reviewer needs the brief, decisions, source attribution and test evidence. A polished photograph alone rarely supplies these details. Choose drawings, tables, screenshots or concise prose according to what the reader must do, and keep units and version names consistent across them.",
    "Traceability connects the final object to requirements and evidence. Record what changed, why it changed and which results belong to each version. Describe known limitations and untested conditions rather than claiming complete validation. A classroom handover should include original work and attribution for outside references, without unnecessary participant details. Test documentation itself: can another person follow it without guessing an omitted measurement or hidden step? Their questions reveal useful revisions."
  ],
  "keyIdeas": [
    "Different readers need different information.",
    "Dimensions and versions must agree.",
    "Document unresolved limits as well as successes."
  ],
  "definitions": [
    {
      "term": "Technical drawing",
      "meaning": "A labelled representation communicating dimensions, structure and construction details."
    },
    {
      "term": "Handover",
      "meaning": "Information needed for another person to use, maintain or continue the work."
    },
    {
      "term": "Attribution",
      "meaning": "Acknowledgement identifying the source of information or material used."
    }
  ],
  "method": [
    "Identify the reader and intended task.",
    "Provide dimensions, materials, steps and version.",
    "Link requirements to decisions and test records.",
    "Ask a reader to identify ambiguities and revise."
  ],
  "workedExample": {
    "prompt": "A hypothetical card organiser handover contains only a photo and “fold as shown”. Identify what to add.",
    "steps": [
      "Add a labelled drawing with millimetre dimensions and fold locations.",
      "List card type, quantities, joining method and assembly order.",
      "State the version and link width and item-finding tests to that version.",
      "Include user instructions, limits and source credits where relevant."
    ],
    "conclusion": "A useful handover supports making, using and checking the object without relying on the designer’s memory."
  },
  "misconceptions": [
    {
      "mistake": "Calling a photograph complete manufacturing evidence.",
      "correction": "Add dimensions, materials and sequence where the photo cannot supply them."
    },
    {
      "mistake": "Mixing test results from different versions.",
      "correction": "Label each result with the exact version tested."
    }
  ],
  "practice": [
    {
      "id": "des-product-documentation-1",
      "difficulty": "Foundation",
      "command": "Identify",
      "marks": 3,
      "prompt": "A hypothetical diagram labels one side “18” and another “120 mm”. Explain the ambiguity and correct the first label if it means 18 centimetres.",
      "hints": [
        "Use one declared unit convention."
      ],
      "solution": [
        "The unit for 18 is missing. If it means 18 cm, label it 180 mm.",
        "Declare dimensions in millimetres and use that convention consistently."
      ],
      "successCriteria": [
        "Unit ambiguity identified",
        "180 mm correct"
      ]
    },
    {
      "id": "des-product-documentation-2",
      "difficulty": "Standard",
      "command": "Organise",
      "marks": 5,
      "prompt": "For a hypothetical library sign, assign these records to a user guide, maker guide or evaluation record: installation dimensions; how to interpret arrows; five observed route attempts. Explain.",
      "hints": [
        "Match content to the reader’s task."
      ],
      "solution": [
        "Installation dimensions belong in the maker or installation guide.",
        "Arrow interpretation belongs in the user guide.",
        "Observed route attempts belong in the evaluation record with version, conditions and criteria."
      ],
      "successCriteria": [
        "Three appropriate assignments",
        "Reader purpose explained"
      ]
    },
    {
      "id": "des-product-documentation-3",
      "difficulty": "Advanced",
      "command": "Audit",
      "marks": 6,
      "prompt": "A hypothetical report shows a v2 photograph, a v1 width measurement and “all requirements passed”, but no v2 tests. Identify the unsupported claim and propose a transparent correction.",
      "hints": [
        "The photograph does not transfer old evidence to a new version."
      ],
      "solution": [
        "The all-requirements claim is unsupported for v2. Retain and label the v1 measurement and v2 photograph separately.",
        "List v2 requirements as untested where no evidence exists, explain changes, and perform the affected checks before updating conclusions.",
        "Do not relabel v1 results as v2 or invent missing measurements."
      ],
      "successCriteria": [
        "Version mismatch identified",
        "Transparent correction",
        "Retest specified"
      ]
    }
  ],
  "checklist": [
    "I identify the reader.",
    "I use consistent units and versions.",
    "I link claims to evidence.",
    "I state limits and credits."
  ],
  "sourceIds": [
    "design-acceptance-criteria",
    "design-research-planning"
  ]
}),
design({
  "id": "myp5-design-criterion-a",
  "topic": "Criterion A",
  "prerequisiteIds": [
    "myp5-design-problem-identification",
    "myp5-design-research"
  ],
  "summary": "Practise inquiry by turning evidence into a justified design brief.",
  "objectives": [
    "Explain a user need with evidence.",
    "Prioritise research questions.",
    "Synthesise research into a brief."
  ],
  "explanation": [
    "This lesson uses the existing mapped heading Criterion A to practise inquiry and analysis. It is an editorial learning activity, not a reproduction of official assessment descriptors or a mark-band guide; use the current rubric supplied by your teacher for assessment. Begin with a defined user and task. Explain the difficulty using available evidence and distinguish facts, possible causes and missing information.",
    "An inquiry record is more than a collection of searches. Prioritise questions that could change the design direction: what users need to accomplish, which constraints are fixed and what comparable solutions reveal. Explain why each method or source fits its question. Synthesise findings into a concise brief that gives a design direction without predetermining every feature. Keep contrary findings and research limitations visible so later decisions can be traced and reconsidered."
  ],
  "keyIdeas": [
    "A need requires a user, task and evidence.",
    "Research priorities should affect decisions.",
    "A brief synthesises findings rather than copying notes."
  ],
  "definitions": [
    {
      "term": "Inquiry question",
      "meaning": "A focused question that research can help answer."
    },
    {
      "term": "Research priority",
      "meaning": "An uncertainty important enough to investigate before a decision."
    },
    {
      "term": "Synthesis",
      "meaning": "Combining findings into an explained conclusion or direction."
    }
  ],
  "method": [
    "Describe the need and its supporting evidence.",
    "Prioritise two decision-relevant unknowns.",
    "Justify methods and analyse findings.",
    "Write a brief with constraints and evidence limits."
  ],
  "workedExample": {
    "prompt": "Hypothetical finding: four of six pupils misfile loose worksheets; two keep them successfully in labelled pockets. Develop an inquiry direction.",
    "steps": [
      "The task is storing and retrieving worksheets, not necessarily buying a new folder.",
      "Investigate when misfiling occurs and why the labelled pockets work for two pupils.",
      "Observe a retrieval task and ask neutral questions about routines.",
      "Brief: explore a feasible classroom method for finding the correct worksheet, with storage limits established through research."
    ],
    "conclusion": "The finding supports a focused inquiry; it does not prove one storage design suits all pupils."
  },
  "misconceptions": [
    {
      "mistake": "Claiming official marks from this practice.",
      "correction": "The marks here are editorial suggestions; follow your teacher’s rubric."
    },
    {
      "mistake": "Listing sources without explaining implications.",
      "correction": "Show what each finding changes about the brief or next question."
    }
  ],
  "practice": [
    {
      "id": "des-criterion-a-1",
      "difficulty": "Foundation",
      "command": "Identify",
      "marks": 3,
      "prompt": "Hypothetical note: three visitors ask where the art room is. Identify user, task and one unknown.",
      "hints": [
        "Do not assume the cause of asking."
      ],
      "solution": [
        "Users: the observed visitors. Task: locating the art room.",
        "Unknown: whether signs, layout, wording or another factor made the route unclear."
      ],
      "successCriteria": [
        "User and task",
        "Relevant unknown"
      ]
    },
    {
      "id": "des-criterion-a-2",
      "difficulty": "Standard",
      "command": "Prioritise",
      "marks": 5,
      "prompt": "For a hypothetical shared-materials organiser, compare researching shelf dimensions with researching fashionable colours before choosing its size. Which comes first and why?",
      "hints": [
        "Identify the decision being made."
      ],
      "solution": [
        "Shelf dimensions come first because they impose a physical constraint on size.",
        "Colour research may matter later, but it cannot establish whether a concept fits."
      ],
      "successCriteria": [
        "Priority linked to decision",
        "Alternative appropriately bounded"
      ]
    },
    {
      "id": "des-criterion-a-3",
      "difficulty": "Advanced",
      "command": "Synthesise",
      "marks": 6,
      "prompt": "Hypothetical evidence: five pupils need access to shared cards; the shelf is 240 mm wide; two struggle with colour-only labels. Write a brief and identify missing evidence.",
      "hints": [
        "Combine constraints without selecting every feature."
      ],
      "solution": [
        "Develop a way for pupils to find and return shared cards within the 240 mm shelf width, using identification that does not rely only on colour.",
        "Investigate card dimensions, number of cards and retrieval tasks before setting capacity and timing requirements.",
        "The small group does not establish every pupil’s needs; seek relevant varied-user evidence."
      ],
      "successCriteria": [
        "Findings synthesised",
        "Missing evidence named",
        "Sample limit retained"
      ]
    }
  ],
  "checklist": [
    "I justify the need.",
    "I prioritise research.",
    "I explain implications.",
    "I distinguish practice from official assessment."
  ],
  "sourceIds": [
    "design-user-needs",
    "design-research-planning"
  ]
}),
design({
  "id": "myp5-design-criterion-b",
  "topic": "Criterion B",
  "prerequisiteIds": [
    "myp5-design-specifications",
    "myp5-design-ideation"
  ],
  "summary": "Practise developing ideas through specifications, comparison and a justified proposal.",
  "objectives": [
    "Connect requirements to research.",
    "Communicate and compare distinct ideas.",
    "Prepare a proposal another person can interpret."
  ],
  "explanation": [
    "Under the existing mapped heading Criterion B, this editorial lesson practises developing ideas rather than supplying official rubric descriptors. Move from research findings to justified requirements, then explore alternatives. A clear drawing or interface sketch should communicate the relevant dimensions, arrangement and user action. Add annotations explaining why choices may meet a need and what still requires testing; visual polish cannot supply missing design reasoning.",
    "Selection should use the same criteria for each option. Mandatory constraints come first, followed by justified priorities such as clarity or ease of making. Explain the basis of comparisons and distinguish estimates from measurements. Develop the chosen idea far enough to guide construction or a purposeful prototype, with materials, dimensions or interaction steps as appropriate. Keep rejected options and their reasons so a reviewer can follow the decision and you can return to them if testing fails."
  ],
  "keyIdeas": [
    "Requirements need a research rationale.",
    "Compare options consistently.",
    "A proposal communicates enough detail for the next stage."
  ],
  "definitions": [
    {
      "term": "Annotation",
      "meaning": "A note explaining a feature, dimension or design reason."
    },
    {
      "term": "Justification",
      "meaning": "An explanation supported by relevant evidence and constraints."
    },
    {
      "term": "Proposal",
      "meaning": "A developed description of the intended solution and its rationale."
    }
  ],
  "method": [
    "Translate findings into testable requirements.",
    "Develop distinct annotated options.",
    "Compare them using shared criteria.",
    "Justify and detail a proposal, naming uncertainties."
  ],
  "workedExample": {
    "prompt": "Hypothetical brief: a card holder must fit a 180 mm space and allow reading without lifting cards. A is 170 mm wide with an open front; B is 190 mm wide with an opaque closed front covering the card text. Compare.",
    "steps": [
      "A meets the width condition; B exceeds it by 10 mm.",
      "A’s open front may support reading, but test actual card visibility.",
      "B’s opaque front covers the card text, conflicting with reading without lifting the cards; it also fails the width limit.",
      "Develop A’s dimensions and card support, then prototype reading and stability."
    ],
    "conclusion": "A is the better supported starting point, conditional on untested visibility and stability."
  },
  "misconceptions": [
    {
      "mistake": "Using different comparison criteria for favoured options.",
      "correction": "Apply shared criteria to make the comparison meaningful."
    },
    {
      "mistake": "Assuming a sketch proves performance.",
      "correction": "Sketches communicate intentions; tests provide performance evidence."
    }
  ],
  "practice": [
    {
      "id": "des-criterion-b-1",
      "difficulty": "Foundation",
      "command": "Annotate",
      "marks": 3,
      "prompt": "A hypothetical sketch shows a sloped card holder but no notes. Write two annotations that would help someone evaluate the idea.",
      "hints": [
        "Describe a dimension and a reason."
      ],
      "solution": [
        "State the intended external width, for example 170 mm to fit a specified 180 mm space.",
        "Explain that the slope is intended to expose the card text, with viewing position and stability still to test."
      ],
      "successCriteria": [
        "Useful dimension and rationale",
        "Untested intention labelled"
      ]
    },
    {
      "id": "des-criterion-b-2",
      "difficulty": "Standard",
      "command": "Compare",
      "marks": 5,
      "prompt": "Two hypothetical concepts must cost at most £8. A is estimated at £7 and B at £9. Both are said to be easy to use without test evidence. Recommend the next step.",
      "hints": [
        "Separate cost estimates from usability claims."
      ],
      "solution": [
        "A is the feasible starting estimate; B exceeds the ceiling unless revised. Verify quantities and prices for the cost estimates.",
        "Prototype the relevant task for A and record usability evidence rather than accepting “easy” as a result."
      ],
      "successCriteria": [
        "Constraint applied",
        "Estimates and claims checked"
      ]
    },
    {
      "id": "des-criterion-b-3",
      "difficulty": "Advanced",
      "command": "Develop",
      "marks": 6,
      "prompt": "A hypothetical team selects a paper divider system but provides only a coloured sketch. Specify four additions needed before someone else can make and assess the prototype.",
      "hints": [
        "Think dimensions, materials, assembly and checks."
      ],
      "solution": [
        "Add labelled dimensions including slot widths and total footprint.",
        "State card type and quantities, plus fold/join locations and assembly sequence.",
        "Link features to requirements and provide planned fit and retrieval tests with thresholds.",
        "Identify unresolved assumptions rather than presenting them as validated."
      ],
      "successCriteria": [
        "Construction detail",
        "Traceable tests",
        "Uncertainty visible"
      ]
    }
  ],
  "checklist": [
    "I justify requirements.",
    "I compare distinct options fairly.",
    "I detail the selected idea.",
    "I label estimates and uncertainties."
  ],
  "sourceIds": [
    "design-double-diamond",
    "design-acceptance-criteria"
  ]
}),
design({
  "id": "myp5-design-criterion-c",
  "topic": "Criterion C",
  "prerequisiteIds": [
    "myp5-design-prototyping"
  ],
  "summary": "Practise creating a solution with a feasible plan and a record of justified changes.",
  "objectives": [
    "Order making steps and dependencies.",
    "Check quality during creation.",
    "Document changes without rewriting the plan retrospectively."
  ],
  "explanation": [
    "The mapped Criterion C heading is used here for editorial practice in creating a solution; it does not certify official assessment coverage. A usable making plan states the steps, materials, tools, time estimates and checks that let another person understand the process. Identify dependencies: dimensions must be established before cutting, and a joint may need to set before loading. For a classroom paper prototype, follow the teacher’s approved tool and material procedures.",
    "Record what actually happens alongside the plan. A changed measurement or material needs a reason, its effect on the specification and any new check. Keep photographs or notes that demonstrate relevant construction decisions, not only an attractive final image. A finished object is evidence that something was made, but not that it meets every requirement. Use in-process checks to catch errors early and reserve appropriate final tests for the finished prototype."
  ],
  "keyIdeas": [
    "A plan includes dependencies and checks.",
    "Actual making may differ from estimates.",
    "Document changes and their consequences."
  ],
  "definitions": [
    {
      "term": "Dependency",
      "meaning": "A step or condition that must be completed before another step."
    },
    {
      "term": "Quality check",
      "meaning": "An inspection or measurement against a stated requirement."
    },
    {
      "term": "Process record",
      "meaning": "Evidence of what was made, checked or changed and why."
    }
  ],
  "method": [
    "List materials, dimensions, tools and constraints.",
    "Sequence steps with realistic estimates and dependencies.",
    "Check critical properties while making.",
    "Record actual changes and prepare final tests."
  ],
  "workedExample": {
    "prompt": "Plan a hypothetical card divider prototype: measure 5 minutes, mark 8, cut 10, assemble 12, check 5. Cutting follows marking. Calculate time and identify a checkpoint.",
    "steps": [
      "Total estimated task time = 5 + 8 + 10 + 12 + 5 = 40 minutes.",
      "Measure before marking, mark before cutting, and cut before assembly.",
      "Check marked dimensions against the plan before cutting to avoid repeating an error.",
      "Allow any separately required drying or waiting time; it is not included in these supplied task times."
    ],
    "conclusion": "The 40-minute estimate covers the listed work only; dependencies and checks make it usable."
  },
  "misconceptions": [
    {
      "mistake": "Rewriting the plan as though every change was intended.",
      "correction": "Keep the original plan and annotate actual changes."
    },
    {
      "mistake": "Treating completion as proof of suitability.",
      "correction": "Compare the finished prototype with its requirements through tests."
    }
  ],
  "practice": [
    {
      "id": "des-criterion-c-1",
      "difficulty": "Foundation",
      "command": "Sequence",
      "marks": 3,
      "prompt": "For a hypothetical paper stand, order these steps and explain one dependency: assemble, mark dimensions, measure available space, cut marked pieces.",
      "hints": [
        "Later steps rely on earlier dimensions."
      ],
      "solution": [
        "Measure available space, mark dimensions, cut marked pieces, then assemble.",
        "Cutting depends on correct markings; marking depends on the available-space measurement."
      ],
      "successCriteria": [
        "Correct order",
        "Dependency explained"
      ]
    },
    {
      "id": "des-criterion-c-2",
      "difficulty": "Standard",
      "command": "Calculate",
      "marks": 5,
      "prompt": "Hypothetical plan: marking 6 minutes, cutting 9, assembly 15 and checking 5, plus a separate 10-minute wait before checking. If steps are sequential, find total elapsed time.",
      "hints": [
        "Include the waiting interval once."
      ],
      "solution": [
        "Active tasks total 6 + 9 + 15 + 5 = 35 minutes.",
        "Add the 10-minute wait: total elapsed time is 45 minutes."
      ],
      "successCriteria": [
        "35 active minutes",
        "45 elapsed minutes"
      ]
    },
    {
      "id": "des-criterion-c-3",
      "difficulty": "Advanced",
      "command": "Document",
      "marks": 6,
      "prompt": "During a hypothetical build, specified card is unavailable and thicker card is used. What should the process record explain and check?",
      "hints": [
        "Thickness may affect several requirements."
      ],
      "solution": [
        "Record the original specification, actual material, reason for substitution and version/date.",
        "Check whether slots and folds still fit, whether external size or cost changed, and whether the intended handling task remains possible.",
        "Retain failed checks and explain any further revision; do not claim that thicker automatically means suitable."
      ],
      "successCriteria": [
        "Transparent change record",
        "Affected properties checked",
        "No unsupported success claim"
      ]
    }
  ],
  "checklist": [
    "I sequence dependencies.",
    "I estimate active and waiting time.",
    "I use in-process checks.",
    "I record actual changes honestly."
  ],
  "sourceIds": [
    "design-double-diamond"
  ]
}),
design({
  "id": "myp5-design-criterion-d",
  "topic": "Criterion D",
  "prerequisiteIds": [
    "myp5-design-testing",
    "myp5-design-evaluation"
  ],
  "summary": "Practise evaluating a solution with test evidence and justified improvements.",
  "objectives": [
    "Design tests that answer the specification.",
    "Explain success and failure with evidence.",
    "Discuss improvements and bounded user impact."
  ],
  "explanation": [
    "This editorial activity uses the mapped Criterion D heading to practise evaluation. It is not an official mark-band guide. Select tests that can establish whether each requirement was met and explain why the methods are appropriate. A reliable record includes version, conditions, results and assistance, as well as the predeclared pass rule. Missing tests must remain visible as gaps rather than becoming assumed successes.",
    "Use the evidence to explain both strengths and limitations. An evaluation should connect performance to the user’s original task, suggest specific improvements and identify how to test them. Discuss impact with appropriate caution: a short classroom trial may show fewer observed errors, but not long-term learning gains or benefits for all users. Keep raw results and distinguish observed impact, plausible future benefit and untested claims. Follow your teacher’s current rubric for assessed work."
  ],
  "keyIdeas": [
    "Test choices need justification.",
    "Judgements should cite results and thresholds.",
    "Impact claims must remain within the evidence."
  ],
  "definitions": [
    {
      "term": "Test validity",
      "meaning": "How well a test addresses the property it is meant to examine."
    },
    {
      "term": "Evidence-based judgement",
      "meaning": "A conclusion justified by relevant observations and criteria."
    },
    {
      "term": "Impact",
      "meaning": "An effect on users or context, with the evidence and time frame specified."
    }
  ],
  "method": [
    "Map every requirement to a suitable test.",
    "Record complete versioned results.",
    "Judge each criterion and the solution overall.",
    "Propose improvements, retests and bounded impact claims."
  ],
  "workedExample": {
    "prompt": "Hypothetical target: at least four of five pupils find a card within 20 seconds without help. Before revision, three succeed; afterwards, four different pupils out of five succeed. Evaluate.",
    "steps": [
      "The first trial fails its target; the revised trial meets it.",
      "The observed count increases from three to four successes, but the different participants weaken attribution to the revision.",
      "Report both samples and inspect errors instead of claiming proof of universal improvement.",
      "Plan further comparable task trials and check any other mandatory requirements."
    ],
    "conclusion": "The revised trial meets this criterion; it does not establish long-term impact or isolate the revision’s effect."
  },
  "misconceptions": [
    {
      "mistake": "Claiming better learning from a faster retrieval task.",
      "correction": "Retrieval time does not directly measure learning."
    },
    {
      "mistake": "Reporting only the best trial.",
      "correction": "Keep all trials and explain differences in conditions."
    }
  ],
  "practice": [
    {
      "id": "des-criterion-d-1",
      "difficulty": "Foundation",
      "command": "Justify",
      "marks": 3,
      "prompt": "A hypothetical sign must be readable from two metres. Why is asking whether users like its colour insufficient, and what test would address the requirement?",
      "hints": [
        "Measure reading at the specified distance."
      ],
      "solution": [
        "Colour preference does not show whether the text is read correctly from two metres.",
        "Ask relevant trial users to identify specified text at that distance under recorded lighting, without hints, using a predefined success rule."
      ],
      "successCriteria": [
        "Method mismatch explained",
        "Suitable test proposed"
      ]
    },
    {
      "id": "des-criterion-d-2",
      "difficulty": "Standard",
      "command": "Judge",
      "marks": 5,
      "prompt": "Hypothetical target: at least four of five independent completions. Results are success, success, assisted completion, success, failure. State the result and a next inquiry.",
      "hints": [
        "Assisted completion is not independent."
      ],
      "solution": [
        "Three of five complete independently, so the criterion fails.",
        "Inspect the assisted and failed attempts to identify where difficulty occurred before choosing a revision."
      ],
      "successCriteria": [
        "Correct count and failure",
        "Evidence-linked inquiry"
      ]
    },
    {
      "id": "des-criterion-d-3",
      "difficulty": "Advanced",
      "command": "Evaluate",
      "marks": 6,
      "prompt": "A hypothetical organiser trial reduces average finding time from 40 to 25 seconds for the same six pupils on a repeated task. A report says “This raises grades for all students.” Evaluate and replace the claim.",
      "hints": [
        "Separate observed task performance from an unmeasured outcome."
      ],
      "solution": [
        "The average falls by 15 seconds in this repeated-task trial; practice effects may contribute.",
        "Grades were not measured and six pupils do not represent all students.",
        "Replacement: the mean finding time for these six pupils fell from 40 to 25 seconds on the second trial under the recorded conditions; further comparable testing is needed to assess the design’s contribution and any wider effects."
      ],
      "successCriteria": [
        "15-second change",
        "Unmeasured grades and sample limit",
        "Qualified replacement"
      ]
    }
  ],
  "checklist": [
    "I justify each test.",
    "I report failures and gaps.",
    "I propose specific retests.",
    "I keep impact claims within evidence."
  ],
  "sourceIds": [
    "design-usability",
    "design-acceptance-criteria"
  ]
})
];
