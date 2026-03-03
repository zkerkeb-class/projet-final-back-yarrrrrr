import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../schema/user.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const TOKEN_EXPIRATION = "2h";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     genre:
 *                       type: string
 *                     niveau:
 *                       type: number
 *       401:
 *         description: Username ou password incorrect
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation des champs requis
    if (!username || !password) {
      return res.status(400).json({ message: "Username et password requis" });
    }

    // Chercher l'utilisateur en base de données
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Comparer le password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password incorrect" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRATION },
    );

    // Connexion réussie
    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        username: user.username,
        genre: user.genre,
        niveau: user.niveau,
        photoProfil: user.photoProfil,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

router.get("/verify", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ valid: false, message: "Token manquant ou invalide" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    return res.status(200).json({ valid: true, decoded });
  } catch (error) {
    return res
      .status(401)
      .json({ valid: false, message: "Token expiré ou invalide" });
  }
});

export default router;
