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
                className="w-full flex items-center gap-3 p-3 rounded-card bg-background-secondary hover:bg-gray-200 transition-colors text-left"
            >
                <div className="w-10 h-10 rounded-full bg-brand-lavender flex items-center justify-center text-brand-purple font-bold text-sm shrink-0">
                    {initials}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-foreground-primary truncate font-serif">{displayName}</p>
                    <p className="text-xs text-foreground-secondary truncate">Free Plan</p>
                </div>
                <ChevronUp size={16} className={`text-foreground-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-background-primary rounded-card shadow-floating border-none overflow-hidden animate-in slide-in-from-bottom-2 fade-in z-50 p-2">
                    <div className="space-y-1">
                        <NavLink
                            to="/settings"
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 rounded-inner text-sm transition-colors ${isActive ? 'bg-brand-lavender text-brand-purple font-medium' : 'text-foreground-secondary hover:bg-background-secondary hover:text-foreground-primary'}`}
                        >
                            <Settings size={18} />
                            Settings
                        </NavLink>
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-inner text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                            <LogOut size={18} />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserAccountWidget;
