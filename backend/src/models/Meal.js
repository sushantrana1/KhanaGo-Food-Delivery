import mongoose from "mongoose";

const mealSchema = new mongoose.Schema(
  {
    externalMealId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, default: "" },
    area: { type: String, default: "" },
    image: { type: String, default: "" },
    instructions: { type: String, default: "" },
    ingredients: [{ ingredient: String, measure: String }],
    youtubeUrl: { type: String, default: "" },
    price: { type: Number, default: 450 },
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    discount: { type: Number, default: 0 },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
  },
  { timestamps: true }
);

export default mongoose.model("Meal", mealSchema);
