const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set.');
    }

    cached.promise = mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

const orderSchema = new mongoose.Schema({
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  cartItems: Array,
  totalAmount: Number,
  orderDate: { type: Date, default: Date.now },
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (error) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Invalid JSON body' }),
    };
  }

  const { customerName, customerEmail, customerPhone, cartItems, totalAmount } = body;

  try {
    await connectToDatabase();
    const order = new Order({
      customerName,
      customerEmail,
      customerPhone,
      cartItems,
      totalAmount,
    });

    const savedOrder = await order.save();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Order placed successfully! We will contact you soon.',
        orderId: savedOrder._id,
      }),
    };
  } catch (error) {
    console.error('Error saving order:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Error saving order' }),
    };
  }
};