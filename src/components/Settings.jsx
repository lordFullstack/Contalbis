import React, { useRef, useState } from 'react'
import { Download, Upload, Moon, Sun, Image as ImageIcon, Trash2 } from 'lucide-react'
import { exportBackup, importBackup, fileToBase64 } from '../lib/storage.js'

const COLORES = ['#2563eb', '#059669', '#dc2626', '#d97706', '#7c3aed', '#0891b2']

export default function Settings({ settings, onUpdateSettings, onChange }) {
  const fileInputRef = useRef(null)
  const logoInputRef = useRef(null)
  const [importMsg, setImportMsg] = useState(null)

  async function handleLogoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const base64 = await fileToBase64(file)
      onUpdateSettings({ logo: base64 })
    } catch (err) {
      alert('No se pudo procesar la imagen del logo.')
    } finally {
      e.target.value = ''
    }
  }

  async function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importBackup(file)
      setImportMsg({ type: 'ok', text: 'Backup importado correctamente.' })
      onChange()
    } catch (err) {
      setImportMsg({ type: 'error', text: err.message })
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Configuración</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Identidad del negocio y respaldo de datos</p>
      </header>

      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 space-y-4 shadow-sm">
        <h2 className="text-sm font-semibold">Identidad</h2>

        <div>
          <label className="text-xs text-gray-400">Nombre del negocio</label>
          <input
            value={settings.businessName}
            onChange={e => onUpdateSettings({ businessName: e.target.value })}
            className="w-full mt-1 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-2">Logotipo</label>
          <div className="flex items-center gap-3">
            {settings.logo ? (
              <img src={settings.logo} alt="Logo" className="w-14 h-14 rounded-xl object-cover border border-gray-100 dark:border-slate-800" />
            ) : (
              <div className="w-14 h-14 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center text-gray-300">
                <ImageIcon size={20} />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="text-xs font-medium rounded-full px-3 py-1.5 border border-gray-200 dark:border-slate-700"
              >
                {settings.logo ? 'Cambiar logo' : 'Subir logo'}
              </button>
              {settings.logo && (
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ logo: null })}
                  className="text-xs font-medium text-rose-600 flex items-center gap-1"
                >
                  <Trash2 size={12} /> Quitar
                </button>
              )}
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-2">Color principal</label>
          <div className="flex gap-2">
            {COLORES.map(color => (
              <button
                key={color}
                onClick={() => onUpdateSettings({ primaryColor: color })}
                className="w-8 h-8 rounded-full border-2"
                style={{
                  backgroundColor: color,
                  borderColor: settings.primaryColor === color ? '#0f172a' : 'transparent'
                }}
                aria-label={color}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-sm">
            {settings.darkMode ? <Moon size={16} /> : <Sun size={16} />}
            Modo oscuro
          </div>
          <button
            onClick={() => onUpdateSettings({ darkMode: !settings.darkMode })}
            className="w-11 h-6 rounded-full relative transition-colors"
            style={{ backgroundColor: settings.darkMode ? 'var(--color-accent)' : '#e5e7eb' }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
              style={{ transform: settings.darkMode ? 'translateX(22px)' : 'translateX(2px)' }}
            />
          </button>
        </div>
      </section>

      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 space-y-3 shadow-sm">
        <h2 className="text-sm font-semibold">Backup</h2>
        <p className="text-xs text-gray-400">
          Exporta toda tu información (ventas, gastos, proveedores y configuración) en un archivo .json,
          o restaura un backup anterior.
        </p>

        <button
          onClick={exportBackup}
          className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          <Download size={16} /> Exportar backup
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold border border-gray-200 dark:border-slate-700"
        >
          <Upload size={16} /> Importar backup
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleImport}
        />

        {importMsg && (
          <p className={`text-xs ${importMsg.type === 'ok' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {importMsg.text}
          </p>
        )}
      </section>
    </div>
  )
                                             }
                         
