import { useEffect, useState } from "react";
import axios from "axios";
import Ventas from "../lib/ventas";

const API_URL = "https://proyecto-ventas-inmobiliaria.onrender.com/api/ventas";

export default function VentasDemo() {
  const [ventasRaw, setVentasRaw] = useState([]);
  const [resultados, setResultados] = useState(null);

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const res = await axios.get(API_URL);
        setVentasRaw(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchVentas();
  }, []);

  useEffect(() => {
    if (!ventasRaw) return;
    const model = new Ventas(ventasRaw);
    // ejemplo de uso de los métodos solicitados
    const sumaMes3 = model.suma(3);
    const promedios = model.promedioMensualPorTipo();
    // tomo el primer año existente para el ejemplo
    const anyos = ventasRaw.map(v => v.año).filter((v,i,arr)=>arr.indexOf(v)===i).sort();
    const añoEjemplo = anyos.length ? anyos[0] : null;
    const mesMayor = añoEjemplo ? model.mesDeMayorVentaEnAnio(añoEjemplo) : null;
    const menorCasa = model.menorVentaPorInmueble('Casa');
    const menorApto = model.menorVentaPorInmueble('Apartamento');

    setResultados({ sumaMes3, promedios, añoEjemplo, mesMayor, menorCasa, menorApto });
  }, [ventasRaw]);

  return (
    <div className="ventas-demo">
      <h2>Consultas (demo)</h2>
      <p>Ventas totales registradas: {ventasRaw.length}</p>
      {!resultados ? (
        <p>Cargando resultados...</p>
      ) : (
        <div>
          <p>Suma ventas en mes 3: ${resultados.sumaMes3.toLocaleString()}</p>
          <p>Promedio Casa: ${Math.round(resultados.promedios.Casa)}</p>
          <p>Promedio Apartamento: ${Math.round(resultados.promedios.Apartamento)}</p>
          <p>Año de ejemplo para mes mayor: {resultados.añoEjemplo ?? 'N/A'}</p>
          <p>Mes de mayor venta en año {resultados.añoEjemplo}: {resultados.mesMayor ?? 'N/A'}</p>
          <p>Menor venta Casa: {resultados.menorCasa ? `${resultados.menorCasa.año}-${resultados.menorCasa.mes} ($${results.menorCasa.precio})` : 'N/A'}</p>
          <p>Menor venta Apartamento: {resultados.menorApto ? `${resultados.menorApto.año}-${resultados.menorApto.mes} ($${resultados.menorApto.precio})` : 'N/A'}</p>
        </div>
      )}
    </div>
  );
}
