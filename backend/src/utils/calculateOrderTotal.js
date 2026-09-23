export const calculateOrderTotal = (
  items,
  deliveryFee = 100,
  codSurcharge = 0,
  discount = 0
) => {
  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + deliveryFee + tax + codSurcharge - discount;
  return { subtotal, deliveryFee, tax, discount, codSurcharge, total };
};