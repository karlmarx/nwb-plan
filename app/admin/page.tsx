"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "admin";

  useEffect(() => {
    if (status === "loading") return;
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data.users);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [status, isAdmin]);

  async function updateUserRole(userId: string, role: string) {
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      if (!res.ok) throw new Error("Failed to update user role");

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-dim">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="bg-card border border-border rounded-lg p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-text mb-2">Not signed in</h1>
          <p className="text-text-dim">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="bg-danger-bg border border-danger-border rounded-lg p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-danger mb-2">Access denied</h1>
          <p className="text-text-dim">
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-text mb-6">Admin Panel</h1>

        {/* Current User Info */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-text mb-2">
            Current User
          </h2>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-text">{session.user?.name}</p>
              <p className="text-text-dim text-sm">{session.user?.email}</p>
            </div>
            <span className="ml-auto px-3 py-1 rounded-full text-xs font-medium bg-safe-bg text-safe border border-safe-border">
              {userRole}
            </span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-danger-bg border border-danger-border rounded-lg p-4 mb-6">
            <p className="text-danger">{error}</p>
          </div>
        )}

        {/* Users List */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold text-text mb-4">
            User Management
          </h2>

          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-muted">No users yet</p>
              <p className="text-text-muted text-sm mt-1">
                Users will appear here once KV storage is configured.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-text-dim text-sm font-medium">
                    Name
                  </th>
                  <th className="text-left py-2 px-3 text-text-dim text-sm font-medium">
                    Email
                  </th>
                  <th className="text-left py-2 px-3 text-text-dim text-sm font-medium">
                    Role
                  </th>
                  <th className="text-right py-2 px-3 text-text-dim text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border">
                    <td className="py-3 px-3 text-text">{user.name}</td>
                    <td className="py-3 px-3 text-text-dim">{user.email}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-safe-bg text-safe border border-safe-border"
                            : user.role === "approved"
                              ? "bg-safe-bg text-safe border border-safe-border"
                              : user.role === "denied"
                                ? "bg-danger-bg text-danger border border-danger-border"
                                : "bg-warning-bg text-warning border border-warning-border"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {user.role !== "admin" && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() =>
                              updateUserRole(user.id, "approved")
                            }
                            className="px-3 py-1 text-xs rounded bg-safe-bg text-safe border border-safe-border hover:opacity-80 transition-opacity"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateUserRole(user.id, "denied")}
                            className="px-3 py-1 text-xs rounded bg-danger-bg text-danger border border-danger-border hover:opacity-80 transition-opacity"
                          >
                            Deny
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
