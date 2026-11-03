import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Bot, 
  Sparkles, 
  ArrowRight, 
  Mic, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  MessageSquare,
  Zap,
  Play
} from "lucide-react";
import Tooltip from "../common/Tooltip";

export default function HeroSection() {
  const [activeDemo, setActiveDemo] = useState(0);
  const isLoggedIn = !!localStorage.getItem("token");
  const chatTarget = isLoggedIn ? "/chat" : "/login";
  const chatState = !isLoggedIn ? { from: { pathname: "/chat" } } : undefined;

  const demoScenarios = [
    {
      query: "I have a headache and mild fever. Can I order Paracetamol 650mg?",
      reply: "Paracetamol 650mg is in stock (120 units). Recommended dosage: 1 tablet every 6 hours after meals. No contraindications detected with your profile.",
      badge: "In Stock & Safe",
      badgeColor: "emerald",
      latency: "0.8s",
    },
    {
      query: "Please refill my Metformin 500mg prescription from last month.",
      reply: "Refill confirmed for Metformin 500mg (2 units). Your previous prescription was verified 28 days ago. Order prepared for ₹180.",
      badge: "Predictive Refill",
      badgeColor: "blue",
      latency: "1.1s",
    },
    {
      query: "Can I take Amoxicillin with my recorded Penicillin allergy?",
      reply: "⚠️ Warning: Amoxicillin is a penicillin-class antibiotic. Cross-reactivity risk detected! I have flagged this prescription for alternate therapy.",
      badge: "Allergy Guard Triggered",
      badgeColor: "rose",
      latency: "0.4s",
    },
  ];

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-24 overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* Left Column: Value Proposition & CTAs */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-900/60 text-cyan-300 border border-blue-500/30 shadow-md">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>AUTONOMOUS CLINICAL AI HEALTHCARE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
            Your Autonomous{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
              AI Pharmacist
            </span>
          </h1>

          <p className="text-base sm:text-lg text-blue-200/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
            Effortlessly order medications with <strong>natural voice & text</strong>, scan doctor prescriptions with <strong>AI Vision OCR</strong>, and safeguard your health with <strong>automated drug interaction checks</strong> and predictive refills.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
            <Link
              to={chatTarget}
              state={chatState}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Start Free AI Chat</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#132d4b]/80 hover:bg-[#1a3c63] border border-blue-800/60 text-slate-200 hover:text-white font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="h-4 w-4 text-cyan-400 fill-cyan-400/30" />
              <span>How It Works</span>
            </a>
          </div>

          {/* Quick Credibility Stats */}
          <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-blue-200/80">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>99.8% Prescription OCR</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Voice & Multilingual</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Zero Hallucination Safeguard</span>
            </span>
          </div>

        </div>

        {/* Right Column: Interactive AI Pharmacist Live Simulator (Kylas-style product preview) */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-[#0e223d]/90 border border-blue-800/80 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl relative space-y-4">
            
            {/* Simulator Header */}
            <div className="flex items-center justify-between border-b border-blue-900/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Live Pharmacist Agent
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  </h3>
                  <p className="text-[10px] text-blue-300">Interactive Simulation Sandbox</p>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-blue-900">
                Latency: {demoScenarios[activeDemo].latency}
              </span>
            </div>

            {/* Scenario Selector Pills */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Click a test prompt:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {demoScenarios.map((sc, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveDemo(i)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer text-left ${
                      activeDemo === i
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                        : "bg-[#081528] text-slate-300 hover:bg-[#132d4b] border border-blue-950"
                    }`}
                  >
                    Scenario #{i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Chat Feed */}
            <div className="bg-[#081528] p-4 rounded-2xl border border-blue-950 space-y-3 min-h-[190px] flex flex-col justify-between">
              
              {/* User Bubble */}
              <div className="flex items-start justify-end gap-2 text-xs">
                <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none max-w-[85%] leading-relaxed shadow-md">
                  {demoScenarios[activeDemo].query}
                </div>
              </div>

              {/* Bot Response Bubble */}
              <div className="flex items-start gap-2 text-xs">
                <div className="w-6 h-6 rounded-md bg-[#132d4b] text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="bg-[#0e223d] border border-blue-900/60 text-slate-200 p-3 rounded-2xl rounded-tl-none max-w-[90%] leading-relaxed shadow-md space-y-2">
                  <p>{demoScenarios[activeDemo].reply}</p>
                  
                  <div className="pt-1 flex items-center justify-between">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        demoScenarios[activeDemo].badgeColor === "emerald"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : demoScenarios[activeDemo].badgeColor === "blue"
                          ? "bg-blue-950 text-blue-300 border border-blue-800"
                          : "bg-rose-950 text-rose-300 border border-rose-800"
                      }`}
                    >
                      {demoScenarios[activeDemo].badge}
                    </span>
                    <span className="text-[10px] text-slate-400">Database Verified</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Card Action */}
            <Link
              to={chatTarget}
              state={chatState}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer"
            >
              <span>Try Live in Full Pharmacist Chat</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

          </div>
        </div>

      </div>
    </section>
  );
}
