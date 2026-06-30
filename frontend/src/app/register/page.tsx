"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlamourHeader } from "@/components/GlamourHeader";
import { EyeIcon } from "@/components/EyeIcon";
import { registerAction } from "@/actions/register.action";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check empty fields
    if (
      !fullName ||
      !email ||
      !role ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    // Check passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Check terms agreement
    if (!agreed) {
      setError("Please accept the Terms and Conditions.");
      return;
    }

    try {
      setLoading(true);
      await registerAction({ name: fullName, email, role, password, confirmPassword });
      window.alert("Signup Successful! Please login.");
      router.push("/login");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <GlamourHeader />

      <main className="main-content">
        <div className="register-wrapper">
          {/* Heading */}
          <div className="register-heading">
            <h1>Create Account</h1>

            <p>
              Begin your journey
              <br />
              with Glamour
            </p>
          </div>

          {/* Register Card */}
          <div
            className="auth-card"
            style={{ animationDelay: "0.05s" }}
          >
            <form onSubmit={handleSubmit} noValidate>
              {/* Full Name */}
              <div className="field-group">
                <label
                  htmlFor="fullName"
                  className="field-label"
                >
                  Full Name
                </label>

                <div className="input-wrapper">
                  <input
                    id="fullName"
                    type="text"
                    className="field-input"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) =>
                      setFullName(e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="field-group">
                <label
                  htmlFor="email"
                  className="field-label"
                >
                  Email Address
                </label>

                <div className="input-wrapper">
                  <input
                    id="email"
                    type="email"
                    className="field-input"
                    autoComplete="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              {/* Role Select */}
              <div className="field-group">
                <label
                  htmlFor="role"
                  className="field-label"
                >
                  Role
                </label>

                <div className="input-wrapper">
                  <select
                    id="role"
                    className="field-input"
                    style={{
                      appearance: 'none',
                      backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236b3545\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 16px center',
                      backgroundSize: '16px',
                      paddingRight: '40px',
                      cursor: 'pointer'
                    }}
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as "user" | "admin")
                    }
                    required
                  >
                    <option value="user">Member (User)</option>
                    <option value="admin">Administrator (Admin)</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div className="field-group">
                <label
                  htmlFor="password"
                  className="field-label"
                >
                  Password
                </label>

                <div className="input-wrapper">
                  <input
                    id="password"
                    type={
                      showPassword ? "text" : "password"
                    }
                    className="field-input has-icon"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                  />

                  <button
                    type="button"
                    className="eye-toggle"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="field-group">
                <label
                  htmlFor="confirmPassword"
                  className="field-label"
                >
                  Confirm Password
                </label>

                <div className="input-wrapper">
                  <input
                    id="confirmPassword"
                    type={
                      showConfirm ? "text" : "password"
                    }
                    className="field-input has-icon"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    required
                  />

                  <button
                    type="button"
                    className="eye-toggle"
                    aria-label={
                      showConfirm
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() =>
                      setShowConfirm((prev) => !prev)
                    }
                  >
                    <EyeIcon visible={showConfirm} />
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) =>
                    setAgreed(e.target.checked)
                  }
                />

                <span className="checkbox-label">
                  I agree to GLAMOUR&apos;S{" "}
                  <Link href="/terms-of-service">
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy-policy">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              {/* Error Message */}
              {error && (
                <p style={{ color: "red", marginBottom: "0.75rem", fontSize: "0.875rem" }}>
                  {error}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Login Link */}
      <p className="nav-link">
        Already have an Account?{" "}
        <Link href="/login">
          Login
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