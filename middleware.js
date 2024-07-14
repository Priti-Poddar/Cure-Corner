const Medicine = require("./models/medicine");
const { medicineSchema, } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    //redirectUrl save
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged in to create listing!");
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

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let medicine = await Medicine.findById(id);
  if (!medicine.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this Listing");
    return res.redirect(`/medicine/${id}`);
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



