export const validateMealId = (req, res, next) => {
  const { id } = req.params;
  if (!id || id.trim().length === 0) {
    return res.status(400).json({ message: "Invalid meal ID" });
  }
  next();
};
