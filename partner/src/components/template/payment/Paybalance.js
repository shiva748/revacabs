import React, {useState} from 'react'

const Paybalance = (recived) => {
    const itm = recived.itm
    const triplog = recived.triplog
    // === === === payment === === === //
    const [dsbl, setdsbl] = useState(false);
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

  async function displayRazorpay(itm) {
    const bookingid = itm.bookingid;
    const billing = itm.billing;
    if (itm.billing.billed) {
      return alert("The booking is already billed");
    }
    if (!billing.companybal) {
      return alert("invalid request");
    }
    if (billing.companybal.amount <= 0) {
      return alert("You have no due on this booking");
    }
    if (billing.companybal.status) {
      return alert("Balance already recived");
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
    const order = await fetch("/payment/createorder/cmpnybal", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        bookingid,
        amount: billing.companybal.amount,
        operatorid: itm.assignedto.operatorid,
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
      name: "Mathura Taxi",
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
        const result = await fetch("/payment/success/cmpnybal", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        });
        const status = await result.json();
        triplog("hstry");
        setdsbl(false);
        alert(status.msg);
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
  return <>
  <button className={dsbl ? "gv-btn ldng-btn" : "gv-btn"}
                        onClick={() => {
                          displayRazorpay(itm);
                        }}
                      > 
                        <span>Pay ₹{itm.billing.companybal.amount} </span>
                      </button>
  </>
}

export default Paybalance