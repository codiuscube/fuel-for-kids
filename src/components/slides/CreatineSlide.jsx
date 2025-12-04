import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, Play, RotateCcw, Brain, Trophy } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { useUserContext } from '../../context/UserContext';

const PROBLEMS_PER_ROUND = 5;
const BASE_TIME_80 = 3000; // 3 seconds at 80%
const BASE_TIME_100 = 5000; // 5 seconds at 100%

/**
 * Generate a random math problem (addition or subtraction)
 */
const generateProblem = () => {
  const isAddition = Math.random() > 0.5;
  let num1, num2, answer;

  if (isAddition) {
    num1 = Math.floor(Math.random() * 15) + 3; // 3-17
    num2 = Math.floor(Math.random() * 12) + 2; // 2-13
    answer = num1 + num2;
  } else {
    num1 = Math.floor(Math.random() * 15) + 8; // 8-22
    num2 = Math.floor(Math.random() * (num1 - 2)) + 1; // Ensure positive result
    answer = num1 - num2;
  }

  return { num1, num2, operator: isAddition ? '+' : '-', answer };
};

/**
 * Get time limit based on battery level
 */
const getTimeLimit = (batteryLevel) => {
  const ratio = (batteryLevel - 80) / 20;
  return BASE_TIME_80 + (BASE_TIME_100 - BASE_TIME_80) * ratio;
};

/**
 * CreatineSlide - Brain Battery with Math Speed Challenge
 * Mission 3: Experience how creatine improves cognitive performance
 */
