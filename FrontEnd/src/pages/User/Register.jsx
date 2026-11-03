import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../../config/api";

import AuthLayout from "../../components/auth/AuthLayout";
import AuthCard from "../../components/auth/AuthCard";
import InputField from "../../components/auth/InputField";
import PrimaryButton from "../../components/auth/PrimaryButton";
import { useToast } from "../../components/common/useToast";

export default function Register() {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      toast.warning("Passwords do not match.", "Validation Error");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        apiUrl("/api/auth/register"),
        formData,
        { withCredentials: true }
      );

      toast.success("Account created successfully! Please sign in.", "Registered");
      navigate("/login");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Registration failed. Try again.";
      setError(msg);
      toast.error(msg, "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Create your patient account"
        subtitle="Manage prescriptions, consultations, and refills with Pharmacy AI."
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <InputField
            label="Full Name"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="John Doe"
          />

          <InputField
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
          />

          <InputField
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="patient@pharmacy.com"
          />

          <InputField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
          />

          <InputField
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
          />

          {error && (
            <p className="text-red-400 text-xs bg-red-950/60 p-2.5 rounded-lg border border-red-800/60">{error}</p>
          )}

          <PrimaryButton type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </PrimaryButton>
        </form>

        <p className="text-[#9FB7C8] text-sm text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
