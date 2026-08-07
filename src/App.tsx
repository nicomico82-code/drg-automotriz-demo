import { useEffect, useMemo, useState, type FormEvent } from "react";
import { categories as seedCategories, gallery as seedGallery, labelForCategory as seedLabelForCategory, products as seedProducts } from "./catalog";
import { loadCatalog } from "./catalogRemote";
import { SupportChat } from "./SupportChat";
import {
  addLine,
  formatPrice,
  itemCount,
  removeLine,
  shippingCost,
  subtotal,
  total,
  updateLineQuantity,
} from "./cart";
import type { CartLine, CategoryId, CheckoutData, Fulfillment, OrderSummary, Product } from "./types";

const CART_STORAGE_KEY = "drg-automotriz-cart";
const INSTAGRAM_URL = "https://www.instagram.com/drg_automotrizcl/";
const WHATSAPP_NUMBER = "56921972666";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
const TIKTOK_URL = "https://www.tiktok.com/@drg_automotrizcl?_r=1&_t=ZS-98gjBAHoirF";
const QUOTE_EMAIL = "Drg.automotrizcl@gmail.com";
const QUOTE_FORM_ENDPOINT = `https://formsubmit.co/ajax/${QUOTE_EMAIL}`;
const SUPPORTED_BRANDS = [
  "Mazda", "Mercedes-Benz", "Toyota", "Dodge", "Audi", "BMW", "Chevrolet", "Volkswagen",
  "Porsche", "Volvo", "Land Rover", "Honda", "Lexus", "Ford", "Jeep", "Rolls-Royce",
];

type QuoteFormData = {
  name: string;
  phone: string;
  vehicle: string;
  service: string;
  notes: string;
};

function loadCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? "[]") as unknown;
    return Array.isArray(stored) ? (stored as CartLine[]) : [];
  } catch {
    return [];
  }
}

