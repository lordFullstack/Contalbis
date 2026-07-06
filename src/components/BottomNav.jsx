import React from 'react'
import { Home, Truck, Settings as SettingsIcon } from 'lucide-react'

const TABS = [
  { key: 'dashboard', label: 'Inicio', icon: Home },
  { key: 'suppliers', label: 'Proveedores', icon: Truck },
  { key: 'settings', label: 'Config', icon: SettingsIcon }
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur
                 dark:border-slate-800 dark:bg-slate-950/95 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-2xl mx-auto lg:max-w-4xl grid grid-cols-3">
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors
                ${isActive ? 'text-accent' : 'text-gray-400 dark:text-slate-500'}`}
              style={isActive ? { color: 'var(--color-accent)' } : undefined}
            >
              <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
