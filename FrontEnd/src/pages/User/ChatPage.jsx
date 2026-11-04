import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Bot, 
  User, 
  Loader2, 
  Mic, 
  MicOff, 
  Paperclip, 
  Send, 
  ArrowLeft, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Package, 
  Sparkles, 
  FileText, 
  X,
  Volume2,
  Home
} from "lucide-react";
import axios from "axios";
import { apiUrl } from "../../config/api";
import Tooltip from "../../components/common/Tooltip";
import { useToast } from "../../components/common/useToast";

const initialMessages = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hello! I'm your AI Pharmacist assistant. You can type, speak with your voice, or upload a photo of your prescription.\n\nHow can I help you today?",
    timestamp: new Date(),
  },
];

export default function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orderModal, setOrderModal] = useState(null);
  const [isConfirmingOrder, setIsConfirmingOrder] = useState(false);

  // Auth Protection Check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("Please sign in to consult with the AI Pharmacist.", "Sign In Required");
      navigate("/login", { state: { from: location }, replace: true });
    }
  }, [navigate, location, toast]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get(apiUrl("/api/agent/chat/history"), {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        if (Array.isArray(data.messages) && data.messages.length) {
          setMessages(
            data.messages.map((message) => ({
              id: String(message.id),
              role: message.role,
              content: message.content,
              timestamp: new Date(message.created_at),
            })),
          );
        }
      })
      .catch((error) => {
        console.error("Chat history load failed", error);
      });
  }, []);

  // Voice Recognition states
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState("");
  const recognitionRef = useRef(null);

  // Image OCR states
  const [extractedData, setExtractedData] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Handle prefill from navigation (e.g. from Order History re-order)
  useEffect(() => {
    if (location.state?.prefill) {
      setInput(location.state.prefill);
      textareaRef.current?.focus();
    }
  }, [location.state]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isListening]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Voice Input Handlers
  const toggleListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error(
        "Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.",
        "Voice Not Supported"
      );
      return;
    }

    if (isListening) {
      // User requested to stop
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      toast.info("Microphone stopped.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechTranscript("");
        toast.info("Listening... Speak your medicine name or question.", "Microphone Active");
      };

      recognition.onresult = (event) => {
        let interimText = "";
        let finalText = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript;
          } else {
            interimText += event.results[i][0].transcript;
          }
        }

        const currentText = finalText || interimText;
        setSpeechTranscript(currentText);

        if (finalText) {
          setInput((prev) => (prev ? `${prev} ${finalText}` : finalText));
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setSpeechTranscript("");

        if (event.error === "not-allowed") {
          toast.error(
            "Microphone permission was denied. Please allow microphone access in browser settings.",
            "Permission Denied"
          );
        } else if (event.error === "no-speech") {
          toast.warning("No voice detected. Please try speaking again.", "No Speech Detected");
        } else {
          toast.error(`Voice error: ${event.error}`, "Microphone Error");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Failed to start voice recognition:", err);
      setIsListening(false);
      toast.error("Could not activate microphone.", "Voice Error");
    }
  };

  // Image Upload for OCR
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size < 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Prescription image must be less than 10MB.", "File Too Large");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setIsLoading(true);
      toast.info("Scanning prescription photo with AI OCR vision...", "Analyzing Image");

      const res = await axios.post(
        apiUrl("/api/prescription"),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setExtractedData(res.data.result);
      setShowConfirm(true);

      const now = Date.now();
      setMessages((prev) => [
        ...prev,
        {
          id: now.toString(),
          role: "assistant",
          content:
            "Prescription scanned successfully! Please review the extracted medicines in the confirmation window.",
          timestamp: new Date(),
        },
      ]);
      toast.success("Prescription scanned! Please review extracted medicines.", "OCR Succeeded");
    } catch (err) {
      const msg =
        err?.response?.data?.details ||
        err?.response?.data?.error ||
        err?.message ||
        "Prescription image could not be processed.";
      toast.error(msg, "OCR Analysis Failed");
      console.error("OCR upload failed", err);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const confirmPrescription = async () => {
    if (!Array.isArray(extractedData) || extractedData.length === 0) {
      toast.warning("No extracted medicines found to verify.", "Notice");
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        apiUrl("/api/prescription/confirm"),
        { medicines: extractedData },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const available = res.data?.available || [];
      const unavailable = res.data?.unavailable || [];
      const recommendedOrder = res.data?.recommendedOrder || null;

      const summaryLines = [];
      if (available.length > 0) {
        summaryLines.push(
          `**In Stock & Approved:**\n` +
          available.map((m) => `• ${m.medicine_name} (${m.quantity} unit${m.quantity > 1 ? "s" : ""}) - ₹${m.price || 0}`).join("\n")
        );
      }
      if (unavailable.length > 0) {
        summaryLines.push(
          `**Unavailable / Stock Out:**\n` +
          unavailable.map((m) => `• ${m.name} (${m.reason || "Out of stock"})`).join("\n")
        );
      }

      const now = Date.now();
      setMessages((prev) => [
        ...prev,
        {
          id: now.toString(),
          role: "assistant",
          content: `### 📋 Prescription Verification Results\n\n${summaryLines.join("\n\n")}`,
          timestamp: new Date(),
        },
      ]);

      if (recommendedOrder) {
        setOrderModal(recommendedOrder);
      }
      setShowConfirm(false);
      toast.success("Prescription medicines verified against pharmacy database!");
    } catch (err) {
      console.error("Prescription confirm failed", err);
      const msg = err.response?.data?.error || "Failed to verify prescription medicines.";
      toast.error(msg, "Verification Failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !image) || isLoading) return;

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    }

    const now = Date.now();
    let userMessage = input.trim();

    if (userMessage) {
      setMessages((prev) => [
        ...prev,
        {
          id: now.toString(),
          role: "user",
          content: userMessage,
          timestamp: new Date(),
        },
      ]);
    }

    setInput("");
    setSpeechTranscript("");
    setImage(null);
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        apiUrl("/api/agent/chat"),
        { message: userMessage },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (res.data.showOrderModal && res.data.order) {
        setOrderModal(res.data.order);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (now + 2).toString(),
          role: "assistant",
          content: res.data.reply || "I have received your request.",
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error("Chat request failed", err);
      let msg = "Sorry, there was an issue communicating with the AI Pharmacist. Please verify that the backend server is running.";
      if (err.response?.data) {
        msg = err.response.data.error || err.response.data.message || msg;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: (now + 2).toString(),
          role: "assistant",
          content: `⚠️ ${msg}`,
          timestamp: new Date(),
        },
      ]);
      toast.error("Could not reach AI Pharmacist backend.", "Chat Error");
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleConfirmOrder = async () => {
    if (!orderModal) return;

    setIsConfirmingOrder(true);
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id");

      const res = await axios.post(
        apiUrl("/api/agent/confirm-order"),
        {
          medicine_id: orderModal.medicine_id,
          quantity: orderModal.quantity,
          user_id: userId ? parseInt(userId) : null,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (res.data.success) {
        const now = Date.now();
        setMessages((prev) => [
          ...prev,
          {
            id: now.toString(),
            role: "assistant",
            content: `✅ **Order Confirmed!**\n\n${res.data.message}\nYour order reference has been logged. You can track progress in your **Order History**.`,
            timestamp: new Date(),
          },
        ]);
        toast.success("Medicine order successfully placed!", "Order Placed");
      }
    } catch (err) {
      console.error("Order confirmation failed", err);
      const errorMsg = err.response?.data?.error || "Error confirming order. Please try again.";
      toast.error(errorMsg, "Order Failed");
      const now = Date.now();
      setMessages((prev) => [
        ...prev,
        {
          id: now.toString(),
          role: "assistant",
          content: `❌ ${errorMsg}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setOrderModal(null);
      setIsConfirmingOrder(false);
    }
  };

  const clearChat = () => {
    const token = localStorage.getItem("token");
    axios
      .delete(apiUrl("/api/agent/chat/history"), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then(() => {
        setMessages(initialMessages);
        toast.info("Chat conversation cleared.", "Cleared");
      })
      .catch((error) => {
        console.error("Chat history clear failed", error);
        toast.error("Could not clear chat history.", "Clear Failed");
      });
  };

  const quickPrompts = [
    "I need Paracetamol 650mg for headache",
    "What are the side effects of Metformin?",
    "Check availability of Amoxicillin 500mg",
    "When should I refill my blood pressure medicine?",
  ];

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-gradient-to-br from-[#0B1F3A] via-[#09182d] to-[#0B1F3A] text-slate-100 overflow-hidden select-text">
      
      {/* ================= STICKY TOP CHATBOT HEADER (NO NAVBAR) ================= */}
      <header className="sticky top-0 z-30 shrink-0 h-16 border-b border-blue-900/60 bg-[#0B1F3A]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <Tooltip text="Go Back">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-[#132d4b]/70 hover:bg-blue-600 hover:text-white text-slate-300 transition cursor-pointer flex items-center gap-1.5 text-xs font-medium"
              aria-label="Go Back"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          </Tooltip>

          <Tooltip text="Patient Dashboard">
            <Link
              to="/dashboard"
              className="p-2 rounded-xl bg-[#132d4b]/70 hover:bg-blue-600 hover:text-white text-slate-300 transition cursor-pointer flex items-center gap-1.5 text-xs font-medium"
              aria-label="Dashboard"
            >
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </Tooltip>

          <Tooltip text="Home Page">
            <Link
              to="/"
              className="p-2 rounded-xl bg-[#132d4b]/70 hover:bg-blue-600 hover:text-white text-slate-300 transition cursor-pointer flex items-center gap-1.5 text-xs font-medium"
              aria-label="Home Landing Page"
            >
              <Home className="h-4 w-4" />
            </Link>
          </Tooltip>

          <div className="h-5 w-px bg-blue-900/60 mx-1 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20">
                <Bot className="h-5 w-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#0B1F3A] animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white leading-tight">
                  Autonomous AI Pharmacist
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Online 24/7
                </span>
              </div>
              <p className="text-xs text-blue-300/80 hidden xs:block">
                Voice • Image OCR • Clinical Interaction Verification
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip text="Clear Chat">
            <button
              type="button"
              onClick={clearChat}
              className="p-2 rounded-xl bg-[#132d4b]/60 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 transition cursor-pointer"
              aria-label="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Tooltip>

          <Link
            to="/history"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#132d4b]/60 hover:bg-[#1a3c63] text-xs text-slate-200 transition cursor-pointer"
          >
            <Package className="h-3.5 w-3.5 text-blue-400" />
            <span>Past Orders</span>
          </Link>
        </div>
      </header>

      {/* ================= SCROLLABLE CHAT MESSAGES AREA ================= */}
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="mx-auto max-w-3xl space-y-6">
          
          {/* Pharmacist Assistant Info Banner */}
          <div className="p-3.5 rounded-2xl bg-[#0e223d]/70 border border-blue-900/50 flex items-start gap-3 text-xs text-blue-200/90 shadow-inner">
            <Sparkles className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Clinical Safe-Guard Active</p>
              <p className="mt-0.5">
                Our autonomous agent checks dosage limits, contraindications, and stock availability before confirming orders.
              </p>
            </div>
          </div>

          {/* Messages Feed */}
          {messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <div
                key={message.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl shadow-md ${
                    isUser
                      ? "bg-gradient-to-tr from-cyan-600 to-blue-600 text-white"
                      : "bg-[#132d4b] border border-blue-800/40 text-blue-400"
                  }`}
                >
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-5 w-5" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-lg ${
                    isUser
                      ? "bg-blue-600 text-white rounded-tr-none shadow-blue-600/10"
                      : "bg-[#0e223d] border border-blue-900/60 text-slate-100 rounded-tl-none"
                  }`}
                >
                  <div
                    className="text-sm leading-relaxed prose prose-invert max-w-none break-words"
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                  />

                  <p className="mt-2 text-[10px] text-right opacity-60">
                    {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }) : ""}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 sm:gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#132d4b] border border-blue-800/40 text-blue-400">
                <Bot className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl rounded-tl-none bg-[#0e223d] border border-blue-900/60 px-4 py-3 text-slate-200 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                <span className="text-blue-200 font-medium">AI Pharmacist is analyzing symptoms & inventory...</span>
              </div>
            </div>
          )}

          {/* Quick Starter Suggestions */}
          {messages.length <= 2 && !isLoading && (
            <div className="pt-4 space-y-2">
              <p className="text-xs font-medium text-slate-400 px-1">Suggested inquiries:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInput(prompt);
                      textareaRef.current?.focus();
                    }}
                    className="text-left p-2.5 rounded-xl bg-[#0e223d]/60 hover:bg-[#132d4b] border border-blue-900/40 hover:border-blue-500/50 text-xs text-slate-300 hover:text-white transition cursor-pointer flex items-center justify-between"
                  >
                    <span>{prompt}</span>
                    <span className="text-blue-400 text-xs">↵</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* ================= STICKY DOCKED BOTTOM INPUT AREA ================= */}
      <footer className="sticky bottom-0 z-30 shrink-0 border-t border-blue-900/60 bg-[#0B1F3A]/98 backdrop-blur-md px-4 py-3 sm:p-5 shadow-2xl">
        <div className="mx-auto max-w-3xl space-y-2">
          
          {/* ================= VOICE LISTENING ACTIVE BANNER (ISSUE #3 FIX) ================= */}
          {isListening && (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-red-950/90 border border-red-500/50 text-red-200 text-xs shadow-xl animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3">
                {/* Pulsing Audio Equalizer */}
                <div className="flex items-end gap-1 h-5">
                  <span className="wave-bar w-1 bg-red-400 rounded-full" />
                  <span className="wave-bar w-1 bg-red-400 rounded-full" />
                  <span className="wave-bar w-1 bg-red-400 rounded-full" />
                  <span className="wave-bar w-1 bg-red-400 rounded-full" />
                  <span className="wave-bar w-1 bg-red-400 rounded-full" />
                </div>

                <div>
                  <span className="font-semibold text-white">Listening... Speak now</span>
                  {speechTranscript ? (
                    <p className="text-red-100 font-mono italic text-[11px] truncate max-w-xs sm:max-w-md">
                      "{speechTranscript}"
                    </p>
                  ) : (
                    <p className="text-red-300 text-[10px]">
                      Say medicine name, quantity, or symptoms clearly
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={toggleListening}
                className="px-2.5 py-1 rounded-lg bg-red-800 hover:bg-red-700 text-white font-medium text-xs transition cursor-pointer"
              >
                Done
              </button>
            </div>
          )}

          {/* Text Input Row */}
          <div className="relative flex items-end gap-2 bg-[#0e223d] border border-blue-900/80 focus-within:border-blue-500 rounded-2xl p-2 transition shadow-inner">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening to your voice..." : "Type medicine request, or click mic to speak..."}
              className="flex-1 max-h-32 min-h-[44px] resize-none bg-transparent px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none"
              style={{ boxSizing: "border-box" }}
            />

            <div className="flex items-center gap-1.5 pb-0.5">
              {/* Paperclip / Prescription Upload */}
              <Tooltip text="Upload Prescription Photo (OCR)">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#132d4b] transition cursor-pointer"
                  aria-label="Upload prescription image"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
              </Tooltip>

              {/* Mic Listening Button */}
              <Tooltip text={isListening ? "Stop voice listening" : "Click to speak (Voice Recognition)"}>
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2 rounded-xl transition cursor-pointer relative ${
                    isListening
                      ? "bg-red-600 text-white mic-active-pulse"
                      : "text-slate-300 hover:text-white hover:bg-[#132d4b]"
                  }`}
                  aria-label={isListening ? "Stop listening" : "Start voice recognition"}
                >
                  {isListening ? (
                    <MicOff className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5 text-cyan-400" />
                  )}
                </button>
              </Tooltip>

              {/* Send Button */}
              <Tooltip text="Send message">
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={(!input.trim() && !image) || isLoading}
                  className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white transition shadow-md shadow-blue-600/30 active:scale-95 cursor-pointer"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </Tooltip>
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Powered by Gemini Medical AI & Database Inventory</span>
            <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
          </div>
        </div>
      </footer>

      {/* ================= THEMED OCR CONFIRMATION POPUP (ISSUE #6 FIX) ================= */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#0e223d] border border-blue-800/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-blue-900/60 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-bold">Review Extracted Prescription</h2>
              </div>
              <button
                onClick={() => setShowConfirm(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Our AI vision detected the following medication orders from your prescription image.
              Confirm to check against current inventory.
            </p>

            <div className="bg-[#081528] p-4 rounded-xl border border-blue-950 max-h-60 overflow-y-auto space-y-2">
              {Array.isArray(extractedData) ? (
                extractedData.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#0e223d]/80 border border-blue-900/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-white">{item.medicine_name || item.name || "Unknown Medicine"}</p>
                      <p className="text-slate-400">Dosage: {item.dosage || "Standard"} • Timing: {item.timing || "As directed"}</p>
                    </div>
                    <span className="px-2 py-1 rounded bg-blue-950 text-blue-300 font-mono">
                      Qty: {item.quantity || 1}
                    </span>
                  </div>
                ))
              ) : (
                <pre className="text-xs text-slate-300 font-mono">
                  {JSON.stringify(extractedData, null, 2)}
                </pre>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition cursor-pointer"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
                onClick={() => confirmPrescription()}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Verify & Check Inventory</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= THEMED ORDER SUMMARY POPUP (ISSUE #6 FIX) ================= */}
      {orderModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#0e223d] border border-blue-800/80 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-blue-900/60 pb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-400" />
                <h2 className="text-xl font-bold">Order Summary</h2>
              </div>
              <button
                onClick={() => setOrderModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3.5 bg-[#081528] p-4 sm:p-5 rounded-xl border border-blue-950 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Medicine</span>
                <span className="font-semibold text-white">{orderModal.medicine_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Quantity</span>
                <span className="font-semibold text-white">{orderModal.quantity} unit(s)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Price per Unit</span>
                <span className="font-semibold text-slate-200">₹{orderModal.price_per_unit}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Stock Availability</span>
                <span className="text-emerald-400 font-medium">
                  {orderModal.stock_available} units in stock
                </span>
              </div>

              <div className="border-t border-blue-900/70 pt-3 flex justify-between items-center">
                <span className="text-slate-300 font-semibold">Total Amount</span>
                <span className="text-2xl font-bold text-blue-400">₹{orderModal.total_price}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setOrderModal(null)}
                disabled={isConfirmingOrder}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={isConfirmingOrder}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold transition shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {isConfirmingOrder && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{isConfirmingOrder ? "Confirming..." : "Confirm & Place Order"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function formatMessage(content) {
  if (!content) return "";
  return content
    .replace(/^### (.*$)/gim, '<h3 class="font-bold text-base text-blue-300 mt-2 mb-1">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-blue-200">$1</em>')
    .replace(/\n/g, "<br />");
}
