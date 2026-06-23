"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerAction } from '@/actions/register.action';
import { registerSchema, RegisterFormValues } from '@/schemas/auth.schema';
import { GlamourHeader } from '@/components/GlamourHeader';
import { EyeIcon } from '@/components/EyeIcon';
import Link from 'next/link';

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError('');

    try {
      await registerAction(values);
      router.push('/login');
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  return (
    <div className="page-wrapper">
      <GlamourHeader />
      <main className="main-content">
        <div className="auth-card">
          <h1>Create Account</h1>
          <p>Begin your journey with Glamour.</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="field-group">
              <label htmlFor="name" className="field-label">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className="field-input"
                autoComplete="name"
                {...register('name')}
              />
              {errors.name && (
                <p className="field-error" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

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
                  autoComplete="new-password"
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

            <div className="field-group">
              <label htmlFor="confirmPassword" className="field-label">
                Confirm Password
              </label>
              <div className="input-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="field-input has-icon"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  className="eye-toggle"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  <EyeIcon visible={showConfirmPassword} />
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="field-error" role="alert">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {serverError && (
              <p className="field-error" role="alert">
                {serverError}
              </p>
            )}

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="nav-link">
            Already have an account? <Link href="/login">Login</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
