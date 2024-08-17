console.log(key);
let amount = 0;
if (cartItem.totalCost < 299) {
  amount = cartItem.totalCost + 50; // Amount in INR
} else {
  amount = cartItem.totalCost; // Amount in INR
}

document.getElementById("pay-btn").addEventListener("click", async (e) => {
  e.preventDefault();
  
  // Create an order
  const response = await fetch("/payment/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });
  const order = await response.json();
  // console.log(order);

  const options = {
    key: key,
    amount: order.amount,
    currency: order.currency,
    name: "Dipti Medical",
    description: "Test Transaction",
    order_id: order.id,
    handler: async function (response) {
      const verifyResponse = await fetch("/payment/payWrazorpe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });

      const verifyResult = await verifyResponse.json();
      if (verifyResult.status === "success") {
        // alert('Payment successful');
        // window.location.href = "/myOrders"
        const paymentId = response.razorpay_payment_id;

        window.location.replace(`razorpay-redirect/${paymentId}`);
      } else {
        alert("Payment failed");
        window.location.href = "/cart";
      }
    },
    prefill: {
      name: cartItem.user.username,
      email: cartItem.user.email,
      contact: cartItem.user.mobile,
    },
    notes: {
      address: Address,
    },
    theme: {
      color: "#3fbfda",
    },
  };

  const rzp1 = new Razorpay(options);
  rzp1.open();
});



document.getElementById("phonepeBtn").addEventListener("click", async (e) => {
  e.preventDefault();
//   let amount = 0;
//   if (cartItem.totalCost < 299) {
//     amount = cartItem.totalCost +50 ; // Amount in INR
//   } else {
//     amount =  cartItem.totalCost; // Amount in INR
//   }
  // Create an order
  const response = await fetch("/payment/payload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });
  const order = await response.json();
  console.log(order);

  const verifyResponse = await fetch("/payment/payWphonepe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      xVerify: order.xVerify,
      base64Payload: order.base64Payload,
    }),
  });
  const verifyResult = await verifyResponse.json();
  // console.log(verifyResult.url);
  console.log(verifyResult.status);
  console.log(verifyResult.url);
  if (verifyResult.status === true) {
    window.location.href = `${verifyResult.url}`;
  }
});


