import React, { useState } from "react";
import { Volume2, Radio, Menu, X, Shield, Cpu, Activity, Sparkles } from "lucide-react";

export function Navbar({ currentPage, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "landing", label: "Overview" },
    { id: "conversation", label: "Live Conversation" },
    { id: "technology", label: "Architecture & FSM" },
    { id: "evaluation", label: "Benchmark Suite" },
    { id: "about", label: "Team & Ethics" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#070A0F]/85 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand */}
        <div 
          onClick={() => onNavigate("landing")} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            SB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                SIGNBRIDGE
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono tracking-wider font-semibold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                RIME CODA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-tight -mt-0.5 hidden sm:block">
              Communication without a barrier.
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "text-cyan-400 bg-slate-900/90 shadow-sm border border-cyan-500/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Action */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => onNavigate("conversation")}
            className="relative group px-5 py-2.5 rounded-xl font-medium text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 hover:brightness-110 shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 overflow-hidden"
          >
            <Radio className="w-4 h-4 text-slate-950 animate-pulse" />
            <span className="font-bold">Start Conversation</span>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#070A0F]/95 backdrop-blur-lg px-4 pt-3 pb-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                currentPage === item.id
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-3">
            <button
              onClick={() => {
                onNavigate("conversation");
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-xl font-semibold text-center text-black bg-gradient-to-r from-cyan-400 to-indigo-400 shadow-md"
            >
              Start Conversation
            </button>
          </div>
        </div>
      )}
    </header>
  );
}