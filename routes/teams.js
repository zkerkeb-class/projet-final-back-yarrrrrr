import express from "express";
import Team from "../schema/team.js";

const router = express.Router();

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Récupérer toutes les équipes
 *     tags: [Teams]
 *     responses:
 *       200:
 *         description: Liste de toutes les équipes
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
    const teams = await Team.find();
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

/**
 * @swagger
 * /api/teams/{userId}:
 *   get:
 *     summary: Récupérer les équipes d'un utilisateur
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: number
 *         required: true
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste des équipes de l'utilisateur
 *       500:
 *         description: Erreur serveur
 */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const teams = await Team.find({ userId: parseInt(userId) });
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Créer une nouvelle équipe
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - generationId
 *               - pokemonTeam
 *             properties:
 *               userId:
 *                 type: number
 *                 description: ID de l'utilisateur
 *               generationId:
 *                 type: number
 *                 description: ID de la génération
 *               pokemonTeam:
 *                 type: array
 *                 description: Array des pokémons dans l'équipe
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Équipe créée avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post("/", async (req, res) => {
  try {
    const { userId, generationId, pokemonTeam } = req.body;

    // Validation
    if (!generationId || !pokemonTeam || pokemonTeam.length === 0) {
      return res.status(400).json({
        message: "Les champs générés et pokemonTeam sont requis",
      });
    }

    // Pour cette implémentation, on utilise un userId par défaut (1)
    // À adapter avec le système d'authentification
    const newTeam = new Team({
      userId: userId || 1,
      generationId: parseInt(generationId),
      pokemonTeam,
    });

    await newTeam.save();
    res.status(201).json({
      message: "Équipe créée avec succès",
      team: newTeam,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

/**
 * @swagger
 * /api/teams/{id}:
 *   put:
 *     summary: Mettre à jour une équipe
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'équipe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pokemonTeam:
 *                 type: array
 *     responses:
 *       200:
 *         description: Équipe mise à jour avec succès
 *       404:
 *         description: Équipe non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { pokemonTeam } = req.body;

    const team = await Team.findByIdAndUpdate(
      id,
      { pokemonTeam },
      { new: true },
    );

    if (!team) {
      return res.status(404).json({ message: "Équipe non trouvée" });
    }

    res.status(200).json({
      message: "Équipe mise à jour avec succès",
      team,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

/**
 * @swagger
 * /api/teams/{id}:
 *   delete:
 *     summary: Supprimer une équipe
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'équipe
 *     responses:
 *       200:
 *         description: Équipe supprimée avec succès
 *       404:
 *         description: Équipe non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findByIdAndDelete(id);

    if (!team) {
      return res.status(404).json({ message: "Équipe non trouvée" });
    }

    res.status(200).json({
      message: "Équipe supprimée avec succès",
      team,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

export default router;
