const { ZodError } = require('zod');

/**
 * Express middleware factory that validates req.body against a Zod schema.
 * Usage: router.post('/route', validate(mySchema), controller)
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      req[source] = schema.parse(req[source] || {});
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        return res.status(400).json({
          error: 'Validation failed',
          details: messages,
        });
      }
      next(err);
    }
  };
}

module.exports = validate;
