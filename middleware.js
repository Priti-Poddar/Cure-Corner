const Medicine = require("./models/medicine");
const { medicineSchema, doctorSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    //redirectUrl save
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you need to login first!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isAdmin = async (req, res, next) => {
  // let medicine = await Medicine.findById(id);
  // console.log(res.locals.currUser.username);
  if (res.locals.currUser.username !== "Admin") {
    req.flash("error", "You are not Admin");
    return res.redirect("/");
  }
  next();
};


module.exports.validateMedicine = (req, res, next) => {
  let { error } = medicineSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateDoctor = (req, res, next) => {
  let { error } = doctorSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};


