// backend/server.js
import express from "express";
import cors from "cors";
import ventasRoutes from "./routes/ventasRoutes.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Rutas de ventas
app.use("/api/ventas", ventasRoutes);

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
