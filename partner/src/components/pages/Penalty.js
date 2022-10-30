import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { FaSearch, FaTimes } from "react-icons/fa";
import Loading from "../template/loading/Loading";
import "./css/Earning.css";
import { Helmet } from "react-helmet";
const Penalty = () => {
  const [hgt, sethgt] = useState();
  const resizer = () => {
    const height = window.innerHeight - 110;
    sethgt(height);
  };
  const [ldng, setldng] = useState(true);
  window.addEventListener("resize", resizer);
  const [pnlty, setpnlty] = useState([]);
  useEffect(() => {
    resizer();
    // eslint-disable-next-line
    penalty();
    // eslint-disable-next-line
  }, []);
  const penalty = async () => {
    const { bookingid, date } = fltr;
    let flt = {};
    if (bookingid) {
      if (typeof bookingid !== "string") {
        return alert("invalid booking id ");
      }
      flt = { ...flt, bookingid };
    }
    if (date) {
      if (typeof date !== "string") {
        return alert("invalid date");
      }
      flt = { ...flt, date };
    }
    setldng(true);
    let res = await fetch("/partner/penalty", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(flt),
    });
    let data = await res.json();
    if (res.status === 200) {
      setpnlty(data);
    } else {
    }
    setldng(false);
  };
  const df = { bookingid: "", date: "" };
  const [fltr, setfltr] = useState(df);
  const [dtl, setdtl] = useState({ display: false, data: {}, dsbl: false });
  // === === === payment === === === //

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
    if (dtl.dsbl) {
      return;
    }
    let { bookingid, penaltyid, close, received } = itm;
    if (received) {
      return alert("The penalty has been already paid");
    }
    if (close) {
      return alert("Penalty has been closed");
    }
    if (!penaltyid || typeof penaltyid !== "string") {
      return alert("invalid request");
    }
    if (!bookingid || typeof bookingid !== "string") {
      return alert("invalid request");
    }
    setdtl({ ...dtl, dsbl: true });
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      setdtl({ ...dtl, dsbl: false });
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    // creating a new order
    const order = await fetch("/payment/createorder/penalty", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        bookingid,
        penaltyid,
      }),
    });

    if (order.status !== 200) {
      setdtl({ ...dtl, dsbl: false });
      alert("Failed to create the order");
      return;
    }
    setdtl({ ...dtl, dsbl: false });
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
        setdtl({ ...dtl, dsbl: true });
        const result = await fetch("/payment/success/penalty", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        });
        const status = await result.json();
        penalty();
        setdtl({ ...dtl, dsbl: false, data: {}, display: false });
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
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>RevaCabs | Penalty's</title>

        <meta
          name="description"
          content="Page to add, manage and update the cars"
        />
        <link rel="canonical" href="http://partner.revacabs.com/" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="multicon-hd">
        <span className="h-t1">Penalty</span>
      </div>
      {ldng ? (
        <Loading />
      ) : (
        <section className="multi-con" style={{ height: `${hgt}px` }}>
          <div className="fltr-con">
            <div className="sub-fltr">
              <DatePicker
                className="inpt-t1"
                name="from"
                placeholderText="From Date"
                autoComplete="off"
                dateFormat="dd/MM/yyyy"
                selected={fltr.from}
                onChange={(value) => {
                  setfltr({ ...fltr, from: value });
                }}
                minDate={new Date(2022, 0, 1, 0, 0, 0, 0)}
                maxDate={new Date()}
              />
            </div>
            <div className="sub-fltr">
              <DatePicker
                className="inpt-t1"
                placeholderText="To Date"
                autoComplete="off"
                dateFormat="dd/MM/yyyy"
                selected={fltr.to}
                onChange={(value) => {
                  setfltr({ ...fltr, to: value });
                }}
                minDate={
                  fltr.from ? fltr.from : new Date(2022, 0, 1, 0, 0, 0, 0)
                }
                maxDate={new Date()}
              />
            </div>
            <div
              className="sub-fltr"
              style={{ justifyContent: "space-around" }}
            >
              <button type="submit" className="fltr-btn" onClick={penalty}>
                <FaSearch /> Search
              </button>
              <button
                type="submit"
                className="fltr-btn"
                onClick={() => {
                  setfltr(df);
                }}
              >
                Clear filter
              </button>
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>#</th>
              </tr>
            </thead>
            <tbody>
              {pnlty.map((itm, i) => {
                return (
                  <tr key={i}>
                    <td lbl="Booking ID">{itm.bookingid}</td>
                    <td lbl="Date">₹ {itm.amount}</td>
                    <td lbl="Paid">{itm.received ? "Yes" : "No"}</td>
                    <td lbl="">
                      <button
                        className="pmt-btn"
                        onClick={() => {
                          setdtl({ display: true, data: itm });
                        }}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {pnlty.length <= 0?<div className="nrc-con"><img src="/icons/nrec.png" alt=""/><p class="nrc-txt">No penalty's found</p></div>:""}
        </section>
      )}
      {dtl.display ? (
        <div className="form-container">
          <div
            className="form-box"
            style={{ height: "fit-content", margin: "auto" }}
          >
            <div className="bkngdtl-hd">
              Penalty
              <div
                className="clsr-con"
                onClick={() => {
                  setdtl({ display: false, data: {} });
                }}
              >
                <FaTimes />
              </div>
            </div>
            <div className="bkng-dtlcon">
              <table className="bkngdtl-tbl">
                <tbody>
                  <tr>
                    <td>Booking Id</td>
                    <td>{dtl.data.bookingid}</td>
                  </tr>
                  <tr>
                    <td>Reason</td>
                    <td>{dtl.data.reason}</td>
                  </tr>
                  <tr>
                    <td>Amount</td>
                    <td>₹{dtl.data.amount}</td>
                  </tr>
                  <tr>
                    <td>Date</td>
                    <td>{new Date(dtl.data.createdon).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td>Received</td>
                    <td>{dtl.data.received ? "Yes" : "No"}</td>
                  </tr>
                  {dtl.data.receivedon ? (
                    <tr>
                      <td>Received on</td>
                      <td>{new Date(dtl.data.receivedon).toLocaleString()}</td>
                    </tr>
                  ) : (
                    ""
                  )}
                </tbody>
              </table>
              {dtl.data.received ? (
                ""
              ) : (
                <div className="pay-btncon">
                  <button
                    className={dtl.dsbl ? "gv-btn ldng-btn" : "gv-btn"}
                    onClick={() => {
                      displayRazorpay(dtl.data);
                    }}
                  >
                    <span>Pay ₹{dtl.data.amount}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default Penalty;
