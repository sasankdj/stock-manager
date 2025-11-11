import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from './components/ProductCard';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [category, setCategory] = useState('');

    const fetchProducts = async (searchTerm = '', sortField = '', sortDir = 'asc', categoryTerm = '') => {
        try {
            setLoading(true);
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (categoryTerm) params.category = categoryTerm;
            if (sortField) {
                params.sortBy = sortField;
                params.sortOrder = sortDir;
            }
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`, { params });
            setProducts(data);
        } catch (err) {
            setError('Failed to fetch products. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleSearchClick = () => {
        fetchProducts(search, sortBy, sortOrder, category);
    };

    const handleSortChange = (e) => {
        const value = e.target.value;
        setSortBy(value);
        fetchProducts(search, value, sortOrder, category);
    };

    const handleSortOrderChange = (e) => {
        const value = e.target.value;
        setSortOrder(value);
        fetchProducts(search, sortBy, value, category);
    };

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        setCategory(value);
        fetchProducts(search, sortBy, sortOrder, value);
    };

    if (loading) return <div className="text-center py-10">Loading products...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Latest Products</h1>
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex flex-1 gap-2">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={handleSearchChange}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSearchClick}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Search
                    </button>
                </div>
                <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Sort by...</option>
                    <option value="itemName">Name</option>
                    <option value="mrp">Price</option>
                </select>
                <select
                    value={sortOrder}
                    onChange={handleSortOrderChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
                <select
                    value={category}
                    onChange={handleCategoryChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Categories</option>
                    <option value="A1 8% REBAL LIST">A1 8% REBAL LIST</option>
                    {/* Add more categories as needed */}
                </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product, index) => (
                    <ProductCard key={product._id || index} product={product} />
                ))}
            </div>
        </div>
    );
};

export default HomePage;