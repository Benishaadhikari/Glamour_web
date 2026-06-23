"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlamourHeader } from "@/components/GlamourHeader";
import { EyeIcon } from "@/components/EyeIcon";
import { loginAction } from "@/actions/login.action";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      await loginAction({ email, password });
      // Navigate to dashboard after successful login
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <GlamourHeader />

      <main className="main-content">
        <div className="auth-card">
          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="field-group">
              <label htmlFor="email" className="field-label">
                Email Address
              </label>

              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  className="field-input"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="field-group">
              <label htmlFor="password" className="field-label">
                Password
              </label>

              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="field-input has-icon"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="eye-toggle"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>

              {/* Forgot Password */}
              <div className="forgot-link">
                <Link href="/forgot-password">
                  Forget Password?
                </Link>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p style={{ color: "red", marginBottom: "0.75rem", fontSize: "0.875rem" }}>
                {error}
              </p>
            )}

            {/* Login Button */}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </main>

      {/* Register Link */}
      <p className="nav-link">
        Don&apos;t you have an Account?{" "}
        <Link href="/register">
          Sign up
        </Link>
      </p>

      {/* Footer */}
      <footer className="footer">
        <Link href="/privacy-policy">
          Privacy Policy
        </Link>

        <Link href="/terms-of-service">
          Terms of service
        </Link>
      </footer>
    </div>
  );
}