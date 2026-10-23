
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        setError("Please login to continue.");
        navigate("/login", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
      navigate("/login", { replace: true });
    } catch {
      setError("Unable to logout. Please try again.");
    }
  };

  if (loading) {
    return <p className="p-8">Loading dashboard...</p>;
  }

  if (!user) {
    return <p className="p-8">{error || "Please login."}</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl rounded-2xl border bg-white p-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">WorkFlow AI</h1>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-black px-4 py-2 text-white"
          >
            Logout
          </button>
        </div>

        <h2 className="mt-10 text-3xl font-bold">
          Welcome, {user.name || user.email}
        </h2>
        <p className="mt-3 text-gray-600">
          You are logged in successfully.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          Email: {user.email}
        </p>
        <p className="text-sm text-gray-500">
          Role: {user.role}
        </p>
      </div>
    </main>
  );
}
