// Makes user text safe to use inside a RegExp (so special characters cannot break the search)
module.exports = (s = '') => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
