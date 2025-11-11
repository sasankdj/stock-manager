import Order from '../models/Order.js';
import { addOrderToSheet } from '../services/sheetsService.js';

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
const addOrderItems = async (req, res) => {
    const { items, totalPrice, totalQty, customerName, customerPhone } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    try {
        const order = new Order({
            items: items.map(item => ({
                itemName: item.itemName,
                qty: item.qty,
                mrp: item.mrp,
            })),
            userId: req.user._id,
            totalPrice,
            totalQty,
            customerName,
            customerPhone,
        });

        const createdOrder = await order.save();

        // After saving to MongoDB, group items by product and add to Google Sheets
        // We do this without 'await' to not make the user wait for the sheet update.
        // The service has its own error handling.
        const groupedItems = {};
        createdOrder.items.forEach(item => {
            if (groupedItems[item.itemName]) {
                groupedItems[item.itemName].qty += item.qty;
                groupedItems[item.itemName].total += item.qty * item.mrp;
            } else {
                groupedItems[item.itemName] = {
                    qty: item.qty,
                    mrp: item.mrp,
                    total: item.qty * item.mrp,
                };
            }
        });

        Object.keys(groupedItems).forEach(productName => {
            const item = groupedItems[productName];
            addOrderToSheet({
                timestamp: new Date().toLocaleString(),
                product: productName,
                qty: item.qty,
                mrp: item.mrp,
                total: item.total,
                customerName: customerName || req.user.name, // Fallback to user's name
                phone: customerPhone,
            });
        });

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Get logged in user orders
 * @route   GET /api/orders/myorders
 * @access  Private
 */
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private/Admin
 */
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('userId', 'name');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('userId', 'id name');
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.status = status;
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


export {
    addOrderItems,
    getMyOrders,
    getOrders,
    getOrderById,
    updateOrderStatus
};
