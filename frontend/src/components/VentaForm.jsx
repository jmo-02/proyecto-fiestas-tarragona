// src/components/VentaForm.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import "./VentaForm.css";


const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function VentaForm({ onVentaAgregada, onVentaCreada }) {
  const [tipo, setTipo] = useState("Casa");
  const [año, setAño] = useState("");
  const [mes, setMes] = useState("");
  const [precio, setPrecio] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  const computeErrors = () => {
    const errs = {};
    const currentYear = new Date().getFullYear();

    if (!tipo) errs.tipo = "Tipo es requerido";

    if (!año || String(año).trim() === "") errs.año = "Año es requerido";
    else {
      const añoNum = parseInt(String(año).trim(), 10);
      if (Number.isNaN(añoNum)) errs.año = "Año debe ser numérico";
      else if (añoNum < 1900 || añoNum > currentYear + 1) errs.año = `Año inválido (1900-${currentYear + 1})`;
    }

    if (!mes || String(mes).trim() === "") errs.mes = "Mes es requerido";
    else {
      const mesNum = Number(mes);
      if (Number.isNaN(mesNum) || mesNum < 1 || mesNum > 12) errs.mes = "Mes inválido (1-12)";
    }

    if (!precio || String(precio).trim() === "") errs.precio = "Precio es requerido";
    else {
      const precioNormalized = String(precio).replace(',', '.').trim();
      const precioNum = parseFloat(precioNormalized);
      if (Number.isNaN(precioNum)) errs.precio = "Precio debe ser numérico";
      else if (precioNum <= 0) errs.precio = "Precio debe ser mayor que 0";
    }

    return errs;
  };

  useEffect(() => {
    setFieldErrors(computeErrors());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, año, mes, precio]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);
    const errs = computeErrors();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    try {
      setLoading(true);
      const añoNum = parseInt(String(año).trim(), 10);
      const mesNum = Number(mes);
      const precioNum = parseFloat(String(precio).replace(',', '.').trim());

      const resp = await axios.post(API_URL, { tipo, año: añoNum, mes: mesNum, precio: precioNum });

      // Mostrar solo el mensaje de éxito enviado por la API
      const msg = resp?.data?.mensaje || resp?.data?.message || 'Venta registrada correctamente';
      setSubmitSuccess(msg);

      const created = resp.data && (resp.data.venta || resp.data || null);
      if (created && typeof onVentaCreada === 'function') onVentaCreada(created);
      onVentaAgregada && onVentaAgregada(); // Notifica al padre que se agregó una nueva venta

      setAño("");
      setMes("");
      setPrecio("");
      setFieldErrors({});
    } catch (error) {
      console.error(error);
      const serverMsg = error?.response?.data?.message || error?.message || 'Error al registrar la venta';
      setSubmitError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const isFormInvalid = Object.keys(fieldErrors).length > 0;

  return (
    <form onSubmit={handleSubmit} className="venta-form form-wide">
      <h2>Registrar venta</h2>

      <div className="field-wrapper">
        <label>Tipo de inmueble:</label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="Casa">Casa</option>
          <option value="Apartamento">Apartamento</option>
        {submitSuccess && <p className="form-success">{submitSuccess}</p>}
        </select>
      </div>

      <div className="field-wrapper">
        <label>Año:</label>
        <input type="text" value={año} onChange={(e) => setAño(e.target.value)} placeholder="ej. 2024" />
        {fieldErrors.año && <div className="field-error">{fieldErrors.año}</div>}
      </div>

      <div className="field-wrapper">
        <label>Mes:</label>
        <select value={mes} onChange={(e) => setMes(e.target.value)}>
          <option value="">-- Selecciona mes --</option>
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
        {fieldErrors.mes && <div className="field-error">{fieldErrors.mes}</div>}
      </div>

      <div className="field-wrapper">
        <label>Precio:</label>
        <input type="text" inputMode="decimal" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="ej. 125000.50" />
        {fieldErrors.precio && <div className="field-error">{fieldErrors.precio}</div>}
      </div>

      <button type="submit" disabled={isFormInvalid || loading}>{loading ? 'Enviando...' : 'Guardar venta'}</button>
      {submitSuccess && <p className="form-success">{submitSuccess}</p>}
      {submitError && <p className="form-error">{submitError}</p>}
    </form>
  );
}
