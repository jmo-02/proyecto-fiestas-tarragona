// src/lib/ventas.js
// Clase Ventas: representa una colección de ventas y métodos de análisis
// Cada venta se representa como un objeto: { tipo: 'Casa'|'Apartamento', año: number, mes: number (1-12), precio: number }

/**
 * Reglas de codificación usadas:
 * - Nombres en camelCase para variables y métodos.
 * - Métodos pequeños y documentados.
 * - Entrada validada mínimamente (tipos básicos) antes de operar.
 */
export default class Ventas {
  constructor(ventas = []) {
    // Guardamos una copia defensiva
    this.ventas = Array.isArray(ventas) ? [...ventas] : [];
  }

  // a) suma: devuelve la suma de ventas para un mes dado (mes: 1..12)
  suma(mes) {
    if (typeof mes !== 'number' || mes < 1 || mes > 12) return 0;
    return this.ventas
      .filter(v => v.mes === mes)
      .reduce((acc, v) => acc + (Number(v.precio) || 0), 0);
  }

  // b) promedio mensual por tipo: devuelve { Casa: number, Apartamento: number }
  promedioMensualPorTipo() {
    const acumulador = {
      Casa: { suma: 0, count: 0 },
      Apartamento: { suma: 0, count: 0 }
    };

    for (const v of this.ventas) {
      const tipo = v.tipo;
      if (!acumulador[tipo]) continue;
      acumulador[tipo].suma += Number(v.precio) || 0;
      acumulador[tipo].count += 1;
    }

    return {
      Casa: acumulador.Casa.count ? acumulador.Casa.suma / acumulador.Casa.count : 0,
      Apartamento: acumulador.Apartamento.count ? acumulador.Apartamento.suma / acumulador.Apartamento.count : 0
    };
  }

  // c) dado un año, devuelve el mes (1..12) en el que se realizó la mayor venta (por precio)
  mesDeMayorVentaEnAnio(anio) {
    const ventasAnio = this.ventas.filter(v => v.año === anio);
    if (ventasAnio.length === 0) return null;
    let max = ventasAnio[0];
    for (const v of ventasAnio) if ((Number(v.precio) || 0) > (Number(max.precio) || 0)) max = v;
    return max.mes;
  }

  // d) procedimiento que dado un inmueble (tipo) devuelve { año, mes, precio }
  // donde se realizó la menor venta para ese tipo
  menorVentaPorInmueble(tipo) {
    const ventasTipo = this.ventas.filter(v => v.tipo === tipo);
    if (ventasTipo.length === 0) return null;
    let min = ventasTipo[0];
    for (const v of ventasTipo) if ((Number(v.precio) || 0) < (Number(min.precio) || 0)) min = v;
    return { año: min.año, mes: min.mes, precio: min.precio };
  }

  // utilidad: añadir una venta (mutable)
  addVenta(venta) {
    if (!venta || typeof venta !== 'object') return false;
    // validaciones mínimas
    if (!venta.tipo || typeof venta.año !== 'number' || typeof venta.mes !== 'number') return false;
    this.ventas.push({ ...venta });
    return true;
  }
}
