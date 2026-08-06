import type { CartLine, Fulfillment, Product } from "./types";

export const createLineId = (productId: string, variant: string) => `${productId}::${variant}`;

export function addLine(lines: CartLine[], product: Product, variant: string, quantity = 1) {
  const lineId = createLineId(product.id, variant);
  const existing = lines.find((line) => line.lineId === lineId);
  if (existing) {
    return lines.map((line) =>
      line.lineId === lineId ? { ...line, quantity: Math.min(line.quantity + quantity, 20) } : line,
    );
  }
  return [...lines, { lineId, product, variant, quantity: Math.min(quantity, 20) }];
}

export function updateLineQuantity(lines: CartLine[], lineId: string, quantity: number) {
  if (quantity <= 0) return lines.filter((line) => line.lineId !== lineId);
  return lines.map((line) => (line.lineId === lineId ? { ...line, quantity: Math.min(quantity, 20) } : line));
}

export function removeLine(lines: CartLine[], lineId: string) {
  return lines.filter((line) => line.lineId !== lineId);
}

export function subtotal(lines: CartLine[]) {
  return lines.reduce((total, line) => total + line.product.priceClp * line.quantity, 0);
}

export function itemCount(lines: CartLine[]) {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

export function shippingCost(lines: CartLine[], fulfillment: Fulfillment) {
  if (fulfillment === "retiro" || fulfillment === "instalacion" || lines.length === 0) return 0;
  return subtotal(lines) >= 60000 ? 0 : 2990;
}

export const total = (lines: CartLine[], fulfillment: Fulfillment) =>
  subtotal(lines) + shippingCost(lines, fulfillment);

export const formatPrice = (value: number) => `$${value.toLocaleString("es-CL")}`;
