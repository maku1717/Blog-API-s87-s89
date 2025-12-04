const express = require("express");
const blogControllers = require("../controllers/blog.js");
const { verify, verifyAdmin } = require("../auth.js");

const router = express.Router();

router.post("/createBlog", verify, blogControllers.createBlog);

router.get("/getAllBlogs", verify, blogControllers.retrieveAllBlog);

router.get("/viewBlogSpecific/:id", verify, blogControllers.viewBlogSpecific);

router.patch("/updateBlog/:id", verify, blogControllers.updateBlog);

router.delete("/deleteBlog/:id", verify, blogControllers.deleteBlog);

router.post("/addComment/:id", verify, blogControllers.addComment);

router.delete("/deleteComment/:id", verify, blogControllers.deleteComment);

router.delete(
  "/:blogId/comments/:commentId",
  verify,
  blogControllers.deleteComment
);

module.exports = router;
