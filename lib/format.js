export function formatPrice(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}
