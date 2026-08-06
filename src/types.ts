export type CategoryId = "Multimedia" | "CarPlay" | "Diagnostico" | "Accesorios" | "Instalacion";

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  priceClp: number;
  compareAtPriceClp?: number;
  description: string;
  image: string;
  badge?: string;
  variants: string[];
};

export type CartLine = {
  lineId: string;
  product: Product;
  quantity: number;
  variant: string;
};

export type Fulfillment = "retiro" | "despacho" | "instalacion";

export type CheckoutData = {
  name: string;
  email: string;
  phone: string;
  fulfillment: Fulfillment;
  address: string;
  notes: string;
  vehicle: string;
  installation: boolean;
};

export type DemoOrder = {
  code: string;
  customerName: string;
  totalClp: number;
  fulfillment: Fulfillment;
  itemCount: number;
  vehicle?: string;
};
