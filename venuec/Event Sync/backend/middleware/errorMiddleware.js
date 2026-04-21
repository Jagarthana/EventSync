module.exports = function errorMiddleware(err, _req, res, _next) {
  console.error(err);
  const status = err.statusCode || err.status || 500;
  const message = status === 500 ? 'Server error' : err.message || 'Error';
  res.status(status).json({ error: message });
};
