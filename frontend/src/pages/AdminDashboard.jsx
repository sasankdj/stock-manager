import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
    const [view, setView] = useState('dashboard'); // 'dashboard', 'products', 'orders', 'hidden'
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [hiddenProducts, setHiddenProducts] = useState([]);
    const [newHiddenProduct, setNewHiddenProduct] = useState('');
    const [loading, setLoading] = useState(true);
    const { userInfo } = useAuth();
 
    const fetchData = async (forceRefetch = false) => {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        try {
            const cachedProducts = sessionStorage.getItem('products');

            if (cachedProducts && !forceRefetch) {
                setProducts(JSON.parse(cachedProducts));
            } else {
                const productsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`, config);
                setProducts(productsRes.data);
                sessionStorage.setItem('products', JSON.stringify(productsRes.data));
            }

            // Fetch orders every time as they are more dynamic
            const [ordersRes, hiddenRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/orders`, config),
                axios.get(`${import.meta.env.VITE_API_URL}/api/sheets/hidden`, config),
            ]);
            setOrders(ordersRes.data);
            setHiddenProducts(hiddenRes.data);
            // If we didn't get products from cache, set them from the API response.
            if (!cachedProducts || forceRefetch) {
                const productsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`, config);
                setProducts(productsRes.data);
                sessionStorage.setItem('products', JSON.stringify(productsRes.data));
            }
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSync = async () => {
        alert('Syncing products with Google Sheet...');
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        sessionStorage.removeItem('products'); // Invalidate cache
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/sheets/sync`, {}, config);
            alert(data.message);
            fetchData(true); // Force refetch data after sync
        } catch (error) {
            alert('Sync failed. Check console for details.');
            console.error(error);
        }
    };

    const handleAddHiddenProduct = async () => {
        if (!newHiddenProduct.trim()) {
            alert('Please enter a product name');
            return;
        }
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/sheets/hidden`, { productName: newHiddenProduct.trim() }, config);
            alert('Product added to hidden list');
            setNewHiddenProduct('');
            fetchData(true); // Refresh data
        } catch (error) {
            alert('Failed to add product to hidden list');
            console.error(error);
        }
    };

    const handleRemoveHiddenProduct = async (productName) => {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/sheets/hidden`, { data: { productName }, headers: { Authorization: `Bearer ${userInfo.token}` } });
            alert('Product removed from hidden list');
            fetchData(true); // Refresh data
        } catch (error) {
            alert('Failed to remove product from hidden list');
            console.error(error);
        }
    };

    const totalSales = orders.reduce((acc, order) => acc + order.totalPrice, 0);
    const salesData = orders.reduce((acc, order) => {
        const date = new Date(order.createdAt).toLocaleDateString();
        acc[date] = (acc[date] || 0) + order.totalPrice;
        return acc;
    }, {});

    const chartData = Object.keys(salesData).map(date => ({ date, sales: salesData[date] }));

    return (
        <div className="flex">
            <aside className="w-64 bg-gray-50 p-4 border-r">
                <h2 className="font-bold text-lg mb-4">Admin Menu</h2>
                <nav className="flex flex-col space-y-2">
                    <Button variant={view === 'dashboard' ? 'secondary' : 'ghost'} onClick={() => setView('dashboard')}>Dashboard</Button>
                    <Button variant={view === 'products' ? 'secondary' : 'ghost'} onClick={() => setView('products')}>Products</Button>
                    <Button variant={view === 'orders' ? 'secondary' : 'ghost'} onClick={() => setView('orders')}>Orders</Button>
                    <Button variant={view === 'hidden' ? 'secondary' : 'ghost'} onClick={() => setView('hidden')}>Hidden Products</Button>
                </nav>
            </aside>
            <main className="flex-grow p-6">
                {loading ? <p>Loading...</p> : (
                    <>
                        {view === 'dashboard' && (
                            <div>
                                <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    <Card><CardHeader><CardTitle>Total Sales</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">₹{totalSales.toFixed(2)}</p></CardContent></Card>
                                    <Card><CardHeader><CardTitle>Total Orders</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{orders.length}</p></CardContent></Card>
                                    <Card><CardHeader><CardTitle>Total Products</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{products.length}</p></CardContent></Card>
                                </div>
                                <h2 className="text-xl font-bold mb-4">Sales Per Day</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="sales" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                        {view === 'products' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h1 className="text-2xl font-bold">Products</h1>
                                    <Button onClick={handleSync}>Sync with Google Sheet</Button>
                                </div>
                                <div className="bg-white shadow rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th></tr></thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {products.map(p => <tr key={p._id}><td className="px-6 py-4 whitespace-nowrap">{p.itemName}</td><td className="px-6 py-4 whitespace-nowrap">{p.qty}</td><td className="px-6 py-4 whitespace-nowrap">₹{p.mrp}</td></tr>)}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {view === 'orders' && (
                            <div>
                                <h1 className="text-2xl font-bold mb-4">Orders</h1>
                                <div className="bg-white shadow rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th></tr></thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {orders.map(o => <tr key={o._id}><td className="px-6 py-4 whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString()}</td><td className="px-6 py-4 whitespace-nowrap">{o.userId.name}</td><td className="px-6 py-4 whitespace-nowrap">₹{o.totalPrice.toFixed(2)}</td></tr>)}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {view === 'hidden' && (
                            <div>
                                <h1 className="text-2xl font-bold mb-4">Hidden Products</h1>
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        placeholder="Enter product name to hide"
                                        value={newHiddenProduct}
                                        onChange={(e) => setNewHiddenProduct(e.target.value)}
                                        className="border border-gray-300 rounded px-3 py-2 mr-2"
                                    />
                                    <Button onClick={handleAddHiddenProduct}>Add to Hidden</Button>
                                </div>
                                <div className="bg-white shadow rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {hiddenProducts.map((product, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap">{product}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Button variant="destructive" onClick={() => handleRemoveHiddenProduct(product)}>Remove</Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;