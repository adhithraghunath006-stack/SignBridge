import React from "react";
import { Users, Shield, Heart, Info, CheckCircle2 } from "lucide-react";

export function About() {
  const teamMembers = [
    { name: "ROSEMARIYA ROY", role: "Team Ideologists" },
    { name: "RIDDHI SINGH", role: "Team Ideologists" },
    { name: "ADHITH RAGHUNATH NAIR", role: "Team Ideologists" },
  ];

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#070A0F] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-14">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-mono border border-cyan-500/20">
            <Users className="w-3.5 h-3.5" />
            <span>Team & Mission</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
            About SignBridge
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed">
            "SignBridge is an experimental accessibility platform exploring how computer vision, speech technology and real-time voice orchestration can make conversations more inclusive."
          </p>
        </div>

        {/* Team Ideologists Section */}
        <div className="space-y-6">
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400">Team Ideologists</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {teamMembers.map((m, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#0D1117] border border-slate-800 space-y-2 hover:border-cyan-500/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-mono font-bold text-black text-sm">
                  {m.name.charAt(0)}
                </div>
                <h4 className="font-bold text-white text-sm tracking-wide pt-2">{m.name}</h4>
                <p className="text-xs font-mono text-cyan-400">{m.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ethical Transparency & Scope Disclosure */}
        <div className="p-8 rounded-2xl bg-[#0D1117] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Shield className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Ethical Disclosure & Project Boundaries
            </h3>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <p>
              To maintain absolute transparency and scientific integrity:
            </p>
            <ul className="space-y-2 text-slate-400 font-mono pl-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Defined Vocabulary:</strong> The prototype currently recognizes an 18-token conversational lexicon. We do not claim universal sign-language translation or dictionary completeness.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>No Medical or Legal Certification:</strong> This software is a hackathon prototype designed for conversational research and is not certified for clinical, critical care, or courtroom use.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Privacy & On-Device Vision:</strong> MediaPipe landmark extraction runs client-side in the user's browser. Raw camera frames are processed in-memory and never sent to external servers.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Deterministic Evaluation:</strong> All benchmark numbers presented in the evaluation suite are measured live using programmatic tests, not hardcoded marketing proxies.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}