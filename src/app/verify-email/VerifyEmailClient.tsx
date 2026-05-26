'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token') ?? '';
  const emailFromUrl = searchParams.get('email') ?? '';

  const [token, setToken] = useState(tokenFromUrl);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const router = useRouter();

  const verifyEmail = useCallback(async (tokenValue: string) => {
    setLoading(true);
    setError('');
    setStatusMessage('');

    try {
      const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(tokenValue)}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Verification failed.');
        return;
      }

      setVerified(true);
      setStatusMessage(data.message || 'Email verified successfully.');
      // Redirect to sign-in after short delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err) {
      setError('Unable to verify email. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (tokenFromUrl) {
      verifyEmail(tokenFromUrl);
    }
  }, [tokenFromUrl, verifyEmail]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setStatusMessage('');

    if (!token.trim()) {
      setError('Enter the verification code.');
      return;
    }

    verifyEmail(token.trim());
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-xl p-8 bg-white dark:bg-slate-900 rounded-lg shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Verify your email</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            {emailFromUrl
              ? `A verification email was sent to ${emailFromUrl}. Follow the link or enter the 6-digit code below.`
              : 'Enter the 6-digit verification code sent to your email, or use the verification link.'}
          </p>
        </div>

        {statusMessage && (
          <div className="mb-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200">
            {statusMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {!verified && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Verification code
              </label>
              <input
                id="token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter your 6-digit verification code"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              {loading ? 'Verifying...' : 'Verify email'}
            </button>
          </form>
        )}

        {verified && (
          <div className="mt-4 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Go to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
