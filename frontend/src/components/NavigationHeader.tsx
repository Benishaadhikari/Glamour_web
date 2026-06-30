"use client";

import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';

export function NavigationHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="header" style={{ justifyContent: 'space-between', padding: '12px 24px' }}>
      <Link href="/dashboard" className="brand-logo">
        Glamour
      </Link>

      <nav style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', color: 'var(--text-dark)', fontWeight: 500, fontSize: '14px' }}>
          Dashboard
        </Link>
        {user?.role === 'admin' && (
          <Link href="/admin" style={{ textDecoration: 'none', color: 'var(--text-dark)', fontWeight: 500, fontSize: '14px' }}>
            Admin
          </Link>
        )}
        <Link href="/profile" style={{ textDecoration: 'none', color: 'var(--text-dark)', fontWeight: 500, fontSize: '14px' }}>
          Profile
        </Link>
        <button
          onClick={logout}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-medium)',
            fontWeight: 500,
            fontSize: '14px',
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          Logout
        </button>
      </nav>
    </header>
  );
}
