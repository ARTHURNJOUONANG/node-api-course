function validate(schema) {
  return (req, _res, next) => {
    try {
      req.validatedBody = schema.parse(req.body);
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = validate;
