import mongoose from "mongoose";

const platformSchema = new mongoose.Schema(
  {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: { 
        type: String, 
        required: true, 
        trim : true
    },
    totalSolved: { 
        type: Number, 
        default: 0 
    },
    problems: {
        easy: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        hard: { type: Number, default: 0 },
    },
    topics: [String],
    url: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true }
);

export const Platform = mongoose.model("Platform", platformSchema);
