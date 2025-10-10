// backend/server.js
import express from "express";
import cors from "cors";
import fiestasRoutes from "./routes/fiestasRoutes.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Rutas de fiestas
app.use("/api/fiestas", fiestasRoutes);

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
