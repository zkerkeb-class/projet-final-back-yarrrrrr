import express from "express";
import bcrypt from "bcryptjs";
import User from "../schema/user.js";

const router = express.Router();

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

    // Connexion réussie
    res.status(200).json({
      message: "Connexion réussie",
      user: {
        id: user._id,
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

export default router;
