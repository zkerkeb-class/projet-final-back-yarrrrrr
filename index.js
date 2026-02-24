import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./connect.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import User from "./schema/user.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Fonction pour importer les utilisateurs depuis le JSON
const importUsersFromJSON = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const filePath = path.join(__dirname, "data", "user.json");
      const usersData = JSON.parse(fs.readFileSync(filePath, "utf8"));

      if (usersData && usersData.length > 0) {
        await User.insertMany(usersData);
        console.log(
          `✅ ${usersData.length} utilisateur(s) importé(s) depuis user.json`,
        );
      }
    }
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'import des utilisateurs:",
      error.message,
    );
  }
};

// Fonction pour initialiser le serveur
const startServer = async () => {
  // Connexion à MongoDB
  await connectDB();

  // Importer les utilisateurs depuis le JSON
  await importUsersFromJSON();

  const app = express();

  app.use(cors());
  app.use(express.json());

  // Configuration Swagger
  const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Projekt Yarrrrrr API",
        version: "1.0.0",
        description:
          "API pour la gestion des utilisateurs et l'authentification",
      },
      servers: [
        {
          url: "http://localhost:3001",
          description: "Serveur de développement",
        },
      ],
    },
    apis: ["./routes/*.js"],
  };

  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () =>
    console.log(
      `API running on port ${PORT} sur l'adresse http://localhost:${PORT}/api-docs`,
    ),
  );
};

startServer().catch((error) => {
  console.error("Erreur au démarrage du serveur:", error);
  process.exit(1);
});
