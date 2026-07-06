// src/lib/storage.js
// Toda la persistencia de la app vive en localStorage bajo 3 llaves:
//   controlfin_transactions -> array de movimientos (ventas y gastos)
//   controlfin_suppliers    -> array de proveedores
//   controlfin_settings     -> objeto de configuración

const KEYS = {
  transactions: 'controlfin_transactions',
  suppliers: 'controlfin_suppliers',
  settings: 'controlfin_settings'
}

const DEFAULT_SETTINGS = {
  businessName: 'Mi Negocio',
  primaryColor: '#2563eb',
  darkMode: true
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch (err) {
    console.error(`Error leyendo ${key} de localStorage:`, err)
    return fallback
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (err) {
    console.error(`Error guardando ${key} en localStorage:`, err)
    return false
  }
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ---------- Transactions ----------
// Forma de una transacción:
// {
//   id, type: 'venta' | 'gasto', amount: number, date: 'YYYY-MM-DD',
//   method: 'efectivo' | 'transferencia' | 'tarjeta',
//   supplierId: string|null, description: string,
//   voucher: base64 string | null, createdAt: ISO string
// }

export function getTransactions() {
  return readJSON(KEYS.transactions, [])
}

export function saveTransactions(list) {
  return writeJSON(KEYS.transactions, list)
}

export function addTransaction(tx) {
  const list = getTransactions()
  const newTx = {
    id: uid(),
    createdAt: new Date().toISOString(),
    supplierId: null,
    voucher: null,
    description: '',
    ...tx
  }
  list.push(newTx)
  saveTransactions(list)
  return newTx
}

export function deleteTransaction(id) {
  const list = getTransactions().filter(t => t.id !== id)
  saveTransactions(list)
  return list
}

// ---------- Suppliers ----------
// { id, name, phone, notes }

export function getSuppliers() {
  return readJSON(KEYS.suppliers, [])
}

export function saveSuppliers(list) {
  return writeJSON(KEYS.suppliers, list)
}

export function addSupplier(supplier) {
  const list = getSuppliers()
  const newSupplier = { id: uid(), phone: '', notes: '', ...supplier }
  list.push(newSupplier)
  saveSuppliers(list)
  return newSupplier
}

export function deleteSupplier(id) {
  const list = getSuppliers().filter(s => s.id !== id)
  saveSuppliers(list)
  return list
}

// ---------- Settings ----------

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...readJSON(KEYS.settings, {}) }
}

export function saveSettings(settings) {
  return writeJSON(KEYS.settings, { ...getSettings(), ...settings })
}

// ---------- Backup / Restore ----------

export function exportBackup() {
  const data = {
    transactions: getTransactions(),
    suppliers: getSuppliers(),
    settings: getSettings(),
    exportedAt: new Date().toISOString()
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const fecha = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `backup-controlfin-${fecha}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function importBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (!data.transactions || !data.suppliers || !data.settings) {
          throw new Error('El archivo no tiene el formato esperado (faltan colecciones).')
        }
        saveTransactions(data.transactions)
        saveSuppliers(data.suppliers)
        saveSettings(data.settings)
        resolve(data)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'))
    reader.readAsText(file)
  })
}

// Convierte un archivo de imagen (voucher) a base64 para guardarlo en la transacción
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null)
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result) // data:image/...;base64,....
    reader.onerror = () => reject(new Error('No se pudo procesar la imagen.'))
    reader.readAsDataURL(file)
  })
}
