// src/lib/calculations.js
// Regla de negocio: Ventas Totales = Gastos + Efectivo en caja
// => Efectivo en caja = Ventas Totales - Gastos Totales

function todayStr() {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

function sum(list) {
  return list.reduce((acc, t) => acc + Number(t.amount || 0), 0)
}

export function getTodayTransactions(transactions) {
  const today = todayStr()
  return transactions.filter(t => t.date === today)
}

export function getTodayTotals(transactions) {
  const today = getTodayTransactions(transactions)
  const ventas = sum(today.filter(t => t.type === 'venta'))
  const gastos = sum(today.filter(t => t.type === 'gasto'))
  return { ventas, gastos }
}

// Efectivo en caja acumulado (histórico), según la fórmula del negocio
export function getCashBalance(transactions) {
  const ventas = sum(transactions.filter(t => t.type === 'venta'))
  const gastos = sum(transactions.filter(t => t.type === 'gasto'))
  return ventas - gastos
}

// Suma acumulada de ingresos (ventas) sin restar gastos
export function getTotalIngresos(transactions) {
  return sum(transactions.filter(t => t.type === 'venta'))
}

export function getTodayMovements(transactions, suppliers) {
  const today = getTodayTransactions(transactions)
  const supplierMap = new Map(suppliers.map(s => [s.id, s.name]))
  return [...today]
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .map(t => ({
      ...t,
      supplierName: t.supplierId ? supplierMap.get(t.supplierId) || 'Proveedor eliminado' : null
    }))
}

function dateKeyFor(dateStr, period) {
  // dateStr = 'YYYY-MM-DD'
  const [y, m, d] = dateStr.split('-')
  if (period === 'year') return y
  if (period === 'month') return `${y}-${m}`
  return dateStr // 'day'
}

function labelFor(key, period) {
  if (period === 'year') return key
  if (period === 'month') {
    const [y, m] = key.split('-')
    const nombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    return `${nombres[Number(m) - 1]} ${y}`
  }
  const [, m, d] = key.split('-')
  return `${d}/${m}`
}

// Construye buckets vacíos consecutivos para que el gráfico no tenga huecos
function buildBuckets(period) {
  const buckets = []
  const now = new Date()

  if (period === 'day') {
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      buckets.push(d.toISOString().slice(0, 10))
    }
  } else if (period === 'month') {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      buckets.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    }
  } else {
    const y = now.getFullYear()
    for (let i = 4; i >= 0; i--) buckets.push(String(y - i))
  }
  return buckets
}

// Devuelve datos listos para recharts: [{ label, ventas, gastos }, ...]
export function getChartData(transactions, period) {
  const buckets = buildBuckets(period)
  const map = new Map(buckets.map(key => [key, { ventas: 0, gastos: 0 }]))

  transactions.forEach(t => {
    const key = dateKeyFor(t.date, period)
    if (!map.has(key)) return // fuera del rango visible
    const entry = map.get(key)
    if (t.type === 'venta') entry.ventas += Number(t.amount || 0)
    else entry.gastos += Number(t.amount || 0)
  })

  return buckets.map(key => ({
    label: labelFor(key, period),
    ventas: map.get(key).ventas,
    gastos: map.get(key).gastos
  }))
}

export function getSupplierPayments(transactions, supplierId) {
  return transactions
    .filter(t => t.type === 'gasto' && t.supplierId === supplierId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function getSupplierTotal(transactions, supplierId) {
  return sum(getSupplierPayments(transactions, supplierId))
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value || 0)
}

// Versión corta para etiquetas de gráfico: 1.2M, 850k, etc.
export function formatCompact(value) {
  return new Intl.NumberFormat('es-CO', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value || 0)
}

export { todayStr }
