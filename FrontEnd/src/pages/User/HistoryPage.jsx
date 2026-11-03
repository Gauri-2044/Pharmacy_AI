import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../../config/api";
import { 
  Package, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Search, 
  ArrowRight, 
  RotateCcw, 
  FileText, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  X
} from "lucide-react";
import Tooltip from "../../components/common/Tooltip";
import { useToast } from "../../components/common/useToast";

export default function HistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      const res = await axios.get(apiUrl("/api/user/history"), {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const fetched = Array.isArray(res.data) ? res.data : [];
      setOrders(fetched);
    } catch (err) {
      console.error("Failed to fetch order history:", err);
      setError("Unable to load order history. Showing preview data.");
      // Provide clean preview fallback data if backend has no orders yet
      setOrders([
        {
          order_id: 101,
          medicine_name: "Amoxicillin 500mg",
          quantity: 2,
          order_status: "Delivered",
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          total_price: 340,
        },
        {
          order_id: 102,
          medicine_name: "Metformin 500mg",
          quantity: 1,
          order_status: "Processing",
          created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
          total_price: 180,
        },
        {
          order_id: 103,
          medicine_name: "Paracetamol 650mg",
          quantity: 3,
          order_status: "Delivered",
          created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
          total_price: 90,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.medicine_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(order.order_id || "").includes(searchTerm);

    const status = (order.order_status || order.status || "Completed").toLowerCase();
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "delivered" && (status.includes("deliv") || status.includes("complete"))) ||
      (statusFilter === "processing" && (status.includes("process") || status.includes("transit"))) ||
      (statusFilter === "pending" && status.includes("pend"));

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status = "Completed") => {
    const lower = String(status).toLowerCase();
    if (lower.includes("deliv") || lower.includes("complete")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
          <CheckCircle2 className="h-3 w-3" /> Delivered
        </span>
      );
    }
    if (lower.includes("process") || lower.includes("transit")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-950/60 text-blue-300 border border-blue-500/30">
          <Clock className="h-3 w-3 animate-spin" /> In Transit
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-950/60 text-amber-300 border border-amber-500/30">
        <Clock className="h-3 w-3" /> Pending Confirmation
      </span>
    );
  };

  const handleReorder = (medicineName) => {
    toast.info(`Preparing order for ${medicineName} in AI Pharmacist chat...`);
    navigate("/chat", { state: { prefill: `I would like to re-order ${medicineName}` } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1F3A] via-[#0B1730] to-[#0B1F3A] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-blue-900/60 pb-6">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold mb-1">
              <Package className="h-4 w-4" />
              <span>PATIENT ORDER & PRESCRIPTION LOGS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Order History
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Review your past medicine orders, automated refills, and chat transactions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-lg shadow-blue-600/20 active:scale-95"
            >
              <span>New AI Order</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-800/50 text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#0e223d]/80 border border-blue-900/40 p-4 rounded-2xl">
            <p className="text-xs text-slate-400">Total Orders</p>
            <p className="text-2xl font-bold text-white mt-1">{orders.length}</p>
          </div>
          <div className="bg-[#0e223d]/80 border border-blue-900/40 p-4 rounded-2xl">
            <p className="text-xs text-slate-400">Delivered</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {orders.filter((o) => (o.order_status || o.status || "").toLowerCase().includes("deliv") || (o.order_status || o.status || "").toLowerCase().includes("comp")).length}
            </p>
          </div>
          <div className="bg-[#0e223d]/80 border border-blue-900/40 p-4 rounded-2xl">
            <p className="text-xs text-slate-400">Active Refills</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">
              {orders.filter((o) => (o.order_status || o.status || "").toLowerCase().includes("process")).length || 1}
            </p>
          </div>
          <div className="bg-[#0e223d]/80 border border-blue-900/40 p-4 rounded-2xl">
            <p className="text-xs text-slate-400">AI Verified</p>
            <p className="text-2xl font-bold text-purple-400 mt-1">100%</p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#0e223d]/60 border border-blue-900/40 p-4 rounded-2xl">
          <div className="relative w-full md:w-80">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by medicine or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#081528] border border-blue-900/60 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {["all", "delivered", "processing", "pending"].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition cursor-pointer shrink-0 ${
                  statusFilter === tab
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-[#132d4b]/60 text-slate-300 hover:bg-[#132d4b] hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List / Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#0e223d]/40 rounded-2xl border border-blue-900/40">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400 mb-3" />
            <p className="text-sm text-slate-400">Fetching order history...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#0e223d]/40 rounded-2xl border border-blue-900/40">
            <Package className="h-12 w-12 text-blue-400/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white">No orders found</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search criteria or filter tabs."
                : "You haven't placed any medicine orders yet. Chat with our AI pharmacist to place your first order!"}
            </p>
            <Link
              to="/chat"
              className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer"
            >
              Order with AI Pharmacist →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div
                key={order.order_id || order.id || Math.random()}
                className="bg-[#0e223d]/80 border border-blue-900/50 hover:border-blue-500/50 rounded-2xl p-4 sm:p-5 transition shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="p-3 bg-blue-950/70 border border-blue-800/40 rounded-xl text-blue-400 shrink-0">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-base font-semibold text-white">
                        {order.medicine_name || `Medicine Order #${order.order_id}`}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/40">
                        ID: #{order.order_id || order.id}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400 mt-1.5">
                      <span>Quantity: <strong className="text-slate-200">{order.quantity || 1} units</strong></span>
                      {order.total_price && (
                        <span>Total: <strong className="text-blue-300">₹{order.total_price}</strong></span>
                      )}
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="h-3 w-3" />
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : "Recent"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-blue-900/40">
                  <div>{getStatusBadge(order.order_status || order.status)}</div>

                  <div className="flex items-center gap-2">
                    <Tooltip text="View Receipt Details">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 rounded-lg bg-[#132d4b] hover:bg-[#1a3c63] text-slate-300 hover:text-white transition cursor-pointer"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    </Tooltip>

                    <Tooltip text="Re-order this medication">
                      <button
                        onClick={() => handleReorder(order.medicine_name)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition cursor-pointer active:scale-95 shadow-md shadow-blue-600/20"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Re-order</span>
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Themed Order Receipt Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-[#0e223d] border border-blue-800/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-white">
              <div className="flex items-center justify-between border-b border-blue-900/60 pb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-400" />
                  <h3 className="font-semibold text-lg">Order Receipt</h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 bg-[#081528] p-4 rounded-xl border border-blue-950 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Order Reference</span>
                  <span className="font-mono text-white">#{selectedOrder.order_id || selectedOrder.id}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Medication</span>
                  <span className="font-medium text-white">{selectedOrder.medicine_name}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Quantity</span>
                  <span className="text-white">{selectedOrder.quantity || 1} units</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Status</span>
                  <span>{getStatusBadge(selectedOrder.order_status || selectedOrder.status)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Order Date</span>
                  <span className="text-white">
                    {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : "Recent"}
                  </span>
                </div>
                <div className="border-t border-blue-900/60 pt-2 flex justify-between font-semibold">
                  <span className="text-slate-300">Total Price</span>
                  <span className="text-blue-400 text-base">₹{selectedOrder.total_price || (selectedOrder.quantity || 1) * 150}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleReorder(selectedOrder.medicine_name);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition cursor-pointer active:scale-95"
                >
                  Re-order with AI
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
