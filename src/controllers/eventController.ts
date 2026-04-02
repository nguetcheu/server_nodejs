import { Request, Response } from "express";
import Event from "../models/Event";

export const registerToEvent = async (req: any, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    const userId = req.user._id;

    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }

    const isAlreadyAttendee = event.attendees.includes(userId);
    const isAlreadyWaiting = event.waitingList?.includes(userId);

    if (isAlreadyAttendee || isAlreadyWaiting) {
      return res.status(400).json({ message: "Vous êtes déjà sur la liste de cet événement" });
    }

    const conflictingEvent = await Event.findOne({
      _id: { $ne: event._id },
      attendees: userId,       
      date: event.date         
    });

    if (conflictingEvent) {
      return res.status(400).json({ 
        message: `Conflit d'agenda : Vous êtes déjà inscrit à l'événement "${conflictingEvent.title}" à cette date.` 
      });
    }

    if (event.attendees.length < event.capacity) {
      // Il reste de la place
      event.attendees.push(userId);
      await event.save();
      return res.json({ 
        message: "Inscription réussie !", 
        status: "registered",
        attendeesCount: event.attendees.length 
      });
    } else {
      if (!event.waitingList) event.waitingList = [];
      event.waitingList.push(userId);
      await event.save();
      return res.json({ 
        message: "Événement complet. Vous avez été ajouté à la file d'attente.", 
        status: "waiting" 
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const unregisterFromEvent = async (req: any, res: Response) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Événement non trouvé" });

    const wasAttendee = event.attendees.includes(userId);

    event.attendees = event.attendees.filter(id => id.toString() !== userId.toString());
    event.waitingList = event.waitingList?.filter(id => id.toString() !== userId.toString());

    if (wasAttendee && event.waitingList && event.waitingList.length > 0) {
      const nextUser = event.waitingList.shift();
      if (nextUser) {
        event.attendees.push(nextUser);
      }
    }

    await event.save();
    res.json({ message: "Vous avez été retiré de l'événement." });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const exportAttendeesCSV = async (req: any, res: Response) => {
  try {
    const event = await Event.findById(req.params.id).populate("attendees", "name email");
    if (!event) return res.status(404).json({ message: "Événement non trouvé" });

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    const header = "Nom,Email\n";
    const rows = event.attendees.map((user: any) => `${user.name},${user.email}`).join("\n");
    const csvContent = header + rows;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=participants-${event.title.replace(/\s+/g, "_")}.csv`);
    res.status(200).send(csvContent);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createEvent = async (req: any, res: Response) => {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user._id });
    res.status(201).json(event);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateEvent = async (req: any, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Événement non trouvé" });

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(updatedEvent);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id).populate("organizer", "name");
    if (!event) return res.status(404).json({ message: "Événement non trouvé" });
    res.json(event);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find()
      .populate("organizer", "name email")
      .populate("attendees", "name email");
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEvent = async (req: any, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Événement non trouvé" });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Non autorisé" });
    }
    await event.deleteOne();
    res.json({ message: "Événement supprimé" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};