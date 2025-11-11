import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const getAuth = () => {
    const auth = new google.auth.GoogleAuth({
        keyFile: './config/credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });
    return auth;
};

const getGoogleSheet = async (auth) => {
    const client = await auth.getClient();
    const googleSheet = google.sheets({ version: 'v4', auth: client });
    return googleSheet;
};

/**
 * Fetches product data from the 'Stock' sheet.
 */
export const getProductsFromSheet = async () => {
    try {
        const auth = getAuth();
        const googleSheet = await getGoogleSheet(auth);

        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        const range = 'Stock!A2:G'; // Assumes headers are in row 1, includes MRP in column G

        const response = await googleSheet.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range,
        });

        console.log('Google Sheets API response:', response.data);
        return response.data.values;
    } catch (error) {
        console.error('Error fetching products from Google Sheet:', error);
        // Return empty array instead of throwing error to prevent 500
        return [];
    }
};

/**
 * Appends a new order to the 'Orders' sheet.
 * @param {Object} orderData - The order data to add.
 */
export const addOrderToSheet = async (orderData) => {
    try {
        const auth = getAuth();
        const googleSheet = await getGoogleSheet(auth);

        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        const range = 'Orders!A:G';

        // The values to append. The order should match the columns in your sheet.
        const values = [
            [
                orderData.timestamp,
                orderData.product,
                orderData.qty,
                orderData.mrp,
                orderData.total,
                orderData.customerName,
                orderData.phone,
            ],
        ];

        await googleSheet.spreadsheets.values.append({
            auth,
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            resource: { values },
        });
    } catch (error) {
        console.error('Error adding order to Google Sheet:', error);
        // We don't throw here to avoid failing the whole order process if sheets fails
    }
};