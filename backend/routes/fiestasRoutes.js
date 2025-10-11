import express from "express";
import db from "../firebase/config.js";

const router = express.Router();
const fiestasRef = db.collection("fiestas");

// Valor por invitado según cantidad
function valorPorInvitado(invitados) {
  if (invitados >= 1 && invitados <= 100) return 8000;
  if (invitados >= 101 && invitados <= 500) return 6000;
  if (invitados > 500) return 4000;
  return 0;
}

// Tarifa fija según horas
function tarifaPorHoras(horas) {
  if (horas >= 1 && horas <= 3) return 100000;
  if (horas >= 4 && horas <= 6) return 200000;
  if (horas > 6) return 300000;
  return 0;
}

// Formatea con separadores de miles y sin decimales (ej. 1.650.000)
function formatoMiles(valor) {
  return new Intl.NumberFormat("es-ES").format(Math.round(valor));
}

// Calcula el monto total: (invitados * valorPorInvitado) + tarifaPorHoras
function calcularMontoTotal(invitados, horas) {
  const valorInvitado = valorPorInvitado(invitados);
  const tarifa = tarifaPorHoras(horas);
  const montoTotal = invitados * valorInvitado + tarifa;
  const montoTotalFormateado = formatoMiles(montoTotal);
  return { montoTotal, montoTotalFormateado };
}

/**
 * POST /api/fiestas
 * Body: { cedula, invitados, horas }
 */
router.post("/", async (req, res) => {
  try {
    const { cedula, invitados, horas } = req.body || {};

    if (!cedula || invitados === undefined || horas === undefined) {
      return res.status(400).json({ error: "Los campos cedula, invitados y horas son obligatorios." });
    }

    if (typeof cedula !== "string" || cedula.trim() === "") {
      return res.status(400).json({ error: "Cedula debe ser una cadena no vacía." });
    }

    const invitadosNum = Number(invitados);
    const horasNum = Number(horas);

    if (!Number.isFinite(invitadosNum) || invitadosNum <= 0) {
      return res.status(400).json({ error: "Invitados debe ser un número positivo." });
    }

    if (!Number.isFinite(horasNum) || horasNum <= 0) {
      return res.status(400).json({ error: "Horas debe ser un número positivo." });
    }

    const { montoTotal, montoTotalFormateado } = calcularMontoTotal(invitadosNum, horasNum);

    const nuevaFiesta = {
      cedula: cedula.trim(),
      invitados: invitadosNum,
      horas: horasNum,
      montoTotal, // se guarda como número en Firestore
    };

    const docRef = await fiestasRef.add(nuevaFiesta);

    return res.status(201).json({
      id: docRef.id,
      ...nuevaFiesta,
      montoTotalFormateado, // representación para mostrar en la tabla/UI
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al registrar la fiesta." });
  }
});

/**
 * GET /api/fiestas
 * Retorna todas las fiestas (incluye monto formateado para mostrar)
 */
router.get("/", async (req, res) => {
  try {
    const snapshot = await fiestasRef.get();

    if (snapshot.empty) return res.status(200).json([]);

    const fiestas = snapshot.docs.map((doc) => {
      const data = doc.data();
      const montoNum = Number(data.montoTotal) || 0;
      return {
        id: doc.id,
        cedula: data.cedula,
        invitados: data.invitados,
        horas: data.horas,
        montoTotal: montoNum,
        montoTotalFormateado: formatoMiles(montoNum),
      };
    });

    return res.status(200).json(fiestas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener las fiestas." });
  }
});

/**
 * GET /api/fiestas/resumen
 * Devuelve totalInvitados, totalHoras y conteo de fiestas por rango de horas
 */
router.get("/resumen", async (req, res) => {
  try {
    const snapshot = await fiestasRef.get();

    let totalInvitados = 0;
    let totalHoras = 0;
    let fiestasRango_1_3 = 0;
    let fiestasRango_4_6 = 0;
    let fiestasRango_mayor6 = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const invitados = Number(data.invitados) || 0;
      const horas = Number(data.horas) || 0;

      totalInvitados += invitados;
      totalHoras += horas;

      if (horas >= 1 && horas <= 3) fiestasRango_1_3++;
      else if (horas >= 4 && horas <= 6) fiestasRango_4_6++;
      else if (horas > 6) fiestasRango_mayor6++;
    });

    return res.status(200).json({
      totalInvitados,
      totalHoras,
      fiestasRango_1_3,
      fiestasRango_4_6,
      fiestasRango_mayor6,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al calcular el resumen." });
  }
});

export default router;