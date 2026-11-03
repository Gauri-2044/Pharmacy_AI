import React from "react";
import { Zap, ShieldCheck, Clock, FileCheck2 } from "lucide-react";

export default function MetricsBar() {
  const metrics = [
    {
      value: "99.8%",
      label: "Prescription OCR Accuracy",
      desc: "Gemini Vision reads doctor cursive and handwritten dosage",
      icon: <FileCheck2 className="h-5 w-5 text-cyan-400" />,
    },
    {
      value: "<1.2s",
      label: "Agent Response Time",
      desc: "Fast clinical query processing with live inventory verification",
      icon: <Zap className="h-5 w-5 text-blue-400" />,
    },
    {
      value: "100%",
      label: "Drug Interaction Safety",
      desc: "Automated screening against recorded patient allergies",
      icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />,
    },
    {
      value: "24/7",
      label: "Autonomous Availability",
      desc: "Continuous voice consultation and instant emergency refills",
      icon: <Clock className="h-5 w-5 text-amber-400" />,
    },
  ];

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-10 bg-[#091526]/70 border-y border-blue-900/50">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[#0e223d]/60 border border-blue-900/40 hover:border-blue-500/40 transition shadow-lg space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {item.value}
              </span>
              <div className="p-2 rounded-xl bg-blue-950/80 border border-blue-900/60">
                {item.icon}
              </div>
            </div>
            <h4 className="text-sm font-bold text-blue-200">{item.label}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

