import React, { useMemo, useState } from 'react'
import { Search, Plus, X, Paperclip, UserPlus } from 'lucide-react'
import { addTransaction, addSupplier, fileToBase64 } from '../lib/storage.js'
import { getSupplierPayments, getSupplierTotal, formatCurrency, todayStr } from '../lib/calculations.js'

export default function Suppliers({ transactions, suppliers, onChange }) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(suppliers[0]?.id || '')
  const [showNewSupplier, setShowNewSupplier] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  const filtered = useMemo(
    () => suppliers.filter(s => s.name.toLowerCase().includes(query.toLowerCase())),
    [suppliers, query]
  )

  const selected = suppliers.find(s => s.id === selectedId) || null
  const payments = selected ? getSupplierPayments(transactions, selected.id) : []
  const total = selected ? getSupplierTotal(transactions, selected.id) : 0

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Proveedores</h1>
        <button
          onClick={() => setShowNewSupplier(true)}
          className="flex items-center gap-1 text-xs font-medium rounded-full px-3 py-1.5 text-white"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          <UserPlus size={14} /> Nuevo
        </button>
      </header>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar proveedor..."
          className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 py-2.5 text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No hay proveedores que coincidan.</p>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filtered.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium border
                ${selectedId === s.id ? 'text-white border-transparent' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'}`}
              style={selectedId === s.id ? { backgroundColor: 'var(--color-accent)' } : undefined}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <section className="space-y-4">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Total pagado a</p>
              <p className="font-semibold">{selected.name}</p>
            </div>
            <p className="text-lg font-semibold tabular-nums" style={{ color: 'var(--color-accent)' }}>
              {formatCurrency(total)}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Historial de pagos</h2>
            <button
              onClick={() => setShowPaymentForm(true)}
              className="flex items-center gap-1 text-xs font-medium rounded-full px-3 py-1.5 border border-gray-200 dark:border-slate-700"
            >
              <Plus size={14} /> Registrar pago
            </button>
          </div>

          {payments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin pagos registrados todavía.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-slate-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-900 text-left text-xs text-gray-400">
                    <th className="px-3 py-2 font-medium">Fecha</th>
                    <th className="px-3 py-2 font-medium">Método</th>
                    <th className="px-3 py-2 font-medium text-right">Monto</th>
                    <th className="px-3 py-2 font-medium text-center">Voucher</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id} className="border-t border-gray-100 dark:border-slate-800">
                      <td className="px-3 py-2 whitespace-nowrap">{p.date}</td>
                      <td className="px-3 py-2 capitalize">{p.method}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(p.amount)}</td>
                      <td className="px-3 py-2 text-center">
                        {p.voucher ? (
                          <a href={p.voucher} target="_blank" rel="noreferrer">
                            <Paperclip size={14} className="inline text-accent" style={{ color: 'var(--color-accent)' }} />
                          </a>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {showNewSupplier && (
        <NewSupplierModal
          onClose={() => setShowNewSupplier(false)}
          onSaved={(newId) => {
            setShowNewSupplier(false)
            setSelectedId(newId)
            onChange()
          }}
        />
      )}

      {showPaymentForm && selected && (
        <PaymentModal
          supplier={selected}
          onClose={() => setShowPaymentForm(false)}
          onSaved={() => {
            setShowPaymentForm(false)
            onChange()
          }}
        />
      )}
    </div>
  )
}

function NewSupplierModal({ onClose, onSaved }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    const supplier = addSupplier({ name: name.trim(), phone })
    onSaved(supplier.id)
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 space-y-4 mb-4 sm:mb-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Nuevo proveedor</h3>
          <button type="button" onClick={onClose}><X size={18} /></button>
        </div>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nombre del proveedor"
          required
          className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
        />
        <input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="Teléfono (opcional)"
          className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
        />
        <button type="submit" className="w-full rounded-lg py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: 'var(--color-accent)' }}>
          Guardar proveedor
        </button>
      </form>
    </div>
  )
}

function PaymentModal({ supplier, onClose, onSaved }) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayStr())
  const [method, setMethod] = useState('transferencia')
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return
    setSaving(true)
    try {
      const voucher = await fileToBase64(file)
      addTransaction({
        type: 'gasto',
        amount: Number(amount),
        date,
        method,
        supplierId: supplier.id,
        description: `Pago a ${supplier.name}`,
        voucher
      })
      onSaved()
    } catch (err) {
      console.error(err)
      alert('No se pudo guardar el voucher. Intenta con otra imagen.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 space-y-4 mb-4 sm:mb-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Pago a {supplier.name}</h3>
          <button type="button" onClick={onClose}><X size={18} /></button>
        </div>

        <input
          type="number"
          inputMode="decimal"
          placeholder="Monto"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
        />

        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
        />

        <select
          value={method}
          onChange={e => setMethod(e.target.value)}
          className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
        >
          <option value="transferencia">Transferencia</option>
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
        </select>

        <label className="flex items-center gap-2 text-sm text-gray-500 border border-dashed border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 cursor-pointer">
          <Paperclip size={16} />
          {file ? file.name : 'Adjuntar foto del voucher'}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={e => setFile(e.target.files?.[0] || null)}
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          {saving ? 'Guardando...' : 'Guardar pago'}
        </button>
      </form>
    </div>
  )
}
