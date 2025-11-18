import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/login`,
                { email, password }
            );

            console.log("Login successful:", data);

            // Store user info and token in AuthContext
            login(data);

            navigate('/products');

        } catch (err) {
            setError(err.response?.data?.message || "Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center bg-background text-foreground px-4">
            <motion.div
                className="w-full max-w-md p-8 space-y-6 rounded-xl bg-card shadow-xl ring-1 ring-border"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                {/* Header */}
                <div className="text-center space-y-1">
                    <h1 className="text-3xl font-bold">Welcome Back</h1>
                    <p className="text-muted-foreground text-sm">
                        Login to continue your journey
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-danger-500/20 text-danger-500 p-3 text-sm rounded-md text-center"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div className="space-y-1">
                        <label htmlFor="email" className="text-sm text-muted-foreground">Email</label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-input border border-border 
                            text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 
                            transition-all"
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                        <label htmlFor="password" className="text-sm text-muted-foreground">Password</label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-input border border-border 
                            text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 
                            transition-all"
                        />
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-md bg-primary-600 hover:bg-primary-700 
                        font-semibold transition-colors disabled:bg-neutral-600"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </motion.button>
                </form>

                {/* Footer */}
                <p className="text-center text-sm text-muted-foreground">
                    Don’t have an account?{" "}
                    <Link to="/signup" className="text-primary-400 hover:underline">
                        Sign up
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;
