# DRG Automotriz · catálogo y servicios

Demo de una solución digital a medida para DRG Automotriz: catálogo de equipos para vehículos, solicitud de cotización, coordinación de despacho o instalación a domicilio y galería de trabajos realizados.

## Incluye

- Catálogo organizado por integración CarPlay/Android Auto, pantallas, diagnóstico e instalación.
- Fichas de servicio con marcas compatibles y valores definidos mediante cotización.
- Carrito persistente en el navegador.
- Solicitud de cotización con vehículo, modalidad y comentarios.
- Envío real de cotizaciones al correo de DRG mediante un endpoint de correo externo.
- Opciones de coordinación, despacho e instalación a domicilio.
- Galería de trabajos realizados y sección de cobertura.
- Confirmación visual de la solicitud para el cliente.
- Diseño responsive para móvil y escritorio.

Esta versión es una demo: no realiza cobros ni guarda solicitudes en una base de datos. Las cotizaciones se envían por correo a `Drg.automotrizcl@gmail.com` mediante FormSubmit; la primera vez, el buzón debe confirmar la activación del formulario desde el correo que envía el servicio.

## Ejecutar localmente

```bash
npm install
npm run dev
```

Abre [http://localhost:5174](http://localhost:5174).

## Comandos útiles

```bash
npm run check   # TypeScript
npm run test    # pruebas del carrito
npm run build   # versión de producción en dist/
npm run preview # previsualizar dist/
```

## Despliegue en Render

Está preparado como Static Site:

- Build command: `npm run build`
- Publish directory: `dist`

## Próxima evolución

1. Catálogo e inventario administrables.
2. Agenda de instalaciones y seguimiento de solicitudes.
3. Notificaciones por WhatsApp o panel administrativo.
4. Pagos y reglas de despacho configurables.

## Catálogo administrable

La tienda usa el catálogo incluido en `src/catalog.ts` cuando no hay variables de entorno. Para un cliente real puede leer el mismo catálogo que el panel administrativo `drg-automotriz-admin` configurando:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Con esas variables, la aplicación consulta categorías, productos, servicios y ofertas activas en Supabase. Si la conexión no está disponible, mantiene el catálogo de respaldo para que el sitio siga siendo visible.
