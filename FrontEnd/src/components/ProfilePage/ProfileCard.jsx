import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { 
  User, 
  Mail, 
  Phone, 
  ShieldAlert, 
  Package, 
  Calendar, 
  Pencil, 
  X, 
  Check, 
  Loader2, 
  Sparkles,
  ExternalLink 
} from "lucide-react";
import ProfileHeader from "./ProfileHeader";
import ProfileStats from "./ProfileStats";
import Tooltip from "../common/Tooltip";
import { useToast } from "../common/useToast";

const ProfileCard = ({ user, onUserUpdate }) => {
  const toast = useToast();
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: user?.username || user?.name || "",
    phone: user?.phone || "",
    allergy: user?.allergy || "",
    image_url: user?.image_url || user?.avatar || "",
  });

  const displayName = user?.username || user?.name || "Patient Member";
  const displayRole = user?.role || user?.user_role || "Pharmacy Patient";

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        "http://localhost:5000/api/user/profile",
        {
          allergy: formData.allergy,
          image_url: formData.image_url,
          phone: formData.phone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // Update local storage user
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          const updated = { ...parsed, ...formData };
          localStorage.setItem("user", JSON.stringify(updated));
        }
      } catch {
        // ignore
      }

      if (onUserUpdate) {
        onUserUpdate(formData);
      }

      toast.success("Profile preferences updated successfully!", "Saved");
      setShowEditModal(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      toast.error(
        err.response?.data?.message || "Could not update profile preferences.",
        "Update Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl bg-[#0e223d]/90 border border-blue-900/60 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:border-blue-500/50 backdrop-blur-md">
      <ProfileHeader user={{ ...user, avatar: formData.image_url || user?.avatar }} />

      <div className="pt-20 px-6 sm:px-8 pb-8 text-center">
        {/* Name and Role */}
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {displayName}
        </h2>

        <span className="inline-block mt-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/70 text-cyan-400 border border-cyan-500/30">
          {displayRole}
        </span>

        {/* User Details Grid */}
        <div className="mt-4 space-y-2 text-sm text-slate-300 text-left bg-[#081528] p-4 rounded-2xl border border-blue-950">
          <div className="flex items-center gap-2.5">
            <Mail className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="truncate">{user?.email || "patient@pharmacy.com"}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Phone className="h-4 w-4 text-blue-400 shrink-0" />
            <span>{formData.phone || user?.phone || "No phone added"}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
            <div>
              <span>
              Allergies:{" "}
              <strong className="text-amber-300 font-medium">
                {formData.allergy || user?.allergy || "None reported"}
              </strong>
              </span>
              {Array.isArray(user?.allergy_chemicals) && user.allergy_chemicals.length > 0 && (
                <p className="mt-1 text-[11px] text-slate-400">
                  Associated agents for safety review: {user.allergy_chemicals.join(", ")}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-1 text-xs text-slate-400 border-t border-blue-900/40">
            <span>Total Healthcare Spend:</span>
            <span className="text-emerald-400 font-semibold text-sm">
              ₹{Number(user?.total_spent || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Stats */}
        <ProfileStats user={user} />

        {/* Recent Orders Preview */}
        {Array.isArray(user?.recentOrders) && user.recentOrders.length > 0 && (
          <div className="mt-6 border-t border-blue-900/60 pt-4 text-left">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white text-xs font-semibold flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-blue-400" />
                Recent Orders
              </p>
              <Link to="/history" className="text-[11px] text-blue-400 hover:underline flex items-center gap-1">
                View all <ExternalLink className="h-2.5 w-2.5" />
              </Link>
            </div>
            <div className="space-y-2">
              {user.recentOrders.slice(0, 3).map((order) => (
                <div
                  key={order.id || order.order_id}
                  className="flex items-center justify-between text-xs bg-[#081528] border border-blue-950 rounded-xl px-3 py-2"
                >
                  <span className="text-slate-300 font-medium truncate max-w-[200px]">
                    {order.medicine_name || `Medicine #${order.medicine_id}`}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-blue-300">x{order.quantity}</span>
                    <span className="text-slate-400 font-mono">₹{order.total_price || "--"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </button>

          <Link
            to="/chat"
            className="flex-1 py-3 px-4 rounded-xl bg-[#132d4b] hover:bg-[#1a3c63] text-slate-200 hover:text-white font-semibold text-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-blue-900/60"
          >
            <Sparkles className="h-4 w-4 text-cyan-400" />
            AI Pharmacist
          </Link>
        </div>
      </div>

      {/* ================= THEMED EDIT PROFILE POPUP (ISSUE #5 & #6 FIX) ================= */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#0e223d] border border-blue-800/80 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 text-white text-left">
            <div className="flex items-center justify-between border-b border-blue-900/60 pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-bold">Edit Profile Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name / Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#081528] border border-blue-900/60 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#081528] border border-blue-900/60 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Reported Drug Allergies (e.g. Penicillin, Sulfa)
                </label>
                <input
                  type="text"
                  value={formData.allergy}
                  onChange={(e) => setFormData({ ...formData, allergy: e.target.value })}
                  placeholder="e.g. Penicillin, Aspirin"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#081528] border border-blue-900/60 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
                <p className="text-[10px] text-amber-300/80 mt-1">
                  The system records this as a reported trigger and pauses possible matches for pharmacist review. It does not diagnose allergies.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Avatar / Profile Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#081528] border border-blue-900/60 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-blue-900/60">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer active:scale-95 text-sm"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{loading ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
