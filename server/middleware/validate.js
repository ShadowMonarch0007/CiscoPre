// tiny helper to use zod with express
export const validate =
  (schema) =>
  (req, res, next) => {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
    }
    // attach parsed data if you want
    next();
  };
