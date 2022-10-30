const Razorpay = require("razorpay");
const Booking = require("../models/client/bookings");
const Order = require("../models/orders");
exports.create_order = async (req, res) => {
  const { order_id, booking_id, amount, verificationkey } = req.body;
  const isbooking = await Booking.findOne({
    orderid: order_id,
    verificationkey,
  });

  if (!isbooking) {
    return res.status(422).json("Invalid request can't create order");
  } else if (!isbooking.advanceoptn.some((itm) => itm.Amount === amount)) {
    return res.status(422).json("Invalid amount can't create order");
  } else if (verificationkey !== isbooking.verificationkey) {
    return res.status(422).json("Invalid verificationkey can't create order");
  }

  if (isbooking.advance > 0) {
    return res.status(422).json("advance already recived");
  }
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: order_id,
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500).send("Some error occured");
    const Nord = new Order({
      rzp_orderid: order.id,
      orderid: order_id,
      status: "created",
      amount,
    });
    const saving = await Nord.save();
    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      created_at: order.created_at,
      status: order.status,
      attempts: order.attempts,
      amount_due: order.amount_due,
      amount_paid: order.amount_paid,
      entity: order.entity,
      notes: order.notes,
      offer_id: order.offer_id,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

// ==== ==== ==== success ==== ==== ==== //

const crypto = require("crypto");

exports.success = async (req, res) => {
  try {
    // getting the details back from our font-end
    const {
      orderCreationId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = req.body;

    // Creating our own digest
    // The format should be like this:
    // digest = hmac_sha256(orderCreationId + "|" + razorpayPaymentId, secret);
    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);

    shasum.update(`${orderCreationId}|${razorpayPaymentId}`);

    const digest = shasum.digest("hex");

    // comaparing our digest with the actual signature
    if (digest !== razorpaySignature)
      return res.status(400).json({ msg: "Transaction not legit!" });

    // THE PAYMENT IS LEGIT & VERIFIED
    // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT
    const updateorder = await Order.updateOne(
      { rzp_orderid: razorpayOrderId },
      { $set: { status: "received" } }
    );
    res.json({
      msg: "success",
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

// === === === Booking balance === === === //
exports.create_order_cmpy = async (req, res) => {
  const user = req.user;
  const { amount, bookingid, operatorid } = req.body;
  const booking = await Booking.findOne({
    bookingid,
    bookingstatus: "completed",
  });
  if (!booking) {
    return res.status(400).json("Invalid request");
  }
  if (booking.assignedto.operatorid !== user.operatorid) {
    return res.status(400).json("Invalid request");
  }
  if (!booking.billing.companybal) {
    return res.status(400).json("invalid request");
  }
  if (booking.billing.companybal.amount !== amount) {
    return res.status(400).json("invalid request");
  }
  if (booking.billing.companybal.amount <= 0) {
    return res.status(400).json("invalid request");
  }
  if (booking.billing.billed) {
    return res.status(400).json("invalid request");
  }
  if (booking.billing.companybal.status) {
    return res.status(400).json("invalid request");
  }
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });
    const options = {
      amount: booking.billing.companybal.amount * 100, // amount in smallest currency unit
      currency: "INR",
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500).send("Some error occured");

    const wrtord = await Booking.updateOne(
      { bookingid, bookingstatus: "completed" },
      {
        "billing.companybal.rzp_orderid": order.id,
        "billing.companybal.status": false,
        "billing.companybal.date": new Date().getTime(),
      }
    );
    if (!wrtord) {
      return res.status(500).json("can't create order");
    }
    order.prefill = {
      email: user.email,
      phone: user.phone,
      name: user.firstName,
      description: `${booking.bookingid} Company's  balance`,
    };
    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
};

// === === === companybal success === === === //

exports.success_companybal = async (req, res) => {
  const user = req.user;
  try {
    // getting the details back from our font-end
    const {
      orderCreationId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = req.body;

    // Creating our own digest
    // The format should be like this:
    // digest = hmac_sha256(orderCreationId + "|" + razorpayPaymentId, secret);
    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);

    shasum.update(`${orderCreationId}|${razorpayPaymentId}`);

    const digest = shasum.digest("hex");

    // comaparing our digest with the actual signature
    if (digest !== razorpaySignature)
      return res.status(400).json({ msg: "Transaction not legit!" });

    // THE PAYMENT IS LEGIT & VERIFIED
    // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT

    const save = await Booking.updateOne(
      {
        "billing.companybal.rzp_orderid": razorpayOrderId,
        bookingstatus: "completed",
        "assignedto.operatorid": user.operatorid,
      },
      {
        "billing.companybal.status": true,
        "billing.companybal.date": new Date().getTime(),
      }
    );
    if (!save) {
      return res
        .status(400)
        .json("Booking updation failed please contract support");
    }
    res.json({
      msg: "success",
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
