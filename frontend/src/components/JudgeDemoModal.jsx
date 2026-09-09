import React, { useState } from "react";
import { Play, SkipForward, RotateCcw, CheckCircle2, AlertTriangle, Sparkles, X } from "lucide-react";
import { DEMO_STEPS } from "../data/demoScript";

export function JudgeDemoModal({ isOpen, onClose, onExecuteStep }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutomatedRunning, setIsAutomatedRunning] = useState(false);

  if (!isOpen) return null;

  const currentStep = DEMO_STEPS[currentStepIndex];

  const handleNextStep = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      onExecuteStep(DEMO_STEPS[nextIndex]);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    onExecuteStep(DEMO_STEPS[0]);
  };

  const handleRunFullSequence = async () => {
    setIsAutomatedRunning(true);
    for (let i = 0; i < DEMO_STEPS.length; i++) {
      setCurrentStepIndex(i);
      onExecuteStep(DEMO_STEPS[i]);
      await new Promise((res) => setTimeout(res, 1400));
    }
    setIsAutomatedRunning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl bg-[#0D1117] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Judge Demonstration Sequence
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                11-Step Deterministic Verification Rig
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Visualizer */}
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>STEP {currentStep.step} OF {DEMO_STEPS.length}</span>
            <span className="text-cyan-400 font-bold">{Math.round(((currentStepIndex + 1) / DEMO_STEPS.length) * 100)}% COMPLETE</span>
          </div>

          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / DEMO_STEPS.length) * 100}%` }}
            />
          </div>

          {/* Active Step Card */}
          <div className="p-4 rounded-xl bg-[#070A0F] border border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold">
                {currentStep.actionType}
              </span>
              <h4 className="text-sm font-semibold text-slate-100">{currentStep.title}</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{currentStep.description}</p>
            <div className="pt-2 text-[11px] font-mono text-cyan-400/90 border-t border-slate-800/80">
              LOG: {currentStep.log}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between gap-3">
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunFullSequence}
              disabled={isAutomatedRunning}
              className="px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isAutomatedRunning ? "Running..." : "Auto-Run (11 Steps)"}</span>
            </button>

            <button
              onClick={handleNextStep}
              disabled={currentStepIndex === DEMO_STEPS.length - 1 || isAutomatedRunning}
              className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              <span>Next Step</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}