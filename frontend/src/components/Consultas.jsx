import { useState } from "react";
import axios from "axios";
import "./VentaList.css"; // reutiliza algunos estilos existentes
import "./ConsultasVentas.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL ;

export default function Consultas() {
  const [mes, setMes] = useState(1);
  const [año, setAño] = useState(new Date().getFullYear());
  const [tipo, setTipo] = useState("Casa");

  const [resultadoSuma, setResultadoSuma] = useState(null);
  const [resultadoPromedios, setResultadoPromedios] = useState(null);
  const [resultadoMesMayor, setResultadoMesMayor] = useState(null);
  const [resultadoMenor, setResultadoMenor] = useState(null);
  const [loadingSuma, setLoadingSuma] = useState(false);
  const [loadingPromedios, setLoadingPromedios] = useState(false);
  const [loadingMesMayor, setLoadingMesMayor] = useState(false);
  const [loadingMenor, setLoadingMenor] = useState(false);

  const handleSuma = async () => {
    setResultadoSuma(null);
    setLoadingSuma(true);
    try {
      const res = await axios.get(`${API_BASE}/suma`, { params: { mes } });
      setResultadoSuma({ ok: true, data: res.data });
    } catch (err) {
      console.error(err);
      setResultadoSuma({ ok: false, error: err?.response?.data?.message || 'Error de conexión' });
    } finally {
      setLoadingSuma(false);
    }
  };

  const handlePromedios = async () => {
    setResultadoPromedios(null);
    setLoadingPromedios(true);
    try {
      const res = await axios.get(`${API_BASE}/promedios`);
      setResultadoPromedios({ ok: true, data: res.data });
    } catch (err) {
      console.error(err);
      setResultadoPromedios({ ok: false, error: err?.response?.data?.message || 'Error de conexión' });
    } finally {
      setLoadingPromedios(false);
    }
  };

  const handleMesMayor = async () => {
    setResultadoMesMayor(null);
    setLoadingMesMayor(true);
    try {
      const res = await axios.get(`${API_BASE}/mes-mayor`, { params: { año } });
      setResultadoMesMayor({ ok: true, data: res.data });
    } catch (err) {
      console.error(err);
      setResultadoMesMayor({ ok: false, error: err?.response?.data?.message || 'Error de conexión' });
    } finally {
      setLoadingMesMayor(false);
    }
  };

  const handleMenorPorTipo = async () => {
    setResultadoMenor(null);
    setLoadingMenor(true);
    try {
      const res = await axios.get(`${API_BASE}/menor-por-tipo`, { params: { tipo } });
      setResultadoMenor({ ok: true, data: res.data });
    } catch (err) {
      console.error(err);
      setResultadoMenor({ ok: false, error: err?.response?.data?.message || 'Error de conexión' });
    } finally {
      setLoadingMenor(false);
    }
  };

  return (
    <div className="ventas-consultas">
      <h2>Consultas</h2>

      <section>
        <h3>Suma de ventas por mes</h3>
        <div className="controls">
          <div className="left">
            <button onClick={handleSuma}>Consultar suma</button>
          </div>
          <div className="right">
            <label>Mes:</label>
            <select value={mes} onChange={(e) => setMes(Number(e.target.value))}>
              <option value={1}>Enero</option>
              <option value={2}>Febrero</option>
              <option value={3}>Marzo</option>
              <option value={4}>Abril</option>
              <option value={5}>Mayo</option>
              <option value={6}>Junio</option>
              <option value={7}>Julio</option>
              <option value={8}>Agosto</option>
              <option value={9}>Septiembre</option>
              <option value={10}>Octubre</option>
              <option value={11}>Noviembre</option>
              <option value={12}>Diciembre</option>
            </select>
          </div>
        </div>
        <div className="result-card">
          {loadingSuma ? (
            <div className="result-loading">Consultando...</div>
          ) : resultadoSuma ? (
            resultadoSuma.ok ? (
              (() => {
                const data = resultadoSuma.data || {};
                const months = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
                const total = Number(data.totalVentas ?? data.total ?? 0);
                if (!total || total <= 0) {
                  return <div className="result-empty">No hay ventas en ese mes.</div>;
                }
                const mesName = months[Number(data.mes) >= 1 && Number(data.mes) <= 12 ? Number(data.mes) : 0] || data.mes;
                return (
                  <div className="result-ok">
                    <div><strong>Mes:</strong> {mesName}</div>
                    <div><strong>Total ventas:</strong> ${new Intl.NumberFormat().format(total)}</div>
                  </div>
                );
              })()
            ) : (
              <div className="result-error">{resultadoSuma.error}</div>
            )
          ) : (
            <div className="result-empty">—</div>
          )}
        </div>
      </section>

      <section>
        <h3>Promedio mensual por tipo</h3>
        <div className="controls">
          <div className="left">
            <button onClick={handlePromedios}>Consultar promedios</button>
          </div>
          <div className="right" />
        </div>
        <div className="result-card">
          {loadingPromedios ? (
            <div className="result-loading">Consultando...</div>
          ) : resultadoPromedios ? (
            resultadoPromedios.ok ? (
              (() => {
                const d = resultadoPromedios.data || {};
                const casas = Number(d.promedioCasas ?? d.promedio_casas ?? 0);
                const deptos = Number(d.promedioApartamentos ?? d.promedio_apartamentos ?? 0);
                if ((!casas || casas <= 0) && (!deptos || deptos <= 0)) {
                  return <div className="result-empty">No hay datos de ventas para calcular promedios.</div>;
                }
                return (
                  <div className="result-ok">
                    {casas > 0 && <div><strong>Promedio casas:</strong> ${new Intl.NumberFormat().format(casas)}</div>}
                    {deptos > 0 && <div><strong>Promedio apartamentos:</strong> ${new Intl.NumberFormat().format(deptos)}</div>}
                  </div>
                );
              })()
            ) : (
              <div className="result-error">{resultadoPromedios.error}</div>
            )
          ) : (
            <div className="result-empty">—</div>
          )}
        </div>
      </section>

      <section>
        <h3>Mes de mayor venta en un año</h3>
        <div className="controls">
          <div className="left">
            <button onClick={handleMesMayor}>Consultar mes de mayor venta</button>
          </div>
          <div className="right">
            <label>Año:</label>
            {/* year select: from 2000 up to current year */}
            <select value={año} onChange={(e) => setAño(Number(e.target.value))}>
              {(() => {
                const current = new Date().getFullYear();
                const years = [];
                for (let y = current; y >= 2000; y--) years.push(y);
                return years.map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ));
              })()}
            </select>
          </div>
        </div>
        <div className="result-card">
          {loadingMesMayor ? (
            <div className="result-loading">Consultando...</div>
          ) : resultadoMesMayor ? (
            resultadoMesMayor.ok ? (
              (() => {
                const d = resultadoMesMayor.data || {};
                const total = Number(d.totalVentas ?? d.total ?? 0);
                const months = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
                if (!total || total <= 0) return <div className="result-empty">No hay ventas en ese año.</div>;
                const mesName = months[Number(d.mesMayor) >= 1 && Number(d.mesMayor) <= 12 ? Number(d.mesMayor) : 0] || d.mesMayor;
                return (
                  <div className="result-ok">
                    <div><strong>Año:</strong> {d.año}</div>
                    <div><strong>Mes de mayor venta:</strong> {mesName}</div>
                    <div><strong>Total ventas:</strong> ${new Intl.NumberFormat().format(total)}</div>
                  </div>
                );
              })()
            ) : (
              <div className="result-error">{resultadoMesMayor.error}</div>
            )
          ) : (
            <div className="result-empty">—</div>
          )}
        </div>
      </section>

      <section>
        <h3>Menor venta por tipo de inmueble</h3>
        <div className="controls">
          <div className="left">
            <button onClick={handleMenorPorTipo}>Consultar menor venta</button>
          </div>
          <div className="right">
            <label>Tipo:</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="Casa">Casa</option>
              <option value="Apartamento">Apartamento</option>
            </select>
          </div>
        </div>
        <div className="result-card">
          {loadingMenor ? (
            <div className="result-loading">Consultando...</div>
          ) : resultadoMenor ? (
            resultadoMenor.ok ? (
              (() => {
                const d = resultadoMenor.data || {};
                const menor = Number(d.menorVenta ?? d.menor ?? 0);
                if (!menor || menor <= 0) return <div className="result-empty">No hay ventas del tipo {d.tipo || tipo}.</div>;
                const months = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
                const mesName = months[Number(d.mes) >= 1 && Number(d.mes) <= 12 ? Number(d.mes) : 0] || d.mes;
                return (
                  <div className="result-ok">
                    <div><strong>Tipo:</strong> {d.tipo}</div>
                    <div><strong>Año:</strong> {d.año}</div>
                    <div><strong>Mes:</strong> {mesName}</div>
                    <div><strong>Menor venta:</strong> ${new Intl.NumberFormat().format(menor)}</div>
                  </div>
                );
              })()
            ) : (
              <div className="result-error">{resultadoMenor.error}</div>
            )
          ) : (
            <div className="result-empty">—</div>
          )}
        </div>
      </section>

      <p className="nota">Nota: esta sección permite realizar consultas a los datos registrados en el sistema. Para ello deben haber registros</p>
    </div>
  );
}
