import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../schema/user.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const TOKEN_EXPIRATION = "2h";

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Liste de tous les utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Erreur serveur
 */
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - genre
 *               - photoIndex
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               genre:
 *                 type: string
 *                 example: "autre"
 *               photoIndex:
 *                 type: number
 *                 example: 1
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: string
 *       400:
 *         description: Username déjà existant ou données manquantes
 *       500:
 *         description: Erreur serveur
 */
router.post("/register", async (req, res) => {
  try {
    const { username, password, genre, photoIndex } = req.body;

    // Validation des champs requis
    if (!username || !password || !genre || photoIndex === undefined) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username déjà existant" });
    }

    // Générer l'ID (auto-increment)
    const lastUser = await User.findOne().sort({ id: -1 });
    const newId = lastUser ? lastUser.id + 1 : 1;

    // Hasher le password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer la photo URL
    const photoUrl = `http://localhost:3001/assets/avatar/${photoIndex}.png`;

    // Créer le nouvel utilisateur
    const newUser = new User({
      id: newId,
      username,
      password: hashedPassword,
      genre,
      niveau: 1,
      photoProfil: [photoUrl],
    });

    await newUser.save();

    const token = jwt.sign(
      {
        userId: newUser.id,
        username: newUser.username,
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRATION },
    );

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      userId: newUser._id,
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        genre: newUser.genre,
        niveau: newUser.niveau,
        photoProfil: newUser.photoProfil,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

/**
 * @swagger
 * /api/users/{username}:
 *   get:
 *     summary: Récupérer un utilisateur par username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

/**
 * @swagger
 * /api/users/{username}:
 *   put:
 *     summary: Mettre à jour un utilisateur par username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *               genre:
 *                 type: string
 *               niveau:
 *                 type: number
 *               photoProfil:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { password, ...updateData } = req.body;

    // Chercher l'utilisateur actuel
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Si un nouveau password est fourni
    if (password && password.trim()) {
      // Vérifier que le nouveau password n'est pas identique à l'ancien (via hash)
      const sameAsOld = await bcrypt.compare(password, user.password);
      if (sameAsOld) {
        return res.status(400).json({
          message: "Le nouveau password ne peut pas être identique à l'ancien",
        });
      }

      // Hasher le nouveau password
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await User.findOneAndUpdate({ username }, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Utilisateur mis à jour avec succès",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

/**
 * @swagger
 * /api/users/{username}:
 *   delete:
 *     summary: Supprimer un utilisateur par username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete("/:username", async (req, res) => {
  try {
    const { username } = req.params;

    // Chercher et supprimer l'utilisateur
    const user = await User.findOneAndDelete({ username });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({
      message: "Utilisateur supprimé avec succès",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

export default router;
