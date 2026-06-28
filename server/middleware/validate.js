export const validate = (schema) => (req, res, next) => {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = req.body[field];

    for (const rule of rules) {
      if (rule === "required" && (!value || (typeof value === "string" && !value.trim()))) {
        errors.push(`${field} is required`);
        break;
      }

      if (rule === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push(`${field} must be a valid email`);
        break;
      }

      if (rule === "password" && value && value.length < 6) {
        errors.push(`${field} must be at least 6 characters`);
        break;
      }

      if (typeof rule === "object" && rule.minLength && value && value.length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters`);
        break;
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  next();
};
