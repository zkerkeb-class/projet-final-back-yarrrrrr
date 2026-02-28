import mongoose from "mongoose";

const userStateSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
      unique: true,
    },
    rollsLeft: {
      type: Number,
      default: 2,
    },
  },
  { timestamps: true },
);

export default mongoose.model("UserState", userStateSchema);
