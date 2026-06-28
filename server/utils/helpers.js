export const asArray = (val) => (Array.isArray(val) ? val : [val]);

export const pick = (obj, keys) => {
  const result = {};
  for (const key of keys) {
    if (obj[key] !== undefined) result[key] = obj[key];
  }
  return result;
};

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const toUpperCase = (str) => (str ? str.toUpperCase() : str);
