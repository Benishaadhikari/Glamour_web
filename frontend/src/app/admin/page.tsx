"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthContext";
import { NavigationHeader } from "@/components/NavigationHeader";
import {
  getUsers,
  updateUserRole,
  deleteUser,
  adminCreateUser,
  adminEditUser,
  UserInfo
} from "@/api/auth.api";

export default function AdminPage() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Confirmation Modal (for Deleting or simple actions)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "delete";
    targetUser: UserInfo | null;
  }>({
    isOpen: false,
    type: "delete",
    targetUser: null,
  });

  // Create / Edit Form Modal
  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    targetUser: UserInfo | null;
  }>({
    isOpen: false,
    mode: "create",
    targetUser: null,
  });

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<"user" | "admin">("user");
  const [formPassword, setFormPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchUsersList = async () => {
    try {
      setIsLoading(true);
      const data = await getUsers();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to retrieve user accounts.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchUsersList();
    }
  }, [currentUser]);

  // Show a temp notification
  const triggerNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Open Form Modal for Creating
  const handleOpenCreateModal = () => {
    setFormName("");
    setFormEmail("");
    setFormRole("user");
    setFormPassword("");
    setFormError("");
    setFormModal({
      isOpen: true,
      mode: "create",
      targetUser: null,
    });
  };

  // Open Form Modal for Editing
  const handleOpenEditModal = (targetUser: UserInfo) => {
    setFormName(targetUser.name);
    setFormEmail(targetUser.email);
    setFormRole(targetUser.role as "user" | "admin");
    setFormPassword(""); // Password optional on edit
    setFormError("");
    setFormModal({
      isOpen: true,
      mode: "edit",
      targetUser,
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formName || !formEmail || !formRole) {
      setFormError("Please fill in all required fields.");
      return;
    }

    if (formModal.mode === "create" && !formPassword) {
      setFormError("Password is required for new accounts.");
      return;
    }

    try {
      setFormSubmitting(true);
      if (formModal.mode === "create") {
        const result = await adminCreateUser({
          name: formName,
          email: formEmail,
          role: formRole,
          password: formPassword,
        });
        setUsers((prev) => [...prev, result.user]);
        triggerNotification(result.message || "Member account created successfully.");
      } else {
        // Edit Mode
        const targetId = formModal.targetUser?._id;
        if (!targetId) return;

        const payload: any = {
          name: formName,
          email: formEmail,
          role: formRole,
        };
        if (formPassword) {
          payload.password = formPassword;
        }

        const result = await adminEditUser(targetId, payload);
        setUsers((prev) =>
          prev.map((u) => (u._id === targetId ? result.user : u))
        );
        triggerNotification(result.message || "User updated successfully.");
      }
      setFormModal({ isOpen: false, mode: "create", targetUser: null });
    } catch (err: any) {
      setFormError(err.message || "Request failed. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteRequest = (targetUser: UserInfo) => {
    setConfirmModal({
      isOpen: true,
      type: "delete",
      targetUser,
    });
  };

  const executeConfirmedDelete = async () => {
    const { targetUser } = confirmModal;
    if (!targetUser) return;

    setConfirmModal((prev) => ({ ...prev, isOpen: false }));

    try {
      const result = await deleteUser(targetUser._id);
      setUsers((prev) => prev.filter((u) => u._id !== targetUser._id));
      triggerNotification(result.message || "User account deleted successfully.");
    } catch (err: any) {
      triggerNotification(err.message || "Action failed.", "error");
    }
  };

  if (authLoading || (isLoading && users.length === 0)) {
    return (
      <main className="page-wrapper">
        <NavigationHeader />
        <div className="main-content" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <div style={{ color: "var(--text-medium)", fontSize: "18px", fontWeight: 500 }}>
            Loading Glamour Directory...
          </div>
        </div>
      </main>
    );
  }

  // Filtered users based on search query
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const regularCount = totalUsers - adminCount;

  return (
    <main className="page-wrapper" style={{ minHeight: "100vh", position: "relative" }}>
      <NavigationHeader />
      
      <div className="main-content" style={{ padding: "40px 24px", maxWidth: "1200px", margin: "0 auto", width: "100%", zIndex: 1 }}>
        
        {/* Header Title Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "36px", fontWeight: 500, letterSpacing: "0.15em", color: "var(--text-dark)", textTransform: "uppercase" }}>
              Admin Control Panel
            </h1>
            <p style={{ color: "var(--text-medium)", fontSize: "14px", marginTop: "8px", letterSpacing: "0.05em" }}>
              Manage glamour members, inspect profile accounts, and allocate roles.
            </p>
          </div>
          
          <button
            onClick={handleOpenCreateModal}
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "var(--text-medium)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "14px",
              letterSpacing: "0.05em",
              cursor: "pointer",
              boxShadow: "var(--shadow)",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--text-dark)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--text-medium)"}
          >
            + Create New User
          </button>
        </div>

        {/* Floating Notification */}
        {notification && (
          <div style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            backgroundColor: notification.type === "success" ? "rgba(255, 255, 255, 0.95)" : "rgba(220, 50, 80, 0.95)",
            color: notification.type === "success" ? "var(--text-dark)" : "#fff",
            borderLeft: `5px solid ${notification.type === "success" ? "var(--text-medium)" : "#700"}`,
            padding: "16px 24px",
            borderRadius: "8px",
            boxShadow: "var(--shadow-lg)",
            zIndex: 1000,
            backdropFilter: "blur(8px)",
            fontWeight: 500,
            fontSize: "14px",
            animation: "fadeIn 0.3s ease-out"
          }}>
            {notification.message}
          </div>
        )}

        {/* Stats Summary Panel */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "40px" }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.25) 100%)",
            backdropFilter: "blur(12px)",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            boxShadow: "var(--shadow)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center"
          }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Total Accounts</span>
            <span style={{ fontSize: "36px", fontWeight: 700, color: "var(--text-dark)", fontFamily: "Cormorant Garamond, serif" }}>{totalUsers}</span>
          </div>

          <div style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.25) 100%)",
            backdropFilter: "blur(12px)",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            boxShadow: "var(--shadow)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center"
          }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Admins</span>
            <span style={{ fontSize: "36px", fontWeight: 700, color: "var(--text-dark)", fontFamily: "Cormorant Garamond, serif" }}>{adminCount}</span>
          </div>

          <div style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.25) 100%)",
            backdropFilter: "blur(12px)",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            boxShadow: "var(--shadow)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center"
          }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Regular Members</span>
            <span style={{ fontSize: "36px", fontWeight: 700, color: "var(--text-dark)", fontFamily: "Cormorant Garamond, serif" }}>{regularCount}</span>
          </div>
        </div>

        {/* Directory Card */}
        <div style={{
          background: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(16px)",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.35)",
          boxShadow: "var(--shadow-lg)",
          padding: "32px",
          overflow: "hidden"
        }}>
          {/* Table Toolbar */}
          <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", color: "var(--text-dark)", letterSpacing: "0.05em", fontWeight: 600 }}>
              User Directory
            </h2>
            <div style={{ position: "relative", width: "100%", maxWidth: "340px" }}>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1px solid var(--pink-border)",
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  color: "var(--text-dark)",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--text-medium)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(232, 168, 181, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--pink-border)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* User Table container */}
          {error ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-medium)" }}>
              <p style={{ fontWeight: 600 }}>Error Loading Directory</p>
              <p style={{ fontSize: "14px", marginTop: "8px" }}>{error}</p>
              <button
                onClick={fetchUsersList}
                style={{ marginTop: "16px", padding: "8px 16px", borderRadius: "8px", border: "none", background: "var(--text-medium)", color: "#fff", cursor: "pointer", fontSize: "13px" }}
              >
                Try Again
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-medium)" }}>
              <p style={{ fontSize: "16px", fontStyle: "italic" }}>
                {searchQuery ? "No members match your search criteria." : "No registered members found."}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 10px", textAlign: "left" }}>
                <thead>
                  <tr style={{ color: "var(--text-medium)", fontSize: "13px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    <th style={{ padding: "12px 16px" }}>User</th>
                    <th style={{ padding: "12px 16px" }}>Email</th>
                    <th style={{ padding: "12px 16px" }}>Role</th>
                    <th style={{ padding: "12px 16px" }}>Joined</th>
                    <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const isSelf = u._id === currentUser?._id;
                    const avatarUrl = u.profileImage ? `http://localhost:4000${u.profileImage}` : null;
                    const joinedDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "N/A";

                    return (
                      <tr
                        key={u._id}
                        style={{
                          background: "rgba(255, 255, 255, 0.45)",
                          transition: "transform 0.2s, background-color 0.2s, box-shadow 0.2s",
                          boxShadow: "0 2px 8px rgba(180, 80, 100, 0.04)",
                        }}
                      >
                        {/* Member Details */}
                        <td style={{ padding: "14px 16px", borderRadius: "12px 0 0 12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {avatarUrl ? (
                              <div style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", border: "2px solid var(--pink-border)" }}>
                                <img src={avatarUrl} alt={u.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              </div>
                            ) : (
                              <div style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                backgroundColor: "var(--pink-input)",
                                color: "var(--text-dark)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 600,
                                fontSize: "14px",
                                border: "2px solid var(--pink-border)"
                              }}>
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: 600, color: "var(--text-dark)", fontSize: "14px" }}>
                                {u.name} {isSelf && <span style={{ fontStyle: "italic", fontWeight: 400, color: "var(--text-light)", fontSize: "12px" }}>(You)</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email address */}
                        <td style={{ padding: "14px 16px", color: "var(--text-medium)", fontSize: "14px" }}>
                          {u.email}
                        </td>

                        {/* Role pill badge */}
                        <td style={{ padding: "14px 16px" }}>
                          {u.role === "admin" ? (
                            <span style={{
                              padding: "4px 10px",
                              borderRadius: "20px",
                              backgroundColor: "var(--text-medium)",
                              color: "#fff",
                              fontSize: "11px",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              boxShadow: "0 2px 5px rgba(107, 53, 69, 0.2)"
                            }}>
                              Admin
                            </span>
                          ) : (
                            <span style={{
                              padding: "4px 10px",
                              borderRadius: "20px",
                              backgroundColor: "rgba(255, 255, 255, 0.8)",
                              color: "var(--text-medium)",
                              border: "1px solid var(--pink-border)",
                              fontSize: "11px",
                              fontWeight: 500,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em"
                            }}>
                              Member
                            </span>
                          )}
                        </td>

                        {/* Joined Date */}
                        <td style={{ padding: "14px 16px", color: "var(--text-light)", fontSize: "13px" }}>
                          {joinedDate}
                        </td>

                        {/* Actions block */}
                        <td style={{ padding: "14px 16px", borderRadius: "0 12px 12px 0", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button
                              onClick={() => handleOpenEditModal(u)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "8px",
                                border: "1px solid var(--pink-border)",
                                backgroundColor: "rgba(255, 255, 255, 0.7)",
                                color: "var(--text-medium)",
                                fontSize: "12px",
                                fontWeight: 500,
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "var(--text-medium)";
                                e.currentTarget.style.color = "#fff";
                                e.currentTarget.style.borderColor = "var(--text-medium)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
                                e.currentTarget.style.color = "var(--text-medium)";
                                e.currentTarget.style.borderColor = "var(--pink-border)";
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteRequest(u)}
                              disabled={isSelf}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "8px",
                                border: "1px solid transparent",
                                backgroundColor: isSelf ? "rgba(0,0,0,0.03)" : "rgba(220, 50, 80, 0.1)",
                                color: isSelf ? "var(--text-light)" : "rgb(200, 30, 60)",
                                fontSize: "12px",
                                fontWeight: 500,
                                cursor: isSelf ? "not-allowed" : "pointer",
                                opacity: isSelf ? 0.5 : 1,
                                transition: "all 0.2s"
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelf) {
                                  e.currentTarget.style.backgroundColor = "rgb(200, 30, 60)";
                                  e.currentTarget.style.color = "#fff";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelf) {
                                  e.currentTarget.style.backgroundColor = "rgba(220, 50, 80, 0.1)";
                                  e.currentTarget.style.color = "rgb(200, 30, 60)";
                                }
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT POPUP MODAL */}
      {formModal.isOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(58, 26, 34, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000,
          animation: "fadeIn 0.2s ease-out"
        }}>
          <div style={{
            background: "rgba(248, 208, 216, 0.98)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.45)",
            borderRadius: "20px",
            padding: "36px",
            maxWidth: "480px",
            width: "90%",
            boxShadow: "var(--shadow-lg)",
            color: "var(--text-dark)",
            animation: "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          }}>
            <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", fontWeight: 600, marginBottom: "20px", textAlign: "center" }}>
              {formModal.mode === "create" ? "Create New Glamour User" : "Edit User Account"}
            </h3>

            <form onSubmit={handleFormSubmit}>
              {/* Full Name */}
              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-medium)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid var(--pink-border)",
                    backgroundColor: "#fff",
                    color: "var(--text-dark)",
                    fontSize: "14px",
                    outline: "none"
                  }}
                  required
                />
              </div>

              {/* Email Address */}
              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-medium)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid var(--pink-border)",
                    backgroundColor: "#fff",
                    color: "var(--text-dark)",
                    fontSize: "14px",
                    outline: "none"
                  }}
                  required
                />
              </div>

              {/* Role dropdown */}
              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-medium)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Role
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as "user" | "admin")}
                    disabled={formModal.mode === "edit" && formModal.targetUser?._id === currentUser?._id}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: "1px solid var(--pink-border)",
                      backgroundColor: "#fff",
                      color: "var(--text-dark)",
                      fontSize: "14px",
                      outline: "none",
                      appearance: "none",
                      backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236b3545\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")',
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 16px center",
                      backgroundSize: "16px"
                    }}
                  >
                    <option value="user">Member (User)</option>
                    <option value="admin">Administrator (Admin)</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-medium)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Password {formModal.mode === "edit" && <span style={{ textTransform: "none", fontStyle: "italic", fontWeight: 400 }}>(Leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder={formModal.mode === "edit" ? "••••••••" : ""}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid var(--pink-border)",
                    backgroundColor: "#fff",
                    color: "var(--text-dark)",
                    fontSize: "14px",
                    outline: "none"
                  }}
                  required={formModal.mode === "create"}
                />
              </div>

              {/* Error inside Form */}
              {formError && (
                <p style={{ color: "rgb(200, 30, 60)", fontSize: "13px", fontWeight: 500, marginBottom: "20px", textAlign: "center" }}>
                  {formError}
                </p>
              )}

              {/* Buttons */}
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={() => setFormModal({ isOpen: false, mode: "create", targetUser: null })}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid var(--pink-border)",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    color: "var(--text-medium)",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: "var(--text-medium)",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    opacity: formSubmitting ? 0.7 : 1
                  }}
                >
                  {formSubmitting ? "Submitting..." : formModal.mode === "create" ? "Create Account" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmModal.isOpen && confirmModal.targetUser && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(58, 26, 34, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000
        }}>
          <div style={{
            background: "rgba(248, 208, 216, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            borderRadius: "20px",
            padding: "32px",
            maxWidth: "420px",
            width: "90%",
            boxShadow: "var(--shadow-lg)",
            textAlign: "center",
            color: "var(--text-dark)"
          }}>
            <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "24px", fontWeight: 600, marginBottom: "12px" }}>
              Delete Account
            </h3>
            
            <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--text-medium)", marginBottom: "24px" }}>
              Are you absolutely sure you want to delete <strong>{confirmModal.targetUser.name}</strong>&apos;s account?
              <br />
              <span style={{ color: "rgb(180, 20, 50)", fontWeight: 600, display: "block", marginTop: "8px" }}>
                This action is permanent and cannot be undone.
              </span>
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => setConfirmModal({ isOpen: false, type: "delete", targetUser: null })}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "1px solid var(--pink-border)",
                  backgroundColor: "rgba(255,255,255,0.7)",
                  color: "var(--text-medium)",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={executeConfirmedDelete}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "rgb(200, 30, 60)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
