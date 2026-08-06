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
import type { CartLine, CategoryId, CheckoutData, DemoOrder, Fulfillment, Product } from "./types";

const CART_STORAGE_KEY = "drg-automotriz-demo-cart";
const INSTAGRAM_URL = "https://www.instagram.com/drg_automotrizcl/";
const QUOTE_EMAIL = "Drg.automotrizcl@gmail.com";
const QUOTE_FORM_ENDPOINT = `https://formsubmit.co/ajax/${QUOTE_EMAIL}`;

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

function createDemoCode() {
  return `DRG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
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
          <button type="button" className="text-button" onClick={() => onOpen(product)}>Elegir <span aria-hidden="true">＋</span></button>
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
          <p className="product-modal__description">{product.description} Antes de confirmar revisamos compatibilidad con tu vehículo y la cobertura de instalación.</p>
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
            <button className="primary-button" type="button" onClick={onAdd}>Agregar al carrito · {formatPrice(product.priceClp * quantity)}</button>
          </div>
          <p className="demo-caption">Demo interactiva · no se realiza un cobro real.</p>
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
            <p className="cart-note">En el siguiente paso nos cuentas tu vehículo y si necesitas instalación.</p>
            <button className="primary-button primary-button--wide" type="button" onClick={onCheckout}>Continuar al checkout <span aria-hidden="true">→</span></button>
          </>
        )}
      </aside>
    </div>
  );
}

function CheckoutModal({ lines, onBack, onComplete }: { lines: CartLine[]; onBack: () => void; onComplete: (data: CheckoutData) => void }) {
  const [form, setForm] = useState<CheckoutData>({ name: "", email: "", phone: "", fulfillment: "retiro", address: "", notes: "", vehicle: "", installation: false });
  const [error, setError] = useState("");
  const setField = <K extends keyof CheckoutData>(field: K, value: CheckoutData[K]) => setForm((current) => ({ ...current, [field]: value }));
  const amount = total(lines, form.fulfillment);
  const shipping = shippingCost(lines, form.fulfillment);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Completa tu nombre y WhatsApp para continuar.");
      return;
    }
    if (form.fulfillment === "instalacion" && !form.vehicle.trim()) {
      setError("Indica marca, modelo y año para revisar compatibilidad.");
      return;
    }
    if (form.fulfillment === "despacho" && !form.address.trim()) {
      setError("Ingresa una dirección para el despacho.");
      return;
    }
    onComplete(form);
  };

  return (
    <div className="overlay" role="presentation">
      <section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <div className="drawer-header"><div><p className="eyebrow">Paso final</p><h2 id="checkout-title">Cuéntanos de tu vehículo</h2></div><button className="close-button" type="button" onClick={onBack} aria-label="Volver al carrito">×</button></div>
        <form onSubmit={submit}>
          <div className="checkout-grid">
            <label>Nombre<input value={form.name} onChange={(event) => setField("name", event.target.value)} placeholder="Tu nombre" /></label>
            <label>WhatsApp<input value={form.phone} onChange={(event) => setField("phone", event.target.value)} placeholder="+56 9 ..." /></label>
            <label>Correo <span className="optional">opcional</span><input type="email" value={form.email} onChange={(event) => setField("email", event.target.value)} placeholder="tu@correo.cl" /></label>
            <label>Marca, modelo y año<input value={form.vehicle} onChange={(event) => setField("vehicle", event.target.value)} placeholder="Ej. Mazda 3 2017" /></label>
          </div>
          <label>¿Cómo quieres recibirlo?<select value={form.fulfillment} onChange={(event) => { const value = event.target.value as Fulfillment; setField("fulfillment", value); setField("installation", value === "instalacion"); }}><option value="retiro">Retiro o coordinación</option><option value="despacho">Despacho a domicilio</option><option value="instalacion">Equipo + instalación a domicilio</option></select></label>
          {form.fulfillment === "despacho" && <label>Dirección<input value={form.address} onChange={(event) => setField("address", event.target.value)} placeholder="Calle, número y comuna" /></label>}
          <label>Comentario <span className="optional">opcional</span><textarea value={form.notes} onChange={(event) => setField("notes", event.target.value)} placeholder="Cuéntanos qué necesitas o qué sistema tiene tu auto." /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="checkout-summary"><div><span>Productos</span><b>{formatPrice(subtotal(lines))}</b></div><div><span>{form.fulfillment === "retiro" ? "Coordinación" : form.fulfillment === "instalacion" ? "Instalación" : "Despacho"}</span><b>{shipping === 0 ? "A confirmar" : formatPrice(shipping)}</b></div><div className="checkout-total"><span>Total demo</span><strong>{formatPrice(amount)}</strong></div></div>
          <div className="checkout-actions"><button className="secondary-button" type="button" onClick={onBack}>Volver</button><button className="primary-button" type="submit">Enviar solicitud <span aria-hidden="true">→</span></button></div>
          <p className="demo-caption">Esta demo no cobra ni envía datos a un negocio real.</p>
        </form>
      </section>
    </div>
  );
}

function QuoteModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<QuoteFormData>({ name: "", phone: "", vehicle: "", service: "Instalación de pantalla / CarPlay", notes: "" });
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
          <p className="eyebrow">Cotización rápida</p><h2 id="quote-title">Cuéntanos qué quieres mejorar.</h2><p className="quote-intro">Con tu marca y modelo revisamos compatibilidad, equipo disponible y cobertura de instalación.</p>
          <form onSubmit={submit} className="quote-form">
            <div className="checkout-grid"><label>Nombre<input required value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Tu nombre" /></label><label>WhatsApp<input required value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+56 9 ..." /></label></div>
            <label>Marca, modelo y año<input required value={form.vehicle} onChange={(event) => update("vehicle", event.target.value)} placeholder="Ej. Mercedes CLA 2018" /></label>
            <label>¿Qué necesitas?<select value={form.service} onChange={(event) => update("service", event.target.value)}><option>Instalación de pantalla / CarPlay</option><option>Diagnóstico o reparación de radio</option><option>Cámara de retroceso</option><option>Otro proyecto</option></select></label>
            <label>Detalle <span className="optional">opcional</span><textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Describe tu idea o adjunta luego una foto por WhatsApp." /></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button primary-button--wide" type="submit" disabled={isSending}>{isSending ? "Enviando cotización…" : "Enviar cotización"}</button>
          </form>
          <p className="demo-caption">La solicitud se envía directamente a <strong>{QUOTE_EMAIL}</strong>.</p>
        </> : <div className="quote-success"><div className="success-icon">✓</div><p className="eyebrow">Cotización enviada</p><h2>Recibimos los datos de tu proyecto.</h2><p>La solicitud fue enviada a <strong>{QUOTE_EMAIL}</strong>. El equipo podrá revisar compatibilidad, disponibilidad y coordinación de instalación.</p><button className="primary-button primary-button--wide" type="button" onClick={onClose}>Volver al catálogo</button></div>}
      </section>
    </div>
  );
}

function SuccessModal({ order, onClose }: { order: DemoOrder; onClose: () => void }) {
  return (
    <div className="overlay" role="presentation">
      <section className="success-modal" role="dialog" aria-modal="true" aria-labelledby="success-title">
        <div className="success-icon">✓</div><p className="eyebrow">Solicitud recibida</p><h2 id="success-title">¡Gracias, {order.customerName}!</h2><p>Así se vería la confirmación para tu cliente y para el equipo de DRG.</p>
        <div className="success-code"><span>Referencia de solicitud</span><strong>{order.code}</strong></div>
        <div className="success-detail"><span>Productos</span><b>{order.itemCount}</b><span>Vehículo</span><b>{order.vehicle || "Por confirmar"}</b><span>Modalidad</span><b>{order.fulfillment === "instalacion" ? "Instalación a domicilio" : order.fulfillment === "despacho" ? "Despacho" : "Coordinación"}</b><span>Total demo</span><b>{formatPrice(order.totalClp)}</b></div>
        <div className="success-note">En una versión personalizada, esta solicitud podría llegar al panel administrativo, correo o WhatsApp del negocio.</div>
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
  const [order, setOrder] = useState<DemoOrder | null>(null);

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
  const completeOrder = (data: CheckoutData) => { setOrder({ code: createDemoCode(), customerName: data.name.trim(), totalClp: total(cart, data.fulfillment), fulfillment: data.fulfillment, itemCount: itemCount(cart), vehicle: data.vehicle.trim() }); setCart([]); setCheckoutOpen(false); setCartOpen(false); };

  return (
    <div className="store-shell">
      <div className="demo-bar"><span className="demo-dot" /> Demo de catálogo DRG · No se realizan cobros reales <span className="demo-bar__right">Equipos + instalación a domicilio</span></div>
      <header className="store-header">
        <a className="store-brand" href="#inicio" aria-label="DRG Automotriz, inicio"><span className="store-brand__logo"><img src="/drg/logo.png" alt="" /></span><span><strong>DRG</strong><small>Automotriz</small></span></a>
        <nav className="store-nav" aria-label="Navegación de la tienda"><a href="#catalogo">Equipos</a><a href="#servicios">Instalación</a><a href="#trabajos">Trabajos</a><a href="#contacto">Contacto</a></nav>
        <button className="cart-button" type="button" onClick={() => setCartOpen(true)}><span>Carrito</span><b>{itemCount(cart)}</b></button>
      </header>

      <main>
        <section className="store-hero" id="inicio">
          <div className="store-hero__copy"><p className="eyebrow"><span className="eyebrow-line" /> CarPlay · audio · servicio a domicilio</p><h1>Tecnología para tu vehículo. <em>Instalación que llega a ti.</em></h1><p>Importamos equipos multimedia, mejoramos tu sistema original y dejamos todo funcionando en tu auto, sin complicaciones.</p><div className="hero-actions"><a className="primary-button" href="#catalogo">Ver equipos <span aria-hidden="true">↓</span></a><button className="secondary-button" type="button" onClick={() => setQuoteOpen(true)}>Cotizar instalación <span aria-hidden="true">↗</span></button></div><div className="hero-proof"><span>01</span><div><strong>Compatibilidad primero</strong><p>Revisamos marca, modelo y año antes de recomendar.</p></div></div></div>
          <div className="store-hero__visual"><img src={catalog.gallery[0].image} alt="Instalación multimedia en un vehículo" /><div className="hero-product-card"><span>Trabajo destacado</span><strong>Mercedes · CarPlay inalámbrico</strong><b>Equipo + instalación</b></div><div className="hero-stamp"><img src="/drg/logo.png" alt="DRG Automotriz" /></div></div>
        </section>

        <section className="trust-strip" aria-label="Propuesta de valor"><div><span>⌁</span><strong>Equipos compatibles</strong><small>Elegidos para tu vehículo</small></div><div><span>⌖</span><strong>Servicio a domicilio</strong><small>Coordinamos en tu comuna</small></div><div><span>✓</span><strong>Instalación cuidada</strong><small>Probamos todo antes de entregar</small></div><div><span>↗</span><strong>Soporte cercano</strong><small>Te explicamos cómo usarlo</small></div></section>

        <section className="catalog-section" id="catalogo">
          <div className="section-heading"><div><p className="eyebrow">01 · Catálogo DRG</p><h2>Mejora la experiencia de <em>manejar.</em></h2></div><p>Equipos, accesorios y servicios que se pueden adaptar a tu auto y a tu forma de usarlo.</p></div>
          <div className="catalog-toolbar"><div className="category-list" aria-label="Categorías">{catalog.categories.map((item) => <button type="button" className={category === item.id ? "category-button is-active" : "category-button"} key={item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}</div><label className="search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar equipo o servicio" aria-label="Buscar equipo o servicio" /></label></div>
          {visibleProducts.length === 0 ? <div className="no-results"><h3>No encontramos ese equipo.</h3><p>Prueba con otra palabra o solicita una revisión personalizada.</p><button className="secondary-button" type="button" onClick={() => { setQuery(""); setCategory("Todos"); }}>Ver catálogo</button></div> : <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} labelForCategory={labelForCategory} onOpen={openProduct} />)}</div>}
        </section>

        <section className="service-section" id="servicios"><div className="service-section__intro"><p className="eyebrow">02 · Cómo trabajamos</p><h2>Del diagnóstico a la <em>ruta.</em></h2><p>La compra puede ser solo del equipo o convertirse en una solución completa: importación, compatibilidad, instalación y explicación final.</p><button className="primary-button" type="button" onClick={() => setQuoteOpen(true)}>Quiero revisar mi auto <span aria-hidden="true">↗</span></button></div><div className="service-steps"><div><span>01</span><strong>Cuéntanos tu vehículo</strong><p>Marca, modelo, año y qué te gustaría mejorar.</p></div><div><span>02</span><strong>Te proponemos una alternativa</strong><p>Elegimos el equipo y la configuración más segura.</p></div><div><span>03</span><strong>Instalamos y probamos</strong><p>Coordinamos visita a domicilio y dejamos todo listo.</p></div></div></section>

        <section className="gallery-section" id="trabajos"><div className="section-heading"><div><p className="eyebrow">03 · Trabajos reales</p><h2>Una muestra de lo que <em>hacemos.</em></h2></div><p>Integraciones, actualizaciones y diagnósticos documentados por el equipo.</p></div><div className="gallery-grid">{catalog.gallery.map((item) => <figure key={item.image}><img src={item.image} alt={item.title} loading="lazy" /><figcaption><span>{item.tag}</span><strong>{item.title}</strong></figcaption></figure>)}</div></section>

        <section className="contact-section" id="contacto"><div><p className="eyebrow">04 · Hablemos</p><h2>¿Qué quieres mejorar <em>en tu auto?</em></h2><p>Envíanos tu marca y modelo. Te ayudamos a encontrar una alternativa compatible y coordinamos la instalación.</p></div><div className="contact-actions"><button className="primary-button" type="button" onClick={() => setQuoteOpen(true)}>Solicitar cotización <span aria-hidden="true">↗</span></button><a className="secondary-button" href={INSTAGRAM_URL} target="_blank" rel="noreferrer">Ver Instagram <span aria-hidden="true">↗</span></a><small>El número de WhatsApp se configura al pasar el demo a producción.</small></div></section>
      </main>

      <footer className="store-footer"><div className="store-brand"><span className="store-brand__logo"><img src="/drg/logo.png" alt="" /></span><span><strong>DRG</strong><small>Automotriz</small></span></div><p>Multimedia, CarPlay y soluciones para tu vehículo.</p><span>© {new Date().getFullYear()} · Demo</span></footer>

      {selectedProduct && <ProductModal product={selectedProduct} labelForCategory={labelForCategory} variant={selectedVariant} quantity={selectedQuantity} onVariant={setSelectedVariant} onQuantity={setSelectedQuantity} onAdd={addSelectedProduct} onClose={() => setSelectedProduct(null)} />}
      {cartOpen && <CartDrawer lines={cart} onQuantity={(lineId, quantity) => setCart((current) => updateLineQuantity(current, lineId, quantity))} onRemove={(lineId) => setCart((current) => removeLine(current, lineId))} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} onClose={() => setCartOpen(false)} />}
      {checkoutOpen && <CheckoutModal lines={cart} onBack={() => { setCheckoutOpen(false); setCartOpen(true); }} onComplete={completeOrder} />}
      {quoteOpen && <QuoteModal onClose={() => setQuoteOpen(false)} />}
      {order && <SuccessModal order={order} onClose={() => setOrder(null)} />}
      <SupportChat />
    </div>
  );
}
