import React, { useMemo, useState } from 'react'
import { Wallet, TrendingUp, TrendingDown, Plus, X } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'
import { addTransaction } from '../lib/storage.js'
import {
  getTodayTotals,
  getCashBalance,
  getTodayMovements,
  getChartData,
  formatCurrency,
  todayStr
} from '../lib/calculations.js'

const PERIODOS = [
  { value: 'day', label: 'Día' },
  { value: 'month', label: 'Mes' },
  { value: 'year', label: 'Año' }
]

function SummaryCard({ icon: Icon, label, value, tone }) {
  const tones = {
    up: 'text-emerald-600 dark:text-emerald-400',
    down: 'text-rose-600 dark:text-rose-400',
    neutral: 'text-accent'
  }
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 shadow-sm">
      <div className={`flex items-center gap-2 text-xs font-medium mb-2 ${tones[tone]}`} style={tone === 'neutral' ? { color: 'var(--color-accent)' } : undefined}>
        <Icon size={16} />
        {label}
      </div>
      <p className="text-lg font-semibold tabular-nums">{formatCurrency(value)}</p>
    </div>
  )
}

export default function Dashboard({ transactions, suppliers, onChange }) {
  const [period, setPeriod] = useState('day')
  const [showForm, setShowForm] = useState(false)

  const { ventas, gastos } = getTodayTotals(transactions)
  const efectivo = getCashBalance(transactions)
  const movimientos = useMemo(() => getTodayMovements(transactions, suppliers), [transactions, suppliers])
  const chartData = useMemo(() => getChartData(transactions, period), [transactions, period])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Resumen de hoy</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">{new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <SummaryCard icon={TrendingUp} label="Ventas" value={ventas} tone="up" />
        <SummaryCard icon={TrendingDown} label="Gastos" value={gastos} tone="down" />
        <SummaryCard icon={Wallet} label="Efectivo" value={efectivo} tone="neutral" />
      </div>

      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Ventas vs. gastos</h2>
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent px-2 py-1"
          >
            {PERIODOS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="label" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="ventas" name="Ventas" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gastos" name="Gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Movimientos de hoy</h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 text-xs font-medium rounded-full px-3 py-1.5 text-white"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <Plus size={14} /> Registrar
          </button>
        </div>

        {movimientos.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-slate-500 py-6 text-center">
            Aún no hay movimientos hoy. Toca "Registrar" para agregar el primero.
          </p>
        ) : (
          <ul className="space-y-2">
            {movimientos.map(m => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {m.description || (m.type === 'venta' ? 'Venta' : 'Gasto')}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 truncate">
                    {m.supplierName ? `Proveedor: ${m.supplierName}` : m.method}
                  </p>
                </div>
                <span className={`text-sm font-semibold tabular-nums ${m.type === 'venta' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {m.type === 'venta' ? '+' : '-'}{formatCurrency(m.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {showForm && (
        <QuickTransactionForm
          suppliers={suppliers}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false)
            onChange()
          }}
        />
      )}
    </div>
  )
}

function QuickTransactionForm({ suppliers, onClose, onSaved }) {
  const [type, setType] = useState('venta')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('efectivo')
  const [description, setDescription] = useState('')
  const [supplierId, setSupplierId] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return
    addTransaction({
      type,
      amount: Number(amount),
      date: todayStr(),
      method,
      description,
      supplierId: type === 'gasto' && supplierId ? supplierId : null
    })
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 space-y-4 mb-4 sm:mb-0"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Registrar movimiento</h3>
          <button type="button" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {['venta', 'gasto'].map(t => (
            <button
              type="button"
              key={t}
              onClick={() => setType(t)}
              className={`rounded-lg py-2 text-sm font-medium capitalize border
                ${type === t ? 'text-white border-transparent' : 'border-gray-200 dark:border-slate-700 text-gray-500'}`}
              style={type === t ? { backgroundColor: 'var(--color-accent)' } : undefined}
            >
              {t}
            </button>
          ))}
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
          type="text"
          placeholder="Descripción (opcional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
        />

        <select
          value={method}
          onChange={e => setMethod(e.target.value)}
          className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
        >
          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
          <option value="tarjeta">Tarjeta</option>
        </select>

        {type === 'gasto' && (
          <select
            value={supplierId}
            onChange={e => setSupplierId(e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
          >
            <option value="">Sin proveedor asociado</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}

        <button
          type="submit"
          className="w-full rounded-lg py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          Guardar
        </button>
      </form>
    </div>
  )
}
