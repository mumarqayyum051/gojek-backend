const { OkResponse, BadRequestResponse } = require("express-http-response");
const db = require("../../db");
const moment = require("moment");
const createPost = (req, res, next) => {
  let { description } = req.body.post || req.body;
  try {
    if (!description) {
      return next(
        // @ts-ignore
        new BadRequestResponse("Please correctly fill all the fields ", 400),
      );
    }

    const postedAt = moment().format("YYYY-MM-DD HH:mm:ss");

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
  console.log("trigger delete");
  const { id } = req.params;
  if (!id) {
    return next(
      // @ts-ignore
      new BadRequestResponse("Please provide a post id", 400),
    );
  }

  let isAllowed = false;
  const post = `select * from posts where id = ${id}`;
  db.query(post, (err, result) => {
    if (err) {
      // @ts-ignore
      return next(new BadRequestResponse(err, 400));
    }

    const deletePost = () => {
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
    console.log(result[0].postedBy == req.authorizedUser.id);
    console.log(result[0].postedBy, req.authorizedUser.id);
    if (result.length === 0) {
      return next(
        // @ts-ignore
        new BadRequestResponse("Post not found", 400),
      );
    }
    if (result[0].postedBy == req.authorizedUser.id) {
      deletePost();
    } else if (req.authorizedUser.allowDelete == 1) {
      deletePost();
    } else {
      return next(
        // @ts-ignore
        new BadRequestResponse(
          "You are not allowed to perform this action",
          401,
        ),
      );
    }
  });
};

const updatePost = (req, res, next) => {
  let { description } = req.body.post || req.body;
  const { id } = req.params;
  if (!description) {
    return next(
      // @ts-ignore
      new BadRequestResponse("Please correctly fill all the fields ", 400),
    );
  }
  if (!id) {
    // @ts-ignore
    return next(new BadRequestResponse("Please provide a post id", 400));
  }

  const post = `select * from posts where id = ${id}`;
  db.query(post, (err, result) => {
    if (err) {
      // @ts-ignore
      return next(new BadRequestResponse(err, 400));
    }
    if (result.length === 0) {
      return next(
        // @ts-ignore
        new BadRequestResponse("Post not found", 400),
      );
    }
    const updatePost = () => {
      description = description.replace(/'/g, "\\'");
      const query = `update posts set description = '${description}' where id = ${id}`;
      db.query(query, (err, result) => {
        if (err) {
          // @ts-ignore
          return next(new BadRequestResponse(err, 400));
        }
        // @ts-ignore
        const updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

        description = description.replace(/'/g, "\\'");

        const query = `update posts set description = '${description}', updatedAt = '${updatedAt}', updatedBy = '${req.authorizedUser.userId}' where id = ${id}`;
        db.query(query, (err, result) => {
          if (err) {
            // @ts-ignore
            return next(new BadRequestResponse(err, 400));
          }
          // @ts-ignore
          return next(
            new OkResponse("Post has been updated successfully", 200),
          );
        });
      });
    };
    if (result[0].postedBy === req.authorizedUser.id) {
      updatePost();
    } else if (req.authorizedUser.allowUpdate == 1) {
      updatePost();
    } else {
      return next(
        // @ts-ignore
        new BadRequestResponse(
          "You are not allowed to perform this action",
          401,
        ),
      );
    }
  });
};

const getAllPosts = (req, res, next) => {
  try {
    let query = "";
    if (req.authorizedUser.allowRead == 1) {
      query = `select * from posts`;
    }
    if (req.authorizedUser.allowRead == 0) {
      query = `select * from posts where postedBy = '${req.authorizedUser.userId}'`;
    }
    db.query(query, (err, result) => {
      if (err) {
        // @ts-ignore
        return next(new BadRequestResponse(err, 400));
      }
      // @ts-ignore
      return next(new OkResponse(result, 200));
    });
  } catch (e) {
    console.log(e);
  }
};
module.exports = {
  createPost,
  deletePost,
  updatePost,
  getAllPosts,
};
