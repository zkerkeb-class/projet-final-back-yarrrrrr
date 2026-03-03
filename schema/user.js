import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  niveau: {
    type: Number,
    required: true,
  },
  photoProfil: {
    type: [String],
    required: true,
  },
});

export default mongoose.model("User", userSchema);
