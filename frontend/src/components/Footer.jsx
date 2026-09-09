import React from "react";
import { ShieldCheck, Heart, Radio, Sparkles } from "lucide-react";

export function Footer({ onNavigate }) {
  return (
    <footer className="border-t border-slate-800/80 bg-[#05070B] text-slate-400 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-black font-extrabold text-base">
                SB
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">SIGNBRIDGE</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              SignBridge is an experimental accessibility platform exploring how computer vision,
              speech technology and real-time voice orchestration can make two-way human conversations
              seamless, interruptible, and inclusive.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Engineered with Rime TTS Coda (astra)</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-200">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate("landing")} className="hover:text-cyan-400 transition-colors">
                  Product Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("conversation")} className="hover:text-cyan-400 transition-colors">
                  Live Conversation Studio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("technology")} className="hover:text-cyan-400 transition-colors">
                  Architecture & FSM
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("evaluation")} className="hover:text-cyan-400 transition-colors">
                  Benchmark Suite
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("about")} className="hover:text-cyan-400 transition-colors">
                  Team Ideologists
                </button>
              </li>
            </ul>
          </div>

          {/* Team Ideologists */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-200">Created By</h4>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <p className="text-xs font-bold text-white tracking-wide">TEAM IDEOLOGISTS</p>
              <div className="text-xs space-y-1 text-slate-300 font-mono">
                <p>• ROSEMARIYA ROY</p>
                <p>• RIDDHI SINGH</p>
                <p>• ADHITH RAGHUNATH NAIR</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Ethics & Disclaimer */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            © 2026 SignBridge by Team Ideologists. Built for the DataForge x Pathway x Rime Voice Hackathon.
          </p>
          <p className="font-mono text-[11px]">
            Defined Vocabulary Prototype • Real-Time Full-Duplex
          </p>
        </div>
      </div>
    </footer>
  );
}