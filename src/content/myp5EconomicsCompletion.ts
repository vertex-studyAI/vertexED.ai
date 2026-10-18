import type { MypLesson } from './myp5Lessons';

const economics = (value: Omit<MypLesson, 'subjectSlug' | 'contentStatus' | 'curriculumVersion'>): MypLesson => ({
  ...value, subjectSlug: 'economics', contentStatus: 'original-editorial-draft',
  curriculumVersion: 'vertexed-myp5-2026.1',
});

export const MYP5_ECONOMICS_COMPLETION: MypLesson[] = [
  economics({
  "id": "myp5-economics-opportunity-cost",
  "topic": "Opportunity cost",
  "prerequisiteIds": [
    "myp5-economics-scarcity"
  ],
  "summary": "Identify the next-best alternative forgone and calculate trade-offs under an explicit resource constraint.",
  "objectives": [
    "Distinguish opportunity cost from total spending.",
    "Calculate a trade-off in units of another good.",
    "Recognise that the best alternative depends on the decision-maker."
  ],
  "explanation": [
    "Opportunity cost is the value of the next-best feasible alternative given up when a choice uses a scarce resource. It is not the sum of every possible alternative. A monetary payment can help measure a trade-off, but time and other resources also have alternative uses. State the actual choice and the best rejected option before evaluating whether the choice was worthwhile. A cost already incurred and unrecoverable is a sunk cost; it does not change the alternatives available now.",
    "A simple budget model makes the trade-off explicit. With a fixed budget and constant prices, buying more of one good leaves less money for another. Divide the price of the chosen good by the price of the alternative to express its cost in alternative units. This calculation describes affordability, not preferences or social value. Every number below is hypothetical; the examples do not report an actual school budget or prescribe a spending decision."
  ],
  "keyIdeas": [
    "Use the next-best feasible alternative.",
    "Trade-offs need units and constraints.",
    "Affordability does not establish desirability."
  ],
  "definitions": [
    {
      "term": "Opportunity cost",
      "meaning": "The value of the next-best feasible alternative forgone."
    },
    {
      "term": "Budget constraint",
      "meaning": "The combinations affordable with a specified budget and prices."
    },
    {
      "term": "Sunk cost",
      "meaning": "An already incurred cost that cannot be recovered by the current decision."
    }
  ],
  "method": [
    "Identify the limited resource and feasible options.",
    "State the next-best rejected option.",
    "Calculate the trade-off using consistent units.",
    "Separate the constraint from a judgement of value."
  ],
  "workedExample": {
    "prompt": "Hypothetical case: a club has 36 credits. Posters cost 6 credits each and leaflets 2 credits each, at constant prices. Calculate the leaflet opportunity cost of one extra poster when the whole budget is spent.",
    "steps": [
      "One poster uses 6 credits that could buy 6/2 = 3 leaflets.",
      "The budget could fund 6 posters alone or 18 leaflets alone.",
      "At a feasible mixed combination, one extra poster requires three fewer leaflets if the full budget stays fixed."
    ],
    "conclusion": "The opportunity cost is 3 leaflets per poster in this two-good budget model. The calculation does not decide which publicity option is better."
  },
  "misconceptions": [
    {
      "mistake": "Adding every rejected option together.",
      "correction": "Identify the best feasible alternative instead."
    },
    {
      "mistake": "Keeping an option because unrecoverable money was already spent.",
      "correction": "Compare the remaining costs and benefits of the current alternatives."
    }
  ],
  "practice": [
    {
      "id": "econ-opportunity-cost-1",
      "difficulty": "Foundation",
      "command": "Calculate",
      "marks": 3,
      "prompt": "Hypothetical case: a notebook costs 8 credits and a pen 2 credits. With a fully spent fixed budget and constant prices, calculate the pen opportunity cost of one extra notebook.",
      "hints": [
        "Use the ratio of prices."
      ],
      "solution": [
        "8/2 = 4 pens per notebook.",
        "Buying the extra notebook requires giving up four pens in this two-good model."
      ],
      "successCriteria": [
        "Correct ratio",
        "Alternative-unit answer"
      ]
    },
    {
      "id": "econ-opportunity-cost-2",
      "difficulty": "Standard",
      "command": "Calculate",
      "marks": 5,
      "prompt": "Hypothetical production frontier: moving from 6 kits and 10 signs to 4 kits and 16 signs uses the same resources efficiently. Find the average kit opportunity cost of each additional sign over this move.",
      "hints": [
        "Compare changes, not totals."
      ],
      "solution": [
        "The move gains 16 - 10 = 6 signs and gives up 6 - 4 = 2 kits.",
        "Average opportunity cost = 2/6 = 1/3 kit per additional sign over this interval."
      ],
      "successCriteria": [
        "Changes identified",
        "Correct ratio and units",
        "Interval scope"
      ]
    },
    {
      "id": "econ-opportunity-cost-3",
      "difficulty": "Advanced",
      "command": "Evaluate",
      "marks": 6,
      "prompt": "Hypothetical case: a non-refundable workshop ticket is already paid for. A learner can attend or use the same time to prepare for an assessment. Explain how opportunity cost should guide the current choice.",
      "hints": [
        "The ticket payment cannot be recovered by either choice."
      ],
      "solution": [
        "The ticket price is sunk for the current decision.",
        "Compare the remaining benefit of attendance with the best alternative use of the time and any new costs.",
        "If assessment preparation is the next-best feasible option, its forgone value is the time opportunity cost of attending."
      ],
      "successCriteria": [
        "Sunk cost recognised",
        "Current alternatives compared",
        "Next-best option specified"
      ]
    }
  ],
  "checklist": [
    "I identify the next-best option.",
    "I state the constraint.",
    "I use alternative units.",
    "I exclude unrecoverable costs from current trade-offs."
  ],
  "sourceIds": [
    "econ-choice"
  ]
}),
  economics({
  "id": "myp5-economics-economic-systems",
  "topic": "Economic systems",
  "prerequisiteIds": [
    "myp5-economics-scarcity"
  ],
  "summary": "Compare how allocation decisions use prices, public decisions and other institutions without treating real economies as pure types.",
  "objectives": [
    "Identify who makes allocation decisions.",
    "Compare incentives and access under different rules.",
    "Evaluate a mixed arrangement using stated objectives."
  ],
  "explanation": [
    "Economic systems organise what is produced, how resources are used and who receives output. Market allocation relies heavily on prices and decentralised decisions. Planned allocation gives public decision-makers a larger direct role in targets and distribution. These are simplifying models, not labels that fully describe every institution in a real country. Households, communities, firms and governments can use different arrangements within the same economy.",
    "Evaluate an arrangement against a clear objective such as access, responsiveness or efficient use of resources. Prices can communicate willingness and ability to pay, which need not match need. Public provision can broaden access but still faces scarcity, information limits and funding choices. A free service has resource costs even when the user pays no fee. Specify the rules and available evidence instead of assuming that ownership alone guarantees efficiency, fairness or a particular outcome."
  ],
  "keyIdeas": [
    "Allocation rules shape incentives and access.",
    "Most arrangements combine institutions.",
    "A zero user price does not mean zero resource cost."
  ],
  "definitions": [
    {
      "term": "Market allocation",
      "meaning": "Allocation influenced by prices and decentralised exchange."
    },
    {
      "term": "Planned allocation",
      "meaning": "Allocation substantially directed through collective or public decisions."
    },
    {
      "term": "Mixed economy",
      "meaning": "An economy combining market mechanisms with public and other forms of allocation."
    }
  ],
  "method": [
    "Identify the resource and allocation rule.",
    "Name who decides and who can access the output.",
    "Compare incentives, information and funding constraints.",
    "Judge against stated objectives with appropriate evidence."
  ],
  "workedExample": {
    "prompt": "Hypothetical case: a publicly funded library offers free entry while a private café inside sells drinks at posted prices. Explain why one allocation label is insufficient.",
    "steps": [
      "Library access is funded collectively and is not conditional on paying an entry price.",
      "Café drinks are allocated through purchases at prices.",
      "Both activities still use scarce staff time and space, and their performance needs separate evidence."
    ],
    "conclusion": "The arrangement combines public access provision with market exchange. Neither ownership nor a free entrance establishes that all users’ needs are met."
  },
  "misconceptions": [
    {
      "mistake": "Equating a market price with social need.",
      "correction": "Distinguish purchasing power from need and external effects."
    },
    {
      "mistake": "Assuming free provision uses no scarce resources.",
      "correction": "Identify staffing, materials, facilities and funding trade-offs."
    }
  ],
  "practice": [
    {
      "id": "econ-economic-systems-1",
      "difficulty": "Foundation",
      "command": "Identify",
      "marks": 3,
      "prompt": "Hypothetical case: households buy bread from competing shops, while a council allocates emergency shelter places using need criteria. Identify the two allocation rules.",
      "hints": [
        "Compare purchase with administrative criteria."
      ],
      "solution": [
        "Bread is allocated through market purchases.",
        "Shelter places are allocated through a public decision rule based on assessed need."
      ],
      "successCriteria": [
        "Market rule",
        "Public rule"
      ]
    },
    {
      "id": "econ-economic-systems-2",
      "difficulty": "Standard",
      "command": "Explain",
      "marks": 5,
      "prompt": "Hypothetical case: a free community pool becomes crowded. Explain why scarcity persists without an entry fee.",
      "hints": [
        "Consider capacity and time."
      ],
      "solution": [
        "Pool space and staff capacity are limited even when users pay no fee.",
        "Excess demand may require booking, queues or another allocation rule.",
        "A zero price to the user does not eliminate the resources needed to operate the service."
      ],
      "successCriteria": [
        "Limited resources",
        "Alternative allocation",
        "Price/cost distinction"
      ]
    },
    {
      "id": "econ-economic-systems-3",
      "difficulty": "Advanced",
      "command": "Evaluate",
      "marks": 6,
      "prompt": "Hypothetical case: a town debates private or public operation of a bus route. Propose evidence for comparing access and efficiency without assuming one owner type must win.",
      "hints": [
        "Use the same objectives for both options."
      ],
      "solution": [
        "Compare coverage, fares and accessibility for different users to assess access.",
        "Compare reliable service output with operating and capital resources to assess efficiency.",
        "Consider contract rules, accountability and funding; ownership alone does not determine the observed outcomes."
      ],
      "successCriteria": [
        "Access evidence",
        "Efficiency evidence",
        "Conditional judgement"
      ]
    }
  ],
  "checklist": [
    "I identify the allocation mechanism.",
    "I separate need and purchasing power.",
    "I account for resource costs.",
    "I compare using consistent objectives."
  ],
  "sourceIds": [
    "econ-systems"
  ]
}),
  economics({
  "id": "myp5-economics-supply",
  "topic": "Supply",
  "prerequisiteIds": [
    "myp5-economics-scarcity"
  ],
  "summary": "Use a supply schedule to distinguish price-driven movements from shifts caused by production conditions.",
  "objectives": [
    "Calculate quantity supplied in a stated model.",
    "Distinguish a movement along supply from a shift.",
    "Explain the role of production costs and time horizon."
  ],
  "explanation": [
    "Supply describes the quantities sellers are willing and able to offer at different prices over a stated period. In a basic competitive model, a higher output price can make additional production worthwhile, holding other conditions constant. A change in that good’s price moves along an existing supply curve. A change in input costs, technology or the number of sellers can instead alter quantities offered at each price and shift the curve.",
    "Always identify the product, units and period. A schedule of units per week cannot be compared directly with a monthly schedule. A model equation is valid only over its stated range; a negative quantity outside that range is not a meaningful prediction. Supply response also depends on adjustment time and capacity. Explain the mechanism before choosing a direction, and avoid treating more observed sales as proof of a supply shift when demand may also have changed."
  ],
  "keyIdeas": [
    "Own-price changes create movements along a given curve.",
    "Production conditions can shift supply.",
    "Quantity needs units, period and model range."
  ],
  "definitions": [
    {
      "term": "Quantity supplied",
      "meaning": "The amount offered at a particular price during a specified period."
    },
    {
      "term": "Supply shift",
      "meaning": "A change in the quantities offered at given prices."
    },
    {
      "term": "Ceteris paribus",
      "meaning": "Holding other relevant conditions constant in a model comparison."
    }
  ],
  "method": [
    "Read price and quantity units and the valid range.",
    "Identify whether own price or another condition changed.",
    "Calculate or describe the resulting quantity relation.",
    "State assumptions and avoid inferring a cause from quantity alone."
  ],
  "workedExample": {
    "prompt": "Hypothetical weekly supply model: Qs = 4P - 8, where P is credits per item and Qs items per week, valid for P from 2 to 8. Compare supply at P = 5 and P = 6 with other conditions unchanged.",
    "steps": [
      "At P = 5, Qs = 4 × 5 - 8 = 12 items per week.",
      "At P = 6, Qs = 4 × 6 - 8 = 16 items per week.",
      "The rise of 4 items per week is a movement along the same supply relation caused by own price."
    ],
    "conclusion": "Quantity supplied increases from 12 to 16 items per week. The equation itself has not shifted."
  },
  "misconceptions": [
    {
      "mistake": "Calling every quantity increase an increase in supply.",
      "correction": "Distinguish a movement along the relation from a change in the relation."
    },
    {
      "mistake": "Extrapolating a linear equation to negative quantities.",
      "correction": "Respect the stated range and physical meaning."
    }
  ],
  "practice": [
    {
      "id": "econ-supply-1",
      "difficulty": "Foundation",
      "command": "Calculate",
      "marks": 3,
      "prompt": "Hypothetical model: Qs = 3P - 6 items per week, valid for prices from 2 to 10 credits. Find quantity supplied at P = 7.",
      "hints": [
        "Substitute within the valid range."
      ],
      "solution": [
        "Qs = 3 × 7 - 6 = 15 items per week."
      ],
      "successCriteria": [
        "Correct substitution",
        "Answer and unit"
      ]
    },
    {
      "id": "econ-supply-2",
      "difficulty": "Standard",
      "command": "Explain",
      "marks": 5,
      "prompt": "Hypothetical case: a bakery’s flour becomes cheaper while its bread price is unchanged. Explain the likely supply effect in a basic competitive model.",
      "hints": [
        "Compare production costs at the same output price."
      ],
      "solution": [
        "Lower flour costs can make supplying additional bread worthwhile at the same bread price.",
        "Supply shifts to the right, holding other relevant conditions constant.",
        "This is not a movement caused by a change in bread’s own price."
      ],
      "successCriteria": [
        "Cost mechanism",
        "Shift direction",
        "Movement/shift distinction"
      ]
    },
    {
      "id": "econ-supply-3",
      "difficulty": "Advanced",
      "command": "Evaluate",
      "marks": 6,
      "prompt": "Hypothetical case: weekly sales rise from 40 to 55 units. No price or cost information is supplied. Evaluate “supply must have increased”.",
      "hints": [
        "Observed sales reflect both sides of a market."
      ],
      "solution": [
        "Higher sales alone do not identify the changed relation.",
        "Demand could have increased, supply could have increased, or both could have changed.",
        "Obtain price, cost and demand-condition evidence before identifying the mechanism."
      ],
      "successCriteria": [
        "Non-unique explanation",
        "Alternative mechanisms",
        "Relevant evidence"
      ]
    }
  ],
  "checklist": [
    "I state units and period.",
    "I distinguish movement and shift.",
    "I explain the cost mechanism.",
    "I respect the model range."
  ],
  "sourceIds": [
    "econ-markets",
    "econ-shifts"
  ]
}),
  economics({
  "id": "myp5-economics-demand",
  "topic": "Demand",
  "prerequisiteIds": [
    "myp5-economics-scarcity",
    "myp5-economics-supply"
  ],
  "summary": "Use demand and supply together to identify equilibrium and distinguish demand shifts from price-driven movements.",
  "objectives": [
    "Calculate quantity demanded at a stated price.",
    "Solve a simple market equilibrium.",
    "Distinguish desire, effective demand and a demand shift."
  ],
  "explanation": [
    "Demand relates quantities buyers are willing and able to buy to a good’s price over a specified period. Desire alone is not effective demand because ability to pay also matters. In the basic model, a change in own price moves along the demand curve when other conditions are held fixed. Income, preferences, related-good prices or the number of buyers can shift the relationship. For a normal good, higher income increases demand; that direction is not universal for every good.",
    "Equilibrium in the simple competitive market occurs where quantity demanded equals quantity supplied. It is a model of compatible buying and selling plans, not a guarantee of fairness or social efficiency. At another price, compare the two quantities to identify excess demand or excess supply. Keep the same good, time period and units throughout. A price and quantity observation alone may not reveal which underlying curve shifted."
  ],
  "keyIdeas": [
    "Demand includes willingness and ability to pay.",
    "A demand shift changes quantities at given prices.",
    "Equilibrium matches planned quantities."
  ],
  "definitions": [
    {
      "term": "Quantity demanded",
      "meaning": "The amount buyers are willing and able to buy at a specified price and time period."
    },
    {
      "term": "Normal good",
      "meaning": "A good for which demand rises as income rises, holding other conditions fixed."
    },
    {
      "term": "Equilibrium",
      "meaning": "A model outcome where quantity demanded equals quantity supplied."
    }
  ],
  "method": [
    "Identify the good, price and quantity units.",
    "Distinguish own-price movements from changed demand conditions.",
    "Set demand equal to supply when finding equilibrium.",
    "Interpret the result and state the model’s limits."
  ],
  "workedExample": {
    "prompt": "Hypothetical market: Qd = 80 - 5P and Qs = 10 + 5P, in items per week, with P in credits per item. Both relations apply from P = 0 to 10. Find equilibrium.",
    "steps": [
      "Set 80 - 5P = 10 + 5P.",
      "Then 70 = 10P, so P = 7 credits per item.",
      "At P = 7, both quantities equal 45 items per week."
    ],
    "conclusion": "The model equilibrium is P = 7 and Q = 45 per week. Matching plans does not establish a fair distribution or include unpriced effects."
  },
  "misconceptions": [
    {
      "mistake": "Treating desire without purchasing capacity as effective demand.",
      "correction": "State both willingness and ability to buy."
    },
    {
      "mistake": "Calling a lower price an outward demand shift.",
      "correction": "A lower own price moves along the curve when other conditions are fixed."
    }
  ],
  "practice": [
    {
      "id": "econ-demand-1",
      "difficulty": "Foundation",
      "command": "Calculate",
      "marks": 3,
      "prompt": "Hypothetical demand: Qd = 60 - 4P items per week for P from 0 to 12 credits. Find Qd at P = 8.",
      "hints": [
        "Substitute the price."
      ],
      "solution": [
        "Qd = 60 - 4 × 8 = 28 items per week."
      ],
      "successCriteria": [
        "Correct substitution",
        "Answer and unit"
      ]
    },
    {
      "id": "econ-demand-2",
      "difficulty": "Standard",
      "command": "Calculate",
      "marks": 5,
      "prompt": "Hypothetical market: Qd = 100 - 10P and Qs = 20 + 10P, valid for P from 0 to 10 credits, quantities per day. Find equilibrium price and quantity.",
      "hints": [
        "Set the planned quantities equal."
      ],
      "solution": [
        "100 - 10P = 20 + 10P, so 80 = 20P and P = 4 credits.",
        "Q = 100 - 40 = 60 items per day; supply also gives 20 + 40 = 60."
      ],
      "successCriteria": [
        "Equilibrium condition",
        "Correct price",
        "Quantity checked on both sides"
      ]
    },
    {
      "id": "econ-demand-3",
      "difficulty": "Advanced",
      "command": "Explain",
      "marks": 6,
      "prompt": "Hypothetical case: incomes rise and a product is specified to be a normal good. Explain the demand effect and why the final quantity change cannot be found without supply information.",
      "hints": [
        "Separate the demand shift from the new intersection."
      ],
      "solution": [
        "Demand shifts right because buyers demand more at given prices.",
        "The new equilibrium depends on the supply relationship and other unchanged conditions.",
        "The statement alone provides no numerical size for the quantity or price change."
      ],
      "successCriteria": [
        "Normal-good assumption",
        "Shift mechanism",
        "Missing information identified"
      ]
    }
  ],
  "checklist": [
    "I include ability to pay.",
    "I identify the changing condition.",
    "I check both sides at equilibrium.",
    "I separate equilibrium and fairness."
  ],
  "sourceIds": [
    "econ-markets",
    "econ-shifts"
  ]
}),
  economics({
  "id": "myp5-economics-elasticity",
  "topic": "Elasticity",
  "prerequisiteIds": [
    "myp5-economics-demand",
    "myp5-economics-supply"
  ],
  "summary": "Calculate percentage responsiveness using a stated convention and connect it to revenue without confusing revenue and profit.",
  "objectives": [
    "Calculate midpoint price elasticity of demand.",
    "Interpret elastic, inelastic and unit-elastic values.",
    "Explain revenue changes under a stated demand relation."
  ],
  "explanation": [
    "Elasticity compares percentage changes, so it has no physical unit. For price elasticity of demand, divide percentage change in quantity demanded by percentage change in price, holding other demand conditions fixed. Here use the midpoint method: divide each change by the average of its initial and final values. The signed demand elasticity is usually negative in the basic model; compare its absolute magnitude with one to describe responsiveness. Supply elasticity uses quantity supplied instead.",
    "A magnitude above one is elastic, below one inelastic and equal to one unit elastic. Do not confuse elasticity with a curve’s numerical slope, which depends on units. Total revenue equals price multiplied by quantity sold; profit also subtracts costs. Elastic demand over an interval can make revenue fall when price rises, but a pair of observed points affected by other changes does not identify a causal elasticity. State the interval and convention, and keep precision until the final answer."
  ],
  "keyIdeas": [
    "Percentage responsiveness is unitless.",
    "The midpoint convention must be explicit.",
    "Revenue and profit are different."
  ],
  "definitions": [
    {
      "term": "Midpoint percentage change",
      "meaning": "The change divided by the average of the starting and ending values, multiplied by 100."
    },
    {
      "term": "Price elasticity of demand",
      "meaning": "Percentage change in quantity demanded divided by percentage change in own price with other demand conditions fixed."
    },
    {
      "term": "Total revenue",
      "meaning": "Price multiplied by quantity sold over the specified period."
    }
  ],
  "method": [
    "Calculate the price and quantity averages.",
    "Divide each change by its average.",
    "Take the ratio and classify its absolute magnitude.",
    "Check revenue and state assumptions about other conditions."
  ],
  "workedExample": {
    "prompt": "Hypothetical movement along one demand curve: price rises from 4 to 6 credits and weekly quantity falls from 60 to 40. Use midpoint elasticity and compare revenue.",
    "steps": [
      "Quantity change = -20/50 = -0.4, or -40%; price change = 2/5 = 0.4, or 40%.",
      "Signed elasticity = -40/40 = -1; its magnitude is 1, so demand is unit elastic over this interval.",
      "Revenue is 4 × 60 = 240 credits before and 6 × 40 = 240 credits after."
    ],
    "conclusion": "Revenue is unchanged in this interval. Costs are not supplied, so the example does not establish a profit change."
  },
  "misconceptions": [
    {
      "mistake": "Using the initial base for one change and the midpoint for the other.",
      "correction": "Apply the same stated convention consistently."
    },
    {
      "mistake": "Calling a negative elasticity less than one and therefore inelastic.",
      "correction": "Classify demand responsiveness using the absolute magnitude."
    }
  ],
  "practice": [
    {
      "id": "econ-elasticity-1",
      "difficulty": "Foundation",
      "command": "Calculate",
      "marks": 3,
      "prompt": "Hypothetical fixed demand relation: price rises from 10 to 12 credits and quantity falls from 110 to 90 units per week. Use the midpoint method to calculate signed elasticity and classify its magnitude.",
      "hints": [
        "Use average quantity 100 and average price 11."
      ],
      "solution": [
        "Quantity change = -20/100 = -0.2; price change = 2/11.",
        "Elasticity = -0.2 ÷ (2/11) = -1.1; magnitude 1.1 is elastic."
      ],
      "successCriteria": [
        "Consistent midpoint bases",
        "Correct signed value",
        "Magnitude classification"
      ]
    },
    {
      "id": "econ-elasticity-2",
      "difficulty": "Standard",
      "command": "Calculate",
      "marks": 5,
      "prompt": "Hypothetical demand: price rises from 5 to 6 credits and weekly quantity falls from 100 to 80. Calculate revenue before and after, the revenue change, and explain why profit cannot be determined.",
      "hints": [
        "Revenue is price times quantity."
      ],
      "solution": [
        "Before: 5 × 100 = 500 credits; after: 6 × 80 = 480 credits.",
        "Revenue change = -20 credits, a 4% decrease relative to the initial 500.",
        "Profit cannot be found without relevant cost data."
      ],
      "successCriteria": [
        "Both revenues",
        "Correct change",
        "Revenue/profit distinction"
      ]
    },
    {
      "id": "econ-elasticity-3",
      "difficulty": "Advanced",
      "command": "Evaluate",
      "marks": 6,
      "prompt": "Hypothetical case: price and sales both rise after a major advertising campaign. Evaluate using those two observations alone to estimate demand’s own-price elasticity.",
      "hints": [
        "Did demand conditions remain fixed?"
      ],
      "solution": [
        "The campaign may have shifted demand, so the points need not lie on one unchanged demand curve.",
        "The observed ratio mixes price movement with changed demand conditions.",
        "It cannot by itself identify the causal own-price responsiveness; additional evidence or an appropriate design is needed."
      ],
      "successCriteria": [
        "Changing conditions identified",
        "Identification limit",
        "Appropriate qualification"
      ]
    }
  ],
  "checklist": [
    "I state the convention.",
    "I use percentage changes consistently.",
    "I classify the magnitude.",
    "I separate revenue, profit and causal evidence."
  ],
  "sourceIds": [
    "econ-elasticity",
    "econ-revenue"
  ]
}),
  economics({
  "id": "myp5-economics-government-intervention",
  "topic": "Government intervention",
  "prerequisiteIds": [
    "myp5-economics-market-failure",
    "myp5-economics-elasticity"
  ],
  "summary": "Analyse price controls and policy trade-offs using explicit model assumptions and distributional evidence.",
  "objectives": [
    "Identify whether a price control is binding.",
    "Calculate excess demand or supply in a simple model.",
    "Evaluate policy effects without equating a model prediction with a universal outcome."
  ],
  "explanation": [
    "Governments can influence allocation through taxes, subsidies, regulation and provision. Identify the problem and the mechanism a policy targets before judging it. A price ceiling sets a maximum price; a price floor sets a minimum. In a basic competitive model, a ceiling below the uncontrolled equilibrium is binding and creates excess demand at that price. A floor above equilibrium creates excess supply. Controls on the other side may leave the equilibrium unchanged.",
    "Compare planned quantities rather than assuming every intended purchase occurs. A shortage measures excess demand at the controlled price; it is not the number of successful trades. Allocation rules, enforcement and changes in quality can matter. A per-unit tax creates a gap between the price buyers pay and the price sellers receive, but who formally remits it does not alone determine who bears its burden. Evaluate responses using elasticity, available alternatives, administrative costs and effects on different groups."
  ],
  "keyIdeas": [
    "Compare a control with the uncontrolled equilibrium.",
    "Shortage describes incompatible plans at a price.",
    "Policy incidence and distribution require evidence."
  ],
  "definitions": [
    {
      "term": "Binding ceiling",
      "meaning": "A maximum price below the uncontrolled equilibrium in the stated competitive model."
    },
    {
      "term": "Shortage",
      "meaning": "Quantity demanded minus quantity supplied at a given price when demand exceeds supply."
    },
    {
      "term": "Tax incidence",
      "meaning": "How a tax’s economic burden is distributed among affected parties."
    }
  ],
  "method": [
    "State the objective and market assumptions.",
    "Find the uncontrolled comparison outcome.",
    "Calculate quantities at the policy price or explain its mechanism.",
    "Evaluate allocation, distribution and implementation limits."
  ],
  "workedExample": {
    "prompt": "Hypothetical competitive market: Qd = 100 - 10P and Qs = 20 + 10P, units per day, valid from P = 0 to 10 credits. A ceiling sets P no higher than 3. Find the model shortage at the ceiling.",
    "steps": [
      "Uncontrolled equilibrium is P = 4, Q = 60, so a ceiling of 3 is binding.",
      "At P = 3, Qd = 70 and Qs = 50.",
      "Shortage = 70 - 50 = 20 units per day; without extra supply, at most 50 units could be traded under these plans."
    ],
    "conclusion": "The lower permitted price leaves 20 units of excess demand at that price. Which buyers obtain the available units depends on allocation, not demand alone."
  },
  "misconceptions": [
    {
      "mistake": "Assuming every maximum price changes the market.",
      "correction": "Compare it with the uncontrolled equilibrium."
    },
    {
      "mistake": "Assuming the party paying the tax to government bears all of it.",
      "correction": "Examine how buyer and seller prices change."
    }
  ],
  "practice": [
    {
      "id": "econ-government-intervention-1",
      "difficulty": "Foundation",
      "command": "Calculate",
      "marks": 3,
      "prompt": "Hypothetical market at a binding price ceiling: buyers demand 90 units per week and sellers offer 65. Calculate the shortage.",
      "hints": [
        "Subtract quantity supplied from quantity demanded."
      ],
      "solution": [
        "Shortage = 90 - 65 = 25 units per week."
      ],
      "successCriteria": [
        "Correct difference",
        "Correct period and units"
      ]
    },
    {
      "id": "econ-government-intervention-2",
      "difficulty": "Standard",
      "command": "Analyse",
      "marks": 5,
      "prompt": "Hypothetical market equilibrium price is 8 credits. A price ceiling is 10 credits. With all other conditions unchanged and no additional rules, explain whether it is binding.",
      "hints": [
        "Can the old equilibrium price still occur legally?"
      ],
      "solution": [
        "The equilibrium price of 8 is below the maximum of 10.",
        "The ceiling is non-binding in this model, so the old equilibrium remains permitted.",
        "A shortage cannot be inferred merely from the existence of this ceiling."
      ],
      "successCriteria": [
        "Price comparison",
        "Non-binding conclusion",
        "No unsupported shortage"
      ]
    },
    {
      "id": "econ-government-intervention-3",
      "difficulty": "Advanced",
      "command": "Evaluate",
      "marks": 6,
      "prompt": "Hypothetical proposal: subsidise bus fares to reduce car congestion. Identify a possible mechanism, a limitation and evidence for evaluation.",
      "hints": [
        "Will riders switch from cars or from other modes?"
      ],
      "solution": [
        "A lower fare may induce some car users to switch to buses if routes and capacity are suitable.",
        "Some extra bus journeys may replace walking or be newly generated, and the subsidy requires funding.",
        "Examine mode switching, congestion, service capacity and distribution of benefits before judging effectiveness."
      ],
      "successCriteria": [
        "Plausible mechanism",
        "Specific trade-off or limit",
        "Relevant evidence"
      ]
    }
  ],
  "checklist": [
    "I find the comparison outcome.",
    "I check whether the rule binds.",
    "I distinguish plans and trades.",
    "I evaluate distribution and implementation."
  ],
  "sourceIds": [
    "econ-controls"
  ]
}),
  economics({
  "id": "myp5-economics-labour",
  "topic": "Labour",
  "prerequisiteIds": [
    "myp5-economics-demand",
    "myp5-economics-supply"
  ],
  "summary": "Interpret labour-market measures and distinguish nominal pay, purchasing power and model-dependent employment effects.",
  "objectives": [
    "Identify labour demand and supply correctly.",
    "Calculate unemployment and real-wage changes.",
    "Evaluate wage-policy claims with stated assumptions."
  ],
  "explanation": [
    "In a labour market, workers supply labour and employers demand it. Demand for workers depends partly on demand for the output they help produce, as well as productivity, technology and costs. A wage is the price of labour over a stated unit of time. The basic competitive model is useful for tracing incentives, but actual employment outcomes can also depend on employer market power, bargaining, institutions and adjustment time.",
    "The unemployment rate compares unemployed people with the labour force, not the entire population. For these exercises, the labour force consists of employed people plus those without work who are available and actively seeking it. Real wages measure purchasing power: divide a nominal-wage index by a price index, using a common base. A higher money wage need not buy more if prices rise faster. State definitions and periods before comparing rates or drawing conclusions about living standards."
  ],
  "keyIdeas": [
    "Workers supply and employers demand labour.",
    "Use the labour force as the unemployment denominator.",
    "Real pay adjusts nominal pay for prices."
  ],
  "definitions": [
    {
      "term": "Labour force",
      "meaning": "Employed people plus unemployed people under the stated availability and job-search definition."
    },
    {
      "term": "Unemployment rate",
      "meaning": "Unemployed people divided by the labour force, multiplied by 100."
    },
    {
      "term": "Real wage",
      "meaning": "A wage expressed in purchasing-power terms after adjusting for a relevant price measure."
    }
  ],
  "method": [
    "Read the population, labour definition and period.",
    "Identify the appropriate numerator and denominator.",
    "Calculate rates or real-wage ratios consistently.",
    "Qualify employment or welfare claims using the model and omitted factors."
  ],
  "workedExample": {
    "prompt": "Hypothetical economy: 900 employed people, 100 unemployed people meeting the stated definition, and 200 people outside the labour force. Calculate the unemployment rate.",
    "steps": [
      "Labour force = 900 + 100 = 1,000 people.",
      "Unemployment rate = 100/1,000 × 100 = 10%.",
      "The 200 outside the labour force are not included in this rate’s denominator."
    ],
    "conclusion": "The rate is 10% of the labour force. It is not 100 divided by the entire population listed."
  },
  "misconceptions": [
    {
      "mistake": "Treating every person without a job as unemployed in the rate.",
      "correction": "Use the specified availability and active-search criteria."
    },
    {
      "mistake": "Assuming higher nominal pay always raises purchasing power.",
      "correction": "Adjust for price changes over the same period."
    }
  ],
  "practice": [
    {
      "id": "econ-labour-1",
      "difficulty": "Foundation",
      "command": "Calculate",
      "marks": 3,
      "prompt": "Hypothetical data: 760 employed and 40 unemployed people in the labour force. Calculate the unemployment rate.",
      "hints": [
        "First find the labour-force total."
      ],
      "solution": [
        "Labour force = 760 + 40 = 800.",
        "Unemployment rate = 40/800 × 100 = 5%."
      ],
      "successCriteria": [
        "Correct denominator",
        "Correct percentage"
      ]
    },
    {
      "id": "econ-labour-2",
      "difficulty": "Standard",
      "command": "Calculate",
      "marks": 5,
      "prompt": "Hypothetical same-base indices rise from 100 to 104 for nominal wages and from 100 to 108 for prices. Find the final real-wage index and its percentage change from the base, to two decimal places.",
      "hints": [
        "Real index = nominal index divided by price index times 100."
      ],
      "solution": [
        "Real-wage index = 104/108 × 100 ≈ 96.30.",
        "Change from the base index 100 is approximately -3.70%.",
        "Money pay rises, but measured purchasing power falls."
      ],
      "successCriteria": [
        "Correct index formula",
        "Rounded index",
        "Correct direction and percentage"
      ]
    },
    {
      "id": "econ-labour-3",
      "difficulty": "Advanced",
      "command": "Evaluate",
      "marks": 6,
      "prompt": "Hypothetical claim: every increase in a minimum wage must reduce employment by the same amount. Evaluate it.",
      "hints": [
        "A model prediction depends on the starting situation and institutions."
      ],
      "solution": [
        "In a basic competitive model, a binding floor can reduce labour demanded, with the size depending on responsiveness.",
        "A non-binding change need not alter the equilibrium; employer power, bargaining and adjustment also affect actual outcomes.",
        "The universal same-amount claim needs evidence and cannot follow from the policy label alone."
      ],
      "successCriteria": [
        "Conditional model mechanism",
        "Relevant qualifications",
        "Universal claim rejected"
      ]
    }
  ],
  "checklist": [
    "I identify both market sides.",
    "I use the right denominator.",
    "I adjust pay for prices.",
    "I qualify policy effects."
  ],
  "sourceIds": [
    "econ-labour",
    "econ-unemployment",
    "econ-real-values"
  ]
}),
  economics({
  "id": "myp5-economics-development",
  "topic": "Development",
  "prerequisiteIds": [
    "myp5-economics-scarcity"
  ],
  "summary": "Compare material output and human outcomes using suitable indicators, averages and distributional limits.",
  "objectives": [
    "Distinguish economic growth from broader development.",
    "Calculate a per-person measure without treating it as a distribution.",
    "Explain the scope and limits of a composite indicator."
  ],
  "explanation": [
    "Economic growth concerns increases in real output; development concerns broader changes in people’s opportunities and living conditions. A per-person output measure divides a total by population, but does not describe how income or services are distributed. Compare health, education, access and environmental conditions alongside economic resources. Use matched dates and definitions, and distinguish a measured indicator from the wider idea it is intended to represent.",
    "The Human Development Index combines dimensions of health, education and income into a summary measure. It can broaden discussion beyond output alone, but an average composite does not fully describe inequality or every aspect of wellbeing. This lesson uses hypothetical arithmetic, not actual country statistics or a reconstruction of the HDI formula. For a real comparison, use the published methodology and data provenance, then examine differences within each place before making claims about all residents."
  ],
  "keyIdeas": [
    "Growth and development are related but distinct.",
    "Per-person averages do not reveal distribution.",
    "Composite indices simplify a wider picture."
  ],
  "definitions": [
    {
      "term": "Economic growth",
      "meaning": "An increase in real output over a specified period."
    },
    {
      "term": "Per capita",
      "meaning": "Per person, calculated by dividing a total by population."
    },
    {
      "term": "Composite indicator",
      "meaning": "A measure combining several indicators under a stated method."
    }
  ],
  "method": [
    "Define the development question and relevant dimensions.",
    "Check dates, units and comparability.",
    "Calculate a suitable rate or average.",
    "Evaluate distribution, omitted dimensions and data quality."
  ],
  "workedExample": {
    "prompt": "Hypothetical region: annual real output is 240 million constant-price credits and population is 60,000. Calculate output per person and state a limitation.",
    "steps": [
      "Divide 240,000,000 by 60,000.",
      "Output per person = 4,000 constant-price credits per year.",
      "This is an average of output, not evidence that each resident earns or receives 4,000 credits."
    ],
    "conclusion": "The measure helps compare the scale of real output per person. It needs distributional and non-income indicators for a broader development judgement."
  },
  "misconceptions": [
    {
      "mistake": "Calling higher total output proof of higher output per person.",
      "correction": "Check population change too."
    },
    {
      "mistake": "Treating a high average as proof every resident benefits.",
      "correction": "Examine variation within the population."
    }
  ],
  "practice": [
    {
      "id": "econ-development-1",
      "difficulty": "Foundation",
      "command": "Calculate",
      "marks": 3,
      "prompt": "Hypothetical region: real output is 150 million constant-price credits per year and population is 50,000. Calculate annual output per person.",
      "hints": [
        "Divide the total by population."
      ],
      "solution": [
        "150,000,000/50,000 = 3,000 constant-price credits per person per year."
      ],
      "successCriteria": [
        "Correct calculation",
        "Per-person and time units"
      ]
    },
    {
      "id": "econ-development-2",
      "difficulty": "Standard",
      "command": "Compare",
      "marks": 5,
      "prompt": "Hypothetical same-currency annual incomes are A: 10, 10, 10, 10 and B: 4, 4, 4, 28 credits. Calculate each mean and explain why the means alone are incomplete.",
      "hints": [
        "Compare totals and the individual values."
      ],
      "solution": [
        "Both totals are 40 credits across four people, so both means are 10 credits.",
        "B’s distribution is much more uneven than A’s.",
        "Equal means therefore do not establish equal living conditions or distribution."
      ],
      "successCriteria": [
        "Both means correct",
        "Distribution compared",
        "Limit explained"
      ]
    },
    {
      "id": "econ-development-3",
      "difficulty": "Advanced",
      "command": "Evaluate",
      "marks": 6,
      "prompt": "Hypothetical claim: a place’s higher HDI score proves it is better on every development dimension for every resident. Evaluate the claim.",
      "hints": [
        "A summary index is not every outcome or each person’s experience."
      ],
      "solution": [
        "HDI combines selected health, education and income dimensions into an average summary.",
        "A higher overall score need not mean every component or every resident’s outcome is higher.",
        "Inspect components, inequality and other relevant conditions before reaching a broader judgement."
      ],
      "successCriteria": [
        "Index scope",
        "Component and distribution limits",
        "Improved evidence"
      ]
    }
  ],
  "checklist": [
    "I distinguish growth and development.",
    "I check population and units.",
    "I examine distribution.",
    "I state indicator limits."
  ],
  "sourceIds": [
    "undp-hdi"
  ]
}),
  economics({
  "id": "myp5-economics-trade",
  "topic": "Trade",
  "prerequisiteIds": [
    "myp5-economics-opportunity-cost"
  ],
  "summary": "Calculate comparative advantage from opportunity costs and distinguish potential gains from their distribution.",
  "objectives": [
    "Distinguish absolute and comparative advantage.",
    "Calculate opportunity costs in a two-good model.",
    "Identify mutually beneficial exchange terms under explicit assumptions."
  ],
  "explanation": [
    "Absolute advantage concerns producing more with the same resources; comparative advantage concerns giving up less of another good. Calculate each producer’s opportunity cost before assigning comparative advantage. In a simple two-good model with constant trade-offs, the producer with the lower opportunity cost of a good can specialise towards it. A producer can have an absolute advantage in both goods while still having a comparative advantage in only one when opportunity costs differ.",
    "Exchange terms between the two opportunity costs can offer both sides gains relative to producing the imported good themselves. State the direction of the ratio carefully, such as cups per cloth, and identify what each side gives and receives. The simple model assumes resources can be reallocated and ignores some costs. Transport, adjustment, environmental effects and distribution within groups can reduce or redistribute gains. Potential aggregate gains do not prove every worker or household benefits."
  ],
  "keyIdeas": [
    "Comparative advantage uses opportunity cost.",
    "Exchange ratios need clear direction and units.",
    "Potential total gains do not guarantee gains for everyone."
  ],
  "definitions": [
    {
      "term": "Absolute advantage",
      "meaning": "Ability to produce more output with the same resources in the specified comparison."
    },
    {
      "term": "Comparative advantage",
      "meaning": "Ability to produce a good at a lower opportunity cost."
    },
    {
      "term": "Terms of trade",
      "meaning": "The exchange ratio between traded goods, expressed with a clear direction."
    }
  ],
  "method": [
    "Read output possibilities for equal resources.",
    "Calculate opportunity costs in both directions.",
    "Assign comparative advantage using the lower cost.",
    "Check an exchange ratio against both costs and state omitted costs."
  ],
  "workedExample": {
    "prompt": "Hypothetical equal-resource producers with linear frontiers: A can make 12 cloth units or 6 cups; B can make 8 cloth units or 8 cups. Assess exchanging one cloth unit for 0.75 cup.",
    "steps": [
      "For A, one cloth costs 6/12 = 0.5 cup; for B, one cloth costs 8/8 = 1 cup.",
      "A has comparative advantage in cloth and B in cups. The rate 0.75 cup per cloth lies between 0.5 and 1.",
      "A receives 0.75 cup for cloth costing 0.5 cup; B obtains cloth for 0.75 cup instead of its own production cost of 1 cup."
    ],
    "conclusion": "Both can gain from this exchange under the stated model, with divisible goods and no trade costs. The example does not establish gains for every person within either producer group."
  },
  "misconceptions": [
    {
      "mistake": "Choosing comparative advantage from output totals alone.",
      "correction": "Compare opportunity costs."
    },
    {
      "mistake": "Reversing a ratio without changing its unit.",
      "correction": "State which good is received per unit given."
    }
  ],
  "practice": [
    {
      "id": "econ-trade-1",
      "difficulty": "Foundation",
      "command": "Calculate",
      "marks": 3,
      "prompt": "Hypothetical linear frontier: a workshop can make 18 bags or 6 stools with the same resources. Find the opportunity cost of one stool in bags.",
      "hints": [
        "Use the output forgone per stool."
      ],
      "solution": [
        "18/6 = 3 bags per stool."
      ],
      "successCriteria": [
        "Correct ratio",
        "Correct alternative units"
      ]
    },
    {
      "id": "econ-trade-2",
      "difficulty": "Standard",
      "command": "Analyse",
      "marks": 5,
      "prompt": "Hypothetical linear frontiers with equal resources: A produces 20 meals or 10 boxes; B produces 12 meals or 12 boxes. Identify comparative advantage for each good.",
      "hints": [
        "Compare meals forgone per box."
      ],
      "solution": [
        "A’s cost of one box is 20/10 = 2 meals; B’s is 12/12 = 1 meal, so B has comparative advantage in boxes.",
        "A’s cost of one meal is 10/20 = 0.5 box; B’s is 12/12 = 1 box, so A has comparative advantage in meals."
      ],
      "successCriteria": [
        "Both opportunity costs",
        "Correct box advantage",
        "Correct meal advantage"
      ]
    },
    {
      "id": "econ-trade-3",
      "difficulty": "Advanced",
      "command": "Evaluate",
      "marks": 6,
      "prompt": "Using hypothetical costs of 0.5 cup per cloth for A and 1 cup per cloth for B, evaluate A exporting cloth to B at 0.4 cup per cloth, with no other costs or benefits.",
      "hints": [
        "Compare the exchange with each producer’s own alternative."
      ],
      "solution": [
        "A receives 0.4 cup for cloth that costs it 0.5 cup to produce in opportunity terms.",
        "That rate does not offer A a gain relative to its own production alternative, although it is attractive to B.",
        "For strict mutual gains in this model, the rate must lie above 0.5 and below 1 cup per cloth."
      ],
      "successCriteria": [
        "Exporter comparison",
        "Both sides distinguished",
        "Correct strict interval"
      ]
    }
  ],
  "checklist": [
    "I compare opportunity costs.",
    "I retain ratio units.",
    "I test both sides of an exchange.",
    "I state model and distribution limits."
  ],
  "sourceIds": [
    "econ-trade"
  ]
}),
  economics({
  "id": "myp5-economics-macroeconomic-foundations",
  "topic": "Macroeconomic foundations",
  "prerequisiteIds": [
    "myp5-economics-scarcity"
  ],
  "summary": "Interpret output, price-level and policy measures while separating nominal changes from real changes.",
  "objectives": [
    "Explain GDP as a flow of final production.",
    "Calculate inflation and a real-output measure.",
    "Distinguish fiscal and monetary policy at a conceptual level."
  ],
  "explanation": [
    "Macroeconomics studies economy-wide outcomes such as output, inflation and unemployment. Gross domestic product measures the value of final goods and services produced within an economy over a period. Counting both an intermediate input and the full value of the final product would double-count that input. Nominal GDP uses current prices; a real measure adjusts for price changes. Neither output growth nor a larger total alone establishes improved wellbeing for every resident.",
    "Inflation is the rate of increase in a general price index over a stated interval. A fall in the inflation rate can mean prices are still rising more slowly, whereas deflation means the index falls. For these exercises, real GDP equals nominal GDP divided by a GDP deflator expressed with base 100, then multiplied by 100. Fiscal policy concerns government spending and taxation; monetary policy concerns monetary conditions such as interest rates. Their effects depend on conditions and timing, not a guaranteed fixed response."
  ],
  "keyIdeas": [
    "GDP is production during a period.",
    "Nominal and real values answer different questions.",
    "Lower positive inflation still means a rising price level."
  ],
  "definitions": [
    {
      "term": "GDP deflator",
      "meaning": "A price measure for domestically produced final output used here as an index with base 100."
    },
    {
      "term": "Inflation rate",
      "meaning": "Percentage change in a general price index over a specified period."
    },
    {
      "term": "Fiscal policy",
      "meaning": "Government choices about spending and taxation that influence economic activity."
    }
  ],
  "method": [
    "Identify the measure, period and price basis.",
    "Exclude double-counting in output reasoning.",
    "Apply the appropriate index or growth calculation.",
    "Interpret direction and distinguish output from wellbeing."
  ],
  "workedExample": {
    "prompt": "Hypothetical economy: nominal GDP is 330 million credits and the GDP deflator is 110 with base year 100. Find real GDP in base-year prices.",
    "steps": [
      "Use real GDP = nominal GDP × 100/deflator.",
      "330 × 100/110 = 300 million base-year-price credits.",
      "Nominal value includes the price-level effect; the real value removes it using the stated deflator."
    ],
    "conclusion": "Real GDP is 300 million base-year-price credits. A real growth rate still needs a comparable earlier real GDP value."
  },
  "misconceptions": [
    {
      "mistake": "Calling lower positive inflation falling prices.",
      "correction": "Distinguish the price level from its rate of increase."
    },
    {
      "mistake": "Adding every transaction in a production chain to GDP.",
      "correction": "Count final output or sum value added consistently."
    }
  ],
  "practice": [
    {
      "id": "econ-macroeconomic-foundations-1",
      "difficulty": "Foundation",
      "command": "Calculate",
      "marks": 3,
      "prompt": "Hypothetical annual price index rises from 125 to 130. Calculate inflation over the year.",
      "hints": [
        "Use the earlier index as the percentage base."
      ],
      "solution": [
        "Inflation = (130 - 125)/125 × 100 = 4%."
      ],
      "successCriteria": [
        "Correct base",
        "Correct percentage and interval"
      ]
    },
    {
      "id": "econ-macroeconomic-foundations-2",
      "difficulty": "Standard",
      "command": "Calculate",
      "marks": 5,
      "prompt": "Hypothetical real GDP rises from 200 to 210 million constant-price credits. Calculate real growth and explain why nominal GDP is unnecessary for this calculation.",
      "hints": [
        "Both values already use the same price basis."
      ],
      "solution": [
        "Real growth = (210 - 200)/200 × 100 = 5%.",
        "The supplied comparable real values already remove price-level changes; nominal GDP is not needed for this growth calculation."
      ],
      "successCriteria": [
        "Correct growth",
        "Real-price basis explained"
      ]
    },
    {
      "id": "econ-macroeconomic-foundations-3",
      "difficulty": "Advanced",
      "command": "Explain",
      "marks": 6,
      "prompt": "Hypothetical inflation falls from 6% in one year to 2% in the next, both measured annually. Explain whether the general price level falls in the second year.",
      "hints": [
        "The second rate is still positive."
      ],
      "solution": [
        "At 2% inflation, the price index rises by 2% during the second year.",
        "It rises more slowly than under 6% inflation, but it does not fall.",
        "A negative inflation rate would indicate a falling index over the stated interval."
      ],
      "successCriteria": [
        "Rate/level distinction",
        "Correct second-year direction",
        "Deflation distinguished"
      ]
    }
  ],
  "checklist": [
    "I state price basis and period.",
    "I avoid double-counting.",
    "I calculate with the correct base.",
    "I distinguish growth, prices and wellbeing."
  ],
  "sourceIds": [
    "econ-gdp",
    "econ-real-values",
    "econ-inflation"
  ]
}),
  economics({
  "id": "myp5-economics-data-response",
  "topic": "Data response",
  "prerequisiteIds": [
    "myp5-economics-elasticity",
    "myp5-economics-development",
    "myp5-economics-macroeconomic-foundations"
  ],
  "summary": "Build an economic response that calculates accurately, distinguishes percentage points from percentages and limits causal claims.",
  "objectives": [
    "Select a calculation matched to the question.",
    "Distinguish rate differences from relative changes.",
    "Evaluate data comparability and causal limitations."
  ],
  "explanation": [
    "Begin a data response by identifying the source label, time period, population, units and definitions. Decide whether the question needs a level, a difference, a percentage change or a rate. A change from 8% to 6% is a fall of two percentage points, while its relative reduction is one quarter of the initial rate. State the denominator and preserve enough precision to avoid changing the conclusion through early rounding.",
    "Use calculations as evidence within an explanation, not as a substitute for one. A simultaneous policy change and improved outcome do not by themselves identify a causal effect. Check whether definitions, coverage, prices or population changed and consider other influences. Distinguish hypothetical exercise data from observed statistics. A strong judgement answers the task while explaining what further evidence would be needed to generalise, compare fairly or attribute an outcome to a specific intervention."
  ],
  "keyIdeas": [
    "The question determines the denominator.",
    "Percentage points and percent changes differ.",
    "Association alone does not identify policy effects."
  ],
  "definitions": [
    {
      "term": "Percentage-point change",
      "meaning": "The arithmetic difference between two percentages expressed in percentage points."
    },
    {
      "term": "Relative percentage change",
      "meaning": "The change divided by the initial value, multiplied by 100."
    },
    {
      "term": "Comparability",
      "meaning": "The extent to which measures share definitions, coverage and other conditions needed for a valid comparison."
    }
  ],
  "method": [
    "Read metadata and define the requested measure.",
    "Write the formula with a stated denominator.",
    "Calculate, retain units and interpret direction.",
    "Evaluate comparability, alternative explanations and scope."
  ],
  "workedExample": {
    "prompt": "Hypothetical unemployment rate falls from 8% to 6% under an unchanged definition. Calculate the percentage-point change and relative percentage change.",
    "steps": [
      "Percentage-point change = 6 - 8 = -2 percentage points.",
      "Relative change = (6 - 8)/8 × 100 = -25%.",
      "Both describe the same rate movement in different units; the rates alone do not establish the change in the number unemployed if the labour force changed."
    ],
    "conclusion": "The rate falls by 2 percentage points, or 25% relative to its starting level. Report the unit to avoid confusing these statements."
  },
  "misconceptions": [
    {
      "mistake": "Writing a percentage-point difference as the relative percent change.",
      "correction": "Use the initial value as denominator for a relative change."
    },
    {
      "mistake": "Treating a before-and-after comparison as causal proof.",
      "correction": "Consider other changes and a suitable comparison before attributing effects."
    }
  ],
  "practice": [
    {
      "id": "econ-data-response-1",
      "difficulty": "Foundation",
      "command": "Calculate",
      "marks": 3,
      "prompt": "Hypothetical participation rate rises from 40% to 50% with the same definition. Calculate the percentage-point increase and relative percentage increase.",
      "hints": [
        "Compare the difference with the starting rate."
      ],
      "solution": [
        "Increase = 50 - 40 = 10 percentage points.",
        "Relative increase = 10/40 × 100 = 25%."
      ],
      "successCriteria": [
        "Correct percentage points",
        "Correct relative percentage"
      ]
    },
    {
      "id": "econ-data-response-2",
      "difficulty": "Standard",
      "command": "Calculate",
      "marks": 5,
      "prompt": "Hypothetical spending rises from 100 to 121 million credits while the relevant same-base price index rises from 100 to 110. Find final real spending in base-year prices and real growth.",
      "hints": [
        "Adjust the later nominal value before comparing."
      ],
      "solution": [
        "Final real spending = 121 × 100/110 = 110 million base-year-price credits.",
        "Initial real spending = 100 million in the base year.",
        "Real growth = (110 - 100)/100 × 100 = 10%, compared with 21% nominal growth."
      ],
      "successCriteria": [
        "Correct deflation",
        "Comparable base values",
        "Correct real growth"
      ]
    },
    {
      "id": "econ-data-response-3",
      "difficulty": "Advanced",
      "command": "Evaluate",
      "marks": 6,
      "prompt": "Hypothetical data show unemployment falling after a training programme starts. No comparison group or information about wider demand is supplied. Evaluate the claim that the programme caused the entire fall.",
      "hints": [
        "What else might change employment?"
      ],
      "solution": [
        "The timing is consistent with a programme effect but does not isolate it.",
        "Wider labour demand, labour-force changes or other policies could contribute.",
        "Use comparable outcomes, programme participation evidence and an appropriate comparison while checking definitions before attributing the entire fall."
      ],
      "successCriteria": [
        "Temporal association distinguished",
        "Alternative explanations",
        "Relevant further evidence"
      ]
    }
  ],
  "checklist": [
    "I check metadata.",
    "I state the denominator.",
    "I label percentages and points.",
    "I qualify causal attribution."
  ],
  "sourceIds": [
    "econ-real-values",
    "econ-unemployment"
  ]
}),
];
