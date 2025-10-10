import express from "express";
import db from "../firebase/config.js";

const router = express.Router();
const fiestasRef = db.collection("fiestas");

// Helpers de cálculo
function tarifaPorInvitados(invitados) {
  if (invitados >= 1 && invitados <= 50) return 25000;
  if (invitados >= 51 && invitados <= 100) return 20000;
  if (invitados > 100) return 15000;
  return 0;
}

function cuotaPorHoras(horas) {
  if (horas >= 1 && horas <= 3) return 50000;
  if (horas >= 4 && horas <= 6) return 100000;
  if (horas > 6) return 200000;
  return 0;
}

/**
 * POST /api/fiestas
 * Body: { cedula, invitados, horas }
 */
router.post("/", async (req, res) => {
  try {
    const { cedula, invitados, horas } = req.body || {};

    // Validaciones
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

    // Calcular montoTotal
    const tarifa = tarifaPorInvitados(invitadosNum);
    const cuotaHoras = cuotaPorHoras(horasNum);
    const montoTotal = invitadosNum * tarifa + cuotaHoras;

    const nuevaFiesta = {
      cedula: cedula.trim(),
      invitados: invitadosNum,
      horas: horasNum,
      montoTotal,
    };

    await fiestasRef.add(nuevaFiesta);

    return res.status(201).json(nuevaFiesta);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al registrar la fiesta." });
  }
});

/**
 * GET /api/fiestas
 * Retorna todas las fiestas
 */
router.get("/", async (req, res) => {
  try {
    const snapshot = await fiestasRef.get();

    if (snapshot.empty) return res.status(200).json([]);

    const fiestas = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
