const express = require('express');
const path = require('path');
const rootDir = require('../util/path');

const router = express.Router();
const products = [];

router.get('/add-product', (req, res) => {
  res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
});

router.post('/add-product', (req, res) => {
  const title = req.body.title;

  if (!title || !title.trim()) {
    return res.status(400).send('Product title is required.');
  }

  products.push({ title: title.trim() });
  res.redirect('/');
});

module.exports = { router, products };