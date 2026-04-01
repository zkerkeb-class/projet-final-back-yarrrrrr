import mongoose from "mongoose";

const poolSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
    },
    generationId: {
      type: Number,
      required: true,
    },
    pokemonPool: [
      {
        id: Number,
        name: String,
        image: String,
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
  { timestamps: true },
);

export default mongoose.model("Pool", poolSchema);
