import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
    },
    generationId: {
      type: Number,
      required: true,
    },
    pokemonTeam: [
      {
        id: {
          type: Number,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        image: {
          type: String,
          required: true,
        },
        types: [String],
        stats: {
          hp: Number,
          attack: Number,
          defense: Number,
          spAtk: Number,
          spDef: Number,
          speed: Number,
        },
        height: Number,
        weight: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Team", teamSchema);
