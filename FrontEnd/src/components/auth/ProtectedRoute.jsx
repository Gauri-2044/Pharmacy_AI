import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useToast } from "../common/useToast";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const toast = useToast();
  const token = localStorage.getItem("token");
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (!token && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.warning(
        "Please log in to consult with the AI Pharmacist.",
        "Sign In Required"
      );
    }
  }, [token, toast]);

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

