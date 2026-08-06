# DRG Automotriz · catálogo y servicios

Demo de una solución digital a medida para DRG Automotriz: catálogo de equipos para vehículos, solicitud de cotización, coordinación de despacho o instalación a domicilio y galería de trabajos realizados.

## Incluye

- Catálogo organizado por multimedia, seguridad, confort y servicios.
- Fichas de producto con variantes, precios demostrativos y stock visible.
- Carrito persistente en el navegador.
- Solicitud de cotización con vehículo, modalidad y comentarios.
- Opciones de retiro, despacho e instalación a domicilio.
- Galería de trabajos realizados y sección de cobertura.
- Confirmación visual de la solicitud para el cliente.
- Diseño responsive para móvil y escritorio.

Esta versión es una demo: no realiza cobros ni guarda solicitudes en un servidor. Al pasar a producción se puede conectar el catálogo, inventario, agenda de instalaciones, avisos y pagos a las herramientas del negocio.

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
3. Notificaciones por correo, WhatsApp o panel administrativo.
4. Pagos y reglas de despacho configurables.
