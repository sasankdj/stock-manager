import { getProductsFromSheet } from '../services/sheetsService.js';

/**
 * @desc    Get all products (with category, search, sort)
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => {
  try {
    const { search, sortBy, sortOrder, category } = req.query;

    const rows = await getProductsFromSheet();
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'No products found in Google Sheet.' });
    }

    const dataRows = rows; // no header to skip, range starts from A2
    const products = [];

    let lastItemName = null;
    let currentCategory = 'Uncategorized';

    for (let rawRow of dataRows) {
      // Normalize: pad to 7 columns & strip hidden characters
      const row = [...rawRow, '', '', '', '', '', '', '']
        .slice(0, 7)
        .map(v =>
          v
            ? v
                .toString()
                .replace(/[\r\n\t\u00A0]+/g, '') // clean hidden chars
                .trim()
            : ''
        );

      const [itemName, pack, batchNo, expiryDate, qty, pqty, mrp] = row;

      // Skip completely empty rows
      if ([itemName, pack, batchNo, expiryDate, qty, mrp].every(x => !x)) continue;

      // 🟩 Detect category header rows (e.g. ["A1 8% REBAL LIST"])
      // Category if itemName exists and batchNo is empty (assuming categories have no batchNo)
      if (itemName && !batchNo) {
        currentCategory = itemName;
        continue; // skip header row itself
      }

      // Carry forward last item name for blank rows
      const currentItemName = itemName || lastItemName;
      if (!currentItemName) continue;
      lastItemName = currentItemName;

      // Skip totals/subtotals
      if (/^(total|subtotal|sum)$/i.test(currentItemName)) continue;

      // Push cleaned product
      products.push({
        itemName: currentItemName,
        pack,
        batchNo,
        expiryDate,
        qty: parseFloat(qty) || 0,
        pqty: parseFloat(pqty) || 0,
        mrp: parseFloat(mrp) || 0,
        image: '',
        category: currentCategory,
      });
    }

    // 🔍 Search filter
    let filteredProducts = products;
    if (search) {
      filteredProducts = products.filter(product =>
        product.itemName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 🏷️ Category filter
    if (category) {
      filteredProducts = filteredProducts.filter(product =>
        product.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    // 🔄 Sorting
    if (sortBy) {
      filteredProducts.sort((a, b) => {
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

    res.json(filteredProducts);
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
    const rows = await getProductsFromSheet();
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'No products found in Google Sheet.' });
    }

    const dataRows = rows;
    let lastItemName = null;
    let currentCategory = 'Uncategorized';
    let product = null;

    for (let rawRow of dataRows) {
      const row = [...rawRow, '', '', '', '', '', '', '']
        .slice(0, 7)
        .map(v =>
          v
            ? v
                .toString()
                .replace(/[\r\n\t\u00A0]+/g, '')
                .trim()
            : ''
        );

      const [itemName, pack, batchNo, expiryDate, qty, pqty, mrp] = row;

      if ([itemName, pack, batchNo, expiryDate, qty, mrp].every(x => !x)) continue;

      // Detect category header
      if (itemName && !batchNo) {
        currentCategory = itemName;
        continue;
      }

      const currentItemName = itemName || lastItemName;
      if (!currentItemName) continue;
      lastItemName = currentItemName;

      if (currentItemName === req.params.id) {
        product = {
          itemName: currentItemName,
          pack,
          batchNo,
          expiryDate,
          qty: parseFloat(qty) || 0,
          pqty: parseFloat(pqty) || 0,
          mrp: parseFloat(mrp) || 0,
          image: '',
          category: currentCategory,
        };
        break;
      }
    }

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

export { getProducts, getProductById };
