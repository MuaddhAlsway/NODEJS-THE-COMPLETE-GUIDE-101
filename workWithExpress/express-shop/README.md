# Express Shop — Working with Express

A guided learning project that combines the core ideas from the **Working with Express** module into one small multi-page shop.

> **Learning goal:** Understand how an HTTP request moves through Node.js and Express, how middleware and routes decide what happens, and how the app serves forms, HTML pages, CSS, and fallback responses.

## What you will build

- A shop home page at `GET /`
- A product list at `GET /products`
- An add-product form at `GET /admin/add-product`
- A form submission handler at `POST /admin/add-product`
- In-memory product storage for practice
- Static CSS served from `public/`
- A custom 404 page for unknown routes

## Architecture at a glance

```text
Browser
  │ HTTP method + URL + headers + optional body
  ▼
Node.js HTTP server (started by app.listen)
  ▼
Express application
  ├─ URL-encoded body parser
  ├─ Static-file middleware
  ├─ /admin router
  ├─ Shop router
  └─ Final 404 middleware
  ▼
Route handler sends a response, redirects, or passes control onward
  ▼
Browser receives status + headers + response body
```

Express is a web framework built on Node.js. Node provides the HTTP server capabilities; Express provides a structured middleware and routing system. In Express, the `req` and `res` objects are Node request/response objects with helpful Express methods added.

## Folder structure

```text
express-shop/
├── app.js
├── package.json
├── routes/
│   ├── admin.js
│   └── shop.js
├── util/
│   └── path.js
├── views/
│   ├── shop.html
│   ├── add-product.html
│   └── 404.html
└── public/
    └── css/
        └── main.css
```

- `app.js` creates and configures the Express app.
- `routes/admin.js` contains admin pages and form submission.
- `routes/shop.js` contains shop pages.
- `util/path.js` exports a stable project root for file resolution.
- `views/` contains HTML files sent by route handlers.
- `public/` contains files the browser can request directly, such as CSS.
- `package.json` describes the project and its dependencies/scripts.

## Setup

From the project directory:

```powershell
npm install
npm start
```

A compatible `package.json` script is:

```json
{
  "scripts": {
    "start": "node app.js"
  }
}
```

If you have not installed dependencies yet, run `npm install express`. Start the server with `npm start`, or run `node app.js` directly. `npm run dev` works only if a `dev` script has been added.

## Source code

### 1. `util/path.js` — establish a stable project root

```js
const path = require('path');

module.exports = path.dirname(require.main.filename);
```

Line by line:

1. `require('path')` loads Node's built-in path utility module.
2. In this CommonJS app, `require.main.filename` is the absolute filename of the entry file that Node started, here `app.js`.
3. `path.dirname(...)` returns the directory containing that entry file.
4. `module.exports` makes that directory available to other modules.

The routes can now build absolute file paths from one reliable root. `path.join()` uses the current operating system's path separators.

### 2. `routes/admin.js` — admin routes and form handling

```js
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
```

Line by line:

1. Import Express to create a router.
2. Import Node's `path` module to assemble paths safely.
3. Import the project root from the helper.
4. `express.Router()` creates a modular route container.
5. `products` is an in-memory array used for this exercise.
6. `router.get('/add-product', ...)` handles a GET request for the form page, relative to the router's mount point.
7. `res.sendFile(...)` sends the HTML file; the constructed path is absolute.
8. `router.post('/add-product', ...)` handles a POST request to the same relative route.
9. `req.body.title` reads the submitted form field after the URL-encoded parser has run.
10. The validation condition rejects missing or whitespace-only titles with a 400 Bad Request response.
11. `return` prevents the handler from continuing after sending the validation response.
12. A valid, trimmed title is added to the array.
13. `res.redirect('/')` sends a redirect response; the browser then makes a new GET request to `/`.
14. The router and array are exported so the app and shop router can use them.

### 3. `routes/shop.js` — shop pages and product list

```js
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
    <!doctype html>
    <html lang="en">
      <head><meta charset="UTF-8"><title>Products</title></head>
      <body>
        <h1>Products</h1>
        <ul>${list || '<li>No products yet.</li>'}</ul>
        <a href="/">Back to shop</a>
      </body>
    </html>
  `);
});

function escapeHtml(value) {
  const entities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return value.replace(/[&<>"']/g, (character) => entities[character]);
}

module.exports = router;
```

Line by line:

1. Import Express, `path`, the root helper, and the shared product array.
2. Create a router for shop-related routes.
3. The GET route `/` sends the shop HTML page.
4. The GET route `/products` builds a list from the current array.
5. `.map()` converts each product into an HTML list item.
6. `escapeHtml()` encodes special characters so a submitted title is treated as text instead of executable markup.
7. `.join('')` combines all list items into one string.
8. The fallback list item is displayed when there are no products.
9. `res.send()` sends the generated HTML and completes the response.
10. The router is exported for mounting in `app.js`.

> This array is temporary learning storage. Data disappears when the server restarts. Production apps persist records in a database.

### 4. `app.js` — assemble the app and define middleware order

```js
const express = require('express');
const path = require('path');
const rootDir = require('./util/path');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(rootDir, 'public')));

app.use('/admin', adminRoutes.router);
app.use(shopRoutes);

app.use((req, res) => {
  res.status(404).sendFile(path.join(rootDir, 'views', '404.html'));
});

app.listen(3000, () => {
  console.log('Express shop running at http://localhost:3000');
});
```

Line by line:

1. Import Express, path utilities, the project root, and the two route modules.
2. `express()` creates the app object and its ordered middleware/route stack.
3. `express.urlencoded({ extended: false })` parses form bodies encoded as `application/x-www-form-urlencoded`, making fields available on `req.body`.
4. The parser is registered before the POST route that needs the parsed data.
5. `express.static(...)` exposes files inside `public/` through browser URLs.
6. `app.use('/admin', adminRoutes.router)` mounts the router under `/admin`. Its `/add-product` path becomes `/admin/add-product`.
7. `app.use(shopRoutes)` mounts the shop routes without an added prefix.
8. The final middleware handles requests that reached the end without a response. It sets status 404 and sends the custom page.
9. `app.listen(3000)` starts the HTTP server. It is Express's convenience wrapper around Node's HTTP server creation/listening process.

### 5. `views/shop.html` — homepage and navigation

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Express Shop</title>
    <link rel="stylesheet" href="/css/main.css">
  </head>
  <body>
    <header>
      <a href="/">Express Shop</a>
      <nav>
        <a href="/">Shop</a>
        <a href="/products">Products</a>
        <a href="/admin/add-product">Add product</a>
      </nav>
    </header>
    <main>
      <h1>Welcome to the shop</h1>
      <p>Add a product, then view it in the products list.</p>
    </main>
  </body>
</html>
```

The `href` values are request paths handled by the Express routers. The stylesheet is requested from `/css/main.css`, not `/public/css/main.css`, because the public directory is the static middleware's root.

### 6. `views/add-product.html` — form that sends a POST request

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Product</title>
    <link rel="stylesheet" href="/css/main.css">
  </head>
  <body>
    <header>
      <a href="/">Express Shop</a>
      <nav>
        <a href="/">Shop</a>
        <a href="/products">Products</a>
      </nav>
    </header>
    <main>
      <h1>Add a product</h1>
      <form action="/admin/add-product" method="POST">
        <label for="title">Product title</label>
        <input id="title" name="title" type="text" required maxlength="80">
        <button type="submit">Save product</button>
      </form>
    </main>
  </body>
</html>
```

- `action` is the URL that receives the submission.
- `method="POST"` makes the browser send a POST request.
- `name="title"` becomes the key `title` in the parsed `req.body`.
- Browser validation improves usability, but server-side validation is still necessary.

### 7. `views/404.html` — custom not-found page

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Not Found</title>
    <link rel="stylesheet" href="/css/main.css">
  </head>
  <body>
    <main>
      <h1>Page not found</h1>
      <p>The requested page does not exist.</p>
      <a href="/">Return to the shop</a>
    </main>
  </body>
</html>
```

The HTML file itself does not set the HTTP status. The Express fallback sets `404` before sending this file.

### 8. `public/css/main.css` — static styling

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background: #f3f5f4;
  color: #17231e;
  font-family: Arial, sans-serif;
}

header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 8%;
  background: #17231e;
}

header a {
  color: white;
  text-decoration: none;
}

nav {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}

main {
  width: min(680px, calc(100% - 32px));
  margin: 64px auto;
  padding: 40px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 12px 40px rgb(23 35 30 / 8%);
}

input,
button {
  padding: 12px;
  font: inherit;
}
```

Because `express.static(path.join(rootDir, 'public'))` uses `public/` as its root, the file `public/css/main.css` is served at `/css/main.css`.

## How a request is handled

### Example: submitting a product

1. The browser submits the form to `POST /admin/add-product`.
2. Node's HTTP server receives the network request and creates the request/response objects.
3. Express starts checking its stack in the order configured in `app.js`.
4. The URL-encoded parser sees the form content type and reads the body.
5. It parses the body into an object such as `{ title: 'Desk Lamp' }`. Form values arrive as strings.
6. The `/admin` mount prefix matches, so Express enters the admin router.
7. The router's POST `/add-product` handler matches the remaining path.
8. The handler validates and stores the title.
9. `res.redirect('/')` sends a redirect response.
10. The browser makes a new GET request to `/`.
11. The shop route sends `shop.html`.

### Example: requesting an unknown page

1. The request passes through the parser and static middleware.
2. No mounted router route matches it.
3. Express reaches the final fallback middleware.
4. The app sets status 404 and sends `404.html`.

## Express fundamentals

### Request, response, and route matching

A request has an HTTP method and a URL path. A route such as `app.get('/products', handler)` matches GET requests for that path. A POST to the same path is a different method and will not match that GET route.

### Middleware and `next()`

Middleware is a function that can inspect or change the request, send a response, or pass control onward.

```js
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});
```

- Middleware runs in registration order when its path/method criteria match.
- `next()` tells Express to continue to the next matching layer.
- Sending a response ends the request-response cycle.
- `next(error)` passes control to error handling middleware.
- If middleware neither responds nor calls `next()`, the request remains pending.
- Do not call `next()` after sending a response unless you deliberately want another handler to run; this can cause duplicate-response errors.

### `app.use()` versus method-specific routes

- `app.use(path, middleware)` is commonly used for middleware or routers and matches path prefixes across HTTP methods.
- `app.get(path, handler)` handles matching GET requests.
- `app.post(path, handler)` handles matching POST requests.

### Router prefixes

Mounting `app.use('/admin', adminRouter)` adds a prefix to routes inside that router. If the router defines `router.get('/add-product', ...)`, the full path is `GET /admin/add-product`. Inside the router, define only the relative portion.

### Request body parsing

- Use `express.urlencoded({ extended: false })` for standard URL-encoded HTML form bodies.
- Use `express.json()` for JSON request bodies.
- Register the needed parser before the routes that read `req.body`.
- Validate request data on the server. Client-side form attributes are not a security boundary.

### Responses and status codes

- `res.send(body)` sends a response and ends it.
- `res.sendFile(absolutePath)` sends a file.
- `res.redirect(path)` sends a redirect response.
- `res.status(code)` sets the status and is chainable.
- Use 400 for invalid client input in this exercise and 404 when no route/resource is found.
- A 404 fallback is normal middleware and should come after the valid routes.

### Static files and file paths

- `express.static(directory)` maps files under a directory to public URLs.
- The physical directory name is not included in the URL.
- `res.sendFile()` expects an absolute path.
- Build paths with `path.join()` and a stable root rather than relying on the shell's current directory.

## Middleware order: why it matters

```text
1. Body parser
2. Static-file middleware
3. Admin router
4. Shop router
5. 404 fallback
```

- The body parser must precede the form route.
- Static middleware must be available before the 404 fallback, so asset requests can be served.
- Valid routes must run before the fallback.
- Middleware is not a set of unordered rules: order changes behavior.

## Run and verify

Start the server:

```powershell
npm start
```

Open these URLs:

- `http://localhost:3000/`
- `http://localhost:3000/admin/add-product`
- `http://localhost:3000/products`
- `http://localhost:3000/this-page-does-not-exist`

Verify the CSS directly at `http://localhost:3000/css/main.css`. Submit a product title, then open the products page. Restarting the server clears the in-memory array.

If Node reports `Cannot find module './routes/admin'`, check that `routes/admin.js` exists relative to `app.js), and that the file is not accidentally named `admin.js.txt`. If npm reports `Missing script: "start"`, add the start script to `package.json`.

## Debugging guide

| Symptom | Likely cause | Check |
|---|---|---|
| `Cannot find module './routes/admin'` | File missing, misnamed, or in the wrong folder | Confirm `routes/admin.js` is beside `app.js` in the expected structure |
| `req.body.title` is undefined | Parser missing, ordered too late, or form has no `name="title"` | Check parser order, input name, and form content type |
| Form POST returns 404 | Form action or router mount does not match | Compare `action`, `app.use('/admin', ...)`, and router path |
| CSS returns 404 | Static middleware/path mismatch | Check file at `public/css/main.css`, static registration, and URL `/css/main.css` |
| `sendFile` rejects the path | Relative path passed | Use `path.join(rootDir, ...)` |
| Request hangs | Middleware neither responds nor calls `next()` | Trace each matching handler in order |
| Valid page shows 404 | Fallback registered too early | Move fallback after all valid routes |
| Product title is missing after restart | Data is held in memory | Expected for this exercise; persistence requires a database |

## Build-from-memory challenge

Close this README and recreate the app from memory:

1. Initialize a CommonJS Node project and install Express.
2. Create a path helper.
3. Create separate admin and shop routers.
4. Add a GET route that sends an HTML file.
5. Add a POST form route and parse its body.
6. Validate the submitted title and redirect after success.
7. Display the stored product.
8. Serve CSS with `express.static()`.
9. Add navigation links between pages.
10. Add a final custom 404 page.
11. Explain the exact middleware and router order for each request.

## Mastery questions

1. What does Express add on top of Node's HTTP server capabilities?
2. What does `express()` return?
3. What does `app.listen(3000)` do?
4. How does Express decide whether a route matches a request?
5. What determines middleware execution order?
6. What does `next()` do? What does `next(error)` do?
7. Why must URL-encoded parsing happen before the POST handler?
8. How does `name="title"` become `req.body.title`?
9. What is the full URL for router path `/add-product` mounted at `/admin`?
10. Why does `res.sendFile()` need an absolute path?
11. How does `public/css/main.css` map to `/css/main.css`?
12. Why is the 404 fallback registered last?
13. Why does the redirect cause another request?
14. What is the limitation of storing products in an array?

**Mastery target:** Rebuild the application without copying, trace a form request from browser to response, and diagnose a broken module path, parser order, route path, or static-file URL.
