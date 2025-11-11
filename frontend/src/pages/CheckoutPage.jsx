import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const CheckoutPage = () => {
    const { cartItems, clearCart } = useCart();
    const { userInfo } = useAuth();
    const [success, setSuccess] = useState(false);
    const [customerName, setCustomerName] = useState(userInfo?.name || '');
    const [customerPhone, setCustomerPhone] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const totalQty = cartItems.reduce((acc, item) => acc + item.qty, 0);
    const totalPrice = cartItems.reduce((acc, item) => acc + item.qty * item.mrp, 0);

    const handlePlaceOrder = async () => {
        setLoading(true);
        setError('');

        const orderData = {
            items: cartItems.map(i => ({ productId: i._id, itemName: i.itemName, qty: i.qty, mrp: i.mrp, cartId: i.cartId })),
            totalPrice,
            totalQty,
            customerName,
            customerPhone,
        };

        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post('http://localhost:5000/api/orders', orderData, config);

            // Prepare WhatsApp message
            let message = `🛒 *New Order Received!* 🛒\n\n`;
            message += `*Name:* ${customerName}\n`;
            message += `*Phone:* ${customerPhone}\n\n`;
            message += `*Products:*\n`;
            cartItems.forEach(item => {
                message += `  - ${item.itemName} × ${item.qty} @ ₹${item.mrp}\n`;
            });
            message += `\n*Total Quantity:* ${totalQty}\n`;
            message += `*Total Price:* ₹${totalPrice.toFixed(2)}\n`;

            const whatsappUrl = `https://api.whatsapp.com/send?phone=${import.meta.env.VITE_WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;

            // Redirect to WhatsApp
            window.location.href = whatsappUrl;

            clearCart();

        } catch (err) {
            setError('Failed to place order. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Checkout</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">Order Summary</h3>
                            <p>Total Items: {totalQty}</p>
                            <p className="font-bold">Total Price: ₹{totalPrice.toFixed(2)}</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="For order updates" />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={loading || cartItems.length === 0}>
                            {loading ? 'Placing Order...' : 'Place Order & Send on WhatsApp'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CheckoutPage;