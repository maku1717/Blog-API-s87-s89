const Blog = require("../models/Blog.js");
const { errorHandler } = require("../auth.js");

module.exports.createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).send({ message: "All fields are required" });
    }

    const newBlog = new Blog({
      title: title,
      content: content,
      author: req.user.userName,
    });

    await newBlog.save();
    return res.status(201).send({ message: "New Blog Created", newBlog });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

module.exports.retrieveAllBlog = async (req, res) => {
  try {
    const allBlogs = await Blog.find({});

    if (!allBlogs) {
      return res.status(404).send({ message: "No Blog Posted" });
    }

    return res.status(200).send({ message: "All blogs posted", allBlogs });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

module.exports.updateBlog = async (req, res) => {
  try {
    const blogId = req.params.id;

    const newUpdateBlog = {
      title: req.body.title,
      content: req.body.content,
    };

    if (!newUpdateBlog) {
      return res.status(400).send({ message: "All fields are required" });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(blogId, newUpdateBlog, {
      new: true,
    });

    return res
      .status(200)
      .send({ message: "Updated blog posted", updatedBlog });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

module.exports.deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).send({ message: "Blog not found" });
    }

    if (req.user.isAdmin || blog.author === req.user.userName) {
      await Blog.findByIdAndDelete(blogId);
      return res.status(200).send({ message: "Blog deleted successfully" });
    } else {
      return res.status(404).send({ message: "Action Forbidden" });
    }
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

module.exports.addComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const blogId = req.params.id;
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).send({ message: "Blog not found" });
    }

    blog.comments.push({
      userId: userId,
      author: req.user.userName,
      comment: req.body.comment,
    });

    await blog.save();
    return res.status(200).send({ message: "comment added successfully" });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

module.exports.deleteComment = async (req, res) => {
  try {
    const blogId = req.params.blogId;
    const commentId = req.params.commentId;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).send({ message: "Blog not found" });
    }

    const comment = blog.comments.id(commentId);
    if (!comment) {
      return res.status(404).send({ message: "Comment not found" });
    }

    if (comment.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).send({
        message: "You are not allowed to delete this comment",
      });
    }

    blog.comments.pull(commentId);
    await blog.save();

    return res.status(200).send({ message: "Comment deleted successfully" });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

module.exports.viewBlogSpecific = async (req, res) => {
  try {
    const blogId = req.params.id;
    const viewBlog = await Blog.findById(blogId);

    if (!viewBlog) {
      return res.status(404).send({ message: "Blog not found" });
    }
    return res.status(200).send(viewBlog);
  } catch (error) {
    return errorHandler(error, req, res);
  }
};
