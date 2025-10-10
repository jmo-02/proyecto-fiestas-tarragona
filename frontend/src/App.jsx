import { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import VentaForm from "./components/VentaForm";
import VentasList from "./components/VentaList";
import Consultas from "./components/Consultas";
import ResumenFiestas from './components/ResumenFiestas';
import "./App.css";
// Fiestas pages (new domain) - progressive migration
import FiestaForm from './components/FiestaForm';
import FiestasList from './components/FiestasList';

export default function App() {
  const [vistaActual, setVistaActual] = useState("ventas");
  const [refresh, setRefresh] = useState(false);
  const [ultimaVenta, setUltimaVenta] = useState(null);

  const handleVentaAgregada = () => setRefresh(!refresh);

  const handleVentaCreada = (venta) => {
    // guarda temporalmente la última venta creada para mostrar en la lista
    setUltimaVenta(venta);
    setRefresh(!refresh);
  };

  return (
    <div className="layout">
      {/* 🔹 Header: arriba y full width */}
      <Header setVistaActual={setVistaActual} />

      {/* 🔹 Main content: centrado, con ancho limitado */}
      <main className="content">
        {vistaActual === "ventas" && (
          <>
            <VentaForm onVentaAgregada={handleVentaAgregada} onVentaCreada={handleVentaCreada} />
          </>
        )}

        {vistaActual === "listado" && (
          <VentasList refresh={refresh} ultimaVenta={ultimaVenta} />
        )}

        {vistaActual === "consultas" && (
          <Consultas />
        )}
        
        {vistaActual === "fiestas" && (
          <FiestasList />
        )}
        
        {vistaActual === "registrar-fiesta" && (
          <FiestaForm />
        )}
        {vistaActual === "resumen-fiestas" && (
          <ResumenFiestas />
        )}
      </main>

      {/* 🔹 Footer: abajo y full width */}
      <Footer />
    </div>

  );
}
