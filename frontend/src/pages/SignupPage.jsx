import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/signup`,
                { name, email, password }
            );

            console.log("Signup successful:", data);
            navigate("/products");

        } catch (err) {
            setError(err.response?.data?.message || "Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center bg-background text-foreground px-4">
            <motion.div
                className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-xl border border-border backdrop-blur-md"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                {/* Title */}
                <div className="text-center space-y-1">
                    <h1 className="text-3xl font-bold">Create an Account</h1>
                    <p className="text-muted-foreground text-sm">
                        Join us and start exploring
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
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div className="space-y-1">
                        <label htmlFor="name" className="text-sm text-muted-foreground">Name</label>
                        <input
                            id="name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-input border border-border 
                            text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 
                            transition-all"
                        />
                    </div>

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

                    {/* Button */}
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-md bg-primary-600 hover:bg-primary-700 
                        font-semibold transition-colors disabled:bg-neutral-600"
                    >
                        {loading ? "Creating Account..." : "Sign Up"}
                    </motion.button>
                </form>

                {/* Footer */}
                <p className="text-sm text-center text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary-400 hover:underline">
                        Log in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default SignupPage;
