import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createBlog,
  deleteBlog,
  getAllBlogList,
  getBlogListUserWise,
  likedBy,
  commentedBy,
  updateBlog,
  getBlogDetails,
  createCategory,
  getCategoryList,
  getBlogListByCategory,
  latestBlog
} from "../controllers/blog.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router
  .route("/createBlog")
  .post(
    verifyJWT,
    upload.fields([{ name: "blogImage", maxCount: 1 }]),
    createBlog
  );
  
router.route("/blogList").post(verifyJWT,getAllBlogList);
router.route("/blogUserWiseList").get(verifyJWT, getBlogListUserWise);
router.route("/deleteBlog/:id").delete(verifyJWT, deleteBlog);
router.route("/liked/:id").put(verifyJWT, likedBy);
router.route("/commented/:id").put(verifyJWT, commentedBy);
router.route("/updateBlog/:id").patch(verifyJWT, updateBlog);
router.route("/blogDetails/:id").get(getBlogDetails);
router.route("/createCategory").post(verifyJWT, createCategory);
router.route("/getCategoryList").get(getCategoryList);
router.route("/getBlogListByCategory/:id").get(verifyJWT, getBlogListByCategory);
router.route("/latest-blog").get(latestBlog);

export default router;
