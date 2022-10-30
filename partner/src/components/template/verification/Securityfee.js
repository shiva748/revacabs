import React, {useState } from "react";

const Securityfee = (received) => {
  const [dsbl, setdsbl] = useState(false);
  const {  setrf, udata } = received;
  const { operatorid } = udata;
  function loadScript(src) {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  async function displayRazorpay() {
    if (dsbl) {
      return;
    }
    setdsbl(true);
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      setdsbl(false);
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    // creating a new order
    const order = await fetch("/payment/createorder/securityfee", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        operatorid,
      }),
    });

    if (order.status !== 200) {
      setdsbl(false);
      alert("Failed to create the order");
      return;
    }
    setdsbl(false);
    // Getting the order details back
    const { amount, id: order_id, currency, prefill } = await order.json();

    const options = {
      key: "rzp_test_mSFzI2USgvCZ2Y", // Enter the Key ID generated from the Dashboard
      amount: amount.toString(),
      currency: currency,
      name: "Reva Cab",
      description: prefill.description,
      image: "http://localhost:8152/icons/logo.png",
      order_id: order_id,
      handler: async function (response) {
        const data = {
          orderCreationId: order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        };
        setdsbl(true);
        const result = await fetch("/payment/success/securityfee", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        });
        const status = await result.json();
        setdsbl(false);
        alert(status.msg);
        setrf({ display: false });
      },
      prefill: {
        name: prefill.name,
        email: prefill.email,
        contact: prefill.phone,
      },
      notes: {
        address: "Mathura",
      },
      theme: {
        color: "#61dafb",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  }
  const closer = () => {
    if (dsbl) {
      return;
    } else {
      setrf({ display: false });
    }
  };
  return (
    <div className="form-container">
      <div
        className={dsbl ? "bd-con ovrly-ad" : "bd-con"}
        style={{ padding: "15px", borderRadius: "10px" }}
      >
        <div className="rdctor-hd">Registration Fee</div>
        <div className="rdctor-con">
          <button
            className={dsbl ? "opt-btn ldng-btn" : "opt-btn"}
            onClick={displayRazorpay}
          >
            <span> Pay ₹200 Now </span>
          </button>
          <div>OR</div>
          <button className="opt-btn" onClick={closer}>
            <span> Pay Later </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Securityfee;
