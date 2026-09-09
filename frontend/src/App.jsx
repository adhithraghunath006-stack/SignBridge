import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Landing } from "./pages/Landing";
import { Conversation } from "./pages/Conversation";
import { Evaluation } from "./pages/Evaluation";
import { Technology } from "./pages/Technology";
import { About } from "./pages/About";

export default function App() {
  const [currentPage, setCurrentPage] = useState("landing");

  const renderPage = () => {
    switch (currentPage) {
      case "conversation":
        return <Conversation />;
      case "evaluation":
        return <Evaluation />;
      case "technology":
        return <Technology />;
      case "about":
        return <About />;
      case "landing":
      default:
        return <Landing onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer onNavigate={setCurrentPage} />
    </div>
  );
}