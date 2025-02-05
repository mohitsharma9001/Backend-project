import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import {
  toggleBookmark,
  getBookmarkedBlogs,
} from "../controllers/bookmark.controller.js";
const router = Router();


router.route("/bookmark/:blogId").post(verifyJWT, toggleBookmark);
router.route("/bookmarked").get(verifyJWT, getBookmarkedBlogs);


export default router;
