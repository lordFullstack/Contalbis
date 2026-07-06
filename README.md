# Control Financiero (PWA)

React + Vite + Tailwind + localStorage. Sin backend, todo vive en el navegador.

## Instalar y correr

```bash
npm install
npm run dev
```

Abre la URL que muestra la terminal (normalmente http://localhost:5173).

Para generar la versión de producción instalable como PWA:

```bash
npm run build
npm run preview
```

## Qué incluye esta primera entrega

- **`src/lib/storage.js`**: toda la capa de datos (transactions, suppliers, settings),
  export/import de backup en `.json` y conversión de imágenes a base64.
- **`src/lib/calculations.js`**: la regla `Ventas = Gastos + Efectivo`, totales del día,
  datos para el gráfico (Día/Mes/Año) y utilidades de proveedores.
- **`src/components/Dashboard.jsx`**: tarjetas de resumen, gráfico con recharts y selector
  de temporalidad, lista de movimientos del día, y un formulario rápido para registrar
  ventas/gastos (necesario para tener datos con qué probar el resto de la app).
- **`src/components/Suppliers.jsx`**: buscador de proveedores, historial de pagos,
  total acumulado, y formulario de pago con adjunto de voucher (foto → base64).
- **`src/components/Settings.jsx`**: nombre del negocio, color principal, modo oscuro,
  y los botones de exportar/importar backup.

## Notas técnicas

- El ícono de la PWA (`icon-192.png`, `icon-512.png`) referenciado en `vite.config.js`
  no está incluido — reemplázalo con tu logo antes de compilar, o el manifest fallará
  al buscarlo.
- Los montos se muestran en pesos colombianos (`Intl.NumberFormat('es-CO', ...)`) —
  cámbialo en `calculations.js` si necesitas otra moneda.
- Todo el estado se recarga desde `localStorage` después de cada escritura (`onChange`
  en cada componente), así que no hay estado "fantasma" desincronizado del storage.

## Pendiente para siguientes entregas (según tu lista de secciones)

Ventas y gastos como módulo separado, Reportes, y Backups como pantalla propia
(hoy exportar/importar vive dentro de Configuración) — dime cuál seguimos.
