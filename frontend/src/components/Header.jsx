import "./Header.css";

import React, { useState } from 'react';

export default function Header({ setVistaActual }) {
  const [open, setOpen] = useState(false);

  const go = (view) => {
    setOpen(false);
    setVistaActual && setVistaActual(view);
  }

  return (
    <div className="header-outer">
      <header className="header-inner">
        <h2>Fiestas y Eventos Tarragona</h2>

        <button className="hamburger" aria-label="Abrir menú" onClick={() => setOpen(o => !o)}>
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>

        <nav className={`header-nav ${open ? 'open' : ''}`}>
          <button onClick={() => go('registrar-fiesta')}>Registrar Fiesta</button>
          <button onClick={() => go('fiestas')}>Fiestas</button>
          <button onClick={() => go('resumen-fiestas')}>Resumen Fiestas</button>
        </nav>
      </header>
    </div>
  );
}
