import type { MypLesson } from './myp5Lessons';

const humanities = (value: Omit<MypLesson, 'subjectSlug' | 'contentStatus' | 'curriculumVersion'>): MypLesson => ({
  ...value, subjectSlug: 'integrated-humanities', contentStatus: 'original-editorial-draft',
  curriculumVersion: 'vertexed-myp5-2026.1',
});

export const MYP5_INTEGRATED_HUMANITIES_COMPLETION: MypLesson[] = [
  humanities({
  "id": "myp5-integrated-humanities-spatial-patterns",
  "topic": "Spatial patterns",
  "prerequisiteIds": [
    "myp5-integrated-humanities-source-analysis"
  ],
  "summary": "Describe spatial differences using suitable rates and scale, then test explanations without inferring individual outcomes.",
  "objectives": [
    "Distinguish location, pattern and explanation.",
    "Calculate comparable rates for differently sized populations.",
    "Evaluate how boundaries and aggregation affect a claim."
  ],
  "explanation": [
    "A spatial pattern describes how a measured feature varies across places. Identify the area, date, units and classification before describing concentrations, contrasts or exceptions. Raw counts can reflect differences in population size rather than differences in prevalence. A rate compares a count with a relevant population or exposure denominator. Use the same definitions and period for each place, and state what the denominator represents.",
    "Historical and economic evidence can help explain a pattern, but a map alone rarely isolates a cause. Past investment, land use and current affordability may each be relevant; treat them as hypotheses until supported. Changing district boundaries can change averages without anyone moving. District-level patterns also need not describe every resident. The hypothetical cases below require a description first, then a qualified explanation and a clear proposal for evidence that could challenge it."
  ],
  "keyIdeas": [
    "Rates require a relevant denominator.",
    "Scale affects visible patterns.",
    "A spatial association is not a complete causal explanation."
  ],
  "definitions": [
    {
      "term": "Spatial pattern",
      "meaning": "The distribution of a measured feature across locations."
    },
    {
      "term": "Rate",
      "meaning": "A quantity expressed relative to a relevant denominator over a specified scope or interval."
    },
    {
      "term": "Aggregation",
      "meaning": "Combining observations into groups or areas, which can conceal variation within them."
    }
  ],
  "method": [
    "Read place, period, boundaries and measurement definitions.",
    "Choose a count or rate suited to the question.",
    "Describe the contrast using specific evidence.",
    "Test possible explanations with historical, economic and finer-scale evidence."
  ],
  "workedExample": {
    "prompt": "Hypothetical districts, measured in the same year and with the same definition: A has 200 households without a library card out of 1,000; B has 300 out of 3,000. Compare counts and proportions.",
    "steps": [
      "B has the larger count: 300 compared with 200 households.",
      "A’s proportion = 200/1,000 × 100 = 20%; B’s = 300/3,000 × 100 = 10%.",
      "A has twice B’s proportion, despite the smaller count. A library card is not proof of library use or convenient access."
    ],
    "conclusion": "Use counts for the number affected and proportions for prevalence. Neither measure alone explains the difference."
  },
  "misconceptions": [
    {
      "mistake": "Calling the largest count the highest prevalence.",
      "correction": "Compare the relevant proportions."
    },
    {
      "mistake": "Treating a district average as every resident’s situation.",
      "correction": "Examine variation within districts and avoid individual claims without individual data."
    }
  ],
  "practice": [
    {
      "id": "ih-spatial-patterns-1",
      "difficulty": "Foundation",
      "command": "Calculate",
      "marks": 3,
      "prompt": "Hypothetical districts use the same definition of a long commute: A has 60 of 400 surveyed residents above the threshold; B has 90 of 900. Calculate both sample proportions.",
      "hints": [
        "Use each sample’s own denominator."
      ],
      "solution": [
        "A: 60/400 × 100 = 15%.",
        "B: 90/900 × 100 = 10%.",
        "These describe the samples; population generalisation depends on sampling."
      ],
      "successCriteria": [
        "Both denominators",
        "Correct percentages",
        "Sample scope"
      ]
    },
    {
      "id": "ih-spatial-patterns-2",
      "difficulty": "Standard",
      "command": "Analyse",
      "marks": 5,
      "prompt": "Hypothetical town has an average journey time of 25 minutes. A report concludes that every resident takes 25 minutes to travel. Explain the error and propose a better description.",
      "hints": [
        "An average summarises a distribution."
      ],
      "solution": [
        "Different journey times can produce the same average of 25 minutes.",
        "Report the spread and relevant neighbourhood or traveller groups alongside the mean.",
        "Individual journey times are needed to describe each resident."
      ],
      "successCriteria": [
        "Average/individual distinction",
        "Useful distribution evidence",
        "No invented values"
      ]
    },
    {
      "id": "ih-spatial-patterns-3",
      "difficulty": "Advanced",
      "command": "Evaluate",
      "marks": 6,
      "prompt": "Hypothetical map shows more empty shops in districts with higher rents. Evaluate the claim that rent alone caused every vacancy.",
      "hints": [
        "What else could shape both measures?"
      ],
      "solution": [
        "The map shows a district-level association under its definitions.",
        "Footfall, local incomes, building conditions or changing demand could contribute.",
        "Comparable rent histories, vacancy timing and evidence on alternative causes are needed to assess the rent mechanism; the map alone cannot attribute every vacancy."
      ],
      "successCriteria": [
        "Association separated",
        "Alternative mechanism",
        "Relevant evidence"
      ]
    }
  ],
  "checklist": [
    "I choose a suitable denominator.",
    "I describe before explaining.",
    "I check boundaries and scale.",
    "I qualify aggregate claims."
  ],
  "sourceIds": [
    "geog-urban-population",
    "archives-document-analysis"
  ]
}),
  humanities({
  "id": "myp5-integrated-humanities-economic-choice",
  "topic": "Economic choice",
  "prerequisiteIds": [
    "myp5-integrated-humanities-inquiry"
  ],
  "summary": "Analyse a public choice through feasible alternatives, opportunity cost, spatial access and evidence about affected groups.",
  "objectives": [
    "Identify the next-best feasible alternative.",
    "Calculate a budget trade-off with explicit units.",
    "Evaluate distribution without treating price as social value."
  ],
  "explanation": [
    "Economic choice arises when limited resources have competing uses. Opportunity cost is the value of the next-best feasible alternative forgone, not the sum of all rejected options. A budget describes affordability under stated prices and constraints; it does not tell us which option best serves a community. Identify the decision-maker, the resource and the realistic alternatives before comparing outcomes.",
    "An integrated inquiry also asks where benefits and costs fall and how earlier decisions shape the choices available now. A service can have a low operating cost yet be difficult for some people to reach. A historically neglected area may have different needs from an already well-served area, but that description requires evidence. Separate measured effects, stakeholder priorities and a reasoned value judgement. All cases here are hypothetical and do not recommend an actual public spending decision."
  ],
  "keyIdeas": [
    "Opportunity cost concerns the best rejected alternative.",
    "Affordability differs from desirability.",
    "Location and past provision affect access."
  ],
  "definitions": [
    {
      "term": "Opportunity cost",
      "meaning": "The value of the next-best feasible alternative given up by a decision."
    },
    {
      "term": "Budget constraint",
      "meaning": "The limit on affordable combinations imposed by the available budget and prices."
    },
    {
      "term": "Distributional effect",
      "meaning": "How benefits or costs differ among people, groups or places."
    }
  ],
  "method": [
    "Identify the scarce resource and feasible choices.",
    "State the next-best alternative forgone.",
    "Calculate relevant costs or trade-offs under explicit assumptions.",
    "Compare access, prior provision and effects across groups."
  ],
  "workedExample": {
    "prompt": "Hypothetical council has 24,000 credits for equipment only. Benches cost 600 credits each and noticeboards 1,200 credits each at fixed prices. With the whole budget spent on these two goods, find the bench trade-off for one extra noticeboard.",
    "steps": [
      "One noticeboard costs 1,200/600 = 2 benches.",
      "The budget could buy 40 benches alone or 20 noticeboards alone.",
      "Replacing two benches with one noticeboard keeps spending unchanged at a feasible combination."
    ],
    "conclusion": "One extra noticeboard forgoes two benches in this model. Which option has greater public value needs evidence about use, location and priorities."
  },
  "misconceptions": [
    {
      "mistake": "Calling the purchase price the whole social opportunity cost.",
      "correction": "Consider the best alternative use and its forgone benefits."
    },
    {
      "mistake": "Assuming the cheapest option gives equal access.",
      "correction": "Check location, eligibility and users’ circumstances."
    }
  ],
  "practice": [
    {
      "id": "ih-economic-choice-1",
      "difficulty": "Foundation",
      "command": "Calculate",
      "marks": 3,
      "prompt": "Hypothetical fixed budget is fully spent on two services. One workshop costs 180 credits and one reading session 60 credits. Calculate the session trade-off for one extra workshop.",
      "hints": [
        "Compare costs in alternative units."
      ],
      "solution": [
        "180/60 = 3 reading sessions per workshop.",
        "One extra workshop requires giving up three sessions under these assumptions."
      ],
      "successCriteria": [
        "Correct ratio",
        "Alternative units and assumption"
      ]
    },
    {
      "id": "ih-economic-choice-2",
      "difficulty": "Standard",
      "command": "Analyse",
      "marks": 5,
      "prompt": "Hypothetical council selects a park instead of a clinic. The clinic was its next-best feasible use of the same land. State the opportunity cost and identify one spatial question for evaluation.",
      "hints": [
        "Distinguish alternative benefits from the selected project’s bill."
      ],
      "solution": [
        "The opportunity cost is the value of the clinic’s forgone benefits.",
        "A relevant spatial question is which residents would lose convenient clinic access compared with existing provision.",
        "The case does not quantify those benefits or establish which project is preferable."
      ],
      "successCriteria": [
        "Next-best benefit",
        "Access question",
        "Evidence limit"
      ]
    },
    {
      "id": "ih-economic-choice-3",
      "difficulty": "Advanced",
      "command": "Evaluate",
      "marks": 6,
      "prompt": "Hypothetical proposal closes two local study rooms and opens one larger room at lower total operating cost. Evaluate whether lower cost alone establishes success.",
      "hints": [
        "Consider capacity and who can reach the service."
      ],
      "solution": [
        "Lower operating cost supports a cost-saving claim on that boundary.",
        "Capacity, opening hours, travel time and access for different users may change.",
        "Compare those outcomes and any transition costs with the policy’s stated objectives before judging success."
      ],
      "successCriteria": [
        "Narrow supported claim",
        "Distribution and service measures",
        "Conditional judgement"
      ]
    }
  ],
  "checklist": [
    "I identify the next-best alternative.",
    "I state price and budget assumptions.",
    "I compare spatial access.",
    "I separate facts and value judgements."
  ],
  "sourceIds": [
    "econ-choice"
  ]
}),
  humanities({
  "id": "myp5-integrated-humanities-global-systems",
  "topic": "Global systems",
  "prerequisiteIds": [
    "myp5-integrated-humanities-spatial-patterns",
    "myp5-integrated-humanities-economic-choice"
  ],
  "summary": "Trace connections across places and time while distinguishing a transmission mechanism from a guaranteed outcome.",
  "objectives": [
    "Identify stocks, flows and system boundaries.",
    "Trace a disruption through connected activities.",
    "Evaluate adaptation and unequal effects."
  ],
  "explanation": [
    "A system is a set of connected parts considered within a stated boundary. Global systems link places through material, financial, information and human flows. A supply network can include several production stages and alternative routes. Define which actors and connections an explanation includes, and distinguish an amount held at a date from a flow over time. A diagram is a selective model, not a complete description of the world.",
    "A change in one part can affect others through a stated mechanism, but the size and timing depend on stocks, contracts, alternatives and responses. Historical evidence can explain how a network developed, while geographical evidence locates exposure to disruption and economic evidence identifies incentives to adapt. Do not assume a local disruption must produce an identical global effect. The hypothetical cases here hold some conditions fixed to make a mechanism assessable; actual outcomes require further evidence."
  ],
  "keyIdeas": [
    "Define the system boundary.",
    "Trace each step of a mechanism.",
    "Stocks and alternatives can change timing and impact."
  ],
  "definitions": [
    {
      "term": "System boundary",
      "meaning": "The line defining which components and connections an analysis includes."
    },
    {
      "term": "Flow",
      "meaning": "A transfer of material, money, information or people over a period."
    },
    {
      "term": "Resilience",
      "meaning": "The capacity of a system to cope with disruption while maintaining or restoring relevant functions."
    }
  ],
  "method": [
    "Identify components, locations and included flows.",
    "Trace the proposed change through a sequence of links.",
    "Check stocks, alternatives and possible responses.",
    "Evaluate who is affected and what remains uncertain."
  ],
  "workedExample": {
    "prompt": "Hypothetical workshop has 240 components in stock and uses 30 per day at a constant rate. A delivery is delayed; no components arrive during the delay. How long can the stock support production at that rate?",
    "steps": [
      "Stock is 240 components; use is a flow of 30 components per day.",
      "Coverage = 240/30 = 8 days.",
      "After eight full days the model stock is zero; continued production then requires new supply or changed use."
    ],
    "conclusion": "The stock supports eight days at the stated rate. This does not establish the delay’s length or the wider network’s total loss."
  },
  "misconceptions": [
    {
      "mistake": "Treating a diagram’s omitted connections as nonexistent.",
      "correction": "State that the boundary is selective and check relevant external links."
    },
    {
      "mistake": "Assuming every linked actor suffers the same effect.",
      "correction": "Examine contracts, stocks, substitutes and distribution."
    }
  ],
  "practice": [
    {
      "id": "ih-global-systems-1",
      "difficulty": "Foundation",
      "command": "Calculate",
      "marks": 3,
      "prompt": "Hypothetical producer holds 150 units and uses 25 units per day, with no deliveries or other losses. Calculate stock coverage.",
      "hints": [
        "Divide stock by daily use."
      ],
      "solution": [
        "Coverage = 150/25 = 6 days at the constant rate."
      ],
      "successCriteria": [
        "Correct division",
        "Time unit and rate assumption"
      ]
    },
    {
      "id": "ih-global-systems-2",
      "difficulty": "Standard",
      "command": "Explain",
      "marks": 5,
      "prompt": "Hypothetical supplier cannot send packaging to a food producer for three days. The producer has five days of packaging stock at its unchanged production rate. Explain why an immediate production stop does not follow.",
      "hints": [
        "Distinguish the delayed flow from the available stock."
      ],
      "solution": [
        "Existing packaging stock can support the three-day interval under the stated conditions.",
        "The five-day coverage exceeds the three-day delay.",
        "This does not rule out other costs or constraints, but the packaging delay alone does not force an immediate stop."
      ],
      "successCriteria": [
        "Stock/flow distinction",
        "Coverage comparison",
        "Qualified outcome"
      ]
    },
    {
      "id": "ih-global-systems-3",
      "difficulty": "Advanced",
      "command": "Evaluate",
      "marks": 6,
      "prompt": "Hypothetical network relies on one transport route. A proposal adds a second route at higher operating cost. Evaluate the resilience claim without assuming it must succeed.",
      "hints": [
        "Are the routes exposed to the same disruption?"
      ],
      "solution": [
        "A usable alternative could preserve flows when one route fails.",
        "Shared hazards, inadequate capacity or delays in switching could limit that benefit.",
        "Compare route independence, capacity, switching time and costs against the required service before judging the proposal."
      ],
      "successCriteria": [
        "Plausible mechanism",
        "Specific limitations",
        "Evidence and trade-off"
      ]
    }
  ],
  "checklist": [
    "I state the boundary.",
    "I distinguish stock and flow.",
    "I trace a mechanism.",
    "I test alternatives and unequal effects."
  ],
  "sourceIds": [
    "geog-globalisation"
  ]
}),
  humanities({
  "id": "myp5-integrated-humanities-sustainability",
  "topic": "Sustainability",
  "prerequisiteIds": [
    "myp5-integrated-humanities-economic-choice",
    "myp5-integrated-humanities-global-systems"
  ],
  "summary": "Evaluate a sustainability decision using comparable services, time horizons and evidence about who bears costs.",
  "objectives": [
    "Define an assessment boundary and service.",
    "Calculate a simple resource comparison.",
    "Integrate environmental and social evidence in a qualified judgement."
  ],
  "explanation": [
    "A sustainability inquiry asks whether an activity can meet needs while maintaining conditions needed in the future. Make the question assessable by defining the service, place, timescale and relevant impacts. A comparison should consider equivalent service and include the stages it claims to cover. A lower use-stage resource requirement does not by itself establish a better whole-life result.",
    "Combine the environmental account with evidence about affordability, access and the distribution of costs. Historical decisions may have locked in infrastructure or created unequal access, so a proposal’s starting point matters. Do not collapse unlike outcomes into a single score without explaining weights and assumptions. A judgement can favour an option conditionally while identifying a cost borne by a particular group. The hypothetical exercises below illustrate this reasoning; their simplified resource figures are not real product assessments."
  ],
  "keyIdeas": [
    "Compare equivalent services.",
    "State included stages and time horizon.",
    "A qualified judgement can recognise both gains and burdens."
  ],
  "definitions": [
    {
      "term": "Assessment boundary",
      "meaning": "The processes, impacts, places and time period included in a comparison."
    },
    {
      "term": "Functional unit",
      "meaning": "A defined amount of service used as a common basis for comparing options."
    },
    {
      "term": "Distributional trade-off",
      "meaning": "A choice in which benefits and burdens fall differently across groups or places."
    }
  ],
  "method": [
    "Specify the service and the question being judged.",
    "Set the stages, impacts and time horizon.",
    "Calculate comparable quantities without combining unlike units.",
    "Integrate access and distribution evidence in a conditional conclusion."
  ],
  "workedExample": {
    "prompt": "Hypothetical classroom model compares one drinking-container use. A disposable container requires 1 litre of water to make. A reusable container requires 20 litres to make plus 0.2 litres to wash after each use. Ignore all other water use; both provide equivalent service. After how many uses is reusable water use lower?",
    "steps": [
      "After n uses, disposable water use is n litres; reusable use is 20 + 0.2n litres.",
      "Reusable is lower when 20 + 0.2n < n, so n > 25.",
      "At 25 uses both use 25 litres; at 26 uses reusable uses 25.2 litres and disposable 26 litres."
    ],
    "conclusion": "The reusable option is lower from 26 whole uses under this boundary. This calculation does not establish overall environmental superiority or actual reuse behaviour."
  },
  "misconceptions": [
    {
      "mistake": "Calling equality a strict improvement.",
      "correction": "Check whether the question asks for equal use or lower use."
    },
    {
      "mistake": "Treating one resource measure as a complete sustainability verdict.",
      "correction": "Consider other impacts, lifetime and access on stated boundaries."
    }
  ],
  "practice": [
    {
      "id": "ih-sustainability-1",
      "difficulty": "Foundation",
      "command": "Calculate",
      "marks": 3,
      "prompt": "Hypothetical service provides 500 equivalent uses. Option A consumes 3 litres per use; B consumes 2 litres per use, counting the use stage only. Calculate each total and B’s saving.",
      "hints": [
        "Multiply each intensity by the same service amount."
      ],
      "solution": [
        "A uses 1,500 litres; B uses 1,000 litres.",
        "B saves 500 litres at the use stage for these 500 uses."
      ],
      "successCriteria": [
        "Both totals",
        "Saving with scope"
      ]
    },
    {
      "id": "ih-sustainability-2",
      "difficulty": "Standard",
      "command": "Analyse",
      "marks": 5,
      "prompt": "Hypothetical town replaces free water refill points with paid machines that use less electricity per litre. Identify one environmental claim supported by the description and one access question it leaves unresolved.",
      "hints": [
        "Separate per-litre energy from who can obtain water."
      ],
      "solution": [
        "The machines have lower electricity intensity per litre under the stated comparison.",
        "Whether residents who cannot afford the charge retain adequate access is unresolved.",
        "Total energy also depends on litres delivered, and other life-cycle impacts are not supplied."
      ],
      "successCriteria": [
        "Narrow supported claim",
        "Specific access question",
        "Boundary or total-use limit"
      ]
    },
    {
      "id": "ih-sustainability-3",
      "difficulty": "Advanced",
      "command": "Evaluate",
      "marks": 6,
      "prompt": "Hypothetical plan reduces bus fuel use per passenger-kilometre but removes evening services used by shift workers. Develop a qualified judgement using both facts.",
      "hints": [
        "Which objective improves and which group may lose access?"
      ],
      "solution": [
        "Fuel intensity improves under the stated measure.",
        "Removing evening services reduces the available service for the specified users; the size of their resulting travel burden needs evidence.",
        "Support for the plan should depend on total impacts and an adequate access alternative, rather than intensity alone."
      ],
      "successCriteria": [
        "Environmental measure",
        "Specified affected group",
        "Conditional integrated judgement"
      ]
    }
  ],
  "checklist": [
    "I define equivalent service.",
    "I check strict thresholds.",
    "I state assessment limits.",
    "I include distribution and access."
  ],
  "sourceIds": [
    "geog-sustainable-consumption"
  ]
}),
  humanities({
  "id": "myp5-integrated-humanities-perspectives",
  "topic": "Perspectives",
  "prerequisiteIds": [
    "myp5-integrated-humanities-source-analysis"
  ],
  "summary": "Compare supported viewpoints in context without inventing motives or treating every claim as equally evidenced.",
  "objectives": [
    "Identify what a source explicitly values.",
    "Distinguish viewpoint from factual accuracy.",
    "Compare perspectives while preserving context and uncertainty."
  ],
  "explanation": [
    "A perspective is a way of interpreting an issue shaped by experience, position, values and available information. Identify it through specific evidence in a source, rather than assuming everyone in a group thinks alike. A person can offer useful evidence while having an interest in the outcome. Conversely, an apparently neutral tone does not establish accuracy. Evaluate each factual claim through its method and corroboration.",
    "Historical perspective also requires attention to the conditions and information available at the time, rather than attributing present knowledge to past actors. Understanding a viewpoint does not require endorsing it. When comparing contemporary stakeholders, distinguish disagreements about facts from disagreements about priorities. The short statements below are original fictional teaching texts, not quotations from actual people or archival documents. Their wording supports limited interpretations; do not invent biography, hidden motives or a consensus for an entire group."
  ],
  "keyIdeas": [
    "Ground perspective in specific wording.",
    "Understanding does not imply endorsement.",
    "Different priorities do not make every factual claim equally supported."
  ],
  "definitions": [
    {
      "term": "Perspective",
      "meaning": "A way of interpreting an issue shaped by a person’s position, experience, values and information."
    },
    {
      "term": "Corroboration",
      "meaning": "Testing a claim against other relevant evidence, while checking independence."
    },
    {
      "term": "Presentism",
      "meaning": "Interpreting past people as if they necessarily had present-day knowledge or assumptions."
    }
  ],
  "method": [
    "Identify the source, context and exact claim.",
    "Use specific words to infer stated priorities.",
    "Compare factual claims separately from value priorities.",
    "Corroborate and identify limits before generalising."
  ],
  "workedExample": {
    "prompt": "Hypothetical consultation contains two fictional statements about a proposed market square: trader, “I need delivery access before opening”; resident, “I want space where children can play after school.” Compare their stated priorities.",
    "steps": [
      "The trader’s statement prioritises delivery access before business opens.",
      "The resident’s statement prioritises play space after school.",
      "Different time periods may permit a shared arrangement, but feasibility is not established by the statements."
    ],
    "conclusion": "The priorities differ without necessarily being incompatible. Neither speaker can be assumed to represent every trader or resident."
  },
  "misconceptions": [
    {
      "mistake": "Assigning one speaker’s view to an entire group.",
      "correction": "State the source’s scope and seek broader evidence."
    },
    {
      "mistake": "Inventing motives to explain a disagreement.",
      "correction": "Separate supported interpretation from speculation."
    }
  ],
  "practice": [
    {
      "id": "ih-perspectives-1",
      "difficulty": "Foundation",
      "command": "Infer",
      "marks": 3,
      "prompt": "Hypothetical fictional statement from a commuter: “Keep the early train; my shift starts before the buses run.” Infer one priority and support it with a detail.",
      "hints": [
        "Connect the requested service to the stated timing."
      ],
      "solution": [
        "The speaker prioritises transport that fits an early work shift.",
        "The detail that the shift starts before buses run supports the need for the early train."
      ],
      "successCriteria": [
        "Supported priority",
        "Precise textual detail"
      ]
    },
    {
      "id": "ih-perspectives-2",
      "difficulty": "Standard",
      "command": "Compare",
      "marks": 5,
      "prompt": "Hypothetical fictional statements: planner, “The route should carry the greatest number of riders”; resident, “The route should still reach our isolated street.” Compare priorities without inventing either speaker’s motives.",
      "hints": [
        "Separate total ridership from geographic inclusion."
      ],
      "solution": [
        "The planner prioritises total ridership.",
        "The resident prioritises service reaching an isolated location.",
        "The statements reveal different evaluation criteria; they do not establish hostility, selfishness or the optimal route."
      ],
      "successCriteria": [
        "Both stated priorities",
        "Explicit comparison",
        "No invented motives"
      ]
    },
    {
      "id": "ih-perspectives-3",
      "difficulty": "Advanced",
      "command": "Evaluate",
      "marks": 6,
      "prompt": "Hypothetical fictional 1900 letter says its author expects a new rail line to increase local trade. A student says the author must have known the line would close in 1950. Evaluate the student’s inference; no other evidence is supplied.",
      "hints": [
        "What information was available at the time of writing?"
      ],
      "solution": [
        "The letter supports an expectation of increased trade, not knowledge of a later closure.",
        "Later outcomes cannot be assigned to the author’s knowledge without contemporary evidence.",
        "The claim imports hindsight; investigate information available in 1900 before explaining the expectation."
      ],
      "successCriteria": [
        "Expectation/knowledge distinction",
        "Hindsight problem",
        "Contextual evidence requirement"
      ]
    }
  ],
  "checklist": [
    "I cite specific wording.",
    "I separate facts and priorities.",
    "I preserve historical context.",
    "I avoid invented motives and group claims."
  ],
  "sourceIds": [
    "history-perspectives",
    "archives-document-analysis"
  ]
}),
  humanities({
  "id": "myp5-integrated-humanities-extended-response",
  "topic": "Extended response",
  "prerequisiteIds": [
    "myp5-integrated-humanities-spatial-patterns",
    "myp5-integrated-humanities-economic-choice",
    "myp5-integrated-humanities-global-systems",
    "myp5-integrated-humanities-sustainability",
    "myp5-integrated-humanities-perspectives"
  ],
  "summary": "Build an integrated argument that weighs different measures and groups, preserves source limits and answers the inquiry.",
  "objectives": [
    "Form a thesis supported by the supplied packet.",
    "Connect disciplinary evidence through reasoning.",
    "Qualify a judgement when outcomes differ across groups."
  ],
  "explanation": [
    "An extended response should answer a focused question through a defensible argument. Define the outcome being judged, choose evidence relevant to it and explain why that evidence supports the claim. Integration means showing how different perspectives change the conclusion, not simply placing a geography paragraph beside an economics paragraph. Distinguish an observed change from evidence that a particular policy caused it.",
    "Plan around claims and counterevidence. Preserve the units, dates, populations and source limitations when combining data. A mean improvement can coexist with deterioration for a subgroup, while a cost saving can coexist with weaker access. State how those tensions affect the judgement and what further evidence would resolve uncertainty. The fictional packets below are complete for each task; use their supplied information rather than inventing historical context, stakeholder motives or unreported outcomes. Alternative responses can satisfy the criteria when precisely supported."
  ],
  "keyIdeas": [
    "A thesis must fit the evidence supplied.",
    "Synthesis explains why combined evidence changes the judgement.",
    "Limits should shape the conclusion."
  ],
  "definitions": [
    {
      "term": "Thesis",
      "meaning": "The central, arguable answer that a response develops and supports."
    },
    {
      "term": "Synthesis",
      "meaning": "A reasoned integration of evidence or perspectives that explains their combined implications."
    },
    {
      "term": "Qualification",
      "meaning": "A condition or limit that narrows a claim to what the evidence supports."
    }
  ],
  "method": [
    "Define the question and evaluation criteria.",
    "Group evidence by claims and tensions.",
    "Explain how combined evidence supports or limits each claim.",
    "Conclude with a qualified answer and targeted evidence needs."
  ],
  "workedExample": {
    "prompt": "Hypothetical packet follows the same 100 travellers before and after a route change, using the same method: 80 central residents’ mean trip falls from 20 to 15 minutes; 20 outer residents’ mean rises from 30 to 35 minutes. Judge whether measured travel improved for everyone.",
    "steps": [
      "Initial overall mean = (80 × 20 + 20 × 30)/100 = 22 minutes.",
      "Later mean = (80 × 15 + 20 × 35)/100 = 19 minutes.",
      "The overall mean falls by 3 minutes, while the outer group’s mean rises by 5 minutes. These group means do not identify every individual change."
    ],
    "conclusion": "Measured average travel time improves overall but not for both groups on average, so improvement for everyone is unsupported. Before-and-after data alone do not isolate the route change’s causal effect."
  },
  "misconceptions": [
    {
      "mistake": "Repeating a statistic without explaining its relevance.",
      "correction": "Link it to the inquiry and state its limits."
    },
    {
      "mistake": "Ending with a universal verdict despite mixed evidence.",
      "correction": "Qualify the answer by group, measure and causal uncertainty."
    }
  ],
  "practice": [
    {
      "id": "ih-extended-response-1",
      "difficulty": "Foundation",
      "command": "Develop",
      "marks": 3,
      "prompt": "Hypothetical packet: a library’s weekly visits rise after later opening hours begin, while its electricity bill rises too. Write a thesis about whether the change succeeded, using only these facts.",
      "hints": [
        "Define which outcomes improved and what cannot yet be judged."
      ],
      "solution": [
        "Visits increased, but the higher electricity bill creates a cost trade-off; overall success depends on the library’s access and budget objectives.",
        "The timing alone does not prove that later hours caused the entire visits increase."
      ],
      "successCriteria": [
        "Both facts used",
        "Criteria-based qualification",
        "Causal limit"
      ]
    },
    {
      "id": "ih-extended-response-2",
      "difficulty": "Standard",
      "command": "Synthesize",
      "marks": 5,
      "prompt": "Hypothetical packet uses comparable definitions: average bus fare falls from 4 to 3 credits, but a remote neighbourhood loses its only bus route. Explain how the evidence changes an evaluation focused on access.",
      "hints": [
        "Price matters only where usable service exists."
      ],
      "solution": [
        "Average fare falls by 1 credit, or 25% relative to 4 credits.",
        "The remote neighbourhood loses bus-route access despite that average price reduction.",
        "An access judgement must consider both affordability and service geography; lower average fares do not establish universal improvement."
      ],
      "successCriteria": [
        "Accurate price change",
        "Spatial access loss",
        "Integrated judgement"
      ]
    },
    {
      "id": "ih-extended-response-3",
      "difficulty": "Advanced",
      "command": "Evaluate",
      "marks": 6,
      "prompt": "Hypothetical packet: a council publicity leaflet claims a new square benefits all residents; a convenience sample of ten nearby shopkeepers reports higher sales. Evaluate the support for the universal claim and propose two useful additional sources.",
      "hints": [
        "Who and what are missing from these sources?"
      ],
      "solution": [
        "The leaflet states the council’s claim; the shopkeeper sample concerns reported sales among a small selected group.",
        "Neither establishes benefits for all residents, and the two sources may not be independent if the leaflet uses that same survey.",
        "A transparently sampled resident survey could test access and experience across neighbourhoods; comparable records of use, costs and displacement could test other outcomes."
      ],
      "successCriteria": [
        "Scope and selection limits",
        "Universal claim challenged",
        "Two relevant source types",
        "Independence checked"
      ]
    }
  ],
  "checklist": [
    "I make a supported thesis.",
    "I integrate evidence through reasoning.",
    "I address counterevidence.",
    "I qualify scope and causation."
  ],
  "sourceIds": [
    "archives-document-analysis",
    "history-primary-evidence"
  ]
}),
];
