import type { CategoryId, Product } from "./types";

export const categories: Array<{ id: "Todos" | CategoryId; label: string }> = [
  { id: "Todos", label: "Todo" },
  { id: "Multimedia", label: "Multimedia" },
  { id: "CarPlay", label: "CarPlay & Android Auto" },
  { id: "Diagnostico", label: "Diagnóstico" },
  { id: "Accesorios", label: "Accesorios" },
  { id: "Instalacion", label: "Equipo + instalación" },
];

export const labelForCategory = (category: CategoryId) => categories.find((item) => item.id === category)?.label ?? category;

const asset = (name: string) => `/drg/${name}`;

export const products: Product[] = [
  {
    id: "drg-screen-01",
    name: "Pantalla multimedia 9\"",
    category: "Multimedia",
    priceClp: 249990,
    compareAtPriceClp: 279990,
    description: "Pantalla táctil para modernizar tu tablero con navegación, música y conectividad.",
    image: asset("work-01.jpg"),
    badge: "Más solicitado",
    variants: ["Universal", "Toyota", "Mazda", "Mercedes"],
  },
  {
    id: "drg-carplay-02",
    name: "Kit CarPlay inalámbrico",
    category: "CarPlay",
    priceClp: 89990,
    description: "Activa Apple CarPlay y Android Auto inalámbricos conservando la experiencia original del vehículo.",
    image: asset("work-02.jpg"),
    badge: "Plug & play",
    variants: ["USB", "USB-C"],
  },
  {
    id: "drg-install-03",
    name: "Pack equipo + instalación",
    category: "Instalacion",
    priceClp: 329990,
    description: "Seleccionamos el equipo compatible y lo instalamos a domicilio, con configuración y prueba final.",
    image: asset("work-04.jpg"),
    badge: "Recomendado",
    variants: ["Santiago", "Región del Ñuble", "Consultar cobertura"],
  },
  {
    id: "drg-repair-04",
    name: "Diagnóstico y reparación de radio",
    category: "Diagnostico",
    priceClp: 39990,
    description: "Evaluación de pantalla, placa, audio o conectividad para definir una reparación segura.",
    image: asset("work-10.jpg"),
    variants: ["Evaluación", "Revisión avanzada"],
  },
  {
    id: "drg-camera-05",
    name: "Cámara de retroceso HD",
    category: "Accesorios",
    priceClp: 44990,
    description: "Mejora la visibilidad al estacionar y deja la imagen integrada en tu pantalla compatible.",
    image: asset("work-05.jpg"),
    badge: "Seguridad",
    variants: ["Estándar", "Con líneas dinámicas"],
  },
  {
    id: "drg-service-06",
    name: "Instalación a domicilio",
    category: "Instalacion",
    priceClp: 69990,
    description: "Vamos a tu ubicación, revisamos compatibilidad y dejamos el sistema probado y explicado.",
    image: asset("work-03.jpg"),
    variants: ["Dentro de cobertura", "Consultar comuna"],
  },
];

export const gallery = [
  { image: asset("work-04.jpg"), title: "Mercedes · actualización multimedia", tag: "Instalación" },
  { image: asset("work-05.jpg"), title: "Mazda CX-3 · cámara y terminaciones", tag: "Integración" },
  { image: asset("work-07.jpg"), title: "Mitsubishi · tecnología en ruta", tag: "Proyecto" },
  { image: asset("work-08.jpg"), title: "Mazda 2 · CarPlay inalámbrico", tag: "Antes y después" },
  { image: asset("work-11.jpg"), title: "Mazda 3 · instalación a domicilio", tag: "Servicio" },
  { image: asset("work-12.jpg"), title: "Diagnóstico y actualización de software", tag: "Diagnóstico" },
];
