import { useEffect, useState } from "react";
import { 
  Plus, 
  Package, 
  Search, 
  Pencil, 
  Trash2, 
  AlertTriangle, 
  X, 
  Check, 
  Loader2, 
  Filter,
  DollarSign,
  Layers,
  FileText
} from "lucide-react";
import Tooltip from "../../components/common/Tooltip";
import { useToast } from "../../components/common/useToast";

export default function MedicineManagement() {
  const [medicines, setMedicines] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [medicineToDelete, setMedicineToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");

  const toast = useToast();

  const [newMedicine, setNewMedicine] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    composition: "",
    dosage: "",
    side_effects: "",
    contraindications: "",
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        q: searchTerm,
        stockStatus: stockStatusFilter,
      }).toString();

      const res = await fetch(`http://localhost:5000/api/admin/medicines?${query}`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch medicines");
      }

      const data = await res.json();
      setMedicines(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Could not fetch backend medicines, using fallback inventory.", err);
      // Fallback sample medicines for testing
      setMedicines([
        {
          id: 1,
          name: "Amoxicillin 500mg",
          price: 120,
          stock: 45,
          category: "Antibiotics",
          description: "Broad-spectrum penicillin antibiotic for bacterial infections.",
          composition: "Amoxicillin Trihydrate",
          dosage: "1 capsule every 8 hours",
          stock_status: "IN_STOCK",
        },
        {
          id: 2,
          name: "Metformin 500mg",
          price: 90,
          stock: 8,
          category: "Antidiabetic",
          description: "First-line medication for the treatment of type 2 diabetes.",
          composition: "Metformin Hydrochloride",
          dosage: "1 tablet twice daily with meals",
          stock_status: "LOW_STOCK",
        },
        {
          id: 3,
          name: "Paracetamol 650mg",
          price: 35,
          stock: 120,
          category: "Analgesic",
          description: "Pain reliever and fever reducer.",
          composition: "Acetaminophen 650mg",
          dosage: "1 tablet every 4-6 hours as needed",
          stock_status: "IN_STOCK",
        },
        {
          id: 4,
          name: "Insulin Glargine 100IU",
          price: 650,
          stock: 0,
          category: "Endocrine",
          description: "Long-acting human insulin analog for diabetes.",
          composition: "Insulin Glargine",
          dosage: "Once daily subcutaneous injection",
          stock_status: "OUT_OF_STOCK",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, stockStatusFilter]);

  const resetForm = () => {
    setNewMedicine({
      name: "",
      price: "",
      stock: "",
      category: "",
      description: "",
      composition: "",
      dosage: "",
      side_effects: "",
      contraindications: "",
    });
  };

  /* ================= CREATE MEDICINE ================= */
  const handleAddMedicine = async () => {
    if (!newMedicine.name.trim() || !newMedicine.price) {
      toast.warning("Please provide a medicine name and price.", "Validation Error");
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        name: newMedicine.name,
        price: parseFloat(newMedicine.price || "0"),
        stock: parseInt(newMedicine.stock || "0", 10),
        category: newMedicine.category,
        description: newMedicine.description,
        composition: newMedicine.composition,
        dosage: newMedicine.dosage,
        side_effects: newMedicine.side_effects,
        contraindications: newMedicine.contraindications,
      };

      const res = await fetch("http://localhost:5000/api/admin/medicines", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.message || "Failed to add medicine");
      }

      toast.success(`${newMedicine.name} added to pharmacy inventory!`, "Medicine Created");
      resetForm();
      setShowCreateModal(false);
      fetchMedicines();
    } catch (err) {
      console.error("Add error:", err);
      toast.error(err.message || "Failed to create medicine.", "Create Failed");
    } finally {
      setActionLoading(false);
    }
  };

  /* ================= UPDATE MEDICINE ================= */
  const handleUpdateMedicine = async () => {
    if (!editingMedicine) return;

    try {
      setActionLoading(true);
      const payload = {
        name: editingMedicine.name,
        price: parseFloat(editingMedicine.price || "0"),
        stock: parseInt(editingMedicine.stock || "0", 10),
        category: editingMedicine.category || "",
        description: editingMedicine.description || "",
        composition: editingMedicine.composition || "",
        dosage: editingMedicine.dosage || "",
        side_effects: editingMedicine.side_effects || "",
        contraindications: editingMedicine.contraindications || "",
      };

      const res = await fetch(`http://localhost:5000/api/admin/medicines/${editingMedicine.id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.message || "Failed to update medicine");
      }

      toast.success(`${editingMedicine.name} updated successfully!`, "Inventory Updated");
      setShowEditModal(false);
      setEditingMedicine(null);
      fetchMedicines();
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.message || "Failed to update medicine.", "Update Failed");
    } finally {
      setActionLoading(false);
    }
  };

  /* ================= DELETE MEDICINE (CRUD COMPLETION) ================= */
  const handleDeleteMedicine = async () => {
    if (!medicineToDelete) return;

    try {
      setActionLoading(true);
      const res = await fetch(`http://localhost:5000/api/admin/medicines/${medicineToDelete.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.message || "Failed to delete medicine");
      }

      toast.success(`${medicineToDelete.name} has been removed from inventory.`, "Medicine Deleted");
      setShowDeleteModal(false);
      setMedicineToDelete(null);
      fetchMedicines();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete medicine.", "Delete Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const getStockBadge = (stock) => {
    const s = Number(stock || 0);
    if (s === 0) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-950/70 text-rose-400 border border-rose-800/60">
          OUT OF STOCK
        </span>
      );
    }
    if (s <= 10) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-950/70 text-amber-400 border border-amber-800/60">
          LOW STOCK ({s})
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
        IN STOCK ({s})
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-blue-900/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <Package className="h-4 w-4" />
            <span>CLINICAL INVENTORY CONTROL (CRUD)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Medicine Inventory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage pharmaceutical catalog, update stock thresholds, and add new formulations.
          </p>
        </div>

        <Tooltip text="Add new medication formulation">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-600/30 cursor-pointer active:scale-95 shrink-0"
          >
            <Plus size={18} />
            <span>Add Medicine</span>
          </button>
        </Tooltip>
      </div>

      {/* Search and Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#0e223d]/70 p-4 rounded-2xl border border-blue-900/50 shadow-inner">
        <div className="md:col-span-2 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, category, composition..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#081528] border border-blue-900/60 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl bg-[#081528] border border-blue-900/60 text-white text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Inventory</option>
            <option value="low">Low Stock (≤10 units)</option>
            <option value="out">Out of Stock (0 units)</option>
            <option value="in">Healthy Stock (&gt;10 units)</option>
          </select>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center justify-center gap-2 text-slate-400 py-10">
          <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
          <span>Syncing pharmacy inventory...</span>
        </div>
      )}

      {/* Medicine Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {medicines.map((med) => (
          <div
            key={med.id}
            className="bg-[#0e223d]/80 border border-blue-900/50 hover:border-blue-500/50 rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition shadow-xl space-y-4 group"
          >
            <div>
              {/* Header with Title and Action Icons */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-blue-950/70 border border-blue-800/40 rounded-xl text-blue-400 shrink-0">
                    <Package size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white group-hover:text-blue-300 transition">
                      {med.name}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">SKU ID: #{med.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Tooltip text="Edit medicine formulation">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMedicine({ ...med });
                        setShowEditModal(true);
                      }}
                      className="p-2 rounded-lg bg-[#132d4b]/60 hover:bg-blue-600 hover:text-white text-slate-300 transition cursor-pointer"
                      aria-label="Edit medicine"
                    >
                      <Pencil size={15} />
                    </button>
                  </Tooltip>

                  <Tooltip text="Delete medicine from catalog">
                    <button
                      type="button"
                      onClick={() => {
                        setMedicineToDelete(med);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 rounded-lg bg-[#132d4b]/60 hover:bg-rose-900/70 hover:text-rose-200 text-slate-300 transition cursor-pointer"
                      aria-label="Delete medicine"
                    >
                      <Trash2 size={15} />
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Stock Status Badge */}
              <div className="mb-3">{getStockBadge(med.stock)}</div>

              {/* Medicine Details */}
              <div className="space-y-1.5 text-xs text-slate-300 bg-[#081528] p-3.5 rounded-xl border border-blue-950">
                <div className="flex justify-between">
                  <span className="text-slate-400">Unit Price:</span>
                  <span className="font-semibold text-emerald-400">₹{med.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Inventory Stock:</span>
                  <span className="font-semibold text-white">{med.stock} units</span>
                </div>
                {med.category && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span className="text-blue-300">{med.category}</span>
                  </div>
                )}
                {med.composition && (
                  <div className="pt-1 border-t border-blue-900/40 text-[11px] text-slate-400">
                    <strong className="text-slate-300">Composition:</strong> {med.composition}
                  </div>
                )}
                {med.dosage && (
                  <div className="text-[11px] text-slate-400">
                    <strong className="text-slate-300">Dosage:</strong> {med.dosage}
                  </div>
                )}
              </div>
            </div>

            {med.description && (
              <p className="text-xs text-slate-400 line-clamp-2 italic">
                "{med.description}"
              </p>
            )}
          </div>
        ))}
      </div>

      {medicines.length === 0 && !loading && (
        <div className="text-center py-16 bg-[#0e223d]/40 rounded-2xl border border-blue-900/40">
          <Package className="h-12 w-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No medicines matched</h3>
          <p className="text-xs text-slate-400 mt-1">Try clearing your search term or stock filter.</p>
        </div>
      )}

      {/* ================= THEMED ADD MEDICINE MODAL ================= */}
      {showCreateModal && (
        <MedicineFormModal
          title="Add New Medicine to Catalog"
          data={newMedicine}
          setData={setNewMedicine}
          onCancel={() => setShowCreateModal(false)}
          onSave={handleAddMedicine}
          saveLabel="Save & Publish"
          loading={actionLoading}
        />
      )}

      {/* ================= THEMED EDIT MEDICINE MODAL ================= */}
      {showEditModal && editingMedicine && (
        <MedicineFormModal
          title="Update Medicine Information"
          data={editingMedicine}
          setData={setEditingMedicine}
          onCancel={() => {
            setShowEditModal(false);
            setEditingMedicine(null);
          }}
          onSave={handleUpdateMedicine}
          saveLabel="Update Changes"
          loading={actionLoading}
        />
      )}

      {/* ================= THEMED DELETE CONFIRMATION MODAL ================= */}
      {showDeleteModal && medicineToDelete && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#0e223d] border border-rose-900/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800/60">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Medicine?</h3>
                <p className="text-xs text-rose-300">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-white font-semibold">{medicineToDelete.name}</strong> from
              the active pharmacy database? Any automated refill alerts referencing this item will
              be cleared.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-blue-900/60">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setMedicineToDelete(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteMedicine}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{actionLoading ? "Deleting..." : "Confirm Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function MedicineFormModal({ title, data, setData, onCancel, onSave, saveLabel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-[#0e223d] border border-blue-800/80 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl space-y-5 text-white">
        
        <div className="flex items-center justify-between border-b border-blue-900/60 pb-3">
          <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Medicine Brand & Strength *
            </label>
            <input
              type="text"
              placeholder="e.g. Amoxicillin 500mg"
              value={data.name || ""}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="w-full p-3 rounded-xl bg-[#081528] border border-blue-900/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Unit Price (₹) *</label>
              <input
                type="number"
                placeholder="0.00"
                value={data.price || ""}
                onChange={(e) => setData({ ...data, price: e.target.value })}
                className="w-full p-3 rounded-xl bg-[#081528] border border-blue-900/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Current Stock Count</label>
              <input
                type="number"
                placeholder="100"
                value={data.stock || ""}
                onChange={(e) => setData({ ...data, stock: e.target.value })}
                className="w-full p-3 rounded-xl bg-[#081528] border border-blue-900/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Category</label>
            <input
              type="text"
              placeholder="e.g. Antibiotics, Cardiovascular, Analgesic"
              value={data.category || ""}
              onChange={(e) => setData({ ...data, category: e.target.value })}
              className="w-full p-3 rounded-xl bg-[#081528] border border-blue-900/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Clinical Composition</label>
            <input
              type="text"
              placeholder="e.g. Paracetamol IP 650mg"
              value={data.composition || ""}
              onChange={(e) => setData({ ...data, composition: e.target.value })}
              className="w-full p-3 rounded-xl bg-[#081528] border border-blue-900/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Recommended Dosage</label>
            <input
              type="text"
              placeholder="e.g. 1 tablet after meals twice daily"
              value={data.dosage || ""}
              onChange={(e) => setData({ ...data, dosage: e.target.value })}
              className="w-full p-3 rounded-xl bg-[#081528] border border-blue-900/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Indications / Description</label>
            <textarea
              rows={2}
              placeholder="Brief description of symptoms treated..."
              value={data.description || ""}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              className="w-full p-3 rounded-xl bg-[#081528] border border-blue-900/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Contraindications & Warnings</label>
            <textarea
              rows={2}
              placeholder="Do not administer with alcohol or in hepatic impairment..."
              value={data.contraindications || ""}
              onChange={(e) => setData({ ...data, contraindications: e.target.value })}
              className="w-full p-3 rounded-xl bg-[#081528] border border-blue-900/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-blue-900/60">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{saveLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