export const CreatineSlide = () => {
  // Battery state
  const [batteryLevel, setBatteryLevel] = useState(80);
  const [creatineGrams, setCreatineGrams] = useState(0);

  // Game state
  const [gamePhase, setGamePhase] = useState('idle'); // idle, countdown, playing, feedback, results
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [problemNumber, setProblemNumber] = useState(0);

  // Scoring
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [round80Results, setRound80Results] = useState(null);
  const [round100Results, setRound100Results] = useState(null);
  const [attempts100, setAttempts100] = useState(0); // Track attempts at 100%

  // Feedback
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [countdownNumber, setCountdownNumber] = useState(3);

  // Refs
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  // Hooks
  const { playClick, playSuccess, playError, playLevelUp } = useSoundEffects();
  const { updateCreatine, updateSlideCompletion } = useUserContext();

  // Update context when state changes
  useEffect(() => {
    updateCreatine({
      batteryLevel,
      creatineGrams,
      round80Score: round80Results,
      round100Score: round100Results,
    });
  }, [batteryLevel, creatineGrams, round80Results, round100Results, updateCreatine]);

  // Track slide completion - 5/5 at 100% OR played twice at 100%
  useEffect(() => {
    const perfectScore = round100Results !== null && round100Results.correct === 5;
    const playedTwice = attempts100 >= 2;
    updateSlideCompletion('creatine', perfectScore || playedTwice);
  }, [round100Results, attempts100, updateSlideCompletion]);

  // Add creatine dose
  const addDose = (grams) => {
    playClick();
    const newGrams = Math.min(creatineGrams + grams, 5);
    setCreatineGrams(newGrams);
    const newLevel = 80 + (newGrams / 5) * 20;
    setBatteryLevel(newLevel);

    if (newLevel >= 100 && batteryLevel < 100) {
      playLevelUp();
    }
  };

  // Start countdown
  const startGame = () => {
    playClick();
    setGamePhase('countdown');
    setCountdownNumber(3);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setProblemNumber(0);
  };

  // Countdown effect
  useEffect(() => {
    if (gamePhase === 'countdown') {
      if (countdownNumber > 0) {
        const timer = setTimeout(() => setCountdownNumber(countdownNumber - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setGamePhase('playing');
        nextProblem();
      }
    }
  }, [gamePhase, countdownNumber]);

  // Generate next problem
  const nextProblem = useCallback(() => {
    if (problemNumber >= PROBLEMS_PER_ROUND) {
      endRound();
      return;
    }

    const problem = generateProblem();
    setCurrentProblem(problem);
    setUserAnswer('');
    setTimeRemaining(getTimeLimit(batteryLevel));
    setProblemNumber(prev => prev + 1);
    setFeedbackMessage('');

    setTimeout(() => inputRef.current?.focus(), 50);
  }, [problemNumber, batteryLevel]);

  // Timer effect
  useEffect(() => {
    if (gamePhase === 'playing' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 100) {
            clearInterval(timerRef.current);
            handleTimeout();
            return 0;
          }
          return prev - 100;
        });
      }, 100);

      return () => clearInterval(timerRef.current);
    }
  }, [gamePhase, currentProblem]);

  // Handle timeout
  const handleTimeout = () => {
    playError();
    setWrongAnswers(prev => prev + 1);
    setFeedbackMessage('Too slow!');
    setGamePhase('feedback');

    setTimeout(() => {
      setGamePhase('playing');
      nextProblem();
    }, 1000);
  };

  // Submit answer
  const submitAnswer = () => {
    if (!userAnswer.trim() || gamePhase !== 'playing') return;

    clearInterval(timerRef.current);
    const isCorrect = parseInt(userAnswer) === currentProblem.answer;

    if (isCorrect) {
      playSuccess();
      setCorrectAnswers(prev => prev + 1);
      setFeedbackMessage('Correct!');
    } else {
      playError();
      setWrongAnswers(prev => prev + 1);
      setFeedbackMessage(`Wrong! It was ${currentProblem.answer}`);
    }

    setGamePhase('feedback');

    setTimeout(() => {
      if (problemNumber >= PROBLEMS_PER_ROUND) {
        endRound();
      } else {
        setGamePhase('playing');
        nextProblem();
      }
    }, 1000);
  };

  // End round
  const endRound = () => {
    setGamePhase('results');
    const results = { correct: correctAnswers, wrong: wrongAnswers };

    if (batteryLevel < 100) {
      setRound80Results(results);
    } else {
      setRound100Results(results);
      setAttempts100(prev => prev + 1); // Track attempts at 100%
    }
  };

  // Reset game
  const resetGame = () => {
    playClick();
    setGamePhase('idle');
    setBatteryLevel(80);
    setCreatineGrams(0);
    setRound80Results(null);
    setRound100Results(null);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setProblemNumber(0);
  };

  // Calculate timer bar color and width
  const timeLimit = getTimeLimit(batteryLevel);
  const timerPercent = (timeRemaining / timeLimit) * 100;
  const timerColor = timeRemaining < 1000 ? 'bg-red-500 animate-pulse' :
                     timeRemaining < 2000 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Badge color="purple">Mission 3</Badge>
          <h2 className="text-2xl font-bold text-white mt-1">The Brain Battery</h2>
          <p className="text-slate-400 text-sm">
            Get <span className="text-purple-400 font-bold">5/5</span> or play <span className="text-purple-400 font-bold">twice</span> at 100% to unlock!
          </p>
        </div>

        {/* Status indicator */}
        {(round100Results?.correct === 5 || attempts100 >= 2) ? (
          <div className="px-3 py-2 rounded-lg border bg-emerald-900/50 border-emerald-500 text-emerald-300 text-sm">
            <Trophy className="w-4 h-4 inline mr-1" />
            {round100Results?.correct === 5 ? 'Perfect Score!' : 'Mission Complete!'}
          </div>
        ) : attempts100 === 1 ? (
          <div className="px-3 py-2 rounded-lg border bg-yellow-900/50 border-yellow-500 text-yellow-300 text-sm">
            1/2 attempts - One more!
          </div>
        ) : round100Results && round100Results.correct < 5 ? (
          <div className="px-3 py-2 rounded-lg border bg-yellow-900/50 border-yellow-500 text-yellow-300 text-sm">
            {round100Results.correct}/5 - Try again!
          </div>
        ) : null}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">

        {/* Left Column: Battery */}
        <div className="flex flex-col items-center justify-center gap-4">
          {/* Single Dynamic Battery */}
          <div className="flex flex-col items-center">
            <div className={`w-28 h-52 border-4 rounded-2xl p-2 bg-slate-900 relative transition-all duration-500 ${
              batteryLevel >= 100
                ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)]'
                : 'border-slate-600'
            }`}>
              {/* Battery fill */}
              <div
                className={`absolute bottom-2 left-2 right-2 rounded-sm transition-all duration-500 flex items-center justify-center ${
                  batteryLevel >= 100 ? 'bg-purple-500' : 'bg-yellow-600'
                }`}
                style={{ height: `${batteryLevel}%` }}
              >
                {batteryLevel >= 100 && <Zap className="text-white fill-white animate-pulse w-10 h-10" />}
              </div>
              {/* Percentage label */}
              <div className={`absolute top-1/2 left-0 right-0 text-center font-black text-2xl z-10 ${
                batteryLevel >= 100 ? 'text-white' : 'text-yellow-900'
              }`}>
                {Math.round(batteryLevel)}%
              </div>
            </div>
            <p className={`mt-2 font-bold text-sm ${batteryLevel >= 100 ? 'text-purple-400' : 'text-slate-400'}`}>
              {batteryLevel >= 100 ? 'Fully Charged!' : 'Vegetarian Default'}
            </p>
          </div>

          {/* Dose Buttons */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => addDose(1)}
                disabled={creatineGrams >= 5 || gamePhase !== 'idle'}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-bold transition-colors"
              >
                +1g
              </button>
              <button
                onClick={() => addDose(3)}
                disabled={creatineGrams >= 5 || gamePhase !== 'idle'}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-bold transition-colors"
              >
                +3g
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Added: {creatineGrams}g / 5g daily
            </p>
          </div>

          {/* Info box */}
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 text-center max-w-xs">
            <Brain className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xs text-slate-400">
              More battery = <span className="text-purple-300">more thinking time</span>
              <br />80% = 3 sec | 100% = 5 sec
            </p>
          </div>
        </div>

        {/* Right Column: Game Area */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 flex flex-col">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            Math Speed Challenge
          </h3>

          {/* Idle State */}
          {gamePhase === 'idle' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              {!round80Results ? (
                <>
                  <p className="text-slate-400 text-center">
                    Test your brain speed at <span className="text-yellow-400">{Math.round(batteryLevel)}% battery</span>
                  </p>
                  <button
                    onClick={startGame}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-colors"
                  >
                    <Play className="w-5 h-5" /> Start Challenge
                  </button>
                </>
              ) : !round100Results && batteryLevel < 100 ? (
                <>
                  <p className="text-slate-400 text-center">
                    You scored <span className="text-yellow-400">{round80Results.correct}/5</span> at 80%
                    <br />Now add creatine to fill your battery!
                  </p>
                </>
              ) : !round100Results && batteryLevel >= 100 ? (
                <>
                  <p className="text-slate-400 text-center">
                    Battery full! Try again with <span className="text-purple-400">5 seconds</span> per problem
                  </p>
                  <button
                    onClick={startGame}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-colors"
                  >
                    <Play className="w-5 h-5" /> Try at 100%
                  </button>
                </>
              ) : (
                <>
                  <div className="text-center space-y-2">
                    <p className="text-white font-bold">Results Comparison</p>
                    <div className="flex gap-4">
                      <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-3">
                        <p className="text-yellow-400 font-bold">80% Battery</p>
                        <p className="text-2xl text-white">{round80Results.correct}/5</p>
                        <p className="text-xs text-slate-400">3 sec/problem</p>
                      </div>
                      <div className={`rounded-lg p-3 ${
                        round100Results.correct === 5
                          ? 'bg-green-900/30 border border-green-500'
                          : 'bg-purple-900/30 border border-purple-500'
                      }`}>
                        <p className={`font-bold ${round100Results.correct === 5 ? 'text-green-400' : 'text-purple-400'}`}>
                          100% Battery
                        </p>
                        <p className="text-2xl text-white">{round100Results.correct}/5</p>
                        <p className="text-xs text-slate-400">5 sec/problem</p>
                      </div>
                    </div>
                    {(round100Results.correct === 5 || attempts100 >= 2) ? (
                      <p className="text-green-400 text-sm font-bold">
                        {round100Results.correct === 5 ? 'Perfect score! ' : ''}Mission unlocked!
                      </p>
                    ) : attempts100 === 1 ? (
                      <p className="text-yellow-400 text-sm">
                        Attempt 1/2 complete! One more try unlocks the mission.
                      </p>
                    ) : round100Results.correct > round80Results.correct ? (
                      <p className="text-yellow-400 text-sm">
                        +{round100Results.correct - round80Results.correct} improvement! Get 5/5 or play again.
                      </p>
                    ) : (
                      <p className="text-yellow-400 text-sm">
                        Get 5/5 or play twice at 100% to unlock!
                      </p>
                    )}
                  </div>
                  <button
                    onClick={resetGame}
                    className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${
                      (round100Results.correct === 5 || attempts100 >= 2)
                        ? 'bg-green-600 hover:bg-green-500'
                        : 'bg-purple-600 hover:bg-purple-500'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    {(round100Results.correct === 5 || attempts100 >= 2) ? 'Play Again' : 'Try Again'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Countdown */}
          {gamePhase === 'countdown' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-6xl font-black text-purple-400 animate-pulse">
                {countdownNumber || 'GO!'}
              </div>
            </div>
          )}

          {/* Playing / Feedback */}
          {(gamePhase === 'playing' || gamePhase === 'feedback') && currentProblem && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              {/* Problem */}
              <div className="text-4xl font-black text-white">
                {currentProblem.num1} {currentProblem.operator} {currentProblem.num2} = ?
              </div>

              {/* Timer Bar */}
              <div className="w-full max-w-xs">
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-100 ${timerColor}`}
                    style={{ width: `${timerPercent}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 text-center mt-1">
                  {(timeRemaining / 1000).toFixed(1)}s
                </p>
              </div>

              {/* Answer Input */}
              <input
                ref={inputRef}
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
                disabled={gamePhase === 'feedback'}
                placeholder="?"
                className="w-24 px-4 py-2 text-2xl text-center bg-slate-900 border-2 border-purple-500 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-purple-400 disabled:opacity-50"
                autoFocus
              />

              {/* Feedback Message */}
              {feedbackMessage && (
                <div className={`text-lg font-bold ${
                  feedbackMessage === 'Correct!' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {feedbackMessage}
                </div>
              )}

              {/* Score */}
              <div className="text-sm text-slate-400">
                Problem {problemNumber}/{PROBLEMS_PER_ROUND} | Score: {correctAnswers} correct
              </div>
            </div>
          )}

          {/* Results (shown in idle state above) */}
          {gamePhase === 'results' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="text-2xl font-bold text-white">
                Round Complete!
              </div>
              <div className="text-lg text-slate-300">
                You got <span className="text-purple-400 font-bold">{correctAnswers}/{PROBLEMS_PER_ROUND}</span> correct
              </div>
              <button
                onClick={() => setGamePhase('idle')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-colors"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const creatineScript = "Time for the Math Speed Challenge! Vegetarians have about 80 percent creatine in their brain battery. Let's test your speed at 80 percent first. Then we'll top off your tank with creatine and try again. Watch how having a full battery gives you more thinking time. Five grams daily is the research-backed dose for memory and math performance.";
