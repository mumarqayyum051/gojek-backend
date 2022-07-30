const { OkResponse, BadRequestResponse } = require("express-http-response");
const db = require("../../db");

const createPost = (req, res, next) => {
  const { description, postedAt } = req.body.post || req.body;
  if (!description || !postedAt) {
    return next(
      // @ts-ignore
      new BadRequestResponse("Please correctly fill all the fields ", 400),
    );
  }

  const query = `insert into posts (description, postedAt, postedBy) values ('${post.description}', '${post.postedAt}', '${post.postedBy}')`;
  db.query(query, (err, result) => {
    if (err) {
      // @ts-ignore
      return next(new BadRequestResponse(err, 400));
    }
    // @ts-ignore
    return next(new OkResponse("Post has been published successfully", 200));
  });
};

const deletePost = (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(
      // @ts-ignore
      new BadRequestResponse("Please provide a post id", 400),
    );
  }

  const query = `delete from posts where id = ${id}`;
  db.query(query, (err, result) => {
    if (err) {
      // @ts-ignore
      return next(new BadRequestResponse(err, 400));
    }
    // @ts-ignore
    return next(new OkResponse("Post has been deleted successfully", 200));
  });
};

const updatePost = (req, res, next) => {
  const { description, postedAt } = req.body.post || req.body;
  const { id } = req.params;
  if (!description || !postedAt) {
    return next(
      // @ts-ignore
      new BadRequestResponse("Please correctly fill all the fields ", 400),
    );
  }
  if (!id) {
    // @ts-ignore
    return next(new BadRequestResponse("Please provide a post id", 400));
  }

  const query = `update posts set description = '${description}', postedAt = '${postedAt}', updatedBy = '${req.user.id}' where id = ${id}`;
  db.query(query, (err, result) => {
    if (err) {
      // @ts-ignore
      return next(new BadRequestResponse(err, 400));
    }
    // @ts-ignore
    return next(new OkResponse("Post has been updated successfully", 200));
  });
};

const getAllPosts = (req, res, next) => {
  const query = `select * from posts`;
  db.query(query, (err, result) => {
    if (err) {
      // @ts-ignore
      return next(new BadRequestResponse(err, 400));
    }
    // @ts-ignore
    return next(new OkResponse(result, 200));
  });
};
module.exports = {
  createPost,
  deletePost,
  updatePost,
  getAllPosts,
};
