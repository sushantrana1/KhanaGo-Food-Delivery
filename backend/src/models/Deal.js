import mongoose from "mongoose";

const dealSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a deal title"],
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  meal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Meal",
    required: true,
  },
  discountPercentage: {
    type: Number,
    required: [true, "Please add discount percentage"],
    min: 1,
    max: 100,
  },
  originalPrice: {
    type: Number,
    required: true,
  },
  dealPrice: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  maxClaims: {
    type: Number,
    default: 100,
  },
  claimedCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  image: {
    type: String,
    default: "",
  },
  badge: {
    type: String,
    default: "Hot Deal",
  },
}, {
  timestamps: true,
});

dealSchema.index({ meal: 1, isActive: 1 });
dealSchema.index({ endDate: 1 });

export default mongoose.model("Deal", dealSchema);
