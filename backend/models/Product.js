const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }],
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ratings: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number },
    comment: { type: String }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
