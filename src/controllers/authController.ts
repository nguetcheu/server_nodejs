import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

const generateToken = (id: any) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret_par_defaut", {
    expiresIn: "30d",
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone, acceptRGPD } = req.body;

    if (!acceptRGPD) {
      return res.status(400).json({ 
        message: "Vous devez accepter la politique de confidentialité pour créer un compte." 
      });
    }

    if (role === "admin") {
      return res.status(403).json({ 
        message: "Action non autorisée. Vous ne pouvez pas créer un compte administrateur." 
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    const user = await User.create({ 
      name, 
      email, 
      password, 
      role,
      phone,
      consent: { accepted: true, date: new Date() } 
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id), 
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (user as any).isAnonymized) {
      res.status(401).json({ message: "Ce compte a été supprimé ou anonymisé." });
      return;
    }

    if (user && (await (user as any).comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }
  } catch (error: any) {
    res.status(500).json({ message: "Erreur serveur lors de la connexion" });
  }
};

export const seedAdmin = async () => {
  try {
    const adminEmail = "admin@eventflow.com";
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      await User.create({
        name: "Admin Principal",
        email: adminEmail,
        password: "AdminPassword123!", 
        role: "admin",
      });
      console.log("👤 [Seed] Admin par défaut créé : admin@eventflow.com / AdminPassword123!");
    }
  } catch (error) {
    console.error("❌ Erreur lors du seeding de l'admin:", error);
  }
};