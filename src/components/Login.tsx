import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
            },
        });

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage('Check your email for the login link!');
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-96">
                <h1 className="mb-6 text-2xl font-bold text-center text-gray-800">SchoolSync Login</h1>
                <form onSubmit={handleLogin} className="flex flex-col space-y-4">
                    <input
                        type="email"
                        placeholder="Your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="p-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {loading ? 'Sending Magic Link...' : 'Send Magic Link'}
                    </button>
                </form>
                {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
            </div>
        </div>
    );
};

export default Login;
