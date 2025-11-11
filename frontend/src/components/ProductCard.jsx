import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
    const [showModal, setShowModal] = useState(false);
    const { addToCart } = useCart();
    // Placeholder in case an image URL is not provided
    const placeholderImage = 'https://via.placeholder.com/300x300.png?text=No+Image';

    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    };

    const handleAddToCart = () => {
        addToCart(product);
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
                        <Button onClick={handleAddToCart}>Add to Cart</Button>
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
        </>
    );
};

export default ProductCard;