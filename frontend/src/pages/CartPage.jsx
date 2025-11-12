import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Trash2, Plus, Minus } from 'lucide-react';

const CartPage = () => {
    const { cartItems, removeFromCart, updateQuantity } = useCart();
    const navigate = useNavigate();

    const totalQty = cartItems.reduce((acc, item) => acc + item.qty, 0);
    const totalPrice = cartItems.reduce((acc, item) => acc + item.qty * item.mrp, 0).toFixed(2);

    const handleCheckout = () => {
        navigate('/checkout');
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
            {cartItems.length === 0 ? (
                <p>Your cart is empty. <Link to="/" className="underline">Go Shopping</Link></p>
            ) : (
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                        {cartItems.map(item => (
                            <Card key={item.cartId} className="flex items-center p-4">
                                {/* <img src={item.image || 'https://via.placeholder.com/100x100?text=No+Image'} alt={item.itemName} className="w-20 h-20 object-cover rounded-md" /> */}
                                <div className="flex-grow ml-4">
                                    <h3 className="font-semibold">{item.itemName}</h3>
                                    <p className="text-sm text-muted-foreground">₹{item.mrp}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.cartId, item.qty - 1)}>
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <p>Qty: {item.qty}</p>
                                    <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.cartId, item.qty + 1)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.cartId)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                    <div className="md:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Total Items</span>
                                    <span>{totalQty}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total Price</span>
                                    <span>₹{totalPrice}</span>
                                </div>
                                <Button className="w-full" size="lg" onClick={handleCheckout}>Proceed to Checkout</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;