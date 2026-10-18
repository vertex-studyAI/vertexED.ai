import type { MypLesson } from './myp5Lessons';

const spanish = (value: Omit<MypLesson, 'subjectSlug' | 'contentStatus' | 'curriculumVersion'>): MypLesson => ({
  ...value, subjectSlug: 'spanish', contentStatus: 'original-editorial-draft',
  curriculumVersion: 'vertexed-myp5-2026.1',
});

export const MYP5_SPANISH_COMPLETION: MypLesson[] = [
  spanish({
  "id": "myp5-spanish-present-tense",
  "topic": "Present tense",
  "prerequisiteIds": [],
  "summary": "Build present-tense sentences with correct subjects, common endings and agreement in familiar contexts.",
  "objectives": [
    "Conjugate regular present forms.",
    "Match verbs to their subjects.",
    "Distinguish a routine from an action happening now."
  ],
  "explanation": [
    "This lesson assumes that you can recognise basic subject pronouns and familiar nouns. The present indicative can describe habits and current situations: Estudio español means I study Spanish, and context can also support I am studying Spanish. Regular endings depend on the infinitive group and subject. For regular verbs, remove -ar, -er or -ir and add endings for the subject. In the order yo, tú, él/ella/usted, nosotros/nosotras, vosotros/vosotras, ellos/ellas/ustedes, the -ar endings are -o, -as, -a, -amos, -áis, -an; -er endings are -o, -es, -e, -emos, -éis, -en; -ir endings are -o, -es, -e, -imos, -ís, -en. Thus tú comes means you eat, and mis amigas viven means my female friends live. Nosotros forms are hablamos, comemos and vivimos. Ustedes takes the third-person plural form and is the usual plural you in Latin America; vosotros is common for informal plural you in Spain. Subject pronouns are often omitted when the verb and context identify the speaker.",
    "Do not copy an English auxiliary into every present sentence. Estudio todos los días is a natural statement of routine. Estoy estudiando ahora emphasises an activity in progress, but this lesson focuses on the simple present. Check irregular forms separately, and make adjectives agree with the nouns they describe. The examples are original teaching sentences, not descriptions of actual learners; valid regional pronouns and forms should be judged within the variety being practised."
  ],
  "keyIdeas": [
    "Choose the subject before the ending.",
    "Spanish often omits an understood subject pronoun.",
    "Meaning and context guide tense choice."
  ],
  "definitions": [
    {
      "term": "Infinitivo",
      "meaning": "The dictionary form, such as hablar, comer or vivir."
    },
    {
      "term": "Presente de indicativo",
      "meaning": "A verb form used for present situations, habits and other context-dependent meanings."
    },
    {
      "term": "Concordancia verbal",
      "meaning": "Agreement between the verb and its subject in person and number."
    }
  ],
  "method": [
    "Identify who performs the action.",
    "Find the infinitive and its group.",
    "Choose the present ending or check an irregular form.",
    "Read the complete sentence for meaning and agreement."
  ],
  "workedExample": {
    "prompt": "Original exercise: complete “Nosotras ___ (vivir) cerca de la escuela” in the present indicative.",
    "steps": [
      "The subject nosotras requires first-person plural.",
      "Vivir is an -ir verb; the form is vivimos.",
      "Nosotras vivimos cerca de la escuela means We live near the school."
    ],
    "conclusion": "Vivimos matches the subject. Nosotras may be omitted when the context is clear."
  },
  "misconceptions": [
    {
      "mistake": "Using the infinitive as the main verb after a subject.",
      "correction": "Conjugate it: yo hablo, not yo hablar."
    },
    {
      "mistake": "Adding estoy to a routine without changing the following verb.",
      "correction": "Use Estudio cada día, or the appropriate estar + gerund construction for an ongoing action."
    }
  ],
  "practice": [
    {
      "id": "spa-present-tense-1",
      "difficulty": "Foundation",
      "command": "Complete",
      "marks": 3,
      "prompt": "Complete in the present: “Tú ___ (comer) en casa.”",
      "hints": [
        "Use the tú ending for an -er verb."
      ],
      "solution": [
        "Tú comes en casa.",
        "You eat at home."
      ],
      "successCriteria": [
        "Correct form comes",
        "Subject meaning preserved"
      ]
    },
    {
      "id": "spa-present-tense-2",
      "difficulty": "Standard",
      "command": "Correct",
      "marks": 5,
      "prompt": "Correct agreement: “Mis amigas vive en una casa pequeño.”",
      "hints": [
        "Check the plural subject and the feminine singular noun casa."
      ],
      "solution": [
        "Mis amigas viven en una casa pequeña.",
        "Viven agrees with mis amigas; pequeña agrees with casa."
      ],
      "successCriteria": [
        "Plural verb",
        "Feminine singular adjective"
      ]
    },
    {
      "id": "spa-present-tense-3",
      "difficulty": "Advanced",
      "command": "Produce",
      "marks": 6,
      "prompt": "Write three Spanish sentences about a fictional daily routine using three different present verbs.",
      "hints": [
        "Use familiar activities and time expressions."
      ],
      "solution": [
        "Possible response: Desayuno a las siete. Voy a la escuela en autobús. Por la tarde, leo en casa.",
        "Meaning: I have breakfast at seven, go to school by bus and read at home in the afternoon. Other coherent routines are valid."
      ],
      "successCriteria": [
        "Three relevant sentences",
        "Three correctly conjugated verbs",
        "Clear routine"
      ]
    }
  ],
  "checklist": [
    "I identify the subject.",
    "I choose the right ending.",
    "I check adjective agreement.",
    "I express the intended routine."
  ],
  "sourceIds": [
    "spanish-agreement",
    "spanish-accents", "spanish-conjugation"
  ]
}),
  spanish({
  "id": "myp5-spanish-high-frequency-verbs",
  "topic": "High-frequency verbs",
  "prerequisiteIds": [
    "myp5-spanish-present-tense"
  ],
  "summary": "Use common irregular verbs and distinguish identity, location, existence, possession and liking.",
  "objectives": [
    "Choose common irregular present forms.",
    "Distinguish hay from estar.",
    "Make gustar agree with the thing liked."
  ],
  "explanation": [
    "Common verbs need repeated practice in meaningful sentences. Soy estudiante identifies the speaker as a student; estoy en la biblioteca locates the speaker. The shortcut permanent versus temporary is unreliable: location normally uses estar even for a building. Hay introduces existence, as in Hay dos salas. Las salas están arriba then locates those identified rooms. Tener expresses possession and age: Tengo quince años means I am fifteen years old.",
    "With gustar in its ordinary liking construction, the liked thing is the grammatical subject. Me gusta el libro uses singular gusta, while Me gustan los libros uses plural gustan. The pronoun me identifies the person who likes it. Learn useful irregular forms such as tengo, hago, voy, quiero and puedo in context. A following infinitive normally stays unconjugated: Puedo leer means I can read. These selected patterns are a foundation, not a full account of every use of ser or estar."
  ],
  "keyIdeas": [
    "Match verb choice to meaning.",
    "Hay introduces existence and does not become plural here.",
    "Gustar agrees with the liked thing."
  ],
  "definitions": [
    {
      "term": "Hay",
      "meaning": "The impersonal present form of haber used to state that something exists."
    },
    {
      "term": "Estar",
      "meaning": "A verb used here to locate someone or something already identified."
    },
    {
      "term": "Gustar",
      "meaning": "In these examples, to be pleasing to someone, expressed naturally in English as liking."
    }
  ],
  "method": [
    "Decide whether the message concerns existence, location or another meaning.",
    "Choose the verb and subject.",
    "Check irregular forms and gustar agreement.",
    "Translate the whole meaning rather than each word separately."
  ],
  "workedExample": {
    "prompt": "Original exercise: translate “There are two books. The books are on the table. I like the books.”",
    "steps": [
      "Existence: Hay dos libros.",
      "Location: Los libros están en la mesa.",
      "Liking: Me gustan los libros."
    ],
    "conclusion": "Hay remains unchanged for plural existence; están and gustan agree with los libros."
  },
  "misconceptions": [
    {
      "mistake": "Writing me gusta los libros.",
      "correction": "Use gustan for the plural subject los libros."
    },
    {
      "mistake": "Explaining ser and estar only as permanent and temporary.",
      "correction": "Use the relevant construction and meaning; location is normally expressed with estar."
    }
  ],
  "practice": [
    {
      "id": "spa-high-frequency-verbs-1",
      "difficulty": "Foundation",
      "command": "Complete",
      "marks": 3,
      "prompt": "Complete: “Yo ___ (tener) quince años y ___ (ir) a la escuela.”",
      "hints": [
        "Both first-person forms are irregular."
      ],
      "solution": [
        "Yo tengo quince años y voy a la escuela.",
        "I am fifteen years old and I go to school."
      ],
      "successCriteria": [
        "Tengo",
        "Voy and meaning"
      ]
    },
    {
      "id": "spa-high-frequency-verbs-2",
      "difficulty": "Standard",
      "command": "Correct",
      "marks": 5,
      "prompt": "Correct: “Hay tres libros y me gusta los libros.”",
      "hints": [
        "Hay is already correct; check the liked thing."
      ],
      "solution": [
        "Hay tres libros y me gustan los libros.",
        "A more natural version in context is Hay tres libros y me gustan."
      ],
      "successCriteria": [
        "Plural gustan",
        "Hay retained",
        "Meaning preserved"
      ]
    },
    {
      "id": "spa-high-frequency-verbs-3",
      "difficulty": "Advanced",
      "command": "Translate",
      "marks": 6,
      "prompt": "Translate “I can read, but I want to write” into Spanish.",
      "hints": [
        "Keep the second verb in each pair as an infinitive."
      ],
      "solution": [
        "Puedo leer, pero quiero escribir.",
        "Yo puedo leer, pero quiero escribir is also valid when the subject needs emphasis."
      ],
      "successCriteria": [
        "Puedo and quiero",
        "Leer and escribir infinitives",
        "Contrast preserved"
      ]
    }
  ],
  "checklist": [
    "I distinguish existence and location.",
    "I check irregular forms.",
    "I identify gustar’s subject.",
    "I preserve meaning."
  ],
  "sourceIds": [
    "spanish-haber",
    "spanish-gustar",
    "spanish-ir"
  ]
}),
  spanish({
  "id": "myp5-spanish-experiences",
  "topic": "Experiences",
  "prerequisiteIds": [
    "myp5-spanish-past-tenses"
  ],
  "summary": "Narrate an original experience using past events, background detail and a clear personal response.",
  "objectives": [
    "Sequence bounded past events.",
    "Add background with the imperfect.",
    "Explain an opinion with a reason."
  ],
  "explanation": [
    "A short account needs a setting, an event and a response. Use the preterite for events presented as bounded: Llegamos tarde means We arrived late. Use the imperfect for background or an ongoing situation: Llovía means It was raining. This is a choice of viewpoint, not a rule that every short action takes one tense and every long action another. Time markers help readers follow the sequence but do not choose the tense automatically.",
    "Keep details consistent across sentences and justify the response with because or another appropriate connector. You may invent the experience for practice. There is no need to disclose a personal event. Present perfect and simple past usage differs across Spanish-speaking regions, so a valid local choice should not be rejected merely for differing from one model. These tasks specify a completed past setting and practise preterite and imperfect contrasts within that frame."
  ],
  "keyIdeas": [
    "Set the scene before sequencing events.",
    "Tense expresses viewpoint.",
    "An opinion needs supporting detail."
  ],
  "definitions": [
    {
      "term": "Experiencia",
      "meaning": "An event or situation someone has lived through or, here, a fictional account for practice."
    },
    {
      "term": "Pretérito perfecto simple",
      "meaning": "The preterite, used here to present bounded past events."
    },
    {
      "term": "Imperfecto",
      "meaning": "A past form used here for background or an ongoing past situation."
    }
  ],
  "method": [
    "Identify the completed past setting.",
    "Separate background from events.",
    "Link events in a clear sequence.",
    "Add a reasoned reaction and check forms."
  ],
  "workedExample": {
    "prompt": "Original fictional account: express “It was raining. We visited a museum. I liked the visit because I learned something new.”",
    "steps": [
      "Background: Llovía.",
      "Event: Visitamos un museo.",
      "Reaction: Me gustó la visita porque aprendí algo nuevo."
    ],
    "conclusion": "The account combines background, a completed visit and a reasoned reaction."
  },
  "misconceptions": [
    {
      "mistake": "Using the imperfect only because an action lasted a long time.",
      "correction": "Duration alone does not determine aspect."
    },
    {
      "mistake": "Giving an opinion without a reason.",
      "correction": "Add a relevant detail with porque."
    }
  ],
  "practice": [
    {
      "id": "spa-experiences-1",
      "difficulty": "Foundation",
      "command": "Translate",
      "marks": 3,
      "prompt": "Translate “Yesterday I visited a museum with my sister” into Spanish.",
      "hints": [
        "Use the first-person preterite of visitar."
      ],
      "solution": [
        "Ayer visité un museo con mi hermana.",
        "Visité needs its written accent."
      ],
      "successCriteria": [
        "Visité",
        "Time and companion preserved"
      ]
    },
    {
      "id": "spa-experiences-2",
      "difficulty": "Standard",
      "command": "Explain",
      "marks": 5,
      "prompt": "Explain in English the contrast in this original sentence: “Hacía frío, pero jugamos en el parque.”",
      "hints": [
        "Distinguish background from the bounded activity."
      ],
      "solution": [
        "Hacía frío supplies background: it was cold.",
        "Jugamos presents playing in the park as a completed past event in this context.",
        "Pero introduces contrast: despite the cold, we played."
      ],
      "successCriteria": [
        "Both meanings",
        "Tense contrast",
        "Connector meaning"
      ]
    },
    {
      "id": "spa-experiences-3",
      "difficulty": "Advanced",
      "command": "Produce",
      "marks": 6,
      "prompt": "Write three connected Spanish sentences about a fictional past outing, using one imperfect form, one preterite event and a reasoned opinion.",
      "hints": [
        "Describe conditions, report an event, then give a reason."
      ],
      "solution": [
        "Possible response: Hacía sol. Fuimos al parque y jugamos al fútbol. Me gustó la tarde porque pasé tiempo con mis amigos.",
        "Other coherent outings meeting the tense and reasoning requirements are valid."
      ],
      "successCriteria": [
        "Background imperfect",
        "Preterite event",
        "Opinion with reason"
      ]
    }
  ],
  "checklist": [
    "I keep the time frame clear.",
    "I distinguish background and events.",
    "I check accents.",
    "I justify the reaction."
  ],
  "sourceIds": [
    "spanish-agreement",
    "spanish-accents", "spanish-conjugation"
  ]
}),
  spanish({
  "id": "myp5-spanish-future-and-conditional",
  "topic": "Future and conditional",
  "prerequisiteIds": [
    "myp5-spanish-present-tense"
  ],
  "summary": "Distinguish plans, future statements and polite conditional requests without confusing their verb patterns.",
  "objectives": [
    "Form ir a plus infinitive.",
    "Use selected future and conditional forms.",
    "Build a real future condition with present after si."
  ],
  "explanation": [
    "Ir a plus infinitive is a common way to express an intention or prospective action: Voy a estudiar means I am going to study. The a is part of this construction. The simple future adds endings to an infinitive or an irregular future stem: estudiaré, tendré. A future form does not guarantee that an event will happen; context determines whether it is a prediction, promise or other future statement.",
    "The conditional uses endings such as -ía and can make a request more polite: ¿Podrías repetirlo? means Could you repeat it? This lesson introduces these familiar uses without requiring a full hypothetical subjunctive system. In the real condition Si tengo tiempo, estudiaré, use present tengo after si, not future tendré. Keep the unaccented conjunction si distinct from sí meaning yes. Future and conditional forms also have other uses beyond this introductory scope."
  ],
  "keyIdeas": [
    "Keep a in ir a + infinitive.",
    "Future and conditional convey different meanings.",
    "Real future conditions use present after si in this pattern."
  ],
  "definitions": [
    {
      "term": "Futuro simple",
      "meaning": "A form used here for a future statement, such as estudiaré."
    },
    {
      "term": "Condicional simple",
      "meaning": "A form used here for a polite request or a would meaning, such as podría."
    },
    {
      "term": "Ir a + infinitivo",
      "meaning": "A construction used here for an intended or prospective action."
    }
  ],
  "method": [
    "Decide whether the message is a plan, statement or request.",
    "Choose the construction.",
    "Check the subject, stem, ending and required preposition.",
    "Read any si clause and preserve the intended meaning."
  ],
  "workedExample": {
    "prompt": "Original exercise: express “Tomorrow I am going to study. Could you help me?” using informal tú.",
    "steps": [
      "Plan: Mañana voy a estudiar.",
      "Polite request: ¿Podrías ayudarme?",
      "Voy a is followed by the infinitive; podrías has a written accent and tú agreement."
    ],
    "conclusion": "Mañana voy a estudiar. ¿Podrías ayudarme? The request does not assert that help will occur."
  },
  "misconceptions": [
    {
      "mistake": "Omitting a in voy a estudiar.",
      "correction": "Retain the preposition in this construction."
    },
    {
      "mistake": "Using si tendré tiempo for this real future condition.",
      "correction": "Use Si tengo tiempo, estudiaré."
    }
  ],
  "practice": [
    {
      "id": "spa-future-and-conditional-1",
      "difficulty": "Foundation",
      "command": "Complete",
      "marks": 3,
      "prompt": "Complete the plan: “Nosotros vamos ___ visitar el museo.”",
      "hints": [
        "The construction needs a preposition."
      ],
      "solution": [
        "Nosotros vamos a visitar el museo.",
        "We are going to visit the museum."
      ],
      "successCriteria": [
        "Required a",
        "Meaning preserved"
      ]
    },
    {
      "id": "spa-future-and-conditional-2",
      "difficulty": "Standard",
      "command": "Translate",
      "marks": 5,
      "prompt": "Translate “I will have time tomorrow” using tener in the simple future tense.",
      "hints": [
        "Use the irregular stem tendr-."
      ],
      "solution": [
        "Tendré tiempo mañana.",
        "Yo tendré tiempo mañana is also valid with an explicit subject."
      ],
      "successCriteria": [
        "Tendré with accent",
        "Future meaning"
      ]
    },
    {
      "id": "spa-future-and-conditional-3",
      "difficulty": "Advanced",
      "command": "Produce",
      "marks": 6,
      "prompt": "Write a Spanish sentence meaning “If I have time, I will read”, using the simple future tense for leer, then a polite tú request meaning “Could you repeat it?”",
      "hints": [
        "Use present after si and conditional poder for the request."
      ],
      "solution": [
        "Si tengo tiempo, leeré.",
        "¿Podrías repetirlo?",
        "Repetir eso may replace repetirlo if the intended reference is clear."
      ],
      "successCriteria": [
        "Tengo after si",
        "Leeré",
        "Polite request and accents"
      ]
    }
  ],
  "checklist": [
    "I choose the intended meaning.",
    "I retain required prepositions.",
    "I check irregular stems.",
    "I distinguish si and sí."
  ],
  "sourceIds": [
    "spanish-ir",
    "spanish-si",
    "spanish-accents", "spanish-conjugation"
  ]
}),
  spanish({
  "id": "myp5-spanish-human-ingenuity",
  "topic": "Human ingenuity",
  "prerequisiteIds": [
    "myp5-spanish-high-frequency-verbs"
  ],
  "summary": "Describe the purpose of an invention and discuss a benefit and limitation in clear, qualified Spanish.",
  "objectives": [
    "Explain purpose with para plus infinitive.",
    "Describe use in the present.",
    "Balance a benefit with a limitation."
  ],
  "explanation": [
    "This theme provides language for discussing inventions, media and communication. Explain what a tool does before evaluating it. Para plus infinitive expresses purpose when appropriate: Uso una aplicación para organizar mis tareas means I use an app to organise my tasks. The infinitive after para does not change to match the speaker. A description can then add a personal benefit with porque and a limitation with pero or sin embargo.",
    "Keep claims within the fictional scenario or clearly mark them as opinions. Puede ayudar means it can help, which is weaker than a guarantee. Avoid inventing a scientific result to make a language answer sound convincing. You can describe a simple tool without advanced technical vocabulary. In open tasks, different inventions and valid regional words are acceptable if the explanation is coherent and the grammar communicates the required functions."
  ],
  "keyIdeas": [
    "State function before evaluation.",
    "Para + infinitive expresses purpose.",
    "Qualified language avoids unsupported guarantees."
  ],
  "definitions": [
    {
      "term": "Invento",
      "meaning": "An invention or newly devised object or process."
    },
    {
      "term": "Para + infinitivo",
      "meaning": "A phrase expressing purpose, such as para escribir."
    },
    {
      "term": "Ventaja",
      "meaning": "A benefit or favourable feature in a stated context."
    }
  ],
  "method": [
    "Name the tool and its user.",
    "Explain its purpose with a suitable construction.",
    "Add a benefit and limitation.",
    "Check infinitives, agreement and strength of claims."
  ],
  "workedExample": {
    "prompt": "Original fictional scenario: explain an app used to organise homework, with one limitation.",
    "steps": [
      "Purpose: Uso una aplicación para organizar mis tareas.",
      "Benefit: Me ayuda a recordar las fechas.",
      "Limit: Sin embargo, necesito una conexión a internet."
    ],
    "conclusion": "The response describes a use and a specific constraint rather than claiming the app always improves results."
  },
  "misconceptions": [
    {
      "mistake": "Conjugating after para in para organizo.",
      "correction": "Use para organizar for this purpose construction."
    },
    {
      "mistake": "Giving an absolute claim without support.",
      "correction": "Use a scoped statement such as puede ayudar or en este caso."
    }
  ],
  "practice": [
    {
      "id": "spa-human-ingenuity-1",
      "difficulty": "Foundation",
      "command": "Complete",
      "marks": 3,
      "prompt": "Complete: “Uso el ordenador para ___ (escribir).”",
      "hints": [
        "Use the infinitive after para."
      ],
      "solution": [
        "Uso el ordenador para escribir.",
        "I use the computer to write. Computadora is a valid regional alternative to ordenador."
      ],
      "successCriteria": [
        "Infinitive escribir",
        "Purpose meaning"
      ]
    },
    {
      "id": "spa-human-ingenuity-2",
      "difficulty": "Standard",
      "command": "Translate",
      "marks": 5,
      "prompt": "Translate “This tool is useful, but it is expensive.” The tool is una herramienta.",
      "hints": [
        "Make both adjectives agree with herramienta."
      ],
      "solution": [
        "Esta herramienta es útil, pero es cara.",
        "Útil does not change for feminine gender; cara does."
      ],
      "successCriteria": [
        "Útil accent",
        "Feminine cara",
        "Contrast"
      ]
    },
    {
      "id": "spa-human-ingenuity-3",
      "difficulty": "Advanced",
      "command": "Produce",
      "marks": 6,
      "prompt": "Describe a fictional invention in three Spanish sentences: its purpose, a possible benefit and a limitation.",
      "hints": [
        "Use para, puede and pero if helpful."
      ],
      "solution": [
        "Possible response: Este robot sirve para ordenar libros. Puede ahorrar tiempo. Pero necesita electricidad.",
        "Other coherent inventions are valid; no real performance claim is required."
      ],
      "successCriteria": [
        "Purpose",
        "Possible benefit",
        "Limitation and agreement"
      ]
    }
  ],
  "checklist": [
    "I explain purpose.",
    "I use infinitives correctly.",
    "I balance benefits and limits.",
    "I avoid unsupported guarantees."
  ],
  "sourceIds": [
    "spanish-agreement"
  ]
}),
  spanish({
  "id": "myp5-spanish-social-organisation",
  "topic": "Social organisation",
  "prerequisiteIds": [
    "myp5-spanish-high-frequency-verbs"
  ],
  "summary": "Describe community services, locations and practical rules with clear language for existence and obligation.",
  "objectives": [
    "Describe available services.",
    "Locate an identified place.",
    "Express a general requirement with hay que."
  ],
  "explanation": [
    "Community topics include schools, libraries, transport and shared activities. Introduce a service with hay, then locate it with estar: Hay una biblioteca; está al lado del parque. Al lado de means next to; de plus el contracts to del. These patterns communicate practical information without needing a long description. Keep locations consistent within an invented neighbourhood.",
    "Hay que plus infinitive expresses a general requirement or necessity in the context: Hay que reservar means booking is required. Tengo que reservar identifies the speaker’s obligation instead. Rules in these exercises are fictional service rules, not claims about actual institutions or legal advice. When explaining a proposal, give a reason and consider access: a service may exist but be unavailable at a useful time. Alternative communities and regional vocabulary are acceptable in open writing tasks."
  ],
  "keyIdeas": [
    "Hay introduces existence.",
    "Estar locates an identified place.",
    "General and personal obligations use different patterns."
  ],
  "definitions": [
    {
      "term": "Servicio",
      "meaning": "A service provided for users or a community."
    },
    {
      "term": "Al lado de",
      "meaning": "Next to, expressing relative location."
    },
    {
      "term": "Hay que + infinitivo",
      "meaning": "An impersonal construction expressing a contextual requirement or necessity."
    }
  ],
  "method": [
    "Identify the service and context.",
    "State existence and location clearly.",
    "Explain a relevant rule or proposal.",
    "Check contractions, infinitives and access details."
  ],
  "workedExample": {
    "prompt": "Original fictional notice: describe a library next to the park where booking is required.",
    "steps": [
      "Existence: Hay una biblioteca.",
      "Location: Está al lado del parque.",
      "Rule: Hay que reservar antes de entrar."
    ],
    "conclusion": "The notice identifies the service, its location and the fictional booking rule."
  },
  "misconceptions": [
    {
      "mistake": "Using plural forms of existential hay.",
      "correction": "Use Hay dos bibliotecas."
    },
    {
      "mistake": "Omitting the infinitive after hay que.",
      "correction": "Use Hay que reservar, not Hay que reserva."
    }
  ],
  "practice": [
    {
      "id": "spa-social-organisation-1",
      "difficulty": "Foundation",
      "command": "Translate",
      "marks": 3,
      "prompt": "Translate “There are two schools in my neighbourhood.”",
      "hints": [
        "Use hay for existence."
      ],
      "solution": [
        "Hay dos escuelas en mi barrio.",
        "Colegios can be appropriate where that word fits the intended type of school."
      ],
      "successCriteria": [
        "Hay unchanged",
        "Two schools and location"
      ]
    },
    {
      "id": "spa-social-organisation-2",
      "difficulty": "Standard",
      "command": "Complete",
      "marks": 5,
      "prompt": "Complete: “La biblioteca está al lado ___ parque.”",
      "hints": [
        "Combine de and el."
      ],
      "solution": [
        "La biblioteca está al lado del parque.",
        "The library is next to the park."
      ],
      "successCriteria": [
        "Del contraction",
        "Location meaning"
      ]
    },
    {
      "id": "spa-social-organisation-3",
      "difficulty": "Advanced",
      "command": "Produce",
      "marks": 6,
      "prompt": "Write three Spanish sentences proposing a fictional community library: say what is missing, what you propose and why.",
      "hints": [
        "Use no hay, propongo and porque."
      ],
      "solution": [
        "Possible response: En mi barrio no hay biblioteca. Propongo abrir una cerca de la escuela. Sería útil porque podríamos estudiar allí.",
        "Other coherent proposals are valid; advanced conditional forms may be replaced with simpler accurate wording."
      ],
      "successCriteria": [
        "Missing service",
        "Clear proposal",
        "Reason and coherent location"
      ]
    }
  ],
  "checklist": [
    "I distinguish existence and location.",
    "I form contractions.",
    "I use hay que with an infinitive.",
    "I justify a proposal."
  ],
  "sourceIds": [
    "spanish-haber"
  ]
}),
  spanish({
  "id": "myp5-spanish-sharing-the-planet",
  "topic": "Sharing the planet",
  "prerequisiteIds": [
    "myp5-spanish-present-tense"
  ],
  "summary": "Express environmental routines and practical proposals without overstating the effects of a fictional action.",
  "objectives": [
    "Describe a routine in the present.",
    "Suggest an action with podemos plus infinitive.",
    "Give a reason and a limitation."
  ],
  "explanation": [
    "This theme practises language about shared places and resources. Begin with a specific action: Reutilizo el papel means I reuse paper. Podemos plus infinitive makes a group suggestion: Podemos usar menos papel means We can use less paper. Menos does not change its ending to agree with papel. Use porque to explain a reason and pero to acknowledge a constraint.",
    "A language response should not invent environmental statistics or guarantee that one action solves a global problem. Describe the fictional setting and use appropriately limited claims. Cuidar el parque means to look after the park; reducing waste and reusing materials are different actions. The tasks assess communication and grammar, not the environmental performance of a real intervention. Open responses may use another plausible action if they preserve the requested functions and avoid unsupported factual claims."
  ],
  "keyIdeas": [
    "Name a specific action.",
    "Podemos takes an infinitive.",
    "A proposal can include a limitation."
  ],
  "definitions": [
    {
      "term": "Reutilizar",
      "meaning": "To use something again."
    },
    {
      "term": "Residuos",
      "meaning": "Waste materials in the context of these tasks."
    },
    {
      "term": "Podemos + infinitivo",
      "meaning": "We can followed by an action, used here to propose a group activity."
    }
  ],
  "method": [
    "Identify the fictional issue and setting.",
    "State an action in clear Spanish.",
    "Explain a relevant reason or purpose.",
    "Add a limitation and check grammar."
  ],
  "workedExample": {
    "prompt": "Original fictional classroom proposal: suggest reusing paper and state a limitation.",
    "steps": [
      "Suggestion: Podemos reutilizar el papel.",
      "Purpose: Así usamos menos material nuevo.",
      "Limit: Pero algunas hojas están demasiado dañadas."
    ],
    "conclusion": "The proposal is specific and qualified; it makes no quantified environmental claim."
  },
  "misconceptions": [
    {
      "mistake": "Writing podemos usamos.",
      "correction": "Use the infinitive: podemos usar."
    },
    {
      "mistake": "Claiming one small action solves every environmental problem.",
      "correction": "Keep the claim proportional to the scenario."
    }
  ],
  "practice": [
    {
      "id": "spa-sharing-the-planet-1",
      "difficulty": "Foundation",
      "command": "Translate",
      "marks": 3,
      "prompt": "Translate “We can use less paper.”",
      "hints": [
        "Use poder followed by an infinitive."
      ],
      "solution": [
        "Podemos usar menos papel."
      ],
      "successCriteria": [
        "Podemos usar",
        "Menos papel"
      ]
    },
    {
      "id": "spa-sharing-the-planet-2",
      "difficulty": "Standard",
      "command": "Correct",
      "marks": 5,
      "prompt": "Correct agreement: “Las botellas está vacíos.”",
      "hints": [
        "Botellas is feminine plural."
      ],
      "solution": [
        "Las botellas están vacías.",
        "Están agrees with the plural subject; vacías agrees in gender and number."
      ],
      "successCriteria": [
        "Están with accent",
        "Vacías with accent and agreement"
      ]
    },
    {
      "id": "spa-sharing-the-planet-3",
      "difficulty": "Advanced",
      "command": "Produce",
      "marks": 6,
      "prompt": "Write three Spanish sentences about a fictional school waste-reduction plan: an action, a reason and a limitation.",
      "hints": [
        "Use a clear connector for each relationship."
      ],
      "solution": [
        "Possible response: Vamos a reutilizar las carpetas. Así compramos menos material. Sin embargo, necesitamos revisar su estado.",
        "Other coherent plans are valid without invented impact statistics."
      ],
      "successCriteria": [
        "Specific action",
        "Reason or consequence",
        "Limitation and accurate language"
      ]
    }
  ],
  "checklist": [
    "I describe a specific action.",
    "I use infinitives after podemos.",
    "I check plural agreement.",
    "I qualify the claim."
  ],
  "sourceIds": [
    "spanish-agreement"
  ]
}),
  spanish({
  "id": "myp5-spanish-connectors",
  "topic": "Connectors",
  "prerequisiteIds": [
    "myp5-spanish-present-tense"
  ],
  "summary": "Link Spanish ideas through cause, contrast, consequence and sequence while preserving the intended relationship.",
  "objectives": [
    "Distinguish cause from consequence.",
    "Use contrast and sequence markers.",
    "Distinguish porque from por qué."
  ],
  "explanation": [
    "Connectors tell the reader how ideas relate. Porque gives a reason: Estudio porque quiero aprender means I study because I want to learn. Por eso introduces a consequence: Quiero aprender; por eso estudio. Pero and sin embargo express contrast, while primero and después organise a sequence. Select the relationship before choosing a word; adding a sophisticated connector does not repair an illogical connection.",
    "Por qué, written separately with an accent, asks why in direct or indirect questions: ¿Por qué estudias? and No sé por qué estudias. Porque, one word without an accent, gives a reason in these tasks. These are not the only porque-related forms, but they cover this lesson’s scope. Use commas or full stops to keep linked clauses readable. Open writing can use another accurate connector when it expresses the required relationship."
  ],
  "keyIdeas": [
    "Meaning determines the connector.",
    "Porque and por qué differ in function.",
    "Punctuation helps the reader follow a link."
  ],
  "definitions": [
    {
      "term": "Causa",
      "meaning": "A reason for an action or situation."
    },
    {
      "term": "Consecuencia",
      "meaning": "A result presented as following from another situation."
    },
    {
      "term": "Contraste",
      "meaning": "A relationship highlighting a difference or an unexpected combination."
    }
  ],
  "method": [
    "Identify the relationship between ideas.",
    "Choose a connector expressing it.",
    "Preserve sentence order and punctuation.",
    "Check spelling and accents."
  ],
  "workedExample": {
    "prompt": "Original exercise: link “Quiero aprender español” and “practico cada día” as a consequence.",
    "steps": [
      "The desire to learn is the stated reason.",
      "Daily practice is presented as the consequence.",
      "Quiero aprender español; por eso practico cada día."
    ],
    "conclusion": "Por eso marks the consequence. Practico cada día porque quiero aprender español expresses the same relationship in a different order."
  },
  "misconceptions": [
    {
      "mistake": "Using por eso to introduce the reason itself.",
      "correction": "Check the direction of the relationship."
    },
    {
      "mistake": "Writing porque in a direct why question.",
      "correction": "Use ¿Por qué...? with a space and accent."
    }
  ],
  "practice": [
    {
      "id": "spa-connectors-1",
      "difficulty": "Foundation",
      "command": "Complete",
      "marks": 3,
      "prompt": "Complete the why question: “¿___ estudias español?”",
      "hints": [
        "Use the interrogative expression."
      ],
      "solution": [
        "¿Por qué estudias español?",
        "Why do you study Spanish?"
      ],
      "successCriteria": [
        "Por qué spelling",
        "Question marks and meaning"
      ]
    },
    {
      "id": "spa-connectors-2",
      "difficulty": "Standard",
      "command": "Combine",
      "marks": 5,
      "prompt": "Combine with contrast: “El libro es largo. Es interesante.”",
      "hints": [
        "Use pero or sin embargo."
      ],
      "solution": [
        "El libro es largo, pero es interesante.",
        "El libro es largo. Sin embargo, es interesante. Both express the requested contrast."
      ],
      "successCriteria": [
        "Contrast connector",
        "Both meanings retained"
      ]
    },
    {
      "id": "spa-connectors-3",
      "difficulty": "Advanced",
      "command": "Produce",
      "marks": 6,
      "prompt": "Write three Spanish sentences about a fictional study session, using primero, después and porque across the response.",
      "hints": [
        "Organise two activities and explain one choice."
      ],
      "solution": [
        "Possible response: Primero leo el texto. Después escribo un resumen. Uso un diccionario porque hay palabras nuevas.",
        "Other logical sequences are valid."
      ],
      "successCriteria": [
        "Sequence",
        "Reason",
        "Three coherent sentences"
      ]
    }
  ],
  "checklist": [
    "I identify the relationship.",
    "I distinguish reason and result.",
    "I check por qué.",
    "I punctuate the link."
  ],
  "sourceIds": [
    "spanish-porque"
  ]
}),
  spanish({
  "id": "myp5-spanish-speaking-interaction",
  "topic": "Speaking interaction",
  "prerequisiteIds": [
    "myp5-spanish-connectors"
  ],
  "summary": "Practise a short exchange that answers, adds detail and invites a response while using appropriate forms of address.",
  "objectives": [
    "Respond to the actual question.",
    "Ask a relevant follow-up.",
    "Request repetition politely when needed."
  ],
  "explanation": [
    "Interaction requires listening to the other speaker and responding to their meaning, rather than reciting a prepared paragraph regardless of the question. A useful short turn answers, adds a reason or detail, and leaves space for a response. ¿Y tú? asks about an informal singular listener; ¿y usted? uses formal singular address. Tú and usted take different verb forms, so keep the chosen relationship consistent.",
    "Repair phrases help communication when something is unclear. ¿Puedes repetirlo, por favor? asks an informal listener to repeat it; ¿Puede repetirlo, por favor? addresses someone as usted. Do not pretend to understand a word that changes the task. These written exchanges are rehearsal material; the page does not record pronunciation or measure spoken fluency. A partner can role-play them, with alternative relevant answers accepted when meaning, register and interaction are maintained."
  ],
  "keyIdeas": [
    "Answer before adding extra detail.",
    "Maintain consistent forms of address.",
    "Clarification is a communication strategy."
  ],
  "definitions": [
    {
      "term": "Turno",
      "meaning": "A contribution by one speaker in an exchange."
    },
    {
      "term": "Pregunta de seguimiento",
      "meaning": "A follow-up question connected to what has just been said."
    },
    {
      "term": "Registro",
      "meaning": "Language choices suited to the relationship, purpose and situation."
    }
  ],
  "method": [
    "Identify what the other speaker asks.",
    "Give a relevant answer and supporting detail.",
    "Ask a follow-up or request clarification.",
    "Check address forms and let the other speaker respond."
  ],
  "workedExample": {
    "prompt": "Original role-play using informal tú: A asks “¿Qué haces los fines de semana?” Give an answer, reason and follow-up.",
    "steps": [
      "Answer: Juego al baloncesto.",
      "Reason: Me gusta porque puedo estar con mis amigos.",
      "Follow-up: ¿Y tú, qué haces?"
    ],
    "conclusion": "The response answers the weekend-activity question and invites the other speaker to contribute."
  },
  "misconceptions": [
    {
      "mistake": "Reciting unrelated memorised material.",
      "correction": "Respond to the question and adapt the next turn."
    },
    {
      "mistake": "Mixing tú and usted forms unintentionally.",
      "correction": "Keep the chosen form of address consistent."
    }
  ],
  "practice": [
    {
      "id": "spa-speaking-interaction-1",
      "difficulty": "Foundation",
      "command": "Respond",
      "marks": 3,
      "prompt": "In a fictional informal exchange, answer “¿Te gusta leer?” with a positive answer beginning Sí and a reason.",
      "hints": [
        "Use sí and porque."
      ],
      "solution": [
        "Possible response: Sí, me gusta leer porque aprendo cosas nuevas.",
        "Other relevant reasons are valid."
      ],
      "successCriteria": [
        "Relevant positive answer",
        "Reason",
        "Sí accent"
      ]
    },
    {
      "id": "spa-speaking-interaction-2",
      "difficulty": "Standard",
      "command": "Translate",
      "marks": 5,
      "prompt": "Ask a person addressed as usted: “Can you repeat it, please?”",
      "hints": [
        "Use third-person singular puede for usted."
      ],
      "solution": [
        "¿Puede repetirlo, por favor?",
        "¿Podría repetirlo, por favor? is also a polite conditional alternative."
      ],
      "successCriteria": [
        "Formal agreement",
        "Request and courtesy",
        "Question punctuation"
      ]
    },
    {
      "id": "spa-speaking-interaction-3",
      "difficulty": "Advanced",
      "command": "Produce",
      "marks": 6,
      "prompt": "Write a four-turn fictional tú dialogue that proposes meeting, asks the time, gives the time and accepts.",
      "hints": [
        "Each turn should respond to the previous one."
      ],
      "solution": [
        "A: ¿Quieres ir al parque mañana?",
        "B: Sí, ¿a qué hora?",
        "A: A las cuatro.",
        "B: De acuerdo. Nos vemos mañana. Other consistent times and plans are valid."
      ],
      "successCriteria": [
        "Four linked turns",
        "Time question and answer",
        "Consistent informal address"
      ]
    }
  ],
  "checklist": [
    "I answer the question.",
    "I add a relevant detail.",
    "I ask or clarify.",
    "I maintain register."
  ],
  "sourceIds": [
    "spanish-agreement",
    "spanish-cefr"
  ]
}),
  spanish({
  "id": "myp5-spanish-reading-comprehension",
  "topic": "Reading comprehension",
  "prerequisiteIds": [
    "myp5-spanish-present-tense"
  ],
  "summary": "Read an original short Spanish text for gist, precise detail and supported inference without adding unstated information.",
  "objectives": [
    "Identify purpose and main message.",
    "Locate details and negation.",
    "Distinguish evidence from inference."
  ],
  "explanation": [
    "Start by identifying the type of text and its likely purpose, then read for the overall message. A notice may give practical information; an email may explain a plan or change. On a second reading, locate the words answering the question. Watch for no, nunca and contrast markers, because they can reverse an interpretation. A familiar word alone is not enough to answer the whole question.",
    "Use context to propose a meaning for an unfamiliar word, then check whether it fits the sentence. Do not add a reason, place or feeling that the text does not supply. A supported inference is narrower than an invented story. These passages are original fictional texts, so answers should refer to their wording rather than outside facts. If a task asks for English, preserve the Spanish meaning; if it asks for Spanish, a concise accurate paraphrase may be better than copying unrelated lines."
  ],
  "keyIdeas": [
    "Read for gist before detail.",
    "Negation and contrast matter.",
    "An inference needs textual support."
  ],
  "definitions": [
    {
      "term": "Idea principal",
      "meaning": "The main message of a text."
    },
    {
      "term": "Detalle explícito",
      "meaning": "Information directly stated in the text."
    },
    {
      "term": "Inferencia",
      "meaning": "An interpretation supported by clues but not directly stated in the same words."
    }
  ],
  "method": [
    "Identify text type and purpose.",
    "Read once for the main message.",
    "Locate evidence for the exact question.",
    "Check negation and avoid unsupported additions."
  ],
  "workedExample": {
    "prompt": "Original fictional notice: “La biblioteca abre a las nueve. Los viernes cierra a las seis, no a las cinco.” State Friday’s closing time in English.",
    "steps": [
      "The question asks when it closes, not opens.",
      "Los viernes identifies Friday; cierra a las seis gives the time.",
      "No a las cinco rejects five o’clock."
    ],
    "conclusion": "It closes at six o’clock on Fridays. The notice does not specify opening or closing times for every other day."
  },
  "misconceptions": [
    {
      "mistake": "Answering with the first number seen.",
      "correction": "Match the number to the action asked about."
    },
    {
      "mistake": "Adding a reason not stated in the passage.",
      "correction": "Separate the text’s information from speculation."
    }
  ],
  "practice": [
    {
      "id": "spa-reading-comprehension-1",
      "difficulty": "Foundation",
      "command": "Identify",
      "marks": 3,
      "prompt": "Read the original fictional message: “No puedo ir hoy. Nos vemos mañana.” When does the writer propose meeting? Answer in English.",
      "hints": [
        "The second sentence gives the new plan."
      ],
      "solution": [
        "Tomorrow.",
        "The message says the writer cannot go today; it does not explain why."
      ],
      "successCriteria": [
        "Tomorrow",
        "No invented reason"
      ]
    },
    {
      "id": "spa-reading-comprehension-2",
      "difficulty": "Standard",
      "command": "Explain",
      "marks": 5,
      "prompt": "Original fictional text: “A Lucía le gusta el parque, pero hoy prefiere quedarse en casa porque llueve.” Explain in English why she prefers staying home today.",
      "hints": [
        "Read the clause after porque."
      ],
      "solution": [
        "She prefers to stay home because it is raining.",
        "This does not mean she dislikes the park; the first clause says she likes it."
      ],
      "successCriteria": [
        "Rain as reason",
        "Preference limited to today",
        "Contrast preserved"
      ]
    },
    {
      "id": "spa-reading-comprehension-3",
      "difficulty": "Advanced",
      "command": "Analyse",
      "marks": 6,
      "prompt": "Original fictional email: “Gracias por invitarme. Llegaré después de la clase.” Identify the stated plan and one detail the email does not establish. Answer in English.",
      "hints": [
        "Distinguish sequence from exact timing."
      ],
      "solution": [
        "The writer plans to arrive after the class.",
        "The exact arrival time is not given.",
        "The text also does not establish how long the class lasts."
      ],
      "successCriteria": [
        "Supported plan",
        "One genuine unknown",
        "No invented timing"
      ]
    }
  ],
  "checklist": [
    "I answer the exact question.",
    "I quote or paraphrase evidence.",
    "I check negative words.",
    "I avoid unstated details."
  ],
  "sourceIds": [
    "spanish-cefr"
  ]
}),
  spanish({
  "id": "myp5-spanish-listening-strategies",
  "topic": "Listening strategies",
  "prerequisiteIds": [
    "myp5-spanish-present-tense"
  ],
  "summary": "Plan gist and detail listening, track corrections and distinguish transcript rehearsal from an actual audio assessment.",
  "objectives": [
    "Prepare a listening focus.",
    "Track negation and corrected details.",
    "Use a repeat listening for a specific uncertainty."
  ],
  "explanation": [
    "Before listening, identify the information you need: a destination, reason, time or attitude. On a first hearing, focus on the main message rather than trying to write every word. A later hearing can test a specific detail. Note changes such as no..., sino... or a speaker correcting a time. The final confirmed information may differ from the first number mentioned.",
    "This page contains original scripts and transcript-based strategy exercises, not playable recordings. For a listening rehearsal, a partner or teacher can read a script naturally while the learner looks away, then repeat it for a stated detail. Reading the visible script alone is not evidence of listening ability. In an actual assessment, follow its rules about repetitions and notes. The model answers here show how to interpret the supplied words; they do not assess pronunciation recognition, accent familiarity or listening fluency."
  ],
  "keyIdeas": [
    "Choose a focus before listening.",
    "Track corrections rather than isolated words.",
    "A visible transcript is not an audio test."
  ],
  "definitions": [
    {
      "term": "Comprensión global",
      "meaning": "Understanding the overall message."
    },
    {
      "term": "Escucha selectiva",
      "meaning": "Listening for a particular required detail."
    },
    {
      "term": "Rectificación",
      "meaning": "A correction that replaces earlier information."
    }
  ],
  "method": [
    "Read the question and predict the type of information needed.",
    "Listen for the main message.",
    "Use an allowed repeat to resolve a specific detail.",
    "Check corrections and distinguish certainty from guesses."
  ],
  "workedExample": {
    "prompt": "Original script for partner read-aloud: “El autobús sale a las tres... perdón, a las tres y media.” What departure time is finally given? The visible script is rehearsal support, not an audio test.",
    "steps": [
      "The first time is three o’clock.",
      "Perdón signals a correction.",
      "The corrected time is las tres y media, half past three."
    ],
    "conclusion": "The final departure time is 3:30. A learner using only the printed script has practised interpretation, not demonstrated listening proficiency."
  },
  "misconceptions": [
    {
      "mistake": "Keeping the first number despite a correction.",
      "correction": "Listen through the correction and record the confirmed detail."
    },
    {
      "mistake": "Calling a correct transcript answer proof of listening fluency.",
      "correction": "Use an actual listening task to assess auditory comprehension."
    }
  ],
  "practice": [
    {
      "id": "spa-listening-strategies-1",
      "difficulty": "Foundation",
      "command": "Identify",
      "marks": 3,
      "prompt": "Transcript-based strategy exercise, not an audio test: “El club no se reúne el martes, sino el jueves.” Which day is confirmed? Answer in English.",
      "hints": [
        "Sino replaces the rejected option."
      ],
      "solution": [
        "Thursday is confirmed; Tuesday is rejected."
      ],
      "successCriteria": [
        "Thursday",
        "Negation and replacement"
      ]
    },
    {
      "id": "spa-listening-strategies-2",
      "difficulty": "Standard",
      "command": "Explain",
      "marks": 5,
      "prompt": "For a partner-read fictional announcement, you understand the destination but are unsure of the departure time. State a specific goal for an allowed second listening.",
      "hints": [
        "Target the unresolved information."
      ],
      "solution": [
        "Listen for the departure-time expression and any correction following it.",
        "Keep the already understood destination as a working note, but verify it if the repeat contradicts it."
      ],
      "successCriteria": [
        "Specific detail focus",
        "Correction strategy"
      ]
    },
    {
      "id": "spa-listening-strategies-3",
      "difficulty": "Advanced",
      "command": "Plan",
      "marks": 6,
      "prompt": "Plan a two-pass listening rehearsal using an original short travel script and a partner. Explain how to avoid turning it into a reading task.",
      "hints": [
        "Separate the learner from the visible script."
      ],
      "solution": [
        "The partner reads while the learner looks away; the first pass targets the overall journey or message.",
        "The second pass targets the required time or place and any correction.",
        "Compare with the transcript afterwards; follow actual assessment rules when practising for a specific test."
      ],
      "successCriteria": [
        "Script hidden during hearing",
        "Distinct pass goals",
        "Post-listening check and scope"
      ]
    }
  ],
  "checklist": [
    "I choose a listening goal.",
    "I track corrections.",
    "I use repeats deliberately.",
    "I distinguish reading from listening evidence."
  ],
  "sourceIds": [
    "spanish-cefr"
  ]
}),
  spanish({
  "id": "myp5-spanish-writing-structures",
  "topic": "Writing structures",
  "prerequisiteIds": [
    "myp5-spanish-connectors"
  ],
  "summary": "Organise a short Spanish message around audience, purpose and required content, then revise language and coherence.",
  "objectives": [
    "Match a message to its audience.",
    "Organise required details clearly.",
    "Revise agreement, verbs and punctuation."
  ],
  "explanation": [
    "A short message needs an identifiable purpose and the information its reader needs. An informal invitation can greet a friend, propose an activity, give a time and ask for a reply. A formal enquiry uses a more formal greeting and consistent usted forms where direct address is needed. The same memorised paragraph will not fit every task; use the prompt to choose content and register.",
    "Plan before writing, then revise in separate passes. First check whether all requested points are answered and whether the sequence makes sense. Next check verb forms, noun-adjective agreement, accents and opening question marks. Model texts are examples rather than compulsory scripts. A different greeting or closing may be suitable in another Spanish-speaking context, provided the relationship and purpose remain coherent. These tasks use fictional recipients, so no real personal information or message sending is required."
  ],
  "keyIdeas": [
    "Purpose determines content.",
    "Register should remain consistent.",
    "Content review and language review serve different checks."
  ],
  "definitions": [
    {
      "term": "Destinatario",
      "meaning": "The intended recipient or reader."
    },
    {
      "term": "Saludo",
      "meaning": "A greeting opening a message."
    },
    {
      "term": "Despedida",
      "meaning": "A closing expression suited to the relationship and message."
    }
  ],
  "method": [
    "Identify audience, purpose and required points.",
    "Plan the order of information.",
    "Draft linked sentences in a consistent register.",
    "Review task coverage, grammar and punctuation."
  ],
  "workedExample": {
    "prompt": "Original task: write an informal invitation to fictional friend Ana to visit the park tomorrow at four and ask for a reply.",
    "steps": [
      "Greeting and plan: Hola, Ana: ¿Quieres ir al parque mañana?",
      "Time: Podemos quedar a las cuatro.",
      "Reply request and closing: ¿Puedes confirmarlo? Un abrazo, Leo."
    ],
    "conclusion": "The invitation gives activity, day, time and a reply request. Other natural informal wording is valid."
  },
  "misconceptions": [
    {
      "mistake": "Using a memorised text that misses a required point.",
      "correction": "Check the prompt against the finished message."
    },
    {
      "mistake": "Switching between informal and formal address without a reason.",
      "correction": "Choose forms suited to the intended relationship."
    }
  ],
  "practice": [
    {
      "id": "spa-writing-structures-1",
      "difficulty": "Foundation",
      "command": "Organise",
      "marks": 3,
      "prompt": "Order these parts of a fictional invitation: closing; greeting; activity and time; request for a reply.",
      "hints": [
        "Start by addressing the reader."
      ],
      "solution": [
        "Greeting; activity and time; request for a reply; closing.",
        "Another order can work if the message remains natural and complete, but this is a clear default."
      ],
      "successCriteria": [
        "Coherent sequence",
        "All parts retained"
      ]
    },
    {
      "id": "spa-writing-structures-2",
      "difficulty": "Standard",
      "command": "Correct",
      "marks": 5,
      "prompt": "Correct the original sentence “Hola Ana quieres venir manana?” with appropriate Spanish greeting and question punctuation and correct manana to mañana using ñ.",
      "hints": [
        "Use a greeting boundary, opening question mark and mañana."
      ],
      "solution": [
        "Hola, Ana: ¿Quieres venir mañana?",
        "Hola, Ana. ¿Quieres venir mañana? is also valid."
      ],
      "successCriteria": [
        "Vocative comma",
        "Paired question marks",
        "Mañana"
      ]
    },
    {
      "id": "spa-writing-structures-3",
      "difficulty": "Advanced",
      "command": "Produce",
      "marks": 6,
      "prompt": "Write a short formal Spanish enquiry to a fictional museum asking its opening time and whether booking is necessary. Include a suitable greeting and closing.",
      "hints": [
        "Use two clear questions; the museum name is unnecessary."
      ],
      "solution": [
        "Possible response: Estimado equipo del museo: ¿A qué hora abre el museo? ¿Es necesario reservar? Muchas gracias por su ayuda. Atentamente, Alex.",
        "Other consistent formal greetings and closings are valid."
      ],
      "successCriteria": [
        "Opening-time question",
        "Booking question",
        "Consistent formal structure"
      ]
    }
  ],
  "checklist": [
    "I cover every required point.",
    "I suit the audience.",
    "I link ideas clearly.",
    "I proofread accents and punctuation."
  ],
  "sourceIds": [
    "spanish-agreement",
    "spanish-accents", "spanish-conjugation"
  ]
}),
  spanish({
  "id": "myp5-spanish-idiomatic-language",
  "topic": "Idiomatic language",
  "prerequisiteIds": [
    "myp5-spanish-high-frequency-verbs"
  ],
  "summary": "Interpret selected Spanish expressions in context and choose natural equivalents instead of literal word-for-word translations.",
  "objectives": [
    "Recognise a non-literal expression.",
    "Explain two selected idioms accurately.",
    "Choose wording suited to context and register."
  ],
  "explanation": [
    "An idiomatic expression can have a meaning that cannot be recovered by translating each word separately. Echar una mano commonly means to help someone, not to throw a hand. In a classroom request, ¿Me echas una mano? can mean Can you give me a hand? The English expression is also non-literal. A neutral paraphrase such as ¿Puedes ayudarme? can preserve the practical meaning.",
    "Estar en las nubes can describe someone who is distracted or daydreaming. Do not confuse it with estar por las nubes, which can describe a very high price. Context decides whether a phrase is literal or figurative and whether it suits the relationship. These selected expressions are not a requirement to fill every answer with idioms. Accurate ordinary language is preferable when an expression’s meaning or register is uncertain; valid regional alternatives should be explained in context."
  ],
  "keyIdeas": [
    "Translate the intended meaning.",
    "Small preposition changes can change an expression.",
    "Use idioms only when context supports them."
  ],
  "definitions": [
    {
      "term": "Locución",
      "meaning": "A conventional multiword expression functioning as a unit."
    },
    {
      "term": "Echar una mano",
      "meaning": "To help someone in the uses practised here."
    },
    {
      "term": "Estar en las nubes",
      "meaning": "To be distracted or daydreaming in the figurative use practised here."
    }
  ],
  "method": [
    "Read the complete context.",
    "Check whether a literal meaning fits.",
    "Identify the conventional meaning and register.",
    "Choose a natural paraphrase or equivalent."
  ],
  "workedExample": {
    "prompt": "Original fictional classroom exchange: “No entiendo este ejercicio. ¿Me echas una mano?” Explain the request in English.",
    "steps": [
      "The speaker says they do not understand the exercise.",
      "Echar una mano asks for help in this context.",
      "A natural translation is I do not understand this exercise. Can you give me a hand?"
    ],
    "conclusion": "The request is for assistance, not a physical hand. Can you help me? also preserves the meaning."
  },
  "misconceptions": [
    {
      "mistake": "Translating every word literally.",
      "correction": "Use context and the expression’s conventional meaning."
    },
    {
      "mistake": "Confusing en las nubes with por las nubes.",
      "correction": "Check the preposition and what the expression describes."
    }
  ],
  "practice": [
    {
      "id": "spa-idiomatic-language-1",
      "difficulty": "Foundation",
      "command": "Paraphrase",
      "marks": 3,
      "prompt": "Paraphrase “¿Me echas una mano?” in neutral Spanish.",
      "hints": [
        "Use ayudar."
      ],
      "solution": [
        "¿Puedes ayudarme?",
        "¿Me ayudas? is also suitable in many informal contexts."
      ],
      "successCriteria": [
        "Request for help",
        "Natural Spanish"
      ]
    },
    {
      "id": "spa-idiomatic-language-2",
      "difficulty": "Standard",
      "command": "Interpret",
      "marks": 5,
      "prompt": "Original fictional context: “Pablo no oyó la pregunta; estaba en las nubes.” Explain the idiom in English without diagnosing a health condition.",
      "hints": [
        "Use the figurative meaning supported by the sentence."
      ],
      "solution": [
        "He was distracted or daydreaming. The sentence also says he did not hear the question.",
        "The sentence does not establish a medical condition."
      ],
      "successCriteria": [
        "Distracted/daydreaming meaning",
        "No literal cloud claim",
        "No diagnosis"
      ]
    },
    {
      "id": "spa-idiomatic-language-3",
      "difficulty": "Advanced",
      "command": "Compare",
      "marks": 6,
      "prompt": "Explain the difference between these original sentences: “Ana está en las nubes” and “Los precios están por las nubes.”",
      "hints": [
        "Compare both the subject and the preposition."
      ],
      "solution": [
        "Ana is distracted or daydreaming in the figurative reading.",
        "The prices are very high.",
        "En and por are part of different expressions here; translating both the same way loses meaning."
      ],
      "successCriteria": [
        "Both meanings",
        "Preposition distinction",
        "Natural correspondence"
      ]
    }
  ],
  "checklist": [
    "I read the context.",
    "I check the expression.",
    "I preserve the intended meaning.",
    "I avoid forced idioms."
  ],
  "sourceIds": [
    "spanish-mano",
    "spanish-nube"
  ]
}),
  spanish({
  "id": "myp5-spanish-exam-strategies",
  "topic": "Exam strategies",
  "prerequisiteIds": [
    "myp5-spanish-reading-comprehension",
    "myp5-spanish-writing-structures",
    "myp5-spanish-listening-strategies"
  ],
  "summary": "Plan and review a Spanish practice task using its actual instructions rather than an invented universal exam formula.",
  "objectives": [
    "Identify task requirements and allowed resources.",
    "Allocate a hypothetical practice period.",
    "Review meaning before polishing language."
  ],
  "explanation": [
    "Start with the actual task: identify audience, purpose, required points, response language and any word or time limit. Follow the rules supplied by your teacher or assessment provider about dictionaries, notes and repeated listening. MYP year alone does not determine a learner’s language phase or the format of every school assessment. The timing examples here are hypothetical practice plans, not official exam requirements.",
    "Allocate time for planning, drafting and checking in proportion to the task. In review, first check whether you answered the question and preserved any source information. Then check tense, agreement, accents and punctuation. A few accurate connectors can clarify a response; forced complexity can obscure it. Rehearsing a strategy is useful, but completing a practice task does not prove a CEFR level or guarantee a mark. Model responses illustrate criteria rather than replace your teacher’s assessment guidance."
  ],
  "keyIdeas": [
    "Read the actual task rules.",
    "Review content before surface detail.",
    "A practice plan is not an official exam format."
  ],
  "definitions": [
    {
      "term": "Consigna",
      "meaning": "The instruction specifying what a task requires."
    },
    {
      "term": "Planificación",
      "meaning": "Preparation of content and structure before drafting."
    },
    {
      "term": "Revisión",
      "meaning": "Checking and improving a response against the task and language requirements."
    }
  ],
  "method": [
    "Extract required content, audience and constraints.",
    "Set a feasible practice plan.",
    "Draft a response focused on the task.",
    "Check coverage, meaning, grammar and punctuation."
  ],
  "workedExample": {
    "prompt": "Hypothetical 40-minute writing practice: allocate 5 minutes to planning, 28 to drafting and 7 to reviewing. Check the total and explain the review order.",
    "steps": [
      "The allocations total 5 + 28 + 7 = 40 minutes.",
      "First check required points, audience and meaning.",
      "Then check verbs, agreement, accents and punctuation."
    ],
    "conclusion": "The plan fits this practice period. Adjust it to the actual task; it is not an official timing rule."
  },
  "misconceptions": [
    {
      "mistake": "Assuming every exam uses the same timing or word limit.",
      "correction": "Read the specific instructions."
    },
    {
      "mistake": "Polishing grammar while leaving a required point unanswered.",
      "correction": "Check content coverage first."
    }
  ],
  "practice": [
    {
      "id": "spa-exam-strategies-1",
      "difficulty": "Foundation",
      "command": "Identify",
      "marks": 3,
      "prompt": "Original fictional task: “Write an informal email inviting a friend to a club. Include the day, time and one reason to join.” List the required content and register.",
      "hints": [
        "Separate content from format."
      ],
      "solution": [
        "Informal email to a friend.",
        "An invitation including the day, time and one reason to join."
      ],
      "successCriteria": [
        "Informal audience/format",
        "All three content points"
      ]
    },
    {
      "id": "spa-exam-strategies-2",
      "difficulty": "Standard",
      "command": "Revise",
      "marks": 5,
      "prompt": "Task: write an informal email inviting a friend to a club, including the day, time and one reason to join. A fictional response says “Hola, Ana: Ven al club el jueves. Es divertido. Un abrazo, Leo.” Identify the missing required detail and supply a suitable Spanish addition.",
      "hints": [
        "Which practical detail is absent?"
      ],
      "solution": [
        "The time is missing.",
        "Possible addition: La reunión empieza a las cinco.",
        "Other consistent meeting times are valid."
      ],
      "successCriteria": [
        "Time identified",
        "Accurate Spanish addition"
      ]
    },
    {
      "id": "spa-exam-strategies-3",
      "difficulty": "Advanced",
      "command": "Plan",
      "marks": 6,
      "prompt": "For a hypothetical 30-minute writing practice, propose planning, drafting and checking times that total 30 minutes, and name two checks.",
      "hints": [
        "Use a plan, not an asserted official rule."
      ],
      "solution": [
        "Possible plan: 4 minutes planning, 21 drafting and 5 checking; total 30 minutes.",
        "Check every required content point, then check verb forms and agreement.",
        "Other workable allocations totalling 30 minutes are valid."
      ],
      "successCriteria": [
        "Total 30 minutes",
        "All three stages",
        "Two relevant checks",
        "Practice scope"
      ]
    }
  ],
  "checklist": [
    "I read the actual rules.",
    "I plan within the time available.",
    "I check task coverage.",
    "I revise meaning and language."
  ],
  "sourceIds": [
    "spanish-cefr"
  ]
}),
];
