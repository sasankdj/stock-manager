// services/sheetsService.js
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

/**
 * ✅ Create Google Auth using environment variables (works on Vercel & locally)
 */
const getAuth = () => {
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error('Missing Google credentials in environment variables');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      // Convert escaped newlines to real newlines
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return auth;
};


const getGoogleSheet = async (auth) => {
  const client = await auth.getClient();
  const googleSheet = google.sheets({ version: 'v4', auth: client });
  return googleSheet;
};

/**
 * ✅ Fetches product data from the 'Stock' sheet
 */
export const getProductsFromSheet = async () => {
  try {
    const auth = getAuth();
    const googleSheet = await getGoogleSheet(auth);

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'Stock!A2:G'; // Change "Stock" if your tab name differs

    const response = await googleSheet.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    console.log('✅ Google Sheets API response:', {
      rows: response.data.values?.length || 0,
      range: response.data.range,
    });

    return response.data.values || [];
  } catch (error) {
    console.error('❌ Error fetching products from Google Sheet:', error);
    return [];
  }
};

/**
 * ✅ Appends a new order to the 'Orders' sheet
 * @param {Object} orderData
 */
export const addOrderToSheet = async (orderData) => {
  try {
    const auth = getAuth();
    const googleSheet = await getGoogleSheet(auth);

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'Orders!A:G';

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
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    console.log('✅ Order added to Google Sheet');
  } catch (error) {
    console.error('❌ Error adding order to Google Sheet:', error);
  }
};

export const testAuth = async () => {
       try {
         const auth = getAuth();
         const client = await auth.getClient();
         const tokens = await client.getAccessToken();
         console.log('✅ Auth successful, access token:', tokens.token);
         return true;
       } catch (error) {
         console.error('❌ Auth failed:', error);
         return false;
       }
     };