import Product from '../models/Product.js';
import { getHiddenProductsFromSheet } from '../services/sheetsService.js';

/**
 * @desc    Get all products (with category, search, sort)
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => {
  try {
    const { search, sortBy, sortOrder, category } = req.query;

    let query = {};
    if (search) {
      query.itemName = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    let products = await Product.find(query);

    // Filter out hidden products for regular users
    const hiddenProducts = await getHiddenProductsFromSheet();
    const hiddenProductNames = hiddenProducts.map(name => name.toString().trim().toLowerCase());
    products = products.filter(product => !hiddenProductNames.includes(product.itemName.toLowerCase()));

    // 🔄 Sorting
    if (sortBy) {
      products.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (['mrp', 'qty', 'pqty'].includes(sortBy)) {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        } else {
          aValue = aValue.toString().toLowerCase();
          bValue = bValue.toString().toLowerCase();
        }

        return sortOrder === 'desc'
          ? aValue < bValue
            ? 1
            : -1
          : aValue > bValue
          ? 1
          : -1;
      });
    }

    res.json(products);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Get single product (with category)
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ itemName: req.params.id });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Get all unique categories
 * @route   GET /api/products/categories
 * @access  Public
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export { getProducts, getProductById, getCategories };
