const { OkResponse, BadRequestResponse } = require("express-http-response");
const db = require("../../db");

const createPost = (req, res, next) => {
  let { description, postedAt } = req.body.post || req.body;
  try {
    if (!description || !postedAt) {
      return next(
        // @ts-ignore
        new BadRequestResponse("Please correctly fill all the fields ", 400),
      );
    }

    description = description.replace(/'/g, "\\'");
    const query = `insert into posts (description, postedAt, postedBy) values ('${description}', '${postedAt}', '${req.authorizedUser.userId}')`;
    db.query(query, (err, result) => {
      if (err) {
        // @ts-ignore
        return next(new BadRequestResponse(err, 400));
      }
      // @ts-ignore
      return next(new OkResponse("Post has been published successfully", 200));
    });
  } catch (e) {
    console.log(e);
  }
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
  let { description, updatedAt } = req.body.post || req.body;
  const { id } = req.params;
  if (!description || !updatedAt) {
    return next(
      // @ts-ignore
      new BadRequestResponse("Please correctly fill all the fields ", 400),
    );
  }
  if (!id) {
    // @ts-ignore
    return next(new BadRequestResponse("Please provide a post id", 400));
  }

  description = description.replace(/'/g, "\\'");

  const query = `update posts set description = '${description}', updatedAt = '${updatedAt}', updatedBy = '${req.authorizedUser.userId}' where id = ${id}`;
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
