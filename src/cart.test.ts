import { describe, expect, it } from "vitest";
import { addLine, shippingCost, subtotal, total, updateLineQuantity } from "./cart";
import type { Product } from "./types";

const product: Product = {
  id: "demo",
  name: "Kit multimedia demo",
  category: "Accesorios",
  priceClp: 10000,
  description: "Equipo compatible con instalación coordinada",
  image: "demo.jpg",
  variants: ["Único"],
};

describe("carrito de DRG Automotriz", () => {
  it("acumula la misma variante en una línea", () => {
    const once = addLine([], product, "Único");
    const twice = addLine(once, product, "Único", 2);
    expect(twice).toHaveLength(1);
    expect(twice[0].quantity).toBe(3);
  });

  it("calcula despacho gratis desde el mínimo configurado", () => {
    const lines = addLine([], { ...product, priceClp: 60000 }, "Único");
    expect(shippingCost(lines, "despacho")).toBe(0);
    expect(total(lines, "despacho")).toBe(subtotal(lines));
  });

  it("elimina una línea cuando la cantidad baja a cero", () => {
    const lines = addLine([], product, "Único");
    expect(updateLineQuantity(lines, lines[0].lineId, 0)).toEqual([]);
  });
});
