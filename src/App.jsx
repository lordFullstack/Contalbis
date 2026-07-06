import React, { useEffect, useState, useCallback } from 'react'
import BottomNav from './components/BottomNav.jsx'
import Dashboard from './components/Dashboard.jsx'
import Suppliers from './components/Suppliers.jsx'
import Settings from './components/Settings.jsx'
import {
  getTransactions,
  getSuppliers,
  getSettings,
  saveSettings as persistSettings
} from './lib/storage.js'

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [transactions, setTransactions] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [settings, setSettings] = useState(getSettings())

  // Recarga los datos desde localStorage (se llama tras cualquier escritura)
  const refresh = useCallback(() => {
    setTransactions(getTransactions())
    setSuppliers(getSuppliers())
    setSettings(getSettings())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Aplica modo oscuro y color de acento a nivel global
  useEffect(() => {
    document.documentElement.classList.toggle('dark', !!settings.darkMode)
    document.documentElement.style.setProperty('--color-accent', settings.primaryColor)
  }, [settings.darkMode, settings.primaryColor])

  function updateSettings(patch) {
    persistSettings(patch)
    refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      <main className="max-w-2xl mx-auto pb-24 px-4 pt-6 sm:px-6 lg:max-w-4xl">
        {tab === 'dashboard' && (
          <Dashboard transactions={transactions} suppliers={suppliers} settings={settings} onChange={refresh} />
        )}
        {tab === 'suppliers' && (
          <Suppliers transactions={transactions} suppliers={suppliers} onChange={refresh} />
        )}
        {tab === 'settings' && (
          <Settings settings={settings} onUpdateSettings={updateSettings} onChange={refresh} />
        )}
      </main>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
      }
