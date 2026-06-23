"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginUser } from '@/api/auth.api';
import { useAuth } from '@/components/AuthContext';
import { loginSchema, LoginFormValues } from '@/schemas/auth.schema';
import { GlamourHeader } from '@/components/GlamourHeader';
import { EyeIcon } from '@/components/EyeIcon';
import Link from 'next/link';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError('');

    try {
      const response = await loginUser(values);
      login(response.accessToken, response.user);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Login failed');
    }
  };

  return (
    <div className="page-wrapper">
      <GlamourHeader />
      <main className="main-content">
        <div className="auth-card">
          <h1>Login</h1>
          <p>Sign in to access your dashboard.</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="field-group">
              <label htmlFor="email" className="field-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="field-input"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <p className="field-error" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="field-group">
              <label htmlFor="password" className="field-label">
                Password
              </label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="field-input has-icon"
                  autoComplete="current-password"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="eye-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
              {errors.password && (
                <p className="field-error" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <p className="field-error" role="alert">
                {serverError}
              </p>
            )}

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Login'}
            </button>
          </form>

          <p className="nav-link">
            Don&apos;t have an account? <Link href="/register">Sign up</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
