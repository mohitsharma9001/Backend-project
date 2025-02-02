const notificationSchema = new Schema(
    {
      user: { type: Schema.Types.ObjectId, ref: "User" }, // Receiver of the notification
      message: { type: String, required: true },
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
  );
  
  export const Notification = mongoose.model("Notification", notificationSchema);
  