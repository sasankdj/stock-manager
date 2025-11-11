import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

const AdminRoute = () => {
    const { userInfo } = useAuth();
    return userInfo && userInfo.role === 'admin' ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRoute;