function createRequestCode() {
  return `DRG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function fulfillmentLabel(value: Fulfillment) {
  return value === "instalacion" ? "Equipo + instalación a domicilio" : value === "despacho" ? "Despacho a domicilio" : "Retiro o coordinación";
}

function ProductCard({ product, onOpen, labelForCategory }: { product: Product; onOpen: (product: Product) => void; labelForCategory: (category: CategoryId) => string }) {
  return (
    <article className="product-card">
      <button className="product-card__image" type="button" onClick={() => onOpen(product)} aria-label={`Ver ${product.name}`}>
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.badge && <span className="product-card__badge">{product.badge}</span>}
        <span className="product-card__image-action">Ver detalle <span aria-hidden="true">↗</span></span>
      </button>
      <div className="product-card__body">
        <p className="product-card__category">{labelForCategory(product.category)}</p>
        <h3>{product.name}</h3>
        <p className="product-card__description">{product.description}</p>
        <div className="product-card__footer">
          <div>
            <strong>{formatPrice(product.priceClp)}</strong>
            {product.compareAtPriceClp && <del>{formatPrice(product.compareAtPriceClp)}</del>}
          </div>
          <button type="button" className="text-button" onClick={() => onOpen(product)}>{product.priceClp > 0 ? "Elegir" : "Consultar"} <span aria-hidden="true">＋</span></button>
        </div>
      </div>
    </article>
  );
}

function ProductModal({
  product,
  labelForCategory,
  variant,
  quantity,
  onVariant,
  onQuantity,
  onAdd,
  onClose,
}: {
  product: Product;
  labelForCategory: (category: CategoryId) => string;
  variant: string;
  quantity: number;
  onVariant: (value: string) => void;
  onQuantity: (value: number) => void;
  onAdd: () => void;
  onClose: () => void;
}) {
  return (
    <div className="overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
        <button className="close-button" type="button" onClick={onClose} aria-label="Cerrar detalle">×</button>
        <div className="product-modal__image"><img src={product.image} alt={product.name} /></div>
        <div className="product-modal__content">
          <p className="eyebrow">{labelForCategory(product.category)}</p>
          <h2 id="product-modal-title">{product.name}</h2>
          <p className="product-modal__description">{product.description} Antes de confirmar, revisamos la compatibilidad con tu vehículo y la cobertura de instalación.</p>
          <div className="product-modal__price">
            <strong>{formatPrice(product.priceClp)}</strong>
            {product.compareAtPriceClp && <del>{formatPrice(product.compareAtPriceClp)}</del>}
          </div>
          <div className="option-group">
            <span className="option-group__label">Elige una opción</span>
            <div className="option-list">
              {product.variants.map((option) => (
                <button className={option === variant ? "option-chip is-selected" : "option-chip"} type="button" key={option} onClick={() => onVariant(option)}>
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="product-modal__actions">
            <div className="quantity-control" aria-label="Cantidad">
              <button type="button" onClick={() => onQuantity(Math.max(1, quantity - 1))} aria-label="Disminuir cantidad">−</button>
              <span>{quantity}</span>
              <button type="button" onClick={() => onQuantity(Math.min(20, quantity + 1))} aria-label="Aumentar cantidad">＋</button>
            </div>
            <button className="primary-button" type="button" onClick={onAdd}>{product.priceClp > 0 ? `Agregar al carrito · ${formatPrice(product.priceClp * quantity)}` : "Agregar a la solicitud"}</button>
          </div>
          <p className="info-caption">El valor final se confirma según compatibilidad, equipo e instalación.</p>
        </div>
      </section>
    </div>
  );
}

function CartDrawer({
  lines,
  onQuantity,
  onRemove,
  onCheckout,
  onClose,
}: {
  lines: CartLine[];
  onQuantity: (lineId: string, quantity: number) => void;
  onRemove: (lineId: string) => void;
  onCheckout: () => void;
  onClose: () => void;
}) {
  const amount = subtotal(lines);
  return (
    <div className="overlay overlay--right" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className="drawer-header">
          <div><p className="eyebrow">Tu selección</p><h2 id="cart-title">Carrito</h2></div>
          <button className="close-button" type="button" onClick={onClose} aria-label="Cerrar carrito">×</button>
        </div>
        {lines.length === 0 ? (
          <div className="empty-cart"><span className="empty-cart__icon">＋</span><h3>Tu carrito está vacío</h3><p>Agrega un equipo o servicio para comenzar.</p></div>
        ) : (
          <>
            <div className="cart-lines">
              {lines.map((line) => (
                <div className="cart-line" key={line.lineId}>
                  <img src={line.product.image} alt="" />
                  <div className="cart-line__main">
                    <div><strong>{line.product.name}</strong><button type="button" className="remove-button" onClick={() => onRemove(line.lineId)}>Eliminar</button></div>
                    <small>{line.variant}</small>
                    <div className="cart-line__bottom"><div className="quantity-control quantity-control--small"><button type="button" onClick={() => onQuantity(line.lineId, line.quantity - 1)} aria-label={`Disminuir ${line.product.name}`}>−</button><span>{line.quantity}</span><button type="button" onClick={() => onQuantity(line.lineId, line.quantity + 1)} aria-label={`Aumentar ${line.product.name}`}>＋</button></div><b>{formatPrice(line.product.priceClp * line.quantity)}</b></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-summary"><span>Subtotal</span><strong>{formatPrice(amount)}</strong></div>
            <p className="cart-note">En el siguiente paso, cuéntanos de tu vehículo y si necesitas instalación.</p>
            <button className="primary-button primary-button--wide" type="button" onClick={onCheckout}>Continuar al checkout <span aria-hidden="true">→</span></button>
          </>
        )}
      </aside>
    </div>
  );
}

function CheckoutModal({ lines, onBack, onComplete }: { lines: CartLine[]; onBack: () => void; onComplete: (data: CheckoutData, code: string) => void }) {
  const [form, setForm] = useState<CheckoutData>({ name: "", email: "", phone: "", fulfillment: "retiro", address: "", notes: "", vehicle: "", installation: false });
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [requestCode] = useState(createRequestCode);
  const setField = <K extends keyof CheckoutData>(field: K, value: CheckoutData[K]) => setForm((current) => ({ ...current, [field]: value }));
  const amount = total(lines, form.fulfillment);
  const shipping = shippingCost(lines, form.fulfillment);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Completa tu nombre y WhatsApp para continuar.");
      return;
    }
    if (form.fulfillment === "instalacion" && !form.vehicle.trim()) {
      setError("Indica la marca, el modelo y el año para revisar la compatibilidad.");
      return;
    }
    if (form.fulfillment === "despacho" && !form.address.trim()) {
      setError("Ingresa una dirección para el despacho.");
      return;
    }
    setIsSending(true);
    try {
      const items = lines.map((line) => `${line.quantity} x ${line.product.name} (${line.variant}) · ${formatPrice(line.product.priceClp * line.quantity)}`).join("\n");
      const response = await fetch(QUOTE_FORM_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          _subject: `Nueva solicitud DRG · ${form.vehicle || "Vehículo por confirmar"}`,
          _template: "table",
          _honey: "",
          _url: typeof window === "undefined" ? "" : window.location.href,
          request_code: requestCode,
          name: form.name,
          phone: form.phone,
          email: form.email || "No informado",
          vehicle: form.vehicle || "Por confirmar",
          fulfillment: fulfillmentLabel(form.fulfillment),
          address: form.address || "No informada",
          items,
          subtotal: formatPrice(subtotal(lines)),
          shipping: shipping === 0 ? "A confirmar" : formatPrice(shipping),
          total: formatPrice(amount),
          details: form.notes || "Sin comentario adicional",
        }),
      });
      const result = await response.json().catch(() => null) as { success?: boolean | string; message?: string } | null;
      const accepted = response.ok && (!result || result.success === undefined || result.success === true || result.success === "true");
      if (!accepted) throw new Error(result?.message || "El servicio de correo rechazó la solicitud.");
      onComplete(form, requestCode);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "No pudimos enviar la solicitud. Inténtalo nuevamente.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="overlay" role="presentation">
      <section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <div className="drawer-header"><div><p className="eyebrow">Paso final</p><h2 id="checkout-title">Cuéntanos de tu vehículo</h2></div><button className="close-button" type="button" onClick={onBack} aria-label="Volver al carrito" disabled={isSending}>×</button></div>
        <div className="checkout-items" aria-label="Productos y servicios seleccionados"><p className="checkout-items__title">Tu solicitud</p>{lines.map((line) => <div className="checkout-item" key={line.lineId}><div><strong>{line.quantity} × {line.product.name}</strong><small>{line.variant}</small></div><b>{formatPrice(line.product.priceClp * line.quantity)}</b></div>)}</div>
        <form onSubmit={submit}>
          <div className="checkout-grid">
            <label>Nombre<input required value={form.name} onChange={(event) => setField("name", event.target.value)} placeholder="Tu nombre" /></label>
            <label>WhatsApp<input required value={form.phone} onChange={(event) => setField("phone", event.target.value)} placeholder="+56 9 ..." /></label>
            <label>Correo <span className="optional">opcional</span><input type="email" value={form.email} onChange={(event) => setField("email", event.target.value)} placeholder="tu@correo.cl" /></label>
            <label>Marca, modelo y año<input value={form.vehicle} onChange={(event) => setField("vehicle", event.target.value)} placeholder="Ej. Mazda 3 2017" /></label>
          </div>
          <label>¿Cómo quieres recibirlo?<select value={form.fulfillment} onChange={(event) => { const value = event.target.value as Fulfillment; setField("fulfillment", value); setField("installation", value === "instalacion"); }}><option value="retiro">Retiro o coordinación</option><option value="despacho">Despacho a domicilio</option><option value="instalacion">Equipo + instalación a domicilio</option></select></label>
          {form.fulfillment === "despacho" && <label>Dirección<input value={form.address} onChange={(event) => setField("address", event.target.value)} placeholder="Calle, número y comuna" /></label>}
          <label>Comentario <span className="optional">opcional</span><textarea value={form.notes} onChange={(event) => setField("notes", event.target.value)} placeholder="Cuéntanos qué necesitas o qué sistema tiene tu auto." /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="checkout-summary"><div><span>Productos y servicios</span><b>{formatPrice(subtotal(lines))}</b></div><div><span>{form.fulfillment === "retiro" ? "Coordinación" : form.fulfillment === "instalacion" ? "Instalación" : "Despacho"}</span><b>{shipping === 0 ? "A confirmar" : formatPrice(shipping)}</b></div><div className="checkout-total"><span>Total de la solicitud</span><strong>{formatPrice(amount)}</strong></div></div>
          <div className="checkout-actions"><button className="secondary-button" type="button" onClick={onBack} disabled={isSending}>Volver</button><button className="primary-button" type="submit" disabled={isSending}>{isSending ? "Enviando solicitud…" : "Enviar solicitud"} <span aria-hidden="true">→</span></button></div>
          <p className="checkout-note">La solicitud se enviará al correo de DRG para confirmar compatibilidad, disponibilidad e instalación.</p>
        </form>
      </section>
    </div>
  );
}

function QuoteModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<QuoteFormData>({ name: "", phone: "", vehicle: "", service: "Integración CarPlay / Android Auto", notes: "" });
  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSending(true);
    try {
      const response = await fetch(QUOTE_FORM_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          _subject: `Nueva cotización · ${form.vehicle}`,
          _template: "table",
          _honey: "",
          _url: typeof window === "undefined" ? "" : window.location.href,
          name: form.name,
          phone: form.phone,
          vehicle: form.vehicle,
          service: form.service,
          details: form.notes || "Sin detalle adicional",
        }),
      });
      const result = await response.json().catch(() => null) as { success?: boolean | string; message?: string } | null;
      const accepted = response.ok && (!result || result.success === undefined || result.success === true || result.success === "true");
      if (!accepted) throw new Error(result?.message || "El servicio de correo rechazó la solicitud.");
      setSubmitted(true);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "No pudimos enviar la cotización. Inténtalo nuevamente.");
    } finally {
      setIsSending(false);
    }
  };
  return (
    <div className="overlay" role="presentation">
      <section className="quote-modal" role="dialog" aria-modal="true" aria-labelledby="quote-title">
        <button className="close-button" type="button" onClick={onClose} aria-label="Cerrar formulario">×</button>
        {!submitted ? <>
          <p className="eyebrow">Cotización rápida</p><h2 id="quote-title">Cuéntanos qué quieres mejorar.</h2><p className="quote-intro">Con la marca y el modelo revisamos la compatibilidad, el equipo disponible y la cobertura de instalación.</p>
          <form onSubmit={submit} className="quote-form">
            <div className="checkout-grid"><label>Nombre<input required value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Tu nombre" /></label><label>WhatsApp<input required value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+56 9 ..." /></label></div>
            <label>Marca, modelo y año<input required value={form.vehicle} onChange={(event) => update("vehicle", event.target.value)} placeholder="Ej. Mercedes CLA 2018" /></label>
            <label>¿Qué necesitas?<select value={form.service} onChange={(event) => update("service", event.target.value)}><option>Integración CarPlay / Android Auto</option><option>Pantalla multimedia a pedido</option><option>Diagnóstico o reparación de radio</option><option>Instalación y configuración</option><option>Evaluación de compatibilidad</option><option>Otro proyecto</option></select></label>
            <label>Detalle <span className="optional">opcional</span><textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Describe tu idea o adjunta luego una foto por WhatsApp." /></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button primary-button--wide" type="submit" disabled={isSending}>{isSending ? "Enviando cotización…" : "Enviar cotización"}</button>
          </form>
          <p className="info-caption">La solicitud se envía directamente a <strong>{QUOTE_EMAIL}</strong>.</p>
        </> : <div className="quote-success"><div className="success-icon">✓</div><p className="eyebrow">Cotización enviada</p><h2>Recibimos los datos de tu proyecto.</h2><p>La solicitud fue enviada a <strong>{QUOTE_EMAIL}</strong>. El equipo podrá revisar compatibilidad, disponibilidad y coordinación de instalación.</p><button className="primary-button primary-button--wide" type="button" onClick={onClose}>Volver al catálogo</button></div>}
      </section>
    </div>
  );
}

function SuccessModal({ order, onClose }: { order: OrderSummary; onClose: () => void }) {
  return (
    <div className="overlay" role="presentation">
      <section className="success-modal" role="dialog" aria-modal="true" aria-labelledby="success-title">
        <div className="success-icon">✓</div><p className="eyebrow">Solicitud recibida</p><h2 id="success-title">¡Gracias, {order.customerName}!</h2><p>Recibimos tu solicitud y la enviaremos al equipo de DRG para revisar los detalles de tu vehículo.</p>
        <div className="success-code"><span>Referencia de solicitud</span><strong>{order.code}</strong></div>
        <div className="success-detail"><span>Productos y servicios</span><b>{order.itemCount}</b><span>Vehículo</span><b>{order.vehicle || "Por confirmar"}</b><span>Modalidad</span><b>{order.fulfillment === "instalacion" ? "Instalación a domicilio" : order.fulfillment === "despacho" ? "Despacho" : "Coordinación"}</b><span>Total de la solicitud</span><b>{formatPrice(order.totalClp)}</b></div>
        <div className="success-note">La solicitud fue enviada al correo de DRG. El valor final y la coordinación se confirman antes de instalar o entregar el equipo.</div>
        <button className="primary-button" type="button" onClick={onClose}>Volver al catálogo</button>
      </section>
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"Todos" | CategoryId>("Todos");
  const [catalog, setCatalog] = useState({ categories: seedCategories, products: seedProducts, gallery: seedGallery });
  const [cart, setCart] = useState<CartLine[]>(loadCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [order, setOrder] = useState<OrderSummary | null>(null);

  useEffect(() => { window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); }, [cart]);
  useEffect(() => { loadCatalog().then(setCatalog).catch(() => undefined); }, []);

  const labelForCategory = (value: CategoryId) => catalog.categories.find((item) => item.id === value)?.label ?? seedLabelForCategory(value);

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return catalog.products.filter((product) => {
      const matchesCategory = category === "Todos" || product.category === category;
      const matchesQuery = !normalizedQuery || `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [catalog.products, category, query]);

  const openProduct = (product: Product) => { setSelectedProduct(product); setSelectedVariant(product.variants[0] ?? "Único"); setSelectedQuantity(1); };
  const addSelectedProduct = () => { if (!selectedProduct) return; setCart((current) => addLine(current, selectedProduct, selectedVariant, selectedQuantity)); setSelectedProduct(null); setCartOpen(true); };
  const completeOrder = (data: CheckoutData, code: string) => { setOrder({ code, customerName: data.name.trim(), totalClp: total(cart, data.fulfillment), fulfillment: data.fulfillment, itemCount: itemCount(cart), vehicle: data.vehicle.trim() }); setCart([]); setCheckoutOpen(false); setCartOpen(false); };

  return (
    <div className="store-shell">
      <div className="demo-bar"><span className="demo-dot" /> Catálogo DRG · Solicitudes de cotización <span className="demo-bar__right">Equipos + instalación a domicilio</span></div>
      <header className="store-header">
        <a className="store-brand" href="#inicio" aria-label="DRG Automotriz, inicio"><span className="store-brand__logo"><img src="/drg/logo.png" alt="" /></span><span><strong>DRG</strong><small>Automotriz</small></span></a>
        <nav className="store-nav" aria-label="Navegación de la tienda"><a href="#catalogo">Equipos</a><a href="#servicios">Instalación</a><a href="#trabajos">Trabajos</a><a href="#contacto">Contacto</a></nav>
        <button className="cart-button" type="button" onClick={() => setCartOpen(true)}><span>Carrito</span><b>{itemCount(cart)}</b></button>
      </header>

      <main>
        <section className="store-hero" id="inicio">
          <div className="store-hero__copy"><p className="eyebrow"><span className="eyebrow-line" /> CarPlay · Android Auto · instalación</p><h1>Tu pantalla original, <em>mucho más útil.</em></h1><p>Integramos CarPlay y Android Auto detrás de la radio de fábrica, instalamos pantallas a pedido y reparamos sistemas multimedia en una amplia variedad de marcas.</p><div className="hero-actions"><a className="primary-button" href="#catalogo">Ver soluciones <span aria-hidden="true">↓</span></a><button className="secondary-button" type="button" onClick={() => setQuoteOpen(true)}>Cotizar instalación <span aria-hidden="true">↗</span></button></div><div className="hero-proof"><span>01</span><div><strong>Compatibilidad primero</strong><p>Revisamos la marca, el modelo y el año antes de recomendar.</p></div></div></div>
          <div className="store-hero__visual"><img src={catalog.gallery[0].image} alt="Instalación multimedia en un vehículo" /><div className="hero-product-card"><span>Trabajo destacado</span><strong>Mercedes · CarPlay inalámbrico</strong><b>Equipo + instalación</b></div><div className="hero-stamp"><img src="/drg/logo.png" alt="DRG Automotriz" /></div></div>
        </section>

        <section className="trust-strip" aria-label="Propuesta de valor"><div><span>⌁</span><strong>Equipos compatibles</strong><small>Elegidos para tu vehículo</small></div><div><span>⌖</span><strong>Servicio a domicilio</strong><small>Coordinamos en tu comuna</small></div><div><span>✓</span><strong>Instalación cuidada</strong><small>Probamos todo antes de entregar</small></div><div><span>↗</span><strong>Soporte cercano</strong><small>Te explicamos cómo usarlo</small></div></section>

        <section className="catalog-section" id="catalogo">
          <div className="section-heading"><div><p className="eyebrow">01 · Soluciones DRG</p><h2>Mejora la experiencia de <em>manejar.</em></h2></div><p>Servicios de integración, pantallas a pedido, diagnóstico e instalación para que tu auto tenga la tecnología que necesita.</p></div>
          <div className="catalog-toolbar"><div className="category-list" aria-label="Categorías">{catalog.categories.map((item) => <button type="button" className={category === item.id ? "category-button is-active" : "category-button"} key={item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}</div><label className="search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar equipo o servicio" aria-label="Buscar equipo o servicio" /></label></div>
          {visibleProducts.length === 0 ? <div className="no-results"><h3>No encontramos ese equipo.</h3><p>Prueba con otra palabra o solicita una revisión personalizada.</p><button className="secondary-button" type="button" onClick={() => { setQuery(""); setCategory("Todos"); }}>Ver catálogo</button></div> : <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} labelForCategory={labelForCategory} onOpen={openProduct} />)}</div>}
        </section>

        <section className="service-section" id="servicios"><div className="service-section__intro"><p className="eyebrow">02 · Cómo trabajamos</p><h2>Del diagnóstico a la <em>ruta.</em></h2><p>El módulo se instala detrás de la radio original para sumar CarPlay y Android Auto. Si tu vehículo no trae pantalla, coordinamos una alternativa a pedido y la dejamos funcionando.</p><button className="primary-button" type="button" onClick={() => setQuoteOpen(true)}>Quiero revisar mi auto <span aria-hidden="true">↗</span></button></div><div className="service-steps"><div><span>01</span><strong>Cuéntanos de tu vehículo</strong><p>Indica la marca, el modelo, el año y qué te gustaría mejorar.</p></div><div><span>02</span><strong>Confirmamos compatibilidad</strong><p>Revisamos el sistema original y proponemos una alternativa.</p></div><div><span>03</span><strong>Instalamos y probamos</strong><p>Coordinamos la visita y dejamos todo listo y explicado.</p></div></div></section>

        <section className="gallery-section" id="trabajos"><div className="section-heading"><div><p className="eyebrow">03 · Trabajos reales</p><h2>Una muestra de lo que <em>hacemos.</em></h2></div><p>Integraciones, actualizaciones y diagnósticos documentados por el equipo.</p></div><div className="gallery-grid">{catalog.gallery.map((item) => <figure key={item.image}><img src={item.image} alt={item.title} loading="lazy" /><figcaption><span>{item.tag}</span><strong>{item.title}</strong></figcaption></figure>)}</div></section>

        <section className="brands-section" aria-labelledby="brands-title"><div><p className="eyebrow">Compatibilidad real</p><h2 id="brands-title">Trabajamos con tu <em>marca.</em></h2><p>Tenemos soluciones para integrar CarPlay y Android Auto, reparar pantallas originales o instalar un equipo a pedido. Envíanos la marca, el modelo y el año para confirmar la alternativa correcta.</p></div><div className="brands-list">{SUPPORTED_BRANDS.map((brand) => <span key={brand}>{brand}</span>)}<span className="brands-list__more">Otros modelos · consultar</span></div></section>

        <section className="contact-section" id="contacto"><div><p className="eyebrow">04 · Hablemos</p><h2>¿Qué quieres mejorar <em>en tu auto?</em></h2><p>Envíanos la marca y el modelo. Te ayudamos a encontrar una alternativa compatible y coordinamos la instalación.</p></div><div className="contact-actions"><button className="primary-button" type="button" onClick={() => setQuoteOpen(true)}>Solicitar cotización <span aria-hidden="true">↗</span></button><a className="secondary-button" href={`${WHATSAPP_URL}?text=Hola%20DRG%20Automotriz%2C%20quiero%20consultar%20por%20un%20equipo%20o%20instalaci%C3%B3n.`} target="_blank" rel="noreferrer">Escribir por WhatsApp <span aria-hidden="true">↗</span></a><a className="secondary-button" href={INSTAGRAM_URL} target="_blank" rel="noreferrer">Ver Instagram <span aria-hidden="true">↗</span></a><a className="secondary-button" href={TIKTOK_URL} target="_blank" rel="noreferrer">Ver TikTok <span aria-hidden="true">↗</span></a><small>WhatsApp: +56 9 2197 2666 · La atención se coordina directamente con el equipo de DRG.</small></div></section>
      </main>

      <footer className="store-footer"><div className="store-brand"><span className="store-brand__logo"><img src="/drg/logo.png" alt="" /></span><span><strong>DRG</strong><small>Automotriz</small></span></div><p>Multimedia, CarPlay y soluciones para tu vehículo.</p><div className="store-footer__links"><a href={WHATSAPP_URL} target="_blank" rel="noreferrer">WhatsApp</a><a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">Instagram</a><a href={TIKTOK_URL} target="_blank" rel="noreferrer">TikTok</a></div><span>© {new Date().getFullYear()} · DRG Automotriz</span></footer>

      {selectedProduct && <ProductModal product={selectedProduct} labelForCategory={labelForCategory} variant={selectedVariant} quantity={selectedQuantity} onVariant={setSelectedVariant} onQuantity={setSelectedQuantity} onAdd={addSelectedProduct} onClose={() => setSelectedProduct(null)} />}
      {cartOpen && <CartDrawer lines={cart} onQuantity={(lineId, quantity) => setCart((current) => updateLineQuantity(current, lineId, quantity))} onRemove={(lineId) => setCart((current) => removeLine(current, lineId))} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} onClose={() => setCartOpen(false)} />}
      {checkoutOpen && <CheckoutModal lines={cart} onBack={() => { setCheckoutOpen(false); setCartOpen(true); }} onComplete={completeOrder} />}
      {quoteOpen && <QuoteModal onClose={() => setQuoteOpen(false)} />}
      {order && <SuccessModal order={order} onClose={() => setOrder(null)} />}
      <SupportChat />
    </div>
  );
}
