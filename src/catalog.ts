import type { CategoryId, Product } from "./types";

export const categories: Array<{ id: "Todos" | CategoryId; label: string }> = [
  { id: "Todos", label: "Todo" },
  { id: "carplay", label: "CarPlay y Android Auto" },
  { id: "pantallas", label: "Pantallas a pedido" },
  { id: "diagnostico", label: "Diagnóstico y reparación" },
  { id: "instalacion", label: "Instalación" },
];

export const labelForCategory = (category: CategoryId) =>
  categories.find((item) => item.id === category)?.label ?? category;

const asset = (name: string) => `/drg/real/${name}`;

export const products: Product[] = [
  {
    id: "drg-carplay-01",
    name: "Integración CarPlay y Android Auto",
    category: "carplay",
    priceClp: 0,
    description:
      "Agregamos CarPlay y Android Auto a la pantalla original mediante un módulo instalado detrás de la radio, manteniendo la estética de fábrica cuando es compatible.",
    image: asset("mazda-carplay-01.png"),
    gallery: [asset("mazda3-carplay-02.png"), asset("mazda6-carplay.png"), asset("mercedes-carplay-01.png")],
    badge: "Más solicitado",
    variants: ["Mazda", "Mercedes-Benz", "Toyota", "Consultar compatibilidad"],
    kind: "service",
    featured: true,
  },
  {
    id: "drg-screen-02",
    name: "Pantalla multimedia a pedido",
    category: "pantallas",
    priceClp: 0,
    description:
      "Para vehículos que no traen una pantalla compatible: buscamos la alternativa adecuada, coordinamos la importación e instalamos el equipo con una integración limpia.",
    image: asset("mercedes-carplay-02.png"),
    gallery: [asset("mazda3-carplay-02.png"), asset("mercedes-cla-exterior.png")],
    badge: "A medida",
    variants: ["Evaluar vehículo", "Importación a pedido", "Consultar"],
    kind: "service",
  },
  {
    id: "drg-repair-03",
    name: "Diagnóstico y reparación de radio o pantalla",
    category: "diagnostico",
    priceClp: 0,
    description:
      "Revisamos fallas táctiles, imagen, audio y conectividad en radios y pantallas originales para definir la reparación más conveniente.",
    image: asset("silverado-radio.png"),
    gallery: [asset("amarok-radio.png"), asset("mercedes-carplay-01.png")],
    badge: "Revisión especializada",
    variants: ["Pantalla táctil", "Radio original", "Audio y conectividad", "Consultar"],
    kind: "service",
  },
  {
    id: "drg-install-04",
    name: "Instalación y configuración en tu vehículo",
    category: "instalacion",
    priceClp: 0,
    description:
      "Coordinamos la visita, instalamos el equipo y dejamos CarPlay, Android Auto, navegación y audio probados y explicados.",
    image: asset("mercedes-cla-exterior.png"),
    gallery: [asset("mercedes-carplay-01.png"), asset("mercedes-carplay-02.png"), asset("mazda6-carplay.png")],
    badge: "Servicio a domicilio",
    variants: ["En taller", "A domicilio", "Coordinar ubicación"],
    kind: "service",
  },
  {
    id: "drg-compat-05",
    name: "Evaluación de compatibilidad",
    category: "carplay",
    priceClp: 0,
    description:
      "Envíanos la marca, el modelo y el año; confirmamos la compatibilidad y te recomendamos la solución antes de instalar.",
    image: asset("mazda6-carplay.png"),
    gallery: [asset("mazda-carplay-01.png"), asset("silverado-radio.png")],
    variants: ["Marca y modelo", "Año del vehículo", "Enviar consulta"],
    kind: "service",
  },
];

export const gallery = [
  { image: asset("mazda-carplay-01.png"), title: "Mazda · integración CarPlay", tag: "CarPlay" },
  { image: asset("mazda3-carplay-02.png"), title: "Mazda 3 · pantalla original conectada", tag: "Android Auto" },
  { image: asset("mercedes-carplay-01.png"), title: "Mercedes-Benz · multimedia integrada", tag: "Instalación" },
  { image: asset("mercedes-carplay-02.png"), title: "Mercedes-Benz · navegación y audio", tag: "CarPlay" },
  { image: asset("amarok-radio.png"), title: "Volkswagen Amarok · revisión de radio", tag: "Diagnóstico" },
  { image: asset("silverado-radio.png"), title: "Chevrolet Silverado · reparación de pantalla", tag: "Reparación" },
  { image: asset("mazda6-carplay.png"), title: "Mazda 6 · CarPlay integrado", tag: "Instalación" },
];
