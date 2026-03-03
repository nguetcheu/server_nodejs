import express, { Request, Response } from 'express';
import { protect, adminOnly } from '../middlewares/authMiddleware';
import User from '../models/User';

const router = express.Router();

router.get('/', protect, adminOnly, async (req: any, res: Response) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Supprimer un utilisateur
router.delete('/:id', protect, adminOnly, async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.params.id);
        if (user?.role === 'admin') {
            return res.status(400).json({ message: 'Impossible de supprimer un admin' });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Utilisateur supprimé' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
});

export default router;