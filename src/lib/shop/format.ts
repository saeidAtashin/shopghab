export function formatToman(price: number): string {
  return `${new Intl.NumberFormat("fa-IR").format(price)} تومان`;
}
