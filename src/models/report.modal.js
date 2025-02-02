const reportSchema = new Schema(
    {
      reportedBy: { type: Schema.Types.ObjectId, ref: "User" },
      blog: { type: Schema.Types.ObjectId, ref: "Blog" },
      reason: { type: String, required: true },
      resolved: { type: Boolean, default: false },
    },
    { timestamps: true }
  );
  
  export const Report = mongoose.model("Report", reportSchema);
  