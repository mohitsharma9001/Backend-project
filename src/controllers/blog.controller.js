import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Blog } from "../models/blog.modal.js";
import { Category } from "../models/category.modal.js";
import { Bookmark } from "../models/bookmark.modal.js";

const createBlog = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;
  const userId = req.user._id;
  if ([title, description, category].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  let blogImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.blogImage) &&
    req.files.blogImage.length > 0
  ) {
    blogImageLocalPath = req.files.blogImage[0].path;
  }
  const blogImage = await uploadOnCloudinary(blogImageLocalPath);

  const existingCategory = await Category.findById(category);
  if (!existingCategory) {
    return res.status(400).json({ message: "Invalid category" });
  }

  const blog = await Blog.create({
    title,
    description,
    category,
    owner: userId,
    blogImage: blogImage?.url || "",
  });

  if (!blog) {
    throw new ApiError(500, "Something went wrong on blog server");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, { blogId: blog._id }, "Blog created successfully")
    );
});

const updateBlog = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user._id;
  const blogId = req.params.id;
  if (!blogId) {
    return res.status(400).json({
      status: 400,
      message: "Blog ID is required.",
    });
  }

  const updateBlog = await Blog.findByIdAndUpdate(
    blogId,
    { $set: { title: title, description: description } },
    { new: true }
  );

  if (!updateBlog) {
    return res.status(404).json({
      status: 404,
      message: "blog not found.",
    });
  }

  return res.status(200).json({
    status: 200,
    data: updateBlog?._id,
    message: "Blog deleted successfully.",
  });
});

const getBlogDetails = asyncHandler(async (req, res) => {
  const blogId = req.params.id;
  if (!blogId) {
    return res.status(400).json({
      status: 400,
      message: "Blog ID is required.",
    });
  }

  const blog = await Blog.findById(blogId)
    .populate("owner", "fullName")
    .populate("commentedBy.user", "fullName avatar");
  if (!blog) {
    return res.status(404).json({
      status: 404,
      message: "Blog not found.",
    });
  }
  blog.commentedBy.sort((a, b) => b.commentedAt - a.commentedAt);
  return res.status(200).json({
    status: 200,
    data: blog,
    message: "Blog retrieved successfully.",
  });
});

const getAllBlogList = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const userId = req.user ? req.user.id : null;
  const query = {};
  if (title) {
    query.title = { $regex: title, $options: "i" };
  }
  const [blogs, totalCount] = await Promise.all([
    Blog.find(query).populate("owner", "fullName username avatar"),
    Blog.countDocuments(query),
  ]);

  let updatedBlogs = blogs.map((blog) => blog.toObject());
  if (userId) {
    const bookmarkedBlogs = await Bookmark.find({ userId });
    const bookmarkedIds = bookmarkedBlogs.map((bookmark) =>
      bookmark.blogId.toString()
    );

    updatedBlogs = updatedBlogs.map((blog) => ({
      ...blog,
      isBookmarked: bookmarkedIds.includes(blog._id.toString()),
    }));
  }

  return res.status(200).json({
    status: 200,
    data: updatedBlogs,
    totalCount,
    message: "Blog list fetched successfully",
  });
});

const getBlogListUserWise = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(401).json({
      status: 401,
      message: "Unauthorized access. Please log in.",
    });
  }

  const [Blogs, totalCount] = await Promise.all([
    Blog.find({ owner: userId }).populate("owner", "fullName email avatar"),
    Blog.countDocuments({ owner: userId }),
  ]);

  // const transformBlogData = Blogs.map((blog) => {
  //   const { owner, ...blogData } = blog.toObject();
  //   return {
  //     ...blogData,
  //     fullName: owner.fullName,
  //     email: owner?.email,
  //     avatar: owner?.avatar,
  //   };
  // });

  return res.status(200).json({
    status: 200,
    data: Blogs,
    totalCount: totalCount,
    message: "Blog list fetched successfully",
  });
});

const deleteBlog = asyncHandler(async (req, res) => {
  const blogId = req.params.id;
  if (!blogId) {
    return res.status(400).json({
      status: 400,
      message: "Blog ID is required.",
    });
  }

  const blog = await Blog.findByIdAndDelete(blogId);

  if (!blog) {
    return res.status(404).json({
      status: 404,
      message: "blog not found.",
    });
  }

  return res.status(200).json({
    status: 200,
    message: "Blog deleted successfully.",
  });
});

const likedBy = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const blogId = req.params.id;
  const blog = await Blog.findById(blogId);

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }
  const isLiked = blog.likeBy.includes(userId);

  if (isLiked) {
    blog.likeBy = blog.likeBy.filter(
      (id) => id.toString() !== userId.toString()
    );
    blog.likeCount -= 1;
  } else {
    blog.likeBy.push(userId);
    blog.likeCount += 1;
  }
  await blog.save();

  res.status(200).json({
    success: true,
    message: isLiked ? "Blog unliked successfully" : "Blog liked successfully",
    likeCount: blog.likeBy?.length,
  });
});

const commentedBy = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const blogId = req.params.id;
  const { comment } = req.body;
  const blog = await Blog.findById(blogId);

  if (!comment) {
    res.status(400);
    throw new Error("Comment text is required");
  }

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  const newComment = {
    user: userId,
    comment: comment,
    commentedAt: new Date(),
  };

  blog.commentedBy.push(newComment);

  await blog.save();

  res.status(201).json({
    success: true,
    message: "Comment added successfully",
    comments: blog.commentedBy,
  });
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({
      status: 400,
      message: "Category name is required.",
    });
  }

  const category = await Category.create({ name, description });

  if (category) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { categoryId: category._id },
          "Blog created successfully"
        )
      );
  }
});

const getCategoryList = asyncHandler(async (req, res) => {
  const category = await Category.find();
  return res.status(200).json({
    status: 200,
    data: category,
    message: "Blog list fetched successfully",
  });
});

const getBlogListByCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;
  const existingCategory = await Category.findById(categoryId);
  if (!existingCategory) {
    return res.status(400).json({ message: "Invalid category" });
  }
  const blogs = await Blog.find({ category: categoryId })
    .populate("owner", "name email")
    .populate("category", "name");

  return res.status(200).json({ message: "Blogs fetched successfully", blogs });
});

const latestBlog = asyncHandler(async (req, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("owner", "fullName")
      .populate("category", "name");

    res.status(200).json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
});

export {
  createBlog,
  getAllBlogList,
  getBlogListUserWise,
  deleteBlog,
  commentedBy,
  likedBy,
  updateBlog,
  getBlogDetails,
  createCategory,
  getCategoryList,
  getBlogListByCategory,
  latestBlog,
};
// kafka, rabbitmq
