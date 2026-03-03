import express from "express";
import Dresseur from "../schema/dresseurs.js";

const router = express.Router();

/**
 * @swagger
 * /api/dresseurs:
 *   get:
 *     summary: Récupérer tous les dresseurs
 *     tags: [Dresseurs]
 *     responses:
 *       200:
 *         description: Liste de tous les dresseurs
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
    const dresseurs = await Dresseur.find();
    res.status(200).json(dresseurs);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

/**
 * @swagger
 * /api/dresseurs/gen/{genNumber}:
 *   get:
 *     summary: Récupérer les dresseurs d'une génération spécifique
 *     tags: [Dresseurs]
 *     parameters:
 *       - in: path
 *         name: genNumber
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numéro de la génération (1-5)
 *     responses:
 *       200:
 *         description: Liste des 5 dresseurs de la génération avec leurs pokémons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Id:
 *                     type: number
 *                   Gen:
 *                     type: number
 *                   Nom:
 *                     type: string
 *                   Type:
 *                     type: string
 *                   Avatar:
 *                     type: string
 *                   Pokemon:
 *                     type: array
 *                     items:
 *                       type: object
 *       400:
 *         description: Numéro de génération invalide
 *       404:
 *         description: Aucun dresseur trouvé pour cette génération
 *       500:
 *         description: Erreur serveur
 */
router.get("/gen/:genNumber", async (req, res) => {
  try {
    const genNumber = parseInt(req.params.genNumber);

    // Validation du numéro de génération
    if (isNaN(genNumber) || genNumber < 1 || genNumber > 5) {
      return res.status(400).json({
        message:
          "Numéro de génération invalide. Veuillez fournir un nombre entre 1 et 5.",
      });
    }

    // Récupérer les dresseurs de la génération spécifiée
    const dresseurs = await Dresseur.find({ Gen: genNumber });

    if (!dresseurs || dresseurs.length === 0) {
      return res.status(404).json({
        message: `Aucun dresseur trouvé pour la génération ${genNumber}`,
      });
    }

    res.status(200).json(dresseurs);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

/**
 * @swagger
 * /api/dresseurs/{id}:
 *   get:
 *     summary: Récupérer un dresseur par son ID
 *     tags: [Dresseurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du dresseur
 *     responses:
 *       200:
 *         description: Détails du dresseur avec ses pokémons
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Dresseur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const dresseur = await Dresseur.findOne({ Id: id });

    if (!dresseur) {
      return res.status(404).json({ message: "Dresseur non trouvé" });
    }

    res.status(200).json(dresseur);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

export default router;
