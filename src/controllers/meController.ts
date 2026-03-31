// controllers/meController.ts
import { Response } from "express";
import User from "../models/User";
import Event from "../models/Event"; // Import crucial pour la désinscription
import crypto from "crypto";

// 1. Droit d'accès : Récupérer ses données
export const getMyProfile = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 2. Droit de rectification : Modifier ses données
export const updateMyProfile = async (req: any, res: Response) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findById(req.user._id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    if (name) user.name = name;
    if (email) user.email = email;
    user.phone = phone;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
    });
  } catch (error: any) {
    if (error.code === 11000)
      return res.status(400).json({ message: "Email déjà utilisé" });
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
};

// 3. Droit à l'effacement : Anonymisation + Nettoyage des événements
export const anonymizeMe = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;

    // A. Désinscription de tous les événements (champ 'attendees')
    await Event.updateMany(
      { attendees: userId },
      { $pull: { attendees: userId } },
    );

    // B. Anonymisation du profil utilisateur
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    user.name = "Utilisateur_Anonyme_" + crypto.randomBytes(3).toString("hex");
    user.email = `anon_${userId}@eventflow.com`;
    user.password = crypto.randomBytes(32).toString("hex"); // Invalide le compte
    user.phone = undefined;
    user.isAnonymized = true;

    await user.save();
    res.json({ message: "Compte anonymisé et désinscrit avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'anonymisation" });
  }
};
