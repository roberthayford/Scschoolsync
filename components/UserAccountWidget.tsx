import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Settings, LogOut, User, ChevronUp } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';

const UserAccountWidget: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    // Get display name or email
    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const initials = displayName.substring(0, 2).toUpperCase();

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                    {initials}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-slate-900 truncate">{displayName}</p>
                    <p className="text-xs text-slate-500 truncate">Free Plan</p>
                </div>
                <ChevronUp size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-2 fade-in z-50">
                    <div className="p-1">
                        <NavLink
                            to="/settings"
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <Settings size={16} />
                            Settings
                        </NavLink>
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserAccountWidget;
