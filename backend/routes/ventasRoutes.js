import express from "express";
import db from "../firebase/config.js";

const router = express.Router();
const ventasRef = db.collection("ventas");

/**
 * 🟢 Crear una nueva venta
 * Ejemplo: POST /api/ventas
 * Body JSON:
 * {
 *   "tipo": "Casa",
 *   "año": 2025,
 *   "mes": 3,
 *   "precio": 1500000
 * }
 */
router.post("/", async (req, res) => {
  try {
    const { tipo, año, mes, precio } = req.body;

    // ✅ Validación básica
    if (!tipo || !año || !mes || !precio) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    if (tipo !== "Casa" && tipo !== "Apartamento") {
      return res.status(400).json({ error: "Tipo inválido. Debe ser 'Casa' o 'Apartamento'." });
    }

    if (isNaN(año) || año < 2000 || año > 2100) {
      return res.status(400).json({ error: "Año inválido." });
    }

    if (isNaN(mes) || mes < 1 || mes > 12) {
      return res.status(400).json({ error: "Mes inválido (1-12)." });
    }

    if (isNaN(precio) || precio <= 0) {
      return res.status(400).json({ error: "Precio inválido." });
    }

    // Guardar en Firestore
    const newVenta = { tipo, año, mes, precio };
    await ventasRef.add(newVenta);

    res.status(201).json({
      mensaje: "Venta registrada correctamente.",
      venta: newVenta
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar la venta." });
  }
});


/**
 * 🔵 Obtener todas las ventas registradas
 * Ejemplo: GET /api/ventas
 */
router.get("/", async (req, res) => {
  try {
    const snapshot = await ventasRef.get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const ventas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(ventas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las ventas" });
  }
});



/**
 * 1️⃣ Suma total de ventas por mes
 * Ejemplo: GET /api/ventas/suma?mes=3
 */
router.get("/suma", async (req, res) => {
  try {
    const mes = parseInt(req.query.mes);
    if (!mes || mes < 1 || mes > 12) return res.status(400).json({ error: "Mes inválido" });

    const snapshot = await ventasRef.where("mes", "==", mes).get();

    let suma = 0;
    snapshot.forEach(doc => {
      suma += doc.data().precio || 0;
    });

    res.json({ mes, totalVentas: suma });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al calcular la suma" });
  }
});

/**
 * 2️⃣ Promedio mensual por tipo
 * Ejemplo: GET /api/ventas/promedios
 */
router.get("/promedios", async (req, res) => {
  try {
    const snapshot = await ventasRef.get();

    let sumaCasas = 0, countCasas = 0;
    let sumaAptos = 0, countAptos = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.tipo === "Casa") {
        sumaCasas += data.precio || 0;
        countCasas++;
      } else if (data.tipo === "Apartamento") {
        sumaAptos += data.precio || 0;
        countAptos++;
      }
    });

    const promedioCasas = countCasas > 0 ? sumaCasas / countCasas : 0;
    const promedioAptos = countAptos > 0 ? sumaAptos / countAptos : 0;

    res.json({
      promedioCasas,
      promedioApartamentos: promedioAptos
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al calcular promedios" });
  }
});

/**
 * 3️⃣ Mes con mayor venta en un año
 * Ejemplo: GET /api/ventas/mes-mayor?año=2025
 */
router.get("/mes-mayor", async (req, res) => {
  try {
    const año = parseInt(req.query.año);
    if (!año) return res.status(400).json({ error: "Año inválido" });

    const snapshot = await ventasRef.where("año", "==", año).get();

    const ventasPorMes = {};

    snapshot.forEach(doc => {
      const { mes, precio } = doc.data();
      if (!ventasPorMes[mes]) ventasPorMes[mes] = 0;
      ventasPorMes[mes] += precio || 0;
    });

    let mesMayor = null;
    let maxVenta = 0;
    for (const [mes, total] of Object.entries(ventasPorMes)) {
      if (total > maxVenta) {
        maxVenta = total;
        mesMayor = mes;
      }
    }

    res.json({ año, mesMayor, totalVentas: maxVenta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al buscar el mes con mayor venta" });
  }
});

/**
 * 4️⃣ Menor venta por tipo de inmueble
 * Ejemplo: GET /api/ventas/menor-por-tipo?tipo=Casa
 */
router.get("/menor-por-tipo", async (req, res) => {
  try {
    const tipo = req.query.tipo;
    if (!tipo) return res.status(400).json({ error: "Tipo requerido" });

    const snapshot = await ventasRef.where("tipo", "==", tipo).get();

    let menorVenta = Infinity;
    let añoMenor = null;
    let mesMenor = null;

    snapshot.forEach(doc => {
      const { año, mes, precio } = doc.data();
      if (precio < menorVenta) {
        menorVenta = precio;
        añoMenor = año;
        mesMenor = mes;
      }
    });

    res.json({ tipo, año: añoMenor, mes: mesMenor, menorVenta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al buscar la menor venta" });
  }
});

export default router;
