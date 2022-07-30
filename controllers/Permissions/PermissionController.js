const { BadRequestResponse } = require("express-http-response");
const db = require("../../db");

const changePermissions = async (req, res, next) => {
  const { id } = req.params;
  const { allowRead, allowCreate, allowUpdate, allowDelete } =
    req.body.permissions || req.body;
  if (!allowRead || !allowCreate || !allowUpdate || !allowDelete) {
    return next("Please fill all the fields", 400);
  }
  if (!id) {
    return next("Please provide user id", 400);
  }
  const query = ` UPDATE permissions SET allowRead = '${allowRead}' , allowCreate = '${allowCreate}' , allowUpdate = '${allowUpdate}' , allowDelete = '${allowDelete}' WHERE id = '${id}'`;
  db.query(query, (err, result) => {
    if (err) {
      return next(new BadRequestResponse(err, 400));
    }
    return next(new OkResponse("User permissions updated"));
  });
};
