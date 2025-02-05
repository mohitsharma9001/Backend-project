import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import { reportBlog, reportList } from "../controllers/report.controller.js";
const router = Router();

router.route("/reportBlog/:id").post(verifyJWT, reportBlog);
router.route("/reportList").get(verifyJWT, reportList);

export default router;
