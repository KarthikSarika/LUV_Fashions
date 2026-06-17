export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  // Multer errors handling
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File size limit exceeded. Maximum size is 5MB.' });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred on the server.';

  res.status(statusCode).json({
    error: message,
    status: statusCode
  });
};
