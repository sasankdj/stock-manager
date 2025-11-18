import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from './ui/Button';
import { ShoppingCart, User, LogOut } from 'lucide-react';

const Navbar = () => {
    const { userInfo, logout } = useAuth();
    const { cartItems } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const cartItemCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

    return (
        <nav className="bg-green-400 text-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-primary">
                    Sanjeevani Medical Agencies
                </Link>
                <div className="flex items-center space-x-4">
                    <Link to="/cart" className="relative">
                        <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                        {cartItemCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {cartItemCount}
                            </span>
                        )}
                    </Link>
                    {userInfo ? (
                        <>
                            <Link to="/myorders" className="text-sm font-medium">My Orders</Link>
                            {userInfo.role === 'admin' && <Link to="/admin" className="text-sm font-medium">Admin</Link>}
                            {userInfo.role === 'admin' && <Link to="/admin/orders" className="text-sm font-medium">Manage Orders</Link>}
                            <span className="flex items-center text-sm"><User className="w-4 h-4 mr-1" /> {userInfo.name}</span>
                            <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-1" /> Logout</Button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium">Login</Link>
                            <Link to="/signup" className="text-sm font-medium">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;