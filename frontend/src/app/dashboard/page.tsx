"use client";

import { useAuth } from "@/components/AuthContext";
import { NavigationHeader } from "@/components/NavigationHeader";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="page-wrapper">
        <div className="main-content">
          <p style={{ color: 'var(--text-medium)' }}>Loading...</p>
        </div>
      </main>
    );
  }

  const profileImageUrl = user?.profileImage
    ? `http://localhost:4000${user.profileImage}`
    : null;

  return (
    <main className="page-wrapper">
      <NavigationHeader />
      <div className="main-content">
        <div className="auth-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '400px' }}>
          {profileImageUrl ? (
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden', marginBottom: '20px', border: '3px solid var(--pink-border)' }}>
              <img
                src={profileImageUrl}
                alt="Profile Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ) : (
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: 'var(--pink-input)', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 600, marginBottom: '20px', border: '3px solid var(--pink-border)' }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
          )}
          <h1 style={{ fontSize: '24px', fontFamily: 'Montserrat, sans-serif' }}>Welcome, {user?.name}!</h1>
          <p style={{ marginTop: '6px', color: 'var(--text-medium)', fontSize: '14px' }}>{user?.email}</p>
          <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--pink-border)', margin: '20px 0' }}></div>
          <p style={{ fontSize: '14px', color: 'var(--text-dark)', fontStyle: 'italic' }}>
            You have successfully authenticated and logged in. Feel free to edit your profile or change your password using the navigation links above.
          </p>
        </div>
      </div>
    </main>
  );
}
