// controllers/meController.ts
import { Response } from "express";
import User from "../models/User";
import crypto from "crypto";

// GET /api/me : Droit d'accès
export const getMyProfile = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// PUT /api/me : Droit de rectification (Modifier ses données)
export const updateMyProfile = async (req: any, res: Response) => {
  try {
    const { name, email, phone } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    if (name) user.name = name;
    if (email) user.email = email;
    user.phone = phone;

    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Cet email est déjà utilisé par un autre compte." });
    }
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
};

// DELETE /api/me : Droit à l'effacement (Anonymisation)
export const anonymizeMe = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    user.name = "Utilisateur_Anonyme_" + crypto.randomBytes(3).toString("hex");
    user.email = `anon_${user._id}@eventflow.com`;
    user.password = crypto.randomBytes(32).toString("hex"); // Rend la reconnexion impossible
    user.phone = undefined;
    user.isAnonymized = true;

    await user.save();
    res.json({ message: "Compte anonymisé avec succès conformément au RGPD." });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'anonymisation" });
  }
};