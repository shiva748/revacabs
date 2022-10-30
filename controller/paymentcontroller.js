const Razorpay = require("razorpay");
const Booking = require("../models/client/bookings");
const Order = require("../models/orders");
exports.create_order = async (req, res) => {
  const { order_id, booking_id, amount, verificationkey } = req.body;
  const isbooking = await Booking.findOne({
    orderid: order_id,
    verificationkey,
  })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status("failed to fetch data");
      return "block";
    });
  if (isbooking === "block") {
    return;
  }

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
      reason: "booking advance",
      amount,
      bookingid: isbooking.bookingid,
    });
    const saving = await Nord.save()
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (saving === "block") {
      return;
    }
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
    )
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (updateorder.modifiedCount > 0) {
      res.json({
        msg: "success",
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
      });
    } else {
      res.status(500).json("Some error occured");
    }
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
  })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (booking === "block") {
    return;
  }
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
    const Nord = new Order({
      rzp_orderid: order.id,
      status: "created",
      reason: "booking balance",
      amount: booking.billing.companybal.amount,
      operatorid: user.operatorid,
      bookingid: booking.bookingid,
    });
    const saving = await Nord.save()
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (saving === "block") {
      return;
    }
    const wrtord = await Booking.updateOne(
      { bookingid, bookingstatus: "completed" },
      {
        "billing.companybal.rzp_orderid": order.id,
        "billing.companybal.status": false,
        "billing.companybal.date": new Date().getTime(),
      }
    )
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (wrtord === "block") {
      return;
    }
    if (wrtord.modifiedCount < 1) {
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
    const updtordr = await Order.updateOne(
      { rzp_orderid: razorpayOrderId },
      { status: "received" }
    )
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (updtordr === "block") {
      return;
    }
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
    )
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (save === "block") {
      return;
    }
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

// === === === Operator Security fee === === === //

const Partner = require("../models/partner/Registration");

exports.create_order_SF = async (req, res) => {
  const user = req.user;
  const { operatorid } = req.body;
  if (
    !operatorid ||
    typeof operatorid !== "string" ||
    user.operatorid !== operatorid
  ) {
    return res.status(400).json("Invalid request");
  }
  if (!user.verification.isverified) {
    return res.status(400).json("Invalid request");
  }
  if (user.Securityfee.received) {
    return res.status(400).json("Invalid request");
  }
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });
    const options = {
      amount: 200 * 100, // amount in smallest currency unit
      currency: "INR",
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500).send("Some error occured");

    const Nord = new Order({
      rzp_orderid: order.id,
      operatorid,
      status: "created",
      reason: "operator fee",
      amount: 200,
    });
    const saving = await Nord.save()
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (saving === "block") {
      return;
    }
    order.prefill = {
      email: user.email,
      phone: user.phone,
      name: user.firstName,
      description: "Operator security fee",
    };
    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
};

// === === === companybal success === === === //

exports.success_securityfee = async (req, res) => {
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
    const updtor = await Order.updateOne(
      {
        rzp_orderid: razorpayOrderId,
        operatorid: user.operatorid,
      },
      {
        status: "received",
      }
    )
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (updtor.modifiedCount < 1) {
      return res.status(400).json("Updation failed please contract support");
    }
    const save = await Partner.updateOne(
      {
        operatorid: user.operatorid,
        "Securityfee.received": false,
      },
      {
        "Securityfee.received": true,
        "Securityfee.amount": 200,
      }
    )
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (save === "block") {
      return;
    }
    if (save.modifiedCount < 1) {
      return res.status(400).json("Updation failed please contract support");
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

// === === === penalty payment === === === //

const Penalty = require("../models/partner/Penalty");

exports.create_order_penalty = async (req, res) => {
  const user = req.user;
  const operatorid = user.operatorid;
  const { bookingid, penaltyid } = req.body;
  if (
    !bookingid ||
    typeof bookingid !== "string" ||
    !penaltyid ||
    typeof penaltyid !== "string"
  ) {
    return res.status(500).json("Invalid request");
  }
  const penalty = await Penalty.findOne({
    bookingid,
    operatorid,
    penaltyid,
  })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      res.status(500).json("failed to fetch data");
      return "block";
    });
  if (penalty === "block") {
    return;
  }
  if (!penalty) {
    return res.status(400).json("Invalid request");
  }
  if (penalty.received) {
    return res.status(400).json("invalid request");
  }
  if (penalty.close) {
    return res.status(400).json("invalid request");
  }
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });
    const options = {
      amount: penalty.amount * 100, // amount in smallest currency unit
      currency: "INR",
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500).send("Some error occured");
    const Nord = new Order({
      rzp_orderid: order.id,
      status: "created",
      reason: "penalty payment",
      amount: penalty.amount,
      operatorid: user.operatorid,
      bookingid: penalty.bookingid,
      penaltyid,
    });
    const saving = await Nord.save()
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (saving === "block") {
      return;
    }
    order.prefill = {
      email: user.email,
      phone: user.phone,
      name: user.firstName,
      description: `${penalty.bookingid} Penalty Payment`,
    };
    res.json(order);
  } catch (error) {
    res.status(500).send("error");
  }
};

// === === === penalty payment success === === === //

exports.success_penalty = async (req, res) => {
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
    const updtor = await Order.updateOne(
      {
        rzp_orderid: razorpayOrderId,
        operatorid: user.operatorid,
      },
      {
        status: "received",
      }
    )
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (updtor.modifiedCount < 1) {
      return res.status(400).json("Updation failed please contract support");
    }
    const order = await Order.findOne({
      rzp_orderid: razorpayOrderId,
      operatorid: user.operatorid,
    })
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (order === "block") {
      return;
    }
    const save = await Penalty.updateOne(
      {
        penaltyid: order.penaltyid,
        operatorid: user.operatorid,
        received: false,
      },
      {
        received: true,
        receivedon: new Date().getTime(),
      }
    )
      .then((res) => {
        return res;
      })
      .catch((error) => {
        res.status(500).json("failed to fetch data");
        return "block";
      });
    if (save === "block") {
      return;
    }
    if (save.modifiedCount < 1) {
      return res.status(400).json("Updation failed please contract support");
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
