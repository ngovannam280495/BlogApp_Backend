const notFoundRouter = (req, res, next) => {
  const error = new Error('Router not found');
  error.status = 404;
  next(error);
};

const handlerGlobalError = (err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
      stack: err.stack,
    },
  });
};

module.exports = { notFoundRouter, handlerGlobalError };
