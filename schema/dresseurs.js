import mongoose from "mongoose";

const dresseurSchema = new mongoose.Schema({
  Id: {
    type: Number,
    required: true,
    unique: true,
  },
  Gen: {
    type: Number,
    required: true,
  },
  Nom: {
    type: String,
    required: true,
  },
  Type: {
    type: String,
    required: true,
  },
  Avatar: {
    type: String,
    required: true,
  },
  Pokemon: [
    {
      Id: {
        type: Number,
        required: true,
      },
      Nom: {
        type: String,
        required: true,
      },
      Niveau: {
        type: Number,
        required: true,
      },
      Type1: {
        type: String,
        required: true,
      },
      Type2: {
        type: String,
        default: null,
      },
      Faiblesse: [
        {
          type: String,
        },
      ],
      Resistance: [
        {
          type: String,
        },
      ],
      Photo: {
        type: String,
        required: true,
      },
    },
  ],
});

export default mongoose.model("Dresseurs", dresseurSchema);
