const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
const db = new sqlite3.Database('./orders.db');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT,
    customerEmail TEXT,
    customerPhone TEXT,
    cartItems TEXT,
    totalAmount REAL,
    orderDate TEXT
  )`);
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from current directory
app.use(express.static(path.join(__dirname)));

// Sample products data (in real app, this would come from database)
const products = [
  { id: 1, name: 'Matador Claro', price: 9, image: 'product_pen_pic/Claro.jpg' },
  { id: 2, name: 'Matador Smoothy Ballpen', price: 129.99, image: 'product_pen_pic/Matador Smoothy Ballpen.jpg' },
  { id: 3, name: 'Matador All-time', price: 159.99, image: 'product_pen_pic/Matador All-time.jpg' },
  { id: 4, name: 'Matador Envoy', price: 149.99, image: 'product_pen_pic/Matador Envoy.jpg' },
  { id: 5, name: 'Matador Glory Crystal', price: 119.99, image: 'product_pen_pic/Matador Glory Crystal.png' },
  { id: 6, name: 'Matador Gripper Gel', price: 109.99, image: 'product_pen_pic/Matador Gripper Gel.png' },
  { id: 7, name: 'Matador Hi-School', price: 139.99, image: 'product_pen_pic/Matador Hi-School.jpg' },
  { id: 8, name: 'Matador i-teen Rio', price: 124.99, image: 'product_pen_pic/Matador i-teen Rio.jpg' },
  { id: 9, name: 'Matador i-teen', price: 114.99, image: 'product_pen_pic/Matador i-teen Aroma.jpg' },
  { id: 10, name: 'Matador Orbit', price: 11.99, image: 'product_pen_pic/Matador Orbit.png' },
  { id: 11, name: 'Matador Pencilic', price: 14.99, image: 'product_pen_pic/Matador Pencilic.png' },
  { id: 12, name: 'Matador Pin-Point', price: 144.99, image: 'product_pen_pic/Matador Pin-Point.png' },
  { id: 13, name: 'Matador Radiant', price: 154.99, image: 'product_pen_pic/Matador Radiant.png' },
  { id: 14, name: 'Matador I-teen Bloom', price: 8.99, image: 'product_pen_pic/Matador Trio.png' },
  { id: 15, name: 'Matador i-teen Grip', price: 179.99, image: 'product_pen_pic/Matador i-teen Aroma.jpg' }
];

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// Submit order
app.post('/api/orders', (req, res) => {
  const { customerName, customerEmail, customerPhone, cartItems, totalAmount } = req.body;

  // Save to database
  db.run(`INSERT INTO orders (customerName, customerEmail, customerPhone, cartItems, totalAmount, orderDate) VALUES (?, ?, ?, ?, ?, ?)`, 
    [customerName, customerEmail, customerPhone, JSON.stringify(cartItems), totalAmount, new Date().toISOString()], 
    function(err) {
      if (err) {
        console.error('Error saving order:', err);
        return res.status(500).json({ success: false, message: 'Error saving order' });
      }
      res.json({
        success: true,
        message: 'Order placed successfully! We will contact you soon.',
        orderId: this.lastID
      });
    });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});