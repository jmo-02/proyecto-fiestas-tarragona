import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './FiestasList.css'

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '')

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function FiestasList() {
  const [fiestas, setFiestas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    axios.get(`${API_URL}/api/fiestas`)
      .then(res => {
        if (!mounted) return
        setFiestas(res.data || [])
        setError(null)
      })
      .catch(err => {
        if (!mounted) return
        setError(err.message || 'Error al obtener fiestas')
      })
      .finally(() => mounted && setLoading(false))

    return () => { mounted = false }
  }, [])

  return (
    <div className="ventas-list content-card">
      <h2>Listado de Fiestas</h2>

      {loading && <div className="server-response">Cargando fiestas...</div>}
      {error && <div className="server-response error">{error}</div>}

      {!loading && !error && (
        <div className="table-wrapper">
          <table className="ventas-table">
            <thead>
              {fiestas.length > 0 && fiestas[0].cedula !== undefined ? (
                <tr>
                  <th>Cédula</th>
                  <th>Invitados</th>
                  <th>Horas</th>
                  <th style={{ textAlign: 'right' }}>Monto total</th>
                </tr>
              ) : (
                <tr>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Mes</th>
                  <th>Año</th>
                  <th style={{ textAlign: 'right' }}>Precio</th>
                </tr>
              )}
            </thead>
            <tbody>
              {fiestas.map((f, idx) => (
                fiestas.length > 0 && fiestas[0].cedula !== undefined ? (
                  <tr key={f.id || f._id || idx}>
                    <td>{f.cedula || '—'}</td>
                    <td>{f.invitados != null ? String(f.invitados) : '—'}</td>
                    <td>{f.horas != null ? String(f.horas) : '—'}</td>
                    <td style={{ textAlign: 'right' }}>{(f.montoTotal != null) ? `${new Intl.NumberFormat().format(f.montoTotal)}` : '—'}</td>
                  </tr>
                ) : (
                  <tr key={f.id || f._id || idx}>
                    <td>{f.titulo || f.nombre || '—'}</td>
                    <td>{f.tipo || '—'}</td>
                    <td>{(typeof f.mes === 'number') ? monthNames[f.mes - 1] : f.mes}</td>
                    <td>{f.anio || f.year || '—'}</td>
                    <td style={{ textAlign: 'right' }}>{(f.precio || f.price) ? `${f.precio || f.price}` : '—'}</td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
