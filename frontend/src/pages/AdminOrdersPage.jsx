import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge'; // Assuming you have a Badge component

const AdminOrdersPage = () => {
    const { userInfo } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders`, config);
                setOrders(data);
            } catch (err) {
                setError('Failed to fetch orders. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (userInfo) {
            fetchOrders();
        }
    }, [userInfo]);

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`, { status: newStatus }, config);
            setOrders(orders.map(order => order._id === orderId ? { ...order, status: newStatus } : order));
        } catch (err) {
            console.error('Failed to update order status:', err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'placed': return 'bg-yellow-500';
            case 'completed': return 'bg-blue-500';
            case 'shipped': return 'bg-orange-500';
            case 'delivered': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    if (loading) return <div className="text-center py-10">Loading orders...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">All Orders</h1>
            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <Card key={order._id}>
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <span>Order #{order._id.slice(-8)}</span>
                                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p><strong>User:</strong> {order.userId.name}</p>
                                    <p><strong>Customer:</strong> {order.customerName}</p>
                                    <p><strong>Phone:</strong> {order.customerPhone}</p>
                                    <p><strong>Total Items:</strong> {order.totalQty}</p>
                                    <p><strong>Total Price:</strong> ₹{order.totalPrice.toFixed(2)}</p>
                                    <p><strong>Ordered on:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                                    <div>
                                        <strong>Items:</strong>
                                        <ul className="list-disc list-inside mt-1">
                                            {order.items.map((item, index) => (
                                                <li key={index}>{item.itemName} × {item.qty} @ ₹{item.mrp}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="flex space-x-2 mt-4">
                                        {order.status === 'pending' && (
                                            <>
                                                <Button onClick={() => updateOrderStatus(order._id, 'shipped')}>Ship</Button>
                                                <Button onClick={() => updateOrderStatus(order._id, 'delivered')}>Deliver</Button>
                                            </>
                                        )}
                                        {order.status === 'placed' && (
                                            <Button onClick={() => updateOrderStatus(order._id, 'completed')}>Complete</Button>
                                        )}
                                        {order.status === 'completed' && (
                                            <Button onClick={() => updateOrderStatus(order._id, 'shipped')}>Ship</Button>
                                        )}
                                        {order.status === 'shipped' && (
                                            <Button onClick={() => updateOrderStatus(order._id, 'delivered')}>Deliver</Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminOrdersPage;
