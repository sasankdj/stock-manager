import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { useCart } from '../context/CartContext';
import { Plus, Minus } from 'lucide-react';

const ProductCard = ({ product }) => {
    const [showModal, setShowModal] = useState(false);
    const [showQuantityModal, setShowQuantityModal] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();
    // Placeholder in case an image URL is not provided
    const placeholderImage = 'https://via.placeholder.com/300x300.png?text=No+Image';

    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    };

    const handleAddToCart = () => {
        addToCart(product, quantity);
        setShowQuantityModal(false);
        setQuantity(1); // Reset quantity for next time
    };

    const handleQuantityChange = (e) => {
        const value = e.target.value;
        if (value === '') {
            setQuantity('');
            return;
        }
        const num = parseInt(value, 10);
        setQuantity(Math.max(1, Math.min(product.qty, num || 1)));
    };

    return (
        <>
            <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
               
                <CardContent className="flex-grow p-4">
                    <Link to={`/product/${product._id}`} className="hover:text-primary">
                        <CardTitle className="text-lg font-semibold leading-tight">{product.itemName}</CardTitle>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">{product.pack}</p>
                </CardContent>
                <CardFooter className="p-4 flex justify-between items-center">
                    <div>
                        <p className="text-xl font-bold">₹{product.mrp}</p>
                        <p className="text-sm text-muted-foreground">Qty: {product.qty}</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button onClick={() => setShowModal(true)}>View Details</Button>
                        <Button onClick={() => setShowQuantityModal(true)} disabled={product.qty === 0}>{product.qty > 0 ? 'Add to Cart' : 'Out of Stock'}</Button>
                    </div>
                </CardFooter>
            </Card>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">{product.itemName}</h2>
                        {product.image && (
                            <img src={product.image} alt={product.itemName} className="w-full h-48 object-cover mb-4 rounded" />
                        )}
                        <div className="space-y-2">
                            <p><strong>Pack:</strong> {product.pack || 'N/A'}</p>
                            <p><strong>Batch No:</strong> {product.batchNo || 'N/A'}</p>
                            <p><strong>Expiry Date:</strong> {formatDate(product.expiryDate)}</p>
                            <p><strong>Quantity:</strong> {product.qty}</p>
                            <p><strong>MRP:</strong> ₹{product.mrp}</p>
                            <p><strong>Category:</strong> {product.category || 'N/A'}</p>
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button onClick={() => setShowModal(false)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}

            {showQuantityModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">Select Quantity for {product.itemName}</h2>
                        <div className="flex items-center justify-center space-x-4 my-6">
                            <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                                <Minus className="h-4 w-4" />
                            </Button>
                            <input
                                type="text"
                                value={quantity}
                                onChange={handleQuantityChange}
                                className="text-2xl font-bold w-16 text-center border-2 border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            />
                            <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.min(product.qty, q + 1))}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-center text-sm text-muted-foreground mb-6">Available stock: {product.qty}</p>
                        <div className="flex justify-end space-x-2 mt-4">
                            <Button variant="outline" onClick={() => {
                                setShowQuantityModal(false);
                                setQuantity(1);
                            }}>Cancel</Button>
                            <Button onClick={handleAddToCart}>Add to Cart</Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductCard;