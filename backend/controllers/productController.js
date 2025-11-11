import { getProductsFromSheet } from '../services/sheetsService.js';

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => {
    try {
        const rows = await getProductsFromSheet();
        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'No products found in Google Sheet.' });
        }

        // Skip header row
        const dataRows = rows.slice(1);

        let lastItemName = null;
        const products = [];

        for (let row of dataRows) {
            // Normalize cells (7 columns)
            const [itemName, pack, batchNo, expiryDate, qty, pqty, mrp] =
                row.map(v => (v !== undefined ? v.toString().trim() : ""));

            // Skip empty rows
            if ([itemName, pack, batchNo, expiryDate, qty, mrp].every(x => !x)) continue;

            // Section headers like "A1 8% REBAL LIST" or totals (only number in last col)
            if (
                itemName &&
                !pack &&
                !batchNo &&
                !expiryDate &&
                !qty &&
                !mrp
            ) {
                continue; // header row — skip
            }
            if (!itemName) {
                // Carry forward the previous item name for continuation rows
                if (lastItemName) row[0] = lastItemName;
                else continue; // if no previous item, skip
            } else {
                lastItemName = itemName;
            }

            // Skip subtotal/total rows (e.g., only number at the end)
            if (!itemName && parseFloat(mrp)) continue;

            // Push cleaned product data
            products.push({
                itemName: row[0],
                pack: row[1],
                batchNo: row[2],
                expiryDate: row[3],
                qty: parseFloat(row[4]) || 0,
                pqty: parseFloat(row[5]) || 0,
                mrp: parseFloat(row[6]) || 0,
                // Add image and category if available, else default
                image: '', // Sheet doesn't have image, can be added later
                category: '', // Sheet doesn't have category, can be added later
            });
        }

        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Get single product
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res) => {
    try {
        const rows = await getProductsFromSheet();
        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'No products found in Google Sheet.' });
        }

        // Skip header row
        const dataRows = rows.slice(1);

        let lastItemName = null;
        let product = null;

        for (let row of dataRows) {
            // Normalize cells (7 columns)
            const [itemName, pack, batchNo, expiryDate, qty, pqty, mrp] =
                row.map(v => (v !== undefined ? v.toString().trim() : ""));

            // Skip empty rows
            if ([itemName, pack, batchNo, expiryDate, qty, mrp].every(x => !x)) continue;

            // Section headers like "A1 8% REBAL LIST" or totals (only number in last col)
            if (
                itemName &&
                !pack &&
                !batchNo &&
                !expiryDate &&
                !qty &&
                !mrp
            ) {
                continue; // header row — skip
            }
            if (!itemName) {
                // Carry forward the previous item name for continuation rows
                if (lastItemName) row[0] = lastItemName;
                else continue; // if no previous item, skip
            } else {
                lastItemName = itemName;
            }

            // Skip subtotal/total rows (e.g., only number at the end)
            if (!itemName && parseFloat(mrp)) continue;

            // Check if this is the product we're looking for (assuming id is itemName)
            if (row[0] === req.params.id) {
                product = {
                    itemName: row[0],
                    pack: row[1],
                    batchNo: row[2],
                    expiryDate: row[3],
                    qty: parseFloat(row[4]) || 0,
                    pqty: parseFloat(row[5]) || 0,
                    mrp: parseFloat(row[6]) || 0,
                    image: '',
                    category: '',
                };
                break; // Found the product, no need to continue
            }
        }

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export { getProducts, getProductById };
