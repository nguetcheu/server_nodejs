import { Request, Response } from "express";
import Event from "../models/Event";

export const createEvent = async (req: any, res: Response) => {
  try {
    const { title, description, date, location, capacity, category } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      location,
      capacity,
      category,
      organizer: req.user._id,
    });

    res.status(201).json(event);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find().populate("organizer", "name email");
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEvent = async (req: any, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event)
      return res.status(404).json({ message: "Événement non trouvé" });
    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    await event.deleteOne();
    res.json({ message: "Événement supprimé" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
