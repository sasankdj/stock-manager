import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';
import { Plus, Minus } from 'lucide-react';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
                setProduct(data);
            } catch (err) {
                setError('Product not found.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) return <div className="text-center py-10">Loading product details...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error} <Link to="/" className="underline">Go back</Link></div>;
    if (!product) return null;

    const placeholderImage = 'https://via.placeholder.com/500x500.png?text=No+Image';

    const handleAddToCart = () => {
        addToCart(product, quantity);
    };

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div>
                <img src={product.image || placeholderImage} alt={product.itemName} className="w-full rounded-lg shadow-lg" />
            </div>
            <div>
                <h1 className="text-4xl font-bold mb-2">{product.itemName}</h1>
                <p className="text-lg text-muted-foreground mb-4">{product.pack}</p>
                <p className="text-3xl font-bold mb-6">₹{product.mrp}</p>

                <div className="space-y-2 mb-6 text-sm">
                    <p><strong>Batch No:</strong> {product.batchNo || 'N/A'}</p>
                    <p><strong>Expiry Date:</strong> {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'}</p>
                    <p className={product.qty > 0 ? 'text-green-600' : 'text-red-600'}>
                        <strong>Status:</strong> {product.qty > 0 ? 'In Stock' : 'Out of Stock'}
                    </p>
                </div>

                <div className="flex items-center space-x-4 my-6">
                    <p className="font-semibold">Quantity:</p>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-lg font-bold w-12 text-center">{quantity}</span>
                        <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.min(product.qty, q + 1))}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <Button
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={product.qty === 0}
                >
                    {product.qty > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
            </div>
        </div>
    );
};

export default ProductDetailsPage;