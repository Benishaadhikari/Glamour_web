"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/components/AuthContext';
import { updateProfile } from '@/api/auth.api';
import { updateProfileSchema, UpdateProfileFormValues } from '@/schemas/auth.schema';
import { NavigationHeader } from '@/components/NavigationHeader';
import { EyeIcon } from '@/components/EyeIcon';

export default function ProfilePage() {
  const { user, isLoading, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    }
  }, [user, reset]);

  if (isLoading) {
    return (
      <main className="page-wrapper">
        <div className="main-content">
          <p style={{ color: 'var(--text-medium)' }}>Loading...</p>
        </div>
      </main>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (values: UpdateProfileFormValues) => {
    setServerError('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('email', values.email);

      // Only send password fields if user filled in current password
      if (values.currentPassword) {
        formData.append('currentPassword', values.currentPassword);
        if (values.newPassword) {
          formData.append('password', values.newPassword);
        }
      }

      if (selectedFile) {
        formData.append('profileImage', selectedFile);
      }

      await updateProfile(formData);
      await refreshUser();
      setSuccessMessage('Profile updated successfully!');
      setSelectedFile(null);
      setPreviewUrl(null);
      reset({
        name: user?.name,
        email: user?.email,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  const currentProfileImage = user?.profileImage
    ? `http://localhost:4000${user.profileImage}`
    : null;

  const divider = (
    <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--pink-border)', margin: '20px 0' }} />
  );

  return (
    <main className="page-wrapper">
      <NavigationHeader />
      <div className="main-content" style={{ alignItems: 'flex-start', justifyContent: 'center' }}>
        <div className="auth-card" style={{ maxWidth: '420px', width: '100%' }}>
          <h1 style={{ fontSize: '22px', marginBottom: '4px', fontFamily: 'Montserrat, sans-serif' }}>Edit Profile</h1>
          <p style={{ color: 'var(--text-medium)', fontSize: '12px', marginBottom: '24px' }}>
            Update your personal details, profile picture, and password.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* ── Avatar ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '3px solid var(--pink-border)',
                  position: 'relative',
                  backgroundColor: 'var(--pink-input)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : currentProfileImage ? (
                  <img src={currentProfileImage} alt="Current profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '32px', fontWeight: 600, color: 'var(--text-dark)' }}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </span>
                )}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: '#fff',
                    fontSize: '9px',
                    textAlign: 'center',
                    padding: '3px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Change
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              {selectedFile && (
                <p style={{ fontSize: '11px', color: 'var(--text-medium)', marginTop: '8px' }}>
                  {selectedFile.name}
                </p>
              )}
            </div>

            {/* ── Basic Info ── */}
            <div className="field-group">
              <label htmlFor="name" className="field-label">Full Name</label>
              <input id="name" type="text" className="field-input" {...register('name')} />
              {errors.name && <p className="field-error" role="alert">{errors.name.message}</p>}
            </div>

            <div className="field-group">
              <label htmlFor="email" className="field-label">Email Address</label>
              <input id="email" type="email" className="field-input" {...register('email')} />
              {errors.email && <p className="field-error" role="alert">{errors.email.message}</p>}
            </div>

            {divider}

            {/* ── Change Password ── */}
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Change Password <span style={{ fontSize: '10px', fontWeight: 400, color: 'var(--text-light)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </p>

            <div className="field-group">
              <label htmlFor="currentPassword" className="field-label">Current Password</label>
              <div className="input-wrapper">
                <input
                  id="currentPassword"
                  type={showCurrentPw ? 'text' : 'password'}
                  className="field-input has-icon"
                  autoComplete="current-password"
                  placeholder="Enter your current password"
                  {...register('currentPassword')}
                />
                <button type="button" className="eye-toggle" onClick={() => setShowCurrentPw(p => !p)} aria-label="Toggle visibility">
                  <EyeIcon visible={showCurrentPw} />
                </button>
              </div>
              {errors.currentPassword && <p className="field-error" role="alert">{errors.currentPassword.message}</p>}
            </div>

            <div className="field-group">
              <label htmlFor="newPassword" className="field-label">New Password</label>
              <div className="input-wrapper">
                <input
                  id="newPassword"
                  type={showNewPw ? 'text' : 'password'}
                  className="field-input has-icon"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  {...register('newPassword')}
                />
                <button type="button" className="eye-toggle" onClick={() => setShowNewPw(p => !p)} aria-label="Toggle visibility">
                  <EyeIcon visible={showNewPw} />
                </button>
              </div>
              {errors.newPassword && <p className="field-error" role="alert">{errors.newPassword.message}</p>}
            </div>

            <div className="field-group">
              <label htmlFor="confirmNewPassword" className="field-label">Confirm New Password</label>
              <div className="input-wrapper">
                <input
                  id="confirmNewPassword"
                  type={showConfirmPw ? 'text' : 'password'}
                  className="field-input has-icon"
                  autoComplete="new-password"
                  placeholder="Repeat new password"
                  {...register('confirmNewPassword')}
                />
                <button type="button" className="eye-toggle" onClick={() => setShowConfirmPw(p => !p)} aria-label="Toggle visibility">
                  <EyeIcon visible={showConfirmPw} />
                </button>
              </div>
              {errors.confirmNewPassword && <p className="field-error" role="alert">{errors.confirmNewPassword.message}</p>}
            </div>

            {divider}

            {serverError && (
              <p className="field-error" role="alert" style={{ marginBottom: '12px' }}>{serverError}</p>
            )}
            {successMessage && (
              <p style={{ color: '#3a7c3a', fontSize: '13px', marginBottom: '12px', fontWeight: 500 }} role="status">
                ✓ {successMessage}
              </p>
            )}

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
