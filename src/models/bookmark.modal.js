import mongoose, { Schema } from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
  },
  { timestamps: true }
);

bookmarkSchema.index({ userId: 1, blogId: 1 }, { unique: true });

export const Bookmark = mongoose.model("Bookmark", bookmarkSchema);