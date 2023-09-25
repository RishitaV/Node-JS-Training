const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

const books = [
  { id: 1, title: 'Book 1', author: 'Author 1' },
  { id: 2, title: 'Book 2', author: 'Author 2' },
  { id: 3, title: 'Book 3', author: 'Author 3' },
];

app.get('/books', (req, res) => {
  res.json(books);
});

app.post('/books', (req, res) => {
  const newBook = req.body;
  books.push(newBook);
  res.status(201).json(newBook);
});

app.get('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id);
  const queriedBook  = books.find((book) => book.id === bookId);

  if (!queriedBook ) {
    return res.status(404).json({ error: 'Book not found' });
  }

  res.json(queriedBook );
});

app.put('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id);
  const updatedBook = req.body;

  const bookIndex = books.findIndex((book) => book.id === bookId);

  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  books[bookIndex] = { ...books[bookIndex], ...updatedBook };
  res.json(books[bookIndex]);
});

app.delete('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id);
  const bookIndex = books.findIndex((book) => book.id === bookId);

  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  books.splice(bookIndex, 1);
  res.sendStatus(204);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});