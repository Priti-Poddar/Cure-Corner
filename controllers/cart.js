const Cart = require("../models/cart");
const Address = require("../models/address");
const Medicine = require("../models/medicine");
const Order = require("../models/order.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const Razorpay = require("razorpay");
const { KEY_ID, KEY_SECRET } = process.env;

const razorpay = new Razorpay({
  key_id: KEY_ID,
  key_secret: KEY_SECRET,
});

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
        });
      }

      // if there is no cart in session and user is not logged in, cart is empty
     if (!req.session.cart) {

      return res.render("users/cart.ejs", {
        user: req.user,
        cart: null,
        products: null,
        userAdd: Add,
      });
    }
    // otherwise, load the session's cart
     
      
      return res.render("users/cart.ejs", {
        user: req.user,
        cart: req.session.cart,
        products: await productsFromCart(req.session.cart),
        userAdd: Add,
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

const key_id = process.env.KEY_ID;

module.exports.checkoutForm = async (req, res) => {
  const cartItem = await Cart.findById(req.session.cart._id).populate("user");

  const Add = await Address.findOne({ user: req.user._id });

  // console.log(cartItem[0].item);
  // const orders = cartItem[0].items;
  res.render("users/payment.ejs", { cartItem, Add, key: key_id });
}

module.exports.createOrders = async (req, res) => {
  const { amount } = req.body;
  // console.log(amount);
  const options = {
    amount: amount * 100, // amount in the smallest currency unit
    currency: "INR",
    receipt: "order_rcptid_11",
  };
  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports.paymentRoute = async (req, res) => {
  if (!req.session.cart) {
    return res.redirect("/cart");
  }
  const cart = await Cart.findById(req.session.cart._id);
  const address = await Address.findOne({ user: req.user._id });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const crypto = require("crypto");
  const hmac = crypto.createHmac("sha256", KEY_SECRET);

  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const generated_signature = hmac.digest("hex");

  if (generated_signature === razorpay_signature) {
    const order = new Order({
      user: req.user,
      cart: {
        totalQty: cart.totalQty,
        totalCost: cart.totalCost,
        items: cart.items,
      },
      address: address,
      paymentId: razorpay_payment_id,
    });
    let orders = await order.save();
    // console.log(orders);
    await cart.save();
    await Cart.findByIdAndDelete(cart._id);
    req.flash("success", "Successfully purchased");
    req.session.cart = null;
    console.log("successfull");
    res.redirect("/myAcc");
    //   // res.json({ status: "success" });
    //   // res.status(200).send("Susscessfull");
    // });
  } else {
    res.json({ status: "failure" });
    res.status(400).send("Payment verification failed");
  }
};