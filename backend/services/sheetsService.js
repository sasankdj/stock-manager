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
 * ✅ Fetches product data from the 'Stock' sheet, excluding products from 'notdisplay' sheet
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

    // Get hidden products from 'notdisplay' sheet
    const hiddenRange = 'notdisplay!A:A'; // Assuming product names are in column A
    let hiddenProducts = [];
    try {
      const hiddenResponse = await googleSheet.spreadsheets.values.get({
        spreadsheetId,
        range: hiddenRange,
      });
      hiddenProducts = hiddenResponse.data.values?.flat().map(name => name.toString().trim().toLowerCase()) || [];
      console.log('Hidden products:', hiddenProducts);
    } catch (error) {
      console.log('No notdisplay sheet found or error fetching hidden products:', error.message);
    }

    // Filter out hidden products
    const filteredValues = response.data.values?.filter(row => {
      const itemName = row[0]?.toString().trim().toLowerCase();
      return !hiddenProducts.includes(itemName);
    }) || [];

    return filteredValues;
  } catch (error) {
    console.error('❌ Error fetching products from Google Sheet:', error);
    return [];
  }
};

/**
 * ✅ Fetches hidden product names from the 'notdisplay' sheet
 */
export const getHiddenProductsFromSheet = async () => {
  try {
    const auth = getAuth();
    const googleSheet = await getGoogleSheet(auth);

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'notdisplay!A:A'; // Assuming product names are in column A

    const response = await googleSheet.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const hiddenProducts = response.data.values?.flat().map(name => name.toString().trim()) || [];
    console.log('✅ Hidden products from sheet:', hiddenProducts);

    return hiddenProducts;
  } catch (error) {
    console.error('❌ Error fetching hidden products from Google Sheet:', error);
    return [];
  }
};

/**
 * ✅ Adds a product name to the 'notdisplay' sheet to hide it
 */
export const addHiddenProductToSheet = async (productName) => {
  try {
    const auth = getAuth();
    const googleSheet = await getGoogleSheet(auth);

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'notdisplay!A:A';

    const values = [[productName]];

    await googleSheet.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    console.log('✅ Product added to hidden list in Google Sheet');
  } catch (error) {
    console.error('❌ Error adding hidden product to Google Sheet:', error);
  }
};

/**
 * ✅ Removes a product name from the 'notdisplay' sheet
 */
export const removeHiddenProductFromSheet = async (productName) => {
  try {
    const auth = getAuth();
    const googleSheet = await getGoogleSheet(auth);

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'notdisplay!A:A';

    // Get current hidden products
    const response = await googleSheet.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const hiddenProducts = response.data.values?.flat() || [];
    const filteredProducts = hiddenProducts.filter(name => name.toString().trim() !== productName);

    // Clear and rewrite the column
    await googleSheet.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });

    if (filteredProducts.length > 0) {
      await googleSheet.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: { values: filteredProducts.map(name => [name]) },
      });
    }

    console.log('✅ Product removed from hidden list in Google Sheet');
  } catch (error) {
    console.error('❌ Error removing hidden product from Google Sheet:', error);
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