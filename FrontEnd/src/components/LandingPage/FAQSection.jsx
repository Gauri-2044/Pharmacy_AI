import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: "How does the AI Pharmacist process voice instructions?",
      a: "When you tap the microphone button, the browser's speech engine captures your voice in real time with visual equalizer feedback. Our AI extracts medicine names, dosages, and quantities, then matches them against our pharmacy catalog instantly.",
    },
    {
      q: "Can I upload a picture of a handwritten doctor's prescription?",
      a: "Yes! Simply click the paperclip icon in the chat. Our vision OCR model scans handwritten physician notes, extracts medication items and recommended dosages, and presents a verification dialog for your confirmation.",
    },
    {
      q: "How does the system protect me from dangerous drug interactions?",
      a: "When you maintain your medical profile with known drug allergies (e.g., penicillin or sulfa), the AI runs automated cross-checks before any order can be confirmed. If a conflict is discovered, it flags the risk immediately.",
    },
    {
      q: "What are predictive refill alerts?",
      a: "For daily or monthly medications (such as blood pressure or diabetes treatments), the system tracks your order date and dosage duration. It automatically alerts you on your dashboard and prompts you to re-order before your supply runs out.",
    },
    {
      q: "Is my medical data kept private and secure?",
      a: "Absolutely. All transactions, chat transcripts, and prescription images are encrypted. Data is used exclusively to facilitate your medicine dispensing and clinical traceability under healthcare privacy standards.",
    },
  ];

  return (
    <section id="faq" className="px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-900/60 text-blue-300 border border-blue-700/50">
            <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Guidance & Frequently Asked Questions
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Everything you need to know about our autonomous AI pharmacy, multi-modal ordering, and clinical verification.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-[#0e223d]/80 border border-blue-900/60 rounded-2xl overflow-hidden transition shadow-lg"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#132d4b]/40 transition"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-white text-sm sm:text-base">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-blue-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-cyan-400" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-blue-900/30 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

