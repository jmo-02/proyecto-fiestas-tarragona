import { useState, useEffect } from "react";
import axios from "axios";
import "./FiestaForm.css";

const API_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, '');

export default function FiestaForm({ onFiestaAgregada, onFiestaCreada }) {
  const [cedula, setCedula] = useState("");
  const [invitados, setInvitados] = useState("");
  const [horas, setHoras] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  const computeErrors = () => {
    const errs = {};
    if (!cedula || String(cedula).trim() === "") errs.cedula = "Cédula es requerida";

    const inv = Number(String(invitados).trim());
    if (String(invitados).trim() === "") errs.invitados = "Número de invitados es requerido";
    else if (Number.isNaN(inv) || inv <= 0) errs.invitados = "Invitados debe ser un número mayor que 0";

    const hr = Number(String(horas).trim());
    if (String(horas).trim() === "") errs.horas = "Número de horas es requerido";
    else if (Number.isNaN(hr) || hr <= 0) errs.horas = "Horas debe ser un número mayor que 0";

    return errs;
  };

  useEffect(() => {
    setFieldErrors(computeErrors());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cedula, invitados, horas]);

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
      const invNum = Number(String(invitados).trim());
      const horasNum = Number(String(horas).trim());

      const resp = await axios.post(`${API_URL}/api/fiestas`, { cedula, invitados: invNum, horas: horasNum });

      const msg = resp?.data?.mensaje || resp?.data?.message || 'Fiesta registrada correctamente';
      setSubmitSuccess(msg);

      const created = resp.data && (resp.data.fiesta || resp.data || null);
      if (created && typeof onFiestaCreada === 'function') onFiestaCreada(created);
      onFiestaAgregada && onFiestaAgregada();

      setCedula("");
      setInvitados("");
      setHoras("");
      setFieldErrors({});
    } catch (error) {
      console.error(error);
      const serverMsg = error?.response?.data?.message || error?.message || 'Error al registrar la fiesta';
      setSubmitError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const isFormInvalid = Object.keys(fieldErrors).length > 0;

  return (
    <form onSubmit={handleSubmit} className="venta-form form-wide">
      <h2>Registrar fiesta</h2>

      <div className="field-wrapper">
        <label>Cédula del contratante:</label>
        <input type="text" value={cedula} onChange={(e) => setCedula(e.target.value)} placeholder="ej. 12345678" />
        {fieldErrors.cedula && <div className="field-error">{fieldErrors.cedula}</div>}
      </div>

      <div className="field-wrapper">
        <label>Número de invitados:</label>
        <input type="number" value={invitados} onChange={(e) => setInvitados(e.target.value)} placeholder="ej. 50" />
        {fieldErrors.invitados && <div className="field-error">{fieldErrors.invitados}</div>}
      </div>

      <div className="field-wrapper">
        <label>Número de horas:</label>
        <input type="number" value={horas} onChange={(e) => setHoras(e.target.value)} placeholder="ej. 4" />
        {fieldErrors.horas && <div className="field-error">{fieldErrors.horas}</div>}
      </div>

      <button type="submit" disabled={isFormInvalid || loading}>{loading ? 'Enviando...' : 'Registrar evento'}</button>
      {submitSuccess && <p className="form-success">{submitSuccess}</p>}
      {submitError && <p className="form-error">{submitError}</p>}
    </form>
  );
}
