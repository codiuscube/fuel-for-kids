import React, { createContext, useContext, useState, useCallback } from 'react';

const UserContext = createContext();

/**
 * UserProvider - Tracks user inputs across the app for personalized Q&A
 */
export const UserProvider = ({ children }) => {
  const [userState, setUserState] = useState({
    // User info
    userName: '',

    // Dashboard state
    weightLbs: null,
    weightKg: null,
    proteinTarget: null,
    dashboardFoods: [],
    dashboardTotals: { calories: 0, protein: 0, carbs: 0 },

    // Protein slide state
    proteinMealMacros: { p: 0, f: 0, c: 0, cal: 0 },

    // Sugar slide state
    sugarFoods: [],

    // Creatine slide state
    creatineState: {
      batteryLevel: 80,
      creatineGrams: 0,
      round80Score: null,
      round100Score: null,
    },

    // Strategy slide state
    equippedHabits: [],
    habitQuizAnswers: {}, // { smoothie: 'answer', yogurt: 'answer', ... }

    // Slide completion tracking
    slideCompletion: {
      dashboard: false,
      protein: false,
      creatine: false,
      sugar: false,
      strategy: false,
    },
  });

  // Update specific parts of state
  const updateUserName = useCallback((name) => {
    setUserState(prev => ({
      ...prev,
      userName: name,
    }));
  }, []);

  const updateSlideCompletion = useCallback((slide, completed) => {
    setUserState(prev => ({
      ...prev,
      slideCompletion: {
        ...prev.slideCompletion,
        [slide]: completed,
      },
    }));
  }, []);

  const updateHabitQuizAnswer = useCallback((habit, answer) => {
    setUserState(prev => ({
      ...prev,
      habitQuizAnswers: {
        ...prev.habitQuizAnswers,
        [habit]: answer,
      },
    }));
  }, []);

  const updateDashboard = useCallback((data) => {
    setUserState(prev => ({
      ...prev,
      weightLbs: data.weightLbs ?? prev.weightLbs,
      weightKg: data.weightKg ?? prev.weightKg,
      proteinTarget: data.proteinTarget ?? prev.proteinTarget,
      dashboardFoods: data.foods ?? prev.dashboardFoods,
      dashboardTotals: data.totals ?? prev.dashboardTotals,
    }));
  }, []);

  const updateProteinMeal = useCallback((macros) => {
    setUserState(prev => ({
      ...prev,
      proteinMealMacros: macros,
    }));
  }, []);

  const updateSugarFoods = useCallback((foods) => {
    setUserState(prev => ({
      ...prev,
      sugarFoods: foods,
    }));
  }, []);

  const updateHabits = useCallback((habits) => {
    setUserState(prev => ({
      ...prev,
      equippedHabits: habits,
    }));
  }, []);

  const updateCreatine = useCallback((data) => {
    setUserState(prev => ({
      ...prev,
      creatineState: {
        ...prev.creatineState,
        ...data,
      },
    }));
  }, []);

  // Generate a summary string for the AI prompt
  const getStateSummary = useCallback(() => {
    const parts = [];

    if (userState.userName) {
      parts.push(`User's name: ${userState.userName}`);
    }

    if (userState.weightLbs) {
      parts.push(`User's weight: ${userState.weightLbs} lbs (${userState.weightKg?.toFixed(1)} kg)`);
      parts.push(`Calculated protein target: ${userState.proteinTarget}g daily`);
    }

    if (userState.dashboardFoods.length > 0) {
      const foodNames = userState.dashboardFoods.map(f => f.name).join(', ');
      parts.push(`Foods added today: ${foodNames}`);
      parts.push(`Current totals: ${userState.dashboardTotals.calories} calories, ${userState.dashboardTotals.protein}g protein, ${userState.dashboardTotals.carbs}g carbs`);

      if (userState.proteinTarget) {
        const remaining = userState.proteinTarget - userState.dashboardTotals.protein;
        if (remaining > 0) {
          parts.push(`Still needs ${remaining}g more protein to hit goal`);
        } else {
          parts.push(`Protein goal achieved!`);
        }
      }
    }

    if (userState.proteinMealMacros.cal > 0) {
      const m = userState.proteinMealMacros;
      parts.push(`Current meal builder: ${m.p}g protein, ${m.f}g fat, ${m.c}g carbs, ${m.cal} calories`);
    }

    if (userState.sugarFoods.length > 0) {
      const sugarFoodNames = userState.sugarFoods.map(f => f.name).join(', ');
      const sugarCount = userState.sugarFoods.filter(f => f.category === 'sugar').length;
      parts.push(`Sugar slide foods: ${sugarFoodNames}`);
      if (sugarCount >= 2) {
        parts.push(`Warning: ${sugarCount} high-sugar items selected - risk of blood sugar crash!`);
      }
    }

    if (userState.creatineState?.creatineGrams > 0) {
      parts.push(`Creatine dose: ${userState.creatineState.creatineGrams}g (battery at ${userState.creatineState.batteryLevel}%)`);

      if (userState.creatineState.round80Score) {
        parts.push(`Math challenge at 80% battery: ${userState.creatineState.round80Score.correct}/5 correct`);
      }
      if (userState.creatineState.round100Score) {
        parts.push(`Math challenge at 100% battery: ${userState.creatineState.round100Score.correct}/5 correct`);
        if (userState.creatineState.round80Score) {
          const improvement = userState.creatineState.round100Score.correct - userState.creatineState.round80Score.correct;
          if (improvement > 0) {
            parts.push(`Improvement with creatine: +${improvement} correct answers!`);
          }
        }
      }
    }

    if (userState.equippedHabits.length > 0) {
      parts.push(`Equipped habits: ${userState.equippedHabits.join(', ')}`);
      if (userState.equippedHabits.length === 4) {
        parts.push(`All habits equipped - mission ready!`);
      }
    }

    return parts.length > 0 ? parts.join('\n') : 'No user data entered yet.';
  }, [userState]);

  return (
    <UserContext.Provider value={{
      userState,
      updateUserName,
      updateSlideCompletion,
      updateHabitQuizAnswer,
      updateDashboard,
      updateProteinMeal,
      updateSugarFoods,
      updateHabits,
      updateCreatine,
      getStateSummary,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
