import mongoose, { Schema } from "mongoose";

const blogSchema = new Schema(
  {
    blogImage: {
      type: String,
    },
    title: {
      type: String,
      require: true,
    },
    description: {
      type: String,
      require: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    likeBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    commentedBy: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        comment: {
          type: String,
          required: true,
        },
        commentedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

  },
  { timestamps: true }
);

export const Blog = mongoose.model("Blog", blogSchema);
