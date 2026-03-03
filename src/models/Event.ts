import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  location: string;
  category: string;
  organizer: mongoose.Types.ObjectId;
  attendees: mongoose.Types.ObjectId[];
  capacity: number;
}

const EventSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Le titre est obligatoire"],
    },
    description: {
      type: String,
      required: [true, "La description est obligatoire"],
    },
    date: {
      type: Date,
      required: [true, "La date est obligatoire"],
    },
    location: {
      type: String,
      required: [true, "Le lieu est obligatoire"],
    },
    category: {
      type: String,
      default: "Général",
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    capacity: {
      type: Number,
      required: [true, "La capacité est obligatoire"],
    },
  },
  { timestamps: true },
);

export default mongoose.model<IEvent>("Event", EventSchema);
