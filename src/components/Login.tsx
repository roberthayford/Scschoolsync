import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'forgot';

const Login: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

    const validatePassword = (pwd: string): string | null => {
        if (pwd.length < 8) return 'Password must be at least 8 characters';
        return null;
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        // Validate password
        const pwdError = validatePassword(password);
        if (pwdError) {
            setMessage({ type: 'error', text: pwdError });
            return;
        }

        // Check password match
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: import.meta.env.VITE_APP_URL || window.location.origin,
            },
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({
                type: 'success',
                text: 'Check your email to confirm your account! You may need to check your spam folder.'
            });
        }
        setLoading(false);
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            if (error.message.includes('Email not confirmed')) {
                setMessage({ type: 'error', text: 'Please confirm your email before signing in. Check your inbox for the confirmation link.' });
            } else {
                setMessage({ type: 'error', text: error.message });
            }
        }
        setLoading(false);
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${import.meta.env.VITE_APP_URL || window.location.origin}/#/reset-password`,
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: 'Check your email for a password reset link!' });
        }
        setLoading(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        if (mode === 'signin') handleSignIn(e);
        else if (mode === 'signup') handleSignUp(e);
        else handleForgotPassword(e);
    };

    const switchMode = (newMode: AuthMode) => {
        setMode(newMode);
        setMessage(null);
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">SchoolSync</h1>
                    <p className="text-slate-600">
                        {mode === 'signin' && 'Welcome back! Sign in to continue.'}
                        {mode === 'signup' && 'Create your account to get started.'}
                        {mode === 'forgot' && 'Reset your password.'}
                    </p>
                </div>

                {/* Tab Selector (for signin/signup) */}
                {mode !== 'forgot' && (
                    <div className="flex mb-6 bg-slate-100 rounded-xl p-1">
                        <button
                            type="button"
                            onClick={() => switchMode('signin')}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${mode === 'signin'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => switchMode('signup')}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${mode === 'signup'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Field */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Field (not for forgot mode) */}
                    {mode !== 'forgot' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-12 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {mode === 'signup' && password.length > 0 && password.length < 8 && (
                                <p className="text-xs text-amber-600 mt-1">Password must be at least 8 characters</p>
                            )}
                        </div>
                    )}

                    {/* Confirm Password (signup only) */}
                    {mode === 'signup' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    required
                                    minLength={8}
                                />
                            </div>
                            {confirmPassword.length > 0 && password !== confirmPassword && (
                                <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                            )}
                        </div>
                    )}

                    {/* Error/Success Message */}
                    {message && (
                        <div className={`flex items-start gap-2 p-3 rounded-xl text-sm ${message.type === 'error'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-green-50 text-green-700'
                            }`}>
                            {message.type === 'error' ? <AlertCircle size={18} className="shrink-0 mt-0.5" /> : <CheckCircle size={18} className="shrink-0 mt-0.5" />}
                            <span>{message.text}</span>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || (mode === 'signup' && password !== confirmPassword)}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading && <Loader2 className="animate-spin" size={18} />}
                        {mode === 'signin' && (loading ? 'Signing In...' : 'Sign In')}
                        {mode === 'signup' && (loading ? 'Creating Account...' : 'Create Account')}
                        {mode === 'forgot' && (loading ? 'Sending...' : 'Send Reset Link')}
                    </button>
                </form>

                {/* Footer Links */}
                <div className="mt-6 text-center text-sm">
                    {mode === 'signin' && (
                        <button
                            type="button"
                            onClick={() => switchMode('forgot')}
                            className="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            Forgot your password?
                        </button>
                    )}
                    {mode === 'forgot' && (
                        <button
                            type="button"
                            onClick={() => switchMode('signin')}
                            className="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            ← Back to Sign In
                        </button>
                    )}
                </div>
            </div>

            {/* Footer */}
            <p className="mt-6 text-sm text-slate-500">
                © 2024 SchoolSync. All rights reserved.
            </p>
        </div>
    );
};

export default Login;
