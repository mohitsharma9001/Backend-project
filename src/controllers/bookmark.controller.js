import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Blog } from "../models/blog.modal.js";
import { Bookmark } from "../models/bookmark.modal.js";

const toggleBookmark = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const userId = req.user.id;
  const existingBookmark = await Bookmark.findOne({ userId, blogId });
  

  if (existingBookmark) {
    await Bookmark.deleteOne({ userId, blogId });
    // Emit socket event
    req.io.emit("updateBookmark", { blogId, userId });
    return res.status(200).json({ status: 200, message: "Bookmark removed" });
  } else {
    await Bookmark.create({ userId, blogId });

    req.io.emit("updateBookmark", { blogId, userId });
    return res.status(201).json({ status: 201, message: "Bookmark added" });
  }
});

const getBookmarkedBlogs = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const bookmarks = await Bookmark.find({ userId }).populate({
    path: "blogId",
    populate: {
      path: "owner",
      model: "User",
      select: "fullName avatar",
    },
  });
  const bookmarkedBlogs = bookmarks.map((bookmark) => bookmark.blogId);

  res.status(200).json({
    status: 200,
    data: bookmarkedBlogs,
    message: "Bookmarked blogs fetched successfully",
  });
});

export { toggleBookmark, getBookmarkedBlogs };
