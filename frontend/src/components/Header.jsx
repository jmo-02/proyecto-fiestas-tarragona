import "./Header.css";

import React from 'react';
export default function Header({ setVistaActual }) {
  return (
    <div className="header-outer">
      <header className="header-inner">
        <h2>Fiestas y Eventos Tarragona</h2>
        <nav className="header-nav">
          {/* <button onClick={() => setVistaActual && setVistaActual('inicio')}>Inicio</button> */}
          <button onClick={() => setVistaActual && setVistaActual('registrar-fiesta')}>Registrar Fiesta</button>
          <button onClick={() => setVistaActual && setVistaActual('fiestas')}>Fiestas</button>
          <button onClick={() => setVistaActual && setVistaActual('resumen-fiestas')}>Resumen Fiestas</button>
        </nav>
      </header>
    </div>
  );
}
