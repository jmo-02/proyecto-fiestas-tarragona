// backend/firebase/config.js
import admin from "firebase-admin";
import { readFileSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Leer el archivo JSON con las credenciales del servicio
const serviceAccount = JSON.parse(
  readFileSync("/etc/secrets/serviceAccountKey.json", "utf8")
);
// const serviceAccount = JSON.parse(
//   readFileSync(`${__dirname}/serviceAccountKey.json`, "utf8")
// );

// Inicializar la app de Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Exportar la instancia de Firestore
const db = admin.firestore();
export default db;
