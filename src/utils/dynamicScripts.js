import { callClaude } from './claudeApi';

// Base scripts for each slide (used as template)
const BASE_SCRIPTS = {
  dashboard: `Listen up team. We need a mindset shift. We don't eat just to get full. We eat to build the machine. Your muscles and brain are like teams of tiny builders. Protein gives them the blocks they need. Enter your weight and I'll calculate exactly how much protein you need at 1.6 grams per kilogram. Then build your day to hit that goal!`,

  protein: `Welcome to the Balanced Fuel Protocol. Every cell in your body contains protein. Muscles use it to repair, and your brain uses it for focus chemicals. But you also need carbs for energy! Hit 30 grams of protein AND at least 20 grams of carbs. Watch your limits though. Too much fat slows you down, and too many calories overloads the system. Greek yogurt has 17 grams of protein, nearly double regular yogurt. Try combining foods for a balanced meal.`,

  creatine: `Time for the Math Speed Challenge! Vegetarians have about 80 percent creatine in their brain battery. Let's test your speed at 80 percent first. Then we'll top off your tank with creatine and try again. Watch how having a full battery gives you more thinking time. Five grams daily is the research-backed dose for memory and math performance.`,

  sugar: `I want to teach you how your body works. Insulin is a key that opens your cells to let energy in. When blood sugar rises fast, your pancreas releases insulin. But sugar jams the lock! Candy spikes then crashes your blood sugar. That crash is called The Bonk. Keep sugar under 25 grams daily, that's just 6 teaspoons. Choose steady fuel like protein and fiber to avoid the crash.`,

  strategy: `Time for the final mission! To equip each habit, you'll need to answer a question about what you've learned. Think back to the previous missions. Power Smoothie gives us protein and hidden greens. Greek Yogurt is packed with high quality protein. Creatine tops off your brain battery. And 60 minutes of activity tells your body to grow stronger. Answer correctly to unlock each habit and complete the protocol!`
};

// System prompt for dynamic script generation
const SCRIPT_SYSTEM_PROMPT = `You are Coach, a friendly nutrition expert for kids. Your job is to personalize lesson scripts based on what the user has already entered/accomplished.

RULES:
1. Keep the same tone and core message as the base script
2. Personalize with the user's name and data when available
3. Reference their progress/achievements where relevant
4. Keep it SHORT - same length or shorter than original (2-4 sentences max)
5. Be encouraging but not over the top
6. Use simple language appropriate for kids
7. IMPORTANT: Return ONLY the personalized script text, nothing else
8. If there's no personalization data, return the base script with minor variation`;

/**
 * Generate a personalized script for a slide based on user context
 */
export async function generateDynamicScript(slideKey, userState) {
  const baseScript = BASE_SCRIPTS[slideKey];
  if (!baseScript) return baseScript;

  // Build context from user state
  const context = buildContext(slideKey, userState);

  // If no meaningful context, return base script
  if (!context) {
    return baseScript;
  }

  try {
    const response = await callClaude({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      system: SCRIPT_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Base script: "${baseScript}"

User context:
${context}

Generate a personalized version of this script that incorporates the user's data. Keep the same educational content but make it personal.`
      }]
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Dynamic script generation failed:', error);
    return baseScript; // Fallback to base script
  }
}

/**
 * Build context string based on slide and user state
 */
function buildContext(slideKey, userState) {
  const parts = [];

  // Always include name if available
  if (userState.userName) {
    parts.push(`User's name: ${userState.userName}`);
  }

  switch (slideKey) {
    case 'dashboard':
      // For dashboard, just use name since this is the first slide
      break;

    case 'protein':
      if (userState.weightLbs) {
        parts.push(`Weight: ${userState.weightLbs} lbs (${userState.weightKg?.toFixed(1)} kg)`);
        parts.push(`Daily protein target: ${userState.proteinTarget}g`);
      }
      if (userState.dashboardFoods?.length > 0) {
        const foodNames = userState.dashboardFoods.map(f => f.name).join(', ');
        parts.push(`Foods they added in Mission 1: ${foodNames}`);
        parts.push(`Current protein intake: ${userState.dashboardTotals?.protein || 0}g`);
      }
      break;

    case 'creatine':
      if (userState.proteinTarget) {
        parts.push(`Their protein target is ${userState.proteinTarget}g`);
      }
      if (userState.proteinMealMacros?.p > 0) {
        parts.push(`In Mission 2, they built a meal with ${userState.proteinMealMacros.p}g protein`);
      }
      break;

    case 'sugar':
      if (userState.creatineState?.round100Score) {
        const score80 = userState.creatineState.round80Score?.correct || 0;
        const score100 = userState.creatineState.round100Score.correct;
        parts.push(`In the math challenge, they scored ${score80}/5 at 80% battery and ${score100}/5 at 100% battery`);
        if (score100 > score80) {
          parts.push(`They improved by ${score100 - score80} correct answers with full creatine!`);
        }
      }
      break;

    case 'strategy':
      if (userState.dashboardTotals?.protein > 0) {
        parts.push(`Total protein logged today: ${userState.dashboardTotals.protein}g`);
      }
      if (userState.sugarFoods?.length > 0) {
        const sugarFoodNames = userState.sugarFoods.map(f => f.name).join(', ');
        parts.push(`Sugar lesson foods: ${sugarFoodNames}`);
      }
      // Summary of progress
      const completed = Object.entries(userState.slideCompletion || {})
        .filter(([_, v]) => v)
        .map(([k]) => k);
      if (completed.length > 0) {
        parts.push(`Completed missions: ${completed.join(', ')}`);
      }
      break;
  }

  return parts.length > 0 ? parts.join('\n') : null;
}

/**
 * Get base script for a slide (for fallback)
 */
export function getBaseScript(slideKey) {
  return BASE_SCRIPTS[slideKey] || '';
}
