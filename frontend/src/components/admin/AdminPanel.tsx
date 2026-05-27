import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

interface AdminStats {
  totalUsers: number;
  totalModels: number;
  totalChats: number;
}

export function AdminPanel() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "ADMIN") return;

    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:3000/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        setError("Failed to load admin stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, token]);

  if (user?.role !== "ADMIN") {
    return <div className="admin-panel error">Access denied</div>;
  }

  if (loading) {
    return <div className="admin-panel">Загрузка...</div>;
  }

  if (error) {
    return <div className="admin-panel error">{error}</div>;
  }

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      <div className="admin-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-value">{stats?.totalUsers || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Models</h3>
          <p className="stat-value">{stats?.totalModels || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Chats</h3>
          <p className="stat-value">{stats?.totalChats || 0}</p>
        </div>
      </div>
    </div>
  );
}
