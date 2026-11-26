// Wraps async controllers so any error goes to our error handler automatically.
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
