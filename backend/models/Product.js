import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
        trim: true,
    },
    pack: {
        type: String,
    },
    batchNo: {
        type: String,
    },
    expiryDate: {
        type: Date,
    },
    qty: {
        type: Number,
        required: true,
        default: 0,
    },
    pqty: { // Assuming pqty is 'previous quantity' or similar
        type: Number,
        default: 0,
    },
    mrp: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        trim: true,
    },
    image: {
        type: String, // URL to the image
    },
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;