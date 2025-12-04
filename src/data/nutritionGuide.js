/**
 * Nutrition Guide Data for Claude Reference
 * Teaching Kids Nutrition: A Vegetarian Family Guide
 * For children ages 9, 12, and 14
 */

export const NUTRITION_GUIDE = {
  // Protein Requirements
  protein: {
    targetPerKg: 1.6, // grams per kg body weight (recommended for active kids)
    minimumPerKg: 1.2, // floor for general health
    optimalPerKg: 1.4, // daily target for active kids
    bufferPerKg: 1.7, // if yesterday's intake was low

    // Quick reference by weight
    byWeight: [
      { lbs: 60, kg: 27, min: 32, optimal: 38, recommended: 46 },
      { lbs: 80, kg: 36, min: 43, optimal: 50, recommended: 61 },
      { lbs: 100, kg: 45, min: 54, optimal: 63, recommended: 77 },
      { lbs: 120, kg: 54, min: 65, optimal: 76, recommended: 92 },
      { lbs: 140, kg: 64, min: 77, optimal: 90, recommended: 109 },
    ],

    // Best vegetarian sources
    sources: {
      complete: [
        { name: 'Eggs', protein: 6, note: 'Gold standard, excellent choline source' },
        { name: 'Greek Yogurt (6oz)', protein: 17, note: 'Nearly double regular yogurt' },
        { name: 'Milk (1 cup)', protein: 8, note: 'Complete protein' },
        { name: 'Cottage Cheese (1 cup)', protein: 28, note: 'Highest dairy protein' },
        { name: 'Tofu (1/2 cup)', protein: 10, note: 'Complete soy protein' },
        { name: 'Tempeh (1/2 cup)', protein: 15, note: 'Fermented, better absorption' },
        { name: 'Edamame (1 cup)', protein: 17, note: 'Complete protein snack' },
        { name: 'Quinoa (1 cup cooked)', protein: 8, note: 'Complete plant protein' },
      ],
      incomplete: [
        { name: 'Lentils (1 cup)', protein: 18, note: 'Combine with grains' },
        { name: 'Black Beans (1 cup)', protein: 15, note: 'Combine with rice' },
        { name: 'Chickpeas (1 cup)', protein: 15, note: 'Great in hummus' },
        { name: 'Peanut Butter (2 tbsp)', protein: 8, note: 'Combine with bread' },
        { name: 'Almonds (1/4 cup)', protein: 6, note: 'Good snack' },
      ],
    },

    // Bioavailability note
    vegetarianNote: 'Plant proteins have 10-20% lower bioavailability. Targets already account for this.',
  },

  // Blood Sugar Management
  bloodSugar: {
    sugarLimitGrams: 25, // AHA recommendation for kids
    carbOverloadThreshold: 100, // grams per meal triggers warning

    glycemicImpact: {
      high: ['Candy', 'Soda', 'White bread', 'Cornflakes', 'Pretzels', 'Fruit juice'],
      medium: ['Whole wheat bread', 'Brown rice', 'Banana', 'Oatmeal'],
      low: ['Legumes', 'Most vegetables', 'Nuts', 'Greek yogurt', 'Apples', 'Berries'],
    },

    insulinExplanation: {
      simple: 'Insulin is a key that opens cells to let energy in. Sugar jams the lock.',
      detailed: 'When blood sugar rises, pancreas releases insulin. Rapid spikes cause crash cycle.',
    },

    theBonk: 'Energy crash caused by blood sugar spike followed by insulin overcorrection.',
  },

  // Creatine for Vegetarians
  creatine: {
    vegetarianDeficit: '10-20% lower muscle creatine than omnivores',
    dietaryIntake: {
      vegetarian: 0.03, // g/day
      omnivore: 1.34, // g/day
    },
    bodyProduction: 1, // g/day synthesized from amino acids

    benefits: [
      'Improved memory (vegetarians show greater gains than meat-eaters)',
      'Better working memory and fluid intelligence',
      'Enhanced attention and information processing',
      'Brain energy support (brain uses 20% of body energy)',
    ],

    dosing: {
      maintenance: '3-5g daily',
      childConservative: '1-3g daily',
      byWeight: {
        50: 1.5, // kg: grams/day
        70: 2.1,
      },
    },

    safety: 'FDA classified as GRAS. No adverse effects in pediatric studies up to 3 years.',
  },

  // Exercise Guidelines
  exercise: {
    dailyMinutes: 60, // moderate-to-vigorous
    weeklyRequirements: {
      vigorousAerobic: 3, // days per week
      muscleStrengthening: 3,
      boneStrengthening: 3,
    },

    talkTest: {
      moderate: 'Breathing faster but able to talk',
      vigorous: 'Hard breathing, difficulty maintaining conversation',
    },

    resistanceTraining: {
      safe: true,
      noMinimumAge: true,
      prepubescentGains: '30-50% strength improvement in 8-12 weeks (neural, not muscle)',
      mythDebunked: 'Does NOT stunt growth or damage growth plates',
    },
  },

  // Age-Appropriate Explanations
  talkingPoints: {
    age9: {
      protein: 'Your muscles and brain are like teams of tiny builders. Protein gives them the blocks they need.',
      exercise: 'When you run and play, muscles ask for help. While you sleep, your body sends building blocks.',
      carbs: 'Food is like fuel. Some burns fast and runs out (tired/cranky). Others burn slowly all day.',
      newFoods: 'Your tongue is learning! It takes 10-15 tries before deciding it likes something.',
    },
    age12: {
      protein: 'Every cell contains protein. Muscles use it to repair, brain uses it for focus chemicals.',
      creatine: 'Brain uses 20% of energy. Creatine helps brain cells regenerate energy faster.',
      bloodSugar: 'Candy spikes then crashes blood sugar. Complex carbs release energy gradually.',
      adaptation: 'Exercise creates stress that tells body to rebuild stronger. Growth happens during recovery.',
    },
    age14: {
      proteinSynthesis: 'Exercise creates microscopic muscle tears. During sleep, growth hormone + protein repairs them stronger.',
      vegetarianNutrition: 'Plant proteins have lower bioavailability. Eat 10-20% more and combine sources.',
      brainChemistry: 'Neurotransmitters built from amino acids. Choline becomes acetylcholine for attention.',
      metabolicHealth: 'High-sugar foods cause insulin resistance over time. Reducing sugar improves markers in 9 days.',
    },
  },

  // Picky Eater Strategies
  pickyEaters: {
    exposuresNeeded: '8-15+ times before acceptance',
    parentMistake: 'Most give up after 3-5 attempts',

    strategies: [
      'Each exposure counts - even touching or smelling',
      'Pressure backfires - creates fussier eaters by age 6',
      'Dips increase acceptance by 80% for bitter foods',
      'Cooking together increases willingness to try',
      'Peer influence is stronger than parent modeling',
    ],

    smoothieProgression: [
      'Start fruit-only with familiar favorites',
      'Add spinach/cauliflower after 1-2 weeks (undetectable)',
      'Frozen veggies taste milder',
      'Let kids choose fruits and press blender',
      'Add protein only after base is accepted',
    ],
  },

  // Key Metrics Summary
  summary: {
    proteinAges9to13: '34g minimum; 1.0-1.5g/kg for active',
    proteinAge14: '46-52g; more for athletes',
    sugarLimit: '25g (6 teaspoons) daily max',
    physicalActivity: '60+ minutes moderate-to-vigorous daily',
    strengthTraining: 'At least 3 days per week',
    creatineMaintenance: '1-3g daily if supplementing',
    newFoodExposures: '10-15 times before acceptance',
    fiber: '26-31g daily for ages 9-13',
    carbsTarget: '45-65% of calories',
  },
};

export default NUTRITION_GUIDE;
