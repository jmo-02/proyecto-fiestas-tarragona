import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './ConsultasFiestas.css'

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '')

export default function ResumenFiestas() {
  const [params, setParams] = useState({ mes: 1, anio: new Date().getFullYear() })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [lastPath, setLastPath] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setParams(prev => ({ ...prev, [name]: value }))
  }

  const callEndpoint = (path) => {
    setLoading(true)
    setError(null)
    setResult(null)
    setLastPath(path)
    axios.get(`${API_URL}/api/fiestas/${path}`, { params })
      .then(res => setResult(res.data))
      .catch(err => setError(err?.response?.data?.message || err.message || 'Error al obtener resumen'))
      .finally(() => setLoading(false))
  }

  // Auto-fetch resumen on mount
  useEffect(() => {
    // call the resumen endpoint once when the component mounts
    callEndpoint('resumen')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderResult = () => {
    if (!result) return null

    // Resumen general: expect totals or similar
    if (lastPath === 'resumen') {
      // Show four fixed boxes with specific metrics. Use multiple fallback keys.
  const totalHoras = Number(result.totalHoras ?? result.total_horas ?? result.totalHours ?? 0)
  const totalInvitados = Number(result.totalInvitados ?? result.total_invitados ?? result.totalGuests ?? result.total_invitantes ?? 0)
  const r1 = Number(result.fiestasRango_1_3 ?? result.fiestas_rango_1_3 ?? result.rango_1_3 ?? result.range_1_3 ?? 0)
  const r2 = Number(result.fiestasRango_4_6 ?? result.fiestas_rango_4_6 ?? result.rango_4_6 ?? result.range_4_6 ?? 0)
  const r3 = Number(result.fiestasRango_7plus ?? result.fiestasRango_7_plus ?? result.fiestas_rango_7_plus ?? result.rango_7_plus ?? result.range_7_plus ?? 0)
  // newer API returns fiestasRango_mayor6 (or similar); include as fallback
  const r3_alt = Number(result.fiestasRango_mayor6 ?? result.fiestas_rango_mayor6 ?? result.fiestasRango_mayor_6 ?? result.fiestas_rango_mayor_6 ?? 0)
  const r3_final = r3 || r3_alt

  const anyData = totalHoras > 0 || totalInvitados > 0 || r1 > 0 || r2 > 0 || r3_final > 0
      if (!anyData) return <div className="result-empty">No hay resultados disponibles.</div>

      return (
        <div className="result-card">
          <div className="result-grid">

            <div className="result-item">
              <div className="result-label">Total de horas</div>
              <div className="result-value">{new Intl.NumberFormat().format(totalHoras)}</div>
            </div>

            <div className="result-item">
              <div className="result-label">Total de invitados</div>
              <div className="result-value">{new Intl.NumberFormat().format(totalInvitados)}</div>
            </div>

            <div className="result-item">
              <div className="result-label">Cantidad de fiestas de 1 a 3 horas</div>
              <div className="result-value">{r1}</div>
            </div>

            <div className="result-item">
              <div className="result-label">Cantidad de fiestas de 4 a 6 horas</div>
              <div className="result-value">{r2}</div>
            </div>

            <div className="result-item">
              <div className="result-label">Cantidad de fiestas de más de 6 horas</div>
              <div className="result-value">{r3_final}</div>
            </div>
          </div>
        </div>
      )
    }

    // Promedio: expect fields for averages
    if (lastPath === 'promedio') {
      // example: { promedioInvitados: 45, promedioHoras: 5 }
      const avgInv = Number(result.promedioInvitados ?? result.promedio_invitados ?? result.promedioInvitadosTotal ?? 0)
      const avgHoras = Number(result.promedioHoras ?? result.promedio_horas ?? 0)
      if (avgInv > 0 || avgHoras > 0) {
        return (
          <div className="result-ok">
            {avgInv > 0 && <div><strong>Promedio invitados:</strong> {Math.round(avgInv)}</div>}
            {avgHoras > 0 && <div><strong>Promedio horas:</strong> {Number(avgHoras).toFixed(1)}</div>}
          </div>
        )
      }
      return <div className="result-empty">No hay datos suficientes para calcular promedios.</div>
    }

    // Suma de precios: expect total or monto
    if (lastPath === 'suma') {
      const total = Number(result.total ?? result.montoTotal ?? result.totalVentas ?? 0)
      if (total > 0) {
          return (
            <div className="result-ok">
              <div><strong>Suma total:</strong> {new Intl.NumberFormat().format(total)}</div>
            </div>
          )
      }
      return <div className="result-empty">No hay montos para sumar en el filtro indicado.</div>
    }

    // If none matches, show a friendly fallback
    // If result is a plain object, render labeled key/value pairs
    if (result && typeof result === 'object' && !Array.isArray(result)) {
      const entries = Object.entries(result)
      if (entries.length === 0) return <div className="result-empty">No hay resultados disponibles.</div>

      const labelMap = {
        montoTotal: 'Monto total',
        totalInvitados: 'Total invitados',
        totalHoras: 'Total horas',
        fiestasRango_mayor6: 'Fiestas rango >6',
        totalFiestas: 'Total de fiestas',
        totalVentas: 'Total ventas',
        promedioInvitados: 'Promedio invitados',
        promedioHoras: 'Promedio horas',
        promedio_casas: 'Promedio casas',
        promedioApartamentos: 'Promedio apartamentos',
        fiestasRango_1_3: 'Fiestas rango 1-3',
      }

      const niceLabel = (k) => {
        if (labelMap[k]) return labelMap[k]
        const replaced = k.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')
        return replaced.replace(/\b\w/g, c => c.toUpperCase())
      }

      const formatValue = (k, v) => {
        if (v == null || v === '') return '—'
        const key = k.toLowerCase()
        // currency-like keys
        if (key.includes('monto') || key.includes('monto') || key.includes('monto') || key.includes('total') && /monto|precio|monto|total/i.test(k)) {
    if (typeof v === 'number') return new Intl.NumberFormat().format(v)
        }
        if (key.includes('invit') || key.includes('hora') || key.includes('count') || key.includes('numero')) {
          return String(v)
        }
        if (typeof v === 'number') return new Intl.NumberFormat().format(v)
        return String(v)
      }

      return (
        <div className="result-card">
          <div className="result-grid">
            {entries.map(([k, v]) => (
              <div className="result-item" key={k}>
                <div className="result-label">{niceLabel(k)}</div>
                <div className="result-value">{formatValue(k, v)}</div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return <div className="result-card">{typeof result === 'string' ? result : <pre>{JSON.stringify(result, null, 2)}</pre>}</div>
  }
  return (
    <div className="consultas-fiesta content-card">
      <h2>Resumen de Fiestas</h2>

      {/* Auto-fetching resumen on mount; month/year inputs and button removed */}

      {/* Trigger resumen once when component mounts */}
      { /* useEffect below performs the fetch */ }

      <div style={{ marginTop: 12 }}>
        {loading && <div className="result-card result-loading">Cargando...</div>}
        {error && <div className="result-card result-error">{error}</div>}
        {result && renderResult()}
      </div>
    </div>
  )
}

// Auto-fetch resumen when component mounts
// We place the useEffect after the component definition so it has access to callEndpoint via closure.
