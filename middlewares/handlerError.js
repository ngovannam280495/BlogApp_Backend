const notFoundRouter = (req, res, next) => {
  const error = new Error('Router not found');
  error.status = 404;
  next(error);
};

const handlerGlobalError = (err, req, res, next) => {
  const status = err?.status ? err.status : 500;
  const message = err?.message ? err.message : 'Failed to connect';
  const stack = err?.stack ? err.stack : 'Failed to connect';
  res.status(status).json({
    status: 'Failed',
    message: message,
    stack: stack,
  });
};

module.exports = { notFoundRouter, handlerGlobalError };
