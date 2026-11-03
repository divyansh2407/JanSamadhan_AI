/**
 * JanSamadhan – Zod Request Validation Middleware
 * Validates request body, query, or params against a Zod schema.
 */

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsedData = schema.parse(dataToValidate);
      req[source] = parsedData; // Replace with sanitized/coerced data
      next();
    } catch (error) {
      const issues = error.issues || error.errors;
      if (issues && Array.isArray(issues)) {
        const formattedErrors = issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'Validation failed',
          errors: formattedErrors,
        });
      }

      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Invalid request data',
      });
    }
  };
};

module.exports = validate;
