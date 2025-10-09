// src/components/VentasList.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./VentaList.css";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function VentasList({ refresh, ultimaVenta = null }) {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVentas = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(API_URL);
        const data = Array.isArray(res.data) ? res.data : [];
        // Merge ultimaVenta if provided (avoid duplicates by id)
        if (ultimaVenta) {
          const exists = data.some((d) => d.id && ultimaVenta.id && d.id === ultimaVenta.id);
          if (!exists) data.unshift(ultimaVenta);
        }
        setVentas(data);
      } catch (err) {
        console.error(err);
        setError(err?.message || 'Error al obtener ventas');
        // if GET fails but we have ultimaVenta, show it
        if (ultimaVenta) setVentas([ultimaVenta]);
      } finally {
        setLoading(false);
      }
    };

    fetchVentas();
  }, [refresh, ultimaVenta]);

  return (
    <div className="ventas-list">
      <h2>Listado de ventas</h2>
      {loading ? (
        <p>Cargando ventas...</p>
      ) : error ? (
        <p className="list-error">{error}</p>
      ) : ventas.length === 0 ? (
        <p>No hay ventas registradas aún.</p>
      ) : (
        <table className="ventas-table" border="1">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Año</th>
              <th>Mes</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v, idx) => {
              const months = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
              const mesDisplay = (() => {
                if (v == null) return '';
                const m = v.mes ?? v.mes;
                const mNum = Number(m);
                if (!Number.isNaN(mNum) && mNum >= 1 && mNum <= 12) return months[mNum];
                return String(v.mes ?? '');
              })();

              return (
                <tr key={v.id ?? `${v.tipo}-${v.año}-${v.mes}-${idx}`}>
                  <td>{v.tipo}</td>
                  <td>{v.año}</td>
                  <td>{mesDisplay}</td>
                  <td>${(typeof v.precio === 'number' ? v.precio : Number(v.precio || 0)).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
