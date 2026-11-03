import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import AuthLayout from "../../components/auth/AuthLayout";
import AuthCard from "../../components/auth/AuthCard";
import InputField from "../../components/auth/InputField";
import PrimaryButton from "../../components/auth/PrimaryButton";
import { useToast } from "../../components/common/useToast";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
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
        setLoading(true);

        try {
            const res = await axios.post(
                "http://localhost:5000/api/auth/login",
                formData,
                {
                    withCredentials: true,
                }
            );

            // Save JWT token to localStorage for authenticated requests
            localStorage.setItem("token", res.data.token);
            
            // Save user info for frontend reference
            if (res.data.user) {
                localStorage.setItem("user", JSON.stringify(res.data.user));
                localStorage.setItem("user_id", res.data.user.user_id);
            }

            toast.success(`Welcome back, ${res.data.user?.name || res.data.user?.username || "Patient"}!`, "Signed In");

            // Redirect to intended route (e.g. /chat) or role default
            const returnUrl = location.state?.from?.pathname || location.state?.from;
            if (returnUrl) {
                navigate(returnUrl);
            } else if (res.data.user?.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }

        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Sign in failed. Check your credentials.";
            setError(msg);
            toast.error(msg, "Authentication Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <AuthCard
                title="Welcome back"
                subtitle="Sign in to consult your AI Pharmacist and track orders."
            >
                <form className="space-y-4" onSubmit={handleSubmit}>
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

                    {error && (
                        <p className="text-red-400 text-xs bg-red-950/60 p-2.5 rounded-lg border border-red-800/60">{error}</p>
                    )}

                    <PrimaryButton type="submit" disabled={loading}>
                        {loading ? "Signing In..." : "Sign In"}
                    </PrimaryButton>
                    <p className="text-sm text-center text-[#9FB7C8]">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-blue-400 hover:underline font-medium">
                            Create Account
                        </Link>
                    </p>
                </form>
            </AuthCard>
        </AuthLayout>
    );
}
