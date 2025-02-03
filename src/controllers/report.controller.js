import { Blog } from "../models/blog.modal.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Report } from "../models/report.modal.js";

const reportBlog = asyncHandler(async (req, res) => {
  const blogId = req.params.id;
  const { reason } = req.body;
  const userId = req.user.id;
  if (!blogId) {
    throw new ApiError(400, "Blog id is required");
  }
  if (!reason) {
    throw new ApiError(400, "Reason is required");
  }

  const findBlog = await Blog.findById(blogId);
  if (!findBlog) {
    throw new ApiError(400, "Blog Not Found");
  }
  const report = await Report.create({
    reportedBy: userId,
    blog: blogId,
    reason,
    resolved: false,
  });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { reportId: report._id },
        "Blog reported successfully"
      )
    );
});

const reportList = asyncHandler(async (req, res) => {
  const blogList = await Report.find();
  return res.status(200).json({
    status: 200,
    data: blogList,
    message: "Report list fetched successfully",
  });
});

export { reportBlog, reportList };
