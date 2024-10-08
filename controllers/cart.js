const Cart = require("../models/cart");
const Address = require("../models/address");
const Medicine = require("../models/medicine");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.renderCartPage = async (req, res) => {
  try {
    // find the cart, whether in session or in db based on the user state
    let cart_user;
    let Add;

    if (req.user) {
      cart_user = await Cart.findOne({ user: req.user._id });
      Add = await Address.findOne({ user: req.user._id });
    }
    // if user is signed in and has cart, load user's cart from the db
    if (req.user && cart_user) {
      req.session.cart = cart_user;
      // console.log(cart_user);
      return res.render("users/cart.ejs", {
        user: req.user,
        cart: cart_user,
        products: await productsFromCart(cart_user),
        userAdd: Add,
        page: "Cart",
      });
    }

    // if there is no cart in session and user is not logged in, cart is empty
    if (!req.session.cart) {
      return res.render("users/cart.ejs", {
        user: req.user,
        cart: null,
        products: null,
        userAdd: Add,
        page: "Cart",
      });
    }
    // otherwise, load the session's cart

    return res.render("users/cart.ejs", {
      user: req.user,
      cart: req.session.cart,
      products: await productsFromCart(req.session.cart),
      userAdd: Add,
      page: "Cart",
    });
  } catch (err) {
    console.log(err.message);
    res.redirect("/medicines");
  }
};

// create products array to store the info of each product in the cart
async function productsFromCart(cart) {
  let products = []; // array of objects
  for (const item of cart.items) {
    let foundProduct = await Medicine.findById(item.productId).populate(
      "category"
    );
    foundProduct["qty"] = item.qty;
    foundProduct["totalPrice"] = item.price;
    products.push(foundProduct);
  }
  return products;
}

module.exports.increaseItem = async (req, res) => {
  const productId = req.params.id;
  try {
    // get the correct cart, either from the db, session, or an empty cart.
    let user_cart;
    if (req.user) {
      user_cart = await Cart.findOne({ user: req.user._id });
    }
    let cart;
    if (
      (req.user && !user_cart && req.session.cart) ||
      (!req.user && req.session.cart)
    ) {
      cart = await new Cart(req.session.cart);
    } else if (!req.user || !user_cart) {
      cart = new Cart({});
    } else {
      cart = user_cart;
    }

    // add the product to the cart
    const product = await Medicine.findById(productId);
    const itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      // if product exists in the cart, update the quantity
      cart.items[itemIndex].qty++;
      cart.items[itemIndex].price = cart.items[itemIndex].qty * product.price;
      cart.totalQty++;
      cart.totalCost += product.price;
    } else {
      // if product does not exists in cart, find it in the db to retrieve its price and add new item
      cart.items.push({
        productId: productId,
        qty: 1,
        price: product.price,
        title: product.title,
      });
      cart.totalQty++;
      cart.totalCost += product.price;
    }

    // if the user is logged in, store the user's id and save cart to the db
    if (req.user) {
      cart.user = req.user._id;
      await cart.save();
    }
    req.session.cart = cart;
    // console.log(cart);
    req.flash("success", "Item added to the cart");
    res.redirect(req.headers.referer);
  } catch (err) {
    console.log(err.message);
    res.redirect("/medicines");
  }
};

module.exports.decreaseItem = async function (req, res, next) {
  // if a user is logged in, reduce from the user's cart and save
  // else reduce from the session's cart
  const productId = req.params.id;
  let cart;
  try {
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else if (req.session.cart) {
      cart = await new Cart(req.session.cart);
    }

    // find the item with productId
    let itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      // find the product to find its price
      const product = await Medicine.findById(productId);
      // if product is found, reduce its qty
      cart.items[itemIndex].qty--;
      cart.items[itemIndex].price -= product.price;
      cart.totalQty--;
      cart.totalCost -= product.price;
      // if the item's qty reaches 0, remove it from the cart
      if (cart.items[itemIndex].qty <= 0) {
        await cart.items.remove({ _id: cart.items[itemIndex]._id });
      }
      req.session.cart = cart;
      //save the cart it only if user is logged in
      if (req.user) {
        await cart.save();
      }
      //delete cart if qty is 0
      if (cart.totalQty <= 0) {
        req.session.cart = null;
        await Cart.findByIdAndDelete(cart._id);
      }
    }
    res.redirect(req.headers.referer);
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
};

module.exports.removeAll = async function (req, res, next) {
  const productId = req.params.id;
  let cart;
  try {
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else if (req.session.cart) {
      cart = await new Cart(req.session.cart);
    }
    //fnd the item with productId
    let itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      //find the product to find its price
      cart.totalQty -= cart.items[itemIndex].qty;
      cart.totalCost -= cart.items[itemIndex].price;
      await cart.items.remove({ _id: cart.items[itemIndex]._id });
    }
    req.session.cart = cart;
    //save the cart it only if user is logged in
    if (req.user) {
      await cart.save();
    }
    //delete cart if qty is 0
    if (cart.totalQty <= 0) {
      req.session.cart = null;
      await Cart.findByIdAndDelete(cart._id);
    }
    res.redirect(req.headers.referer);
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
};

module.exports.saveAddressPage = async (req, res) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.address.add,
      limit: 1,
    })
    .send();

  const newAddress = new Address(req.body.address);
  newAddress.user = req.user._id;
  newAddress.location = req.body.address.add;
  newAddress.geometry = response.body.features[0].geometry;

  let saveAddress = await newAddress.save();
  console.log(saveAddress);
  req.flash("success", "New Address saved!");

  res.redirect("/cart");
};

