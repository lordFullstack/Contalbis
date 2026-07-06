import React from 'react'
import { LayoutGrid, Users, Settings as SettingsIcon } from 'lucide-react'

const TABS = [
  { key: 'dashboard', label: 'Inicio', icon: LayoutGrid },
  { key: 'suppliers', label: 'Proveedores', icon: Users },
  { key: 'settings', label: 'Config', icon: SettingsIcon }
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur
                 dark:border-slate-800 dark:bg-slate-950/95 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-2xl mx-auto lg:max-w-4xl flex items-stretch justify-around">
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors"
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.4 : 1.8}
                className={isActive ? '' : 'text-gray-400 dark:text-slate-500'}
                style={isActive ? { color: 'var(--color-accent)' } : undefined}
              />
              <span
                className={`text-[11px] font-medium ${isActive ? '' : 'text-gray-400 dark:text-slate-500'}`}
                style={isActive ? { color: 'var(--color-accent)' } : undefined}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}


