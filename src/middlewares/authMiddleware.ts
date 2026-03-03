import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded: any = jwt.verify(
        token,
        process.env.JWT_SECRET || "secret_par_defaut",
      );

      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res
        .status(401)
        .json({ message: "Session expirée, veuillez vous reconnecter" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Accès refusé, aucun token fourni" });
  }
};

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Accès refusé : Droits administrateur requis" });
  }
};

export const isOrganizer = (req: any, res: Response, next: NextFunction) => {
  if (
    req.user &&
    (req.user.role === "organizer" || req.user.role === "admin")
  ) {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Accès refusé : Rôle Organisateur requis" });
  }
};
