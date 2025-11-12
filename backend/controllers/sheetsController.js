import { getProductsFromSheet } from '../services/sheetsService.js';
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
        const validRows = [];

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

            // Push cleaned data
            validRows.push({
                itemName: row[0],
                pack: row[1],
                batchNo: row[2],
                expiryDate: row[3],
                qty: parseFloat(row[4]) || 0,
                pqty: parseFloat(row[5]) || 0,
                mrp: parseFloat(row[6]) || 0
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

export { syncProducts };
