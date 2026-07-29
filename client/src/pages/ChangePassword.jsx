import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updatePasswordBackend } from "../api/report.api";
import { useAuth } from "../context/AuthContext";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // 🔐 FIXED CALL
      await updatePasswordBackend(password, currentPassword);

      alert("Password updated successfully");

      if (profile?.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/worker-dashboard");
      }
    } catch (err) {
      console.error(err);

      if (err.code === "auth/requires-recent-login") {
        alert("Please log in again before changing password");
      } else {
        alert(err.message || "Failed to update password");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">

        <h2 className="text-lg font-bold mb-4">Set New Password</h2>

        <input
          type="password"
          placeholder="Current Password"
          className="w-full border p-2 mb-3"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="New Password"
          className="w-full border p-2 mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full border p-2 mb-3"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}