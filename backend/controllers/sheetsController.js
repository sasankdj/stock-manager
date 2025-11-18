import { getProductsFromSheet, getHiddenProductsFromSheet, addHiddenProductToSheet, removeHiddenProductFromSheet } from '../services/sheetsService.js';
import Product from '../models/Product.js';

/**
 * @desc    Sync products from Google Sheet to MongoDB
 * @route   POST /api/sheets/sync
 * @access  Private/Admin
 */
const syncProducts = async (req, res) => {
    try {
        const rows = await getProductsFromSheet();
        console.log('Fetched rows from sheet:', rows);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'No data found in Google Sheet.' });
        }

        // Skip header row
        const dataRows = rows.slice(1);

        let lastItemName = null;
        let currentCategory = 'Uncategorized';
        const validRows = [];

        for (let row of dataRows) {
            // Normalize cells (7 columns)
            const [itemName, pack, batchNo, expiryDate, qty, pqty, mrp] =
                row.map(v => (v !== undefined ? v.toString().trim() : ""));

            // Skip empty rows
            if ([itemName, pack, batchNo, expiryDate, qty, mrp].every(x => !x)) continue;

            // Detect category header rows (e.g. ["A1 8% REBAL LIST"])
            // Category if itemName exists and batchNo is empty (assuming categories have no batchNo)
            if (itemName && !batchNo) {
                currentCategory = itemName;
                continue; // skip header row itself
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

            // Parse expiryDate if valid, else null
            let parsedExpiry = null;
            if (row[3]) {
                const date = new Date(row[3]);
                if (!isNaN(date.getTime())) {
                    parsedExpiry = date;
                }
            }

            // Push cleaned data with category
            validRows.push({
                itemName: row[0],
                pack: row[1],
                batchNo: row[2],
                expiryDate: parsedExpiry,
                qty: parseFloat(row[4]) || 0,
                pqty: parseFloat(row[5]) || 0,
                mrp: parseFloat(row[6]) || 0,
                category: currentCategory,
                image: ''
            });
        }

        if (validRows.length === 0) {
            return res.status(400).json({ message: 'No valid products to sync.' });
        }

        // Prepare bulk operations
        const ops = validRows.map(prod => ({
            updateOne: {
                filter: { itemName: prod.itemName, batchNo: prod.batchNo },
                update: {
                    $set: {
                        itemName: prod.itemName,
                        pack: prod.pack,
                        batchNo: prod.batchNo,
                        expiryDate: prod.expiryDate,
                        qty: prod.qty,
                        pqty: prod.pqty,
                        mrp: prod.mrp,
                        category: prod.category,
                        image: prod.image,
                    },
                },
                upsert: true,
            },
        }));

        // Don't await this on Vercel to avoid function timeouts.
        // The sync will run in the background.
        Product.bulkWrite(ops);

        res.json({
            message: `✅ Sync started for ${validRows.length} products.`,
            count: validRows.length
        });

    } catch (error) {
        console.error('Sync Error:', error);
        res.status(500).json({
            message: '❌ Server error during sync.',
            error: error.message,
        });
    }
};

/**
 * @desc    Get hidden products list
 * @route   GET /api/sheets/hidden
 * @access  Private/Admin
 */
const getHiddenProducts = async (req, res) => {
    try {
        const hiddenProducts = await getHiddenProductsFromSheet();
        res.json(hiddenProducts);
    } catch (error) {
        console.error('Error fetching hidden products:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Add product to hidden list
 * @route   POST /api/sheets/hidden
 * @access  Private/Admin
 */
const addHiddenProduct = async (req, res) => {
    const { productName } = req.body;

    if (!productName || productName.trim() === '') {
        return res.status(400).json({ message: 'Product name is required' });
    }

    try {
        await addHiddenProductToSheet(productName.trim());
        res.json({ message: 'Product added to hidden list' });
    } catch (error) {
        console.error('Error adding hidden product:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Remove product from hidden list
 * @route   DELETE /api/sheets/hidden
 * @access  Private/Admin
 */
const removeHiddenProduct = async (req, res) => {
    const { productName } = req.body;

    if (!productName || productName.trim() === '') {
        return res.status(400).json({ message: 'Product name is required' });
    }

    try {
        await removeHiddenProductFromSheet(productName.trim());
        res.json({ message: 'Product removed from hidden list' });
    } catch (error) {
        console.error('Error removing hidden product:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export { syncProducts, getHiddenProducts, addHiddenProduct, removeHiddenProduct };
