import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

// Interface pour TypeScript
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "organizer" | "participant";
}


const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom est obligatoire"],
    },
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Le mot de passe est obligatoire"],
    },
    role: {
      type: String,
      enum: ["admin", "organizer", "participant"],
      default: "participant",
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.pre("save", async function (this: any) {
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error: any) {
    throw error;
  }
});

UserSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
