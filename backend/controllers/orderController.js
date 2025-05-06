const Order = require('../models/Order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    
    // Calculate total price
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order
    const order = await Order.create({
      user: req.user.id,
      items,
      shippingAddress,
      totalPrice,
      paymentInfo: {
        method: paymentMethod
      }
    });
    
    res.status(201).json({ order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create payment intent with Stripe
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd'
    });
    
    res.status(200).json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check permissions (only seller or admin can update)
    if (req.user.role !== 'admin' && 
        req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    order.status = status;
    await order.save();
    
    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
