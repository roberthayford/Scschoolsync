import React, { useState } from 'react';
import { User, Lock, Mail, Shield, Trash2, LogOut, Loader2, AlertCircle, CheckCircle, Eye, EyeOff, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UserAccountSettings: React.FC = () => {
    const { user, signOut, updatePassword, resetPasswordForEmail, deleteAccount } = useAuth();

    // Password change state
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

    // Password reset state
    const [isSendingReset, setIsSendingReset] = useState(false);
    const [resetMessage, setResetMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

    // Delete account state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage(null);

        if (newPassword.length < 8) {
            setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setIsUpdatingPassword(true);
        const { error } = await updatePassword(newPassword);

        if (error) {
            setPasswordMessage({ type: 'error', text: error.message });
        } else {
            setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
            setNewPassword('');
            setConfirmPassword('');
        }
        setIsUpdatingPassword(false);
    };

    const handleSendResetEmail = async () => {
        if (!user?.email) return;

        setResetMessage(null);
        setIsSendingReset(true);

        const { error } = await resetPasswordForEmail(user.email);

        if (error) {
            setResetMessage({ type: 'error', text: error.message });
        } else {
            setResetMessage({ type: 'success', text: 'Password reset email sent! Check your inbox.' });
        }
        setIsSendingReset(false);
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') return;

        setIsDeleting(true);
        const { error } = await deleteAccount();

        if (error) {
            alert('Error deleting account: ' + error.message);
            setIsDeleting(false);
        }
        // If successful, the user will be signed out automatically
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Profile Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <User className="text-blue-600" size={20} />
                        Account Profile
                    </h3>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <Mail className="text-indigo-600" size={18} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Email Address</p>
                            <p className="font-medium text-slate-900">{user?.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Calendar className="text-green-600" size={18} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Account Created</p>
                            <p className="font-medium text-slate-900">{formatDate(user?.created_at)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Shield className="text-purple-600" size={18} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Last Sign In</p>
                            <p className="font-medium text-slate-900">{formatDate(user?.last_sign_in_at)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Lock className="text-amber-600" size={20} />
                        Change Password
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Update your password to keep your account secure.</p>
                </div>
                <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-12 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                        {newPassword.length > 0 && newPassword.length < 8 && (
                            <p className="text-xs text-amber-600 mt-1">Password must be at least 8 characters</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                minLength={8}
                            />
                        </div>
                        {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                            <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                        )}
                    </div>

                    {passwordMessage && (
                        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${passwordMessage.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                            }`}>
                            {passwordMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                            {passwordMessage.text}
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={isUpdatingPassword || newPassword.length < 8 || newPassword !== confirmPassword}
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdatingPassword && <Loader2 className="animate-spin" size={16} />}
                            Update Password
                        </button>
                        <button
                            type="button"
                            onClick={handleSendResetEmail}
                            disabled={isSendingReset}
                            className="px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSendingReset && <Loader2 className="animate-spin" size={16} />}
                            Send Reset Email
                        </button>
                    </div>

                    {resetMessage && (
                        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${resetMessage.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                            }`}>
                            {resetMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                            {resetMessage.text}
                        </div>
                    )}
                </form>
            </div>

            {/* Session Management */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Shield className="text-indigo-600" size={20} />
                        Session Management
                    </h3>
                </div>
                <div className="p-6">
                    <button
                        onClick={signOut}
                        className="px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-red-100 bg-red-50">
                    <h3 className="text-lg font-semibold text-red-900 flex items-center gap-2">
                        <Trash2 className="text-red-600" size={20} />
                        Danger Zone
                    </h3>
                    <p className="text-sm text-red-700 mt-1">These actions are permanent and cannot be undone.</p>
                </div>
                <div className="p-6">
                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                        >
                            <Trash2 size={18} />
                            Delete Account
                        </button>
                    ) : (
                        <div className="space-y-4 p-4 bg-red-50 rounded-xl border border-red-200">
                            <p className="text-sm text-red-800 font-medium">
                                ⚠️ This will permanently delete your account and all associated data including children, emails, events, and actions.
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-red-800 mb-1.5">
                                    Type "DELETE" to confirm
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    placeholder="DELETE"
                                    className="w-full px-4 py-2 border border-red-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDeleting && <Loader2 className="animate-spin" size={16} />}
                                    {isDeleting ? 'Deleting...' : 'Permanently Delete Account'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setDeleteConfirmText('');
                                    }}
                                    className="px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserAccountSettings;
