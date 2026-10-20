const express = require('express');
const path = require('path');
const rootDir = require('../util/path');
const { products } = require('./admin');

const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'views', 'shop.html'));
});

router.get('/products', (req, res) => {
  const list = products
    .map((product) => `<li>${escapeHtml(product.title)}</li>`)
    .join('');

  res.send(`
    <h1>Products</h1>
    <ul>${list || '<li>No products yet.</li>'}</ul>
    <a href="/">Back to shop</a>
  `);
});

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return entities[character];
  });
}

module.exports = router;