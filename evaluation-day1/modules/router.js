const { readDB, writeDB } = require('./db');

function sendJson(req, res, statusCode, body) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.url} → ${statusCode}`);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

async function handleGetBooks(req, res, searchParams) {
  const db = await readDB();
  let books = [...(db.books || [])];

  if (searchParams.has('available')) {
    const wantAvailable = searchParams.get('available') === 'true';
    books = books.filter((b) => b.available === wantAvailable);
  }

  sendJson(req, res, 200, {
    success: true,
    count: books.length,
    data: books,
  });
}

async function handleGetBookById(req, res, id) {
  const db = await readDB();
  const book = db.books.find((b) => b.id === id);
  if (!book) {
    return sendJson(req, res, 404, { success: false, error: 'Livre introuvable' });
  }
  return sendJson(req, res, 200, { success: true, data: book });
}

async function handlePostBook(req, res) {
  const raw = await readBody(req);
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return sendJson(req, res, 400, { success: false, error: 'JSON invalide' });
  }

  const { title, author, year } = parsed;
  if (
    title === undefined ||
    title === null ||
    author === undefined ||
    author === null ||
    year === undefined ||
    year === null
  ) {
    return sendJson(req, res, 400, {
      success: false,
      error: 'Les champs title, author et year sont requis',
    });
  }

  const db = await readDB();
  const maxId = db.books.reduce((max, b) => Math.max(max, b.id), 0);
  const newId = maxId + 1;
  const newBook = {
    id: newId,
    title,
    author,
    year,
    available: true,
  };
  db.books.push(newBook);
  await writeDB(db);
  return sendJson(req, res, 201, { success: true, data: newBook });
}

async function handleDeleteBook(req, res, id) {
  const db = await readDB();
  const idx = db.books.findIndex((b) => b.id === id);
  if (idx === -1) {
    return sendJson(req, res, 404, { success: false, error: 'Livre introuvable' });
  }
  db.books.splice(idx, 1);
  await writeDB(db);
  return sendJson(req, res, 200, { success: true, data: { id } });
}

async function dispatch(req, res) {
  const method = req.method;
  const base = `http://${req.headers.host || 'localhost'}`;
  const url = new URL(req.url, base);
  const pathname = url.pathname;

  if (method === 'POST' && pathname === '/books') {
    return handlePostBook(req, res);
  }

  if (method === 'DELETE' && /^\/books\/\d+$/.test(pathname)) {
    const id = Number(pathname.split('/')[2]);
    return handleDeleteBook(req, res, id);
  }

  if (method === 'GET' && pathname === '/books') {
    return handleGetBooks(req, res, url.searchParams);
  }

  if (method === 'GET' && /^\/books\/\d+$/.test(pathname)) {
    const id = Number(pathname.split('/')[2]);
    return handleGetBookById(req, res, id);
  }

  return sendJson(req, res, 404, { success: false, error: 'Route non trouvée' });
}

async function handleRequest(req, res) {
  try {
    await dispatch(req, res);
  } catch (err) {
    console.error(err);
    sendJson(req, res, 500, { success: false, error: 'Erreur interne' });
  }
}

module.exports = { handleRequest };
