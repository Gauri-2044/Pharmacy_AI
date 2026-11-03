import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../../config/api";
import ProfileCard from "../../components/ProfilePage/ProfileCard";
import Loader from "../../components/ProfilePage/Loader";

const getUserProfile = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    apiUrl("/api/user/profile"),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    }
  );

  return response.data;
};

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserProfile();
        setUser(data);
      } catch (err) {
        console.warn("Failed to fetch backend profile, falling back to cached profile.", err);
        // Fallback to localStorage user if available
        try {
          const cached = localStorage.getItem("user");
          if (cached) {
            setUser(JSON.parse(cached));
            return;
          }
        } catch {
          // ignore
        }
        setError("Failed to load profile. Please verify your login session.");
      }
    };

    fetchUser();
  }, []);

  const handleUserUpdate = (updatedFields) => {
    setUser((prev) => ({ ...prev, ...updatedFields }));
  };

  if (error && !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#0B1220] px-4">
        <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-center max-w-md">
          <h2 className="text-rose-300 text-lg font-semibold">{error}</h2>
          <a
            href="/login"
            className="mt-4 inline-block px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (!user) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B1220] via-[#0B1730] to-[#0B1220] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center">
        <ProfileCard user={user} onUserUpdate={handleUserUpdate} />
      </div>
    </div>
  );
};

export default ProfilePage;
