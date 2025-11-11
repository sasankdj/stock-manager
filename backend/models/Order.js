import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [
        {
            itemName: {
                type: String,
                required: true,
            },
            qty: {
                type: Number,
                required: true,
            },
            mrp: {
                type: Number,
                required: true,
            },
        },
    ],
    totalPrice: {
        type: Number,
        required: true,
    },
    totalQty: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['placed', 'completed', 'shipped', 'delivered'],
        default: 'placed',
    },
    customerName: {
        type: String,
        required: true,
    },
    customerPhone: {
        type: String,
        required: true,
    },
    whatsappSent: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true // This will create 'createdAt' and 'updatedAt' fields
});

const Order = mongoose.model('Order', orderSchema);
export default Order;