import "./Header.css";

export default function Header({ setVistaActual }) {
  return (
    <div className="header-outer">
      <header className="header-inner">
        <h2>🏡 Sistema de Ventas Inmobiliarias</h2>
        <nav>
          <button onClick={() => setVistaActual("ventas")}>Registrar Venta</button>
          <button onClick={() => setVistaActual("listado")}>Ver Listado</button>
          <button onClick={() => setVistaActual("consultas")}>Consultas</button>
        </nav>
      </header>
    </div>
  );
}
