import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import "./css/completebooking.css";
import { FcApproval } from "react-icons/fc";
import { FaTimesCircle, FaTimes } from "react-icons/fa";
import Loading from "../templates/loading/secloading";
import validator from "validator";
import { Helmet } from "react-helmet";

const Cbooking = () => {
  const [alertd, setalertd] = useState({
    display: false,
    title: "",
    message: "",
    type: "",
  });
  const [loadingbtn, setloadingbtn] = useState(false);
  const [loadscr, setloadscr] = useState(true);
  const [hgt, sethgt] = useState();
  const resizer = () => {
    const height = window.innerHeight - 125;
    sethgt(height);
  };
  window.addEventListener("resize", resizer);
  const history = useHistory();
  const [viewstate, setviewstate] = useState("cdtls");
  const [servicedata, setservicedata] = useState({
    bookingtype: "outstation",
    outstationtype: "Oneway",
    from: "loading, ",
    fromcode: "",
    to: "loading, ",
    tocode: "",
    pickupdate: new Date(),
    pickupat: "",
    returnat: "",
  });
  const isbkng = () => {
    if (
      localStorage.getItem("service-data") &&
      sessionStorage.getItem("service-data") &&
      sessionStorage.getItem("selected") &&
      localStorage.getItem("selected")
    ) {
      if (
        localStorage.getItem("selected") !== sessionStorage.getItem("selected")
      ) {
        history.push("/");
      } else {
        setitm(JSON.parse(sessionStorage.getItem("selected")));
        setservicedata(JSON.parse(sessionStorage.getItem("service-data")));
        setloadscr(false);
      }
    } else {
      history.push("/");
    }
  };
  const [itm, setitm] = useState({
    name: "Amaze",
    othercharges: { GST: { amount: "" } },
  });
  useEffect(() => {
    isbkng();
    resizer();
    // eslint-disable-next-line
  }, []);
  // ========================================//

  // === === === creating booking === === === //

  // ========================================//
  const dcstm = { name: "", email: "", phone: "", address: "" };
  const [cstmrdtl, setcstmrdtl] = useState(dcstm);
  let name, value;
  const handelinput = (e) => {
    name = e.target.name;
    value = e.target.value;
    setcstmrdtl({ ...cstmrdtl, [name]: value });
  };
  const [advancear, setadvancear] = useState([]);
  const crtbooking = async (e) => {
    setloadingbtn(true);
    e.preventDefault();
    if (isvalid()) {
      setloadingbtn(false);
      return;
    }
    const { name, email, phone, address } = cstmrdtl;
    if (!name || !email || !phone || !address) {
      setloadingbtn(false);
      return setalertd({
        display: true,
        title: "",
        message: "please fill all the fields",
        type: "danger",
      });
    }
    const res = await fetch("/api/booking", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        triptype: servicedata.bookingtype,
        outstationtype: servicedata.outstationtype,
        tripid: itm._id,
        sourcecity: { from: servicedata.from, fromcode: servicedata.fromcode },
        endcity: { to: servicedata.to, tocode: servicedata.tocode },
        pickupat: servicedata.pickupat,
        pickupdate: servicedata.pickupdate,
        returnat: servicedata.returnat,
        contactdtls: {
          name,
          phone,
          email,
        },
        trip: itm,
      }),
    });
    const data = await res.json();
    if (res.status === 201) {
      const advancea = data.data.aopt;
      setadvancear(data.data.aopt);
      setloadingbtn(false);
      setpmt({
        sorder_id: data.data.orderid,
        booking_id: data.data.bookingid,
        samount: data.data.aopt[0].Amount,
        verificationkey: data.data.verificationkey,
      });
      const checkdat = {
        order_id: data.data.orderid,
        booking_id: data.data.bookingid,
        verificationkey: data.data.verificationkey,
      };
      sessionStorage.setItem("checkdat", JSON.stringify(checkdat));
      sessionStorage.setItem("advancea", JSON.stringify(advancea));
      setviewstate("pmts");
    } else {
      setloadingbtn(false);
      alert(data);
    }
  };

  // === === === input validation === === === //
  const ert = {
    email: { display: false, message: "" },
    phone: { display: false, message: "" },
  };
  const [error, seterror] = useState(ert);
  const isemail = () => {
    if (!validator.isEmail(cstmrdtl.email)) {
      seterror({
        ...error,
        // eslint-disable-next-line
        ["email"]: { display: true, message: "Please enter a valid email" },
      });
      return false;
    } else {
      return true;
    }
  };
  const isphone = () => {
    if (!validator.isMobilePhone(cstmrdtl.phone, "en-IN")) {
      seterror({
        ...error,
        // eslint-disable-next-line
        ["phone"]: {
          display: true,
          message: "Please enter valid mobile number.",
        },
      });
      return false;
    } else {
      return true;
    }
  };
  const isvalid = () => {
    let error = false;
    if (!isemail()) {
      error = true;
    }
    if (!isphone()) {
      error = true;
    }

    return error;
  };

  // === === ==== payment === === ==== //

  const [pmt, setpmt] = useState();

  // change

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

  async function displayRazorpay(e) {
    e.preventDefault();
    const checkdat = JSON.parse(sessionStorage.getItem("checkdat"));
    const advancea = JSON.parse(sessionStorage.getItem("advancea"));
    const { sorder_id, booking_id, samount, verificationkey } = pmt;
    if (sorder_id !== checkdat.order_id) {
      return setalertd({
        display: true,
        title: "",
        message: "Data has been changed",
        type: "danger",
      });
    } else if (booking_id !== checkdat.booking_id) {
      return setalertd({
        display: true,
        title: "",
        message: "Data has been changed",
        type: "danger",
      });
    } else if (verificationkey !== checkdat.verificationkey) {
      return setalertd({
        display: true,
        title: "",
        message: "Data has been changed",
        type: "danger",
      });
    } else if (!advancea.some((itm) => itm.Amount === samount)) {
      return setalertd({
        display: true,
        title: "",
        message: "Invalid amount data change found",
        type: "danger",
      });
    }
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const order = await fetch("/payment/createorder/bkngadv", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        order_id: sorder_id,
        booking_id,
        amount: samount,
        verificationkey,
      }),
    });

    if (order.status !== 200) {
      setalertd({
        display: true,
        title: "",
        message: await order.json(),
        type: "danger",
      });
      return;
    }

    const { amount, id: order_id, currency } = await order.json();

    const options = {
      key: "rzp_test_mSFzI2USgvCZ2Y", // Enter the Key ID generated from the Dashboard
      amount: amount.toString(),
      currency: currency,
      name: "Sarathi cabs",
      description: "integrating payment gateway",
      image: "https://mathurataxi.in.net/assets/images/download-1-122x122.png",
      order_id: order_id,
      handler: async function (response) {
        const data = {
          orderCreationId: order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        };

        const result = await fetch("/payment/success/bkngadv", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const status = await result.json();
        if (result.status === 200) {
          const success = await fetch("/api/updatebooking", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              rzp_id: order_id,
              orderid: sorder_id,
              bookingid: booking_id,
              ad_amount: amount / 100,
            }),
          });
          const successdat = await success.json();
          if (success.status === 202) {
            sessionStorage.removeItem("selected", "service-data");
            localStorage.removeItem("selected", "service-data");
            sessionStorage.setItem("Confrmd", JSON.stringify(successdat));
            alert(
              `Payment ${status.msg} you will be redirected to confirmation`
            );
            history.push("/booking/confirmation");
          } else {
            sessionStorage.removeItem("selected", "service-data");
            localStorage.removeItem("selected", "service-data");
            setalertd({
              display: true,
              title: "",
              message: successdat,
              type: "danger",
            });
          }
        }
      },
      prefill: {
        name: cstmrdtl.name,
        email: cstmrdtl.email,
        contact: cstmrdtl.phone,
      },
      notes: {
        address: "Mathura cab ",
      },
      theme: {
        color: "#61dafb",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  }

  const nadv = async (e) => {
    e.preventDefault();
    const checkdat = JSON.parse(sessionStorage.getItem("checkdat"));
    const advancea = JSON.parse(sessionStorage.getItem("advancea"));
    const { sorder_id, booking_id, samount, verificationkey } = pmt;
    if (sorder_id !== checkdat.order_id) {
      return setalertd({
        display: true,
        title: "",
        message: "Data change found",
        type: "danger",
      });
    } else if (booking_id !== checkdat.booking_id) {
      return setalertd({
        display: true,
        title: "",
        message: "Data change found",
        type: "danger",
      });
    } else if (verificationkey !== checkdat.verificationkey) {
      return setalertd({
        display: true,
        title: "",
        message: "Data change found",
        type: "danger",
      });
    } else if (!advancea.some((itm) => itm.Amount === samount)) {
      return setalertd({
        display: true,
        title: "",
        message: "Invalid advance amount",
        type: "danger",
      });
    }
    const success = await fetch("/api/updatebooking", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        orderid: sorder_id,
        bookingid: booking_id,
        ad_amount: 0,
      }),
    });
    const data = await success.json();
    if (success.status === 202) {
      sessionStorage.removeItem("selected", "service-data");
      localStorage.removeItem("selected", "service-data");
      sessionStorage.setItem("Confrmd", JSON.stringify(data));
      history.push("/booking/confirmation");
    } else {
      setalertd({
        display: true,
        title: "",
        message: data,
        type: "danger",
      });
    }
  };

  // change
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>
          {servicedata.bookingtype === "local"
            ? `${
                servicedata.from.split(",")[0]
              } Local Cab booking contact details.`
            : `${servicedata.from.split(",")[0]} to ${
                servicedata.to.split(",")[0]
              } ${servicedata.outstationtype} cab booking contact details`}
        </title>
        <meta
          name="description"
          content={
            servicedata.bookingtype === "local"
              ? `${
                  servicedata.from.split(",")[0]
                } Local Cab booking contact details.`
              : `${servicedata.from.split(",")[0]} to ${
                  servicedata.to.split(",")[0]
                } ${servicedata.outstationtype} cab booking contact details`
          }
        />
        <link rel="canonical" href="http://revacabs.com/" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="page-head">
        <span className="page-head-text">Booking details</span>
      </div>
      {loadscr ? (
        <Loading />
      ) : (
        <section className="cmplt" style={{ height: `${hgt}px` }}>
          <div className="cmplt-con-lft">
            <div className="dtl">
              <div
                className={loadingbtn ? "dtl-form progress-layer" : "dtl-form"}
              >
                <div className={viewstate === "cdtls" ? "Cbhead" : "gry"}>
                  Contact Details
                </div>
                {viewstate === "cdtls" ? (
                  <form>
                    <div className="dtl-form-row">
                      <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        className="dtl-input"
                        onChange={handelinput}
                        value={cstmrdtl.name}
                      />
                    </div>
                    <div className="dtl-form-row">
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        className="dtl-input"
                        onChange={handelinput}
                        value={cstmrdtl.email}
                        onFocus={() => {
                          seterror({
                            ...error,
                            // eslint-disable-next-line
                            ["email"]: { display: false, message: "" },
                          });
                        }}
                        onBlur={isemail}
                      />
                    </div>
                    {error.email.display ? (
                      <span
                        className="input-err"
                        style={{ marginLeft: "15px" }}
                      >
                        {error.email.message}
                      </span>
                    ) : (
                      ""
                    )}
                    <div className="dtl-form-row">
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        className="dtl-input"
                        onChange={handelinput}
                        value={cstmrdtl.phone}
                        onFocus={() => {
                          seterror({
                            ...error,
                            // eslint-disable-next-line
                            ["phone"]: { display: false, message: "" },
                          });
                        }}
                        onBlur={isphone}
                      />
                    </div>
                    {error.phone.display ? (
                      <span
                        className="input-err"
                        style={{ marginLeft: "15px" }}
                      >
                        {error.phone.message}
                      </span>
                    ) : (
                      ""
                    )}
                    <div className="dtl-form-row">
                      <input
                        type="text"
                        name="address"
                        placeholder="Pickup address in Mathura"
                        className="dtl-input"
                        onChange={handelinput}
                        value={cstmrdtl.address}
                      />
                    </div>
                    <div className="dtl-form-row">
                      <button
                        type="submit"
                        className={
                          loadingbtn ? "action-btn loading" : "action-btn"
                        }
                        onClick={crtbooking}
                      >
                        Proceed
                      </button>
                    </div>
                  </form>
                ) : (
                  ""
                )}
              </div>
              <div
                className={loadingbtn ? "dtl-form progress-layer" : "dtl-form"}
                style={{ marginTop: "4px" }}
              >
                <div className={viewstate === "pmts" ? "Cbhead" : "gry"}>
                  Payment Details
                </div>
                {viewstate === "pmts" ? (
                  <form>
                    <div className="alert-bx">
                      <span>
                        <FcApproval /> NO charges to reschedule or cancel.
                      </span>
                    </div>
                    <div className="ad-optns-con">
                      {advancear.map((itm, i) => {
                        return (
                          <div
                            className={
                              pmt.samount === itm.Amount
                                ? "ad-optns shade-ad"
                                : "ad-optns"
                            }
                            key={i}
                          >
                            <label
                              htmlFor={itm.Atype}
                              className="advance-label"
                            >
                              <span className="ad-lbl-txt">
                                {itm.Amount !== 0
                                  ? `Pay ₹${itm.Amount} (${itm.Atype}) Now`
                                  : "Full cash payment"}
                              </span>
                            </label>
                            <input
                              className="radio"
                              type="radio"
                              name="paymentmode"
                              id={itm.Atype}
                              value={itm.Amount}
                              onChange={() => {
                                // eslint-disable-next-line
                                setpmt({ ...pmt, ["samount"]: itm.Amount });
                              }}
                            />
                            <div
                              className={
                                pmt.samount === itm.Amount
                                  ? "radio-circlea radio-activea"
                                  : "radio-circlea"
                              }
                            ></div>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      type="submit"
                      className="pay-btn"
                      onClick={pmt.samount === 0 ? nadv : displayRazorpay}
                    >
                      {pmt.samount === 0 ? "Confirm" : "Proceed"}
                    </button>
                  </form>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="alert-con">
              <div className="alert-head">Trip Terms</div>
              <div className="alert-bx">
                <span>
                  <FcApproval /> Free Cancellation applicable before{" "}
                  {new Date(servicedata.pickupat - 14400000).toLocaleString()}
                </span>
              </div>
              <div className="alert-sub-con">
                <ul className="info-li">
                  <li>
                    <span>
                      <FcApproval />
                    </span>
                    Gst Included (5%) - Rs.{itm.othercharges.GST.amount} (apx)
                  </li>
                  <li>
                    <p>
                      <FaTimesCircle />
                    </p>
                    Night charges (10 PM - 6 AM) - Rs.250
                  </li>
                  <li>
                    <p>
                      <FaTimesCircle />
                    </p>
                    Wating charge - Rs.100/hr
                  </li>
                  <li>
                    <p>
                      <FaTimesCircle />
                    </p>
                    Extra charges after 167 km - Rs.12/km
                  </li>
                  <li>
                    <p>
                      <FaTimesCircle />
                    </p>
                    Mcd
                  </li>
                  <li>
                    <p>
                      <FaTimesCircle />
                    </p>
                    Parking Charges
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="cmplt-con-rgt">
            <div className="trip-info">
              <div className="info-head">Trip Plan</div>
              <div className="c-pic">
                <img src={`/car/${itm.name}.png`} alt="" srcSet="" />
              </div>
              <div className="info-conte">
                <ul className="info-li">
                  <li>
                    <div>Route:</div>
                    <span>
                      {servicedata.from.split(",")[0]}
                      {servicedata.bookingtype === "outstation"
                        ? ` To ${servicedata.to.split(",")[0]}`
                        : ""}
                    </span>
                  </li>
                  <li>
                    <div>Pickup at:</div>
                    <span>
                      {new Date(servicedata.pickupat).toLocaleString()}
                    </span>
                  </li>
                  <li>
                    <div>Trip type:</div>
                    <span>
                      {servicedata.bookingtype === "outstation"
                        ? `${servicedata.bookingtype}(${servicedata.outstationtype})`
                        : servicedata.bookingtype}
                    </span>
                  </li>
                  <li>
                    <div>Car:</div>
                    <span>{itm.name}</span>
                  </li>
                </ul>
              </div>
            </div>
            <img src="/car/ad1.jpg" alt="" srcSet="" className="cmplt-image" />
          </div>
          <div className="sml-footer">© Copyright Sarthi.</div>
        </section>
      )}
      {alertd.display ? (
        alertd.type === "danger" ? (
          <div className="danger-alert">
            <span>
              <FaTimesCircle className="dismiss-alert" />
              {alertd.title ? `${alertd.title}:` : ""} {alertd.message}
            </span>
            <FaTimes
              className="dismiss-alert"
              onClick={() => {
                // eslint-disable-next-line
                setalertd({ ...alertd, ["display"]: false });
              }}
            />
          </div>
        ) : (
          <div className="green-alert">
            <span>
              <FcApproval className="dismiss-alert" />
              {alertd.title ? `${alertd.title} :` : ""} {alertd.message}
            </span>
            <FaTimes
              className="dismiss-alert"
              onClick={() => {
                // eslint-disable-next-line
                setalertd({ ...alertd, ["display"]: false });
              }}
            />
          </div>
        )
      ) : (
        ""
      )}
    </>
  );
};

export default Cbooking;
