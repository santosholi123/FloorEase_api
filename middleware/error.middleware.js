module.exports = (err, req, res, next) => {
  console.error("ERROR MIDDLEWARE:", err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(statusCode).json({
    message: message,
    error: err.error || err.message || "Unknown error"
  });
};
