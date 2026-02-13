import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.access_token);
            navigate('/admin/categories');
        } catch (err) {
            console.error("Login failed:", err);
            if (!err.response) {
                setError('Connection error. Please check your internet or tunnel.');
            } else if (err.response.status === 401) {
                setError('Invalid email or password');
            } else {
                setError(err.response?.data?.msg || 'Login failed');
            }
        }
    };

    const fillDemo = (e) => {
        e.preventDefault();
        setEmail('owner@demo.com');
        setPassword('123456');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
            <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
                    <p className="text-sm text-gray-500 mt-2">Sign in to manage your restaurant</p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 text-sm rounded-lg mb-6 border border-red-100 flex items-center justify-center font-medium">{error}</div>}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 ml-1">Email</label>
                        <input
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                            type="text"
                            placeholder="name@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 ml-1">Password</label>
                        <input
                            className="block w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 active:scale-[0.98] transition-all shadow-md hover:shadow-lg"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <button
                        onClick={fillDemo}
                        className="w-full py-2 px-4 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center"
                    >
                        ✨ Login as Demo Admin
                    </button>

                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Demo Credentials</p>
                        <div className="text-xs text-gray-500 font-mono bg-gray-50 inline-block px-3 py-2 rounded-lg border border-gray-100">
                            owner@demo.com • 123456
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
