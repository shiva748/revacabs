import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import "./css/completebooking.css";
import { FcApproval } from "react-icons/fc";
import { FaTimesCircle, FaTimes } from "react-icons/fa";
import { HiCurrencyRupee } from "react-icons/hi";
import Loading from "../templates/loading/secloading";
import validator from "validator";
import { Helmet } from "react-helmet";
import { IoMdContact } from "react-icons/io";
import { BsFillPatchQuestionFill } from "react-icons/bs";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { CgArrowsExchange, CgArrowRight } from "react-icons/cg";
import { ReactSearchAutocomplete } from "react-search-autocomplete";

const Cbooking = () => {
  const [alertd, setalertd] = useState({
    display: false,
    title: "",
    message: "",
    type: "",
  });
  const [ld, setld] = useState({ scr: true, crt: false, py: false });
  const [hgt, sethgt] = useState();
  const resizer = () => {
    const height = window.innerHeight - 125;
    sethgt(height);
  };
  window.addEventListener("resize", resizer);
  const history = useHistory();
  const [viewstate, setviewstate] = useState("cdtls");
  const [servicedata, setservicedata] = useState({
    bookingtype: "",
    outstationtype: "",
    from: "",
    fromcode: "",
    to: "",
    tocode: "",
    pickupdate: "",
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
        setld({ ...ld, scr: false });
      }
    } else {
      history.push("/");
    }
  };
  const [itm, setitm] = useState({
    name: "",
    othercharges: { GST: { amount: "" } },
  });
  useEffect(() => {
    isbkng();
    resizer();
    atofl();
    locality();
    // eslint-disable-next-line
  }, []);
  // ========================================//

  // === === === creating booking === === === //

  // ========================================//
  const dcstm = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    trprsn: "",
    comname: "",
    comgstno: "",
    comaddress: "",
    inpt: true,
    addtype: "auto",
  };
  const [cstmrdtl, setcstmrdtl] = useState(dcstm);
  let name, value;
  const handelinput = (e) => {
    name = e.target.name;
    value = e.target.value;
    setcstmrdtl({ ...cstmrdtl, [name]: value });
  };
  const [advancear, setadvancear] = useState([]);
  const crtbooking = async (e) => {
    setld({ ...ld, crt: true });
    e.preventDefault();
    if (isvalid()) {
      setld({ ...ld, crt: false });
      return;
    }
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      trprsn,
      comname,
      comgstno,
      comaddress,
      locality,
      addtype,
    } = cstmrdtl;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !address ||
      !trprsn ||
      !address ||
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof address !== "string" ||
      typeof trprsn !== "string" ||
      typeof addtype !== "string" ||
      !["auto", "custom"].some((itm) => itm === addtype)
    ) {
      setld({ ...ld, crt: false });
      return setalertd({
        display: true,
        title: "",
        message: "please fill all the fields",
        type: "danger",
      });
    }
    if (trprsn === "Business" && (!comname || !comgstno || !comaddress)) {
      setld({ ...ld, crt: false });
      return setalertd({
        display: true,
        title: "",
        message: "please fill all the fields 2",
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
        firstName,
        lastName,
        phone,
        email,
        trip: itm,
        trprsn,
        comname,
        comgstno,
        comaddress,
        address,
        locality,
        addtype,
      }),
    });
    const data = await res.json();
    if (res.status === 201) {
      const advancea = data.data.aopt;
      setadvancear(data.data.aopt);
      setld({ ...ld, crt: false });
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
      setld({ ...ld, crt: false });
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
    if (ld.py) {
      return;
    }
    setld({ ...ld, py: true });
    const checkdat = JSON.parse(sessionStorage.getItem("checkdat"));
    const advancea = JSON.parse(sessionStorage.getItem("advancea"));
    const { sorder_id, booking_id, samount, verificationkey } = pmt;
    if (sorder_id !== checkdat.order_id) {
      setld({ ...ld, py: false });
      return setalertd({
        display: true,
        title: "",
        message: "Data has been changed",
        type: "danger",
      });
    } else if (booking_id !== checkdat.booking_id) {
      setld({ ...ld, py: false });
      return setalertd({
        display: true,
        title: "",
        message: "Data has been changed",
        type: "danger",
      });
    } else if (verificationkey !== checkdat.verificationkey) {
      setld({ ...ld, py: false });
      return setalertd({
        display: true,
        title: "",
        message: "Data has been changed",
        type: "danger",
      });
    } else if (!advancea.some((itm) => itm.Amount === samount)) {
      setld({ ...ld, py: false });
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
      setld({ ...ld, py: false });
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
        amount: samount.toString(),
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
      setld({ ...ld, py: false });
      return;
    } else {
      setld({ ...ld, py: false });
    }

    const { amount, id: order_id, currency } = await order.json();

    const options = {
      key: "rzp_live_YJs7U86skAdvl8", // Enter the Key ID generated from the Dashboard
      amount: amount.toString(),
      currency: currency,
      name: "Reva cabs",
      description: `${booking_id} Advance payment`,
      image: "https://revacabs.com/icons/logo.png",
      order_id: order_id,
      handler: async function (response) {
        const data = {
          orderCreationId: order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        };
        setld({ ...ld, py: true });
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
              ad_amount: `${amount / 100}`,
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
            setld({ ...ld, py: false });
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
            setld({ ...ld, py: false });
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
    if (ld.py) {
      return;
    }
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
        ad_amount: "0",
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
  const atofl = async () => {
    const res = await fetch("/api/atofl", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await res.json();
    if (JSON.stringify(data) !== "{}") {
      setcstmrdtl({
        ...cstmrdtl,
        email: data.email,
        phone: data.phone,
        firstName: data.firstName,
        lastName: data.lastName,
        inpt: false,
      });
    }
  };
  const locality = async () => {
    if (
      !localStorage.getItem("service-data") ||
      !sessionStorage.getItem("service-data") ||
      localStorage.getItem("service-data") !==
        sessionStorage.getItem("service-data")
    ) {
    }
    let dataa = JSON.parse(localStorage.getItem("service-data"));
    const res = await fetch("/api/public/locality", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        city: dataa.from,
        citycode: dataa.fromcode,
      }),
    });
    const data = await res.json();
    if (JSON.stringify(data) !== "{}") {
      let locality = [];
      data.locality.map((itm, i) => {
        return locality.push({ ...itm, id: i });
        
      });
      setloca(locality);
    }
  };
  const [loca, setloca] = useState([]);
  // change

  // === filter === //

  const handleOnSelect = (item) => {
    setcstmrdtl({ ...cstmrdtl, address: item.name, locality: item.code });
  };
  const handleOnClear = () => {
    setcstmrdtl({ ...cstmrdtl, address: "", locality: "" });
  };

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
        <meta http-equiv="Content-Security-Policy" content="script-src 'self' https://checkout.razorpay.com/v1/checkout.js"/>
        <meta name="robots" content="noindex,nofollow" />
        <meta http-equiv="Content-Security-Policy" content="script-src 'self' https://checkout.razorpay.com/v1/checkout.js"/>
      </Helmet>
      <div className="page-head">
        <span className="page-head-text">Complete booking</span>
      </div>
      {ld.scr ? (
        <Loading />
      ) : (
        <section className="cmplt" style={{ height: `${hgt}px` }}>
          <div className="cmplt-con-lft">
            <div className="dtl">
              <div className={ld.crt ? "dtl-form progress-layer" : "dtl-form"}>
                <div
                  className={viewstate === "cdtls" ? "Cbhead" : "Cbhead gry"}
                >
                  <IoMdContact style={{ marginRight: "5px" }} />
                  Contact Details
                </div>
                {viewstate === "cdtls" ? (
                  <form>
                    <div className="dtl-form-row">
                      <div className="di-con">
                        {cstmrdtl.inpt ? (
                          <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            className="dtl-input-di"
                            onChange={handelinput}
                            value={cstmrdtl.firstName}
                            autoComplete="off"
                          />
                        ) : (
                          <div
                            className="dtl-input-di"
                            style={{
                              border: "solid 1px #767676",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {cstmrdtl.firstName}
                          </div>
                        )}
                      </div>
                      <div className="di-con">
                        {cstmrdtl.inpt ? (
                          <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            className="dtl-input-di"
                            onChange={handelinput}
                            value={cstmrdtl.lastName}
                            autoComplete="off"
                          />
                        ) : (
                          <div
                            className="dtl-input-di"
                            style={{
                              border: "solid 1px #767676",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {cstmrdtl.lastName}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="dtl-form-row">
                      <div className="di-con">
                        {cstmrdtl.inpt ? (
                          <>
                            <input
                              type="email"
                              name="email"
                              placeholder="Email"
                              className="dtl-input-di"
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
                              autoComplete="off"
                            />
                            {error.email.display ? (
                              <span className="input-err">
                                {error.email.message}
                              </span>
                            ) : (
                              ""
                            )}
                          </>
                        ) : (
                          <div
                            className="dtl-input-di"
                            style={{
                              border: "solid 1px #767676",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {cstmrdtl.email}
                          </div>
                        )}
                      </div>
                      <div className="di-con">
                        {cstmrdtl.inpt ? (
                          <>
                            <input
                              type="tel"
                              name="phone"
                              placeholder="Phone Number"
                              className="dtl-input-di"
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
                              autoComplete="off"
                            />
                            {error.phone.display ? (
                              <span className="input-err">
                                {error.phone.message}
                              </span>
                            ) : (
                              ""
                            )}
                          </>
                        ) : (
                          <div
                            className="dtl-input-di"
                            style={{
                              border: "solid 1px #767676",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {cstmrdtl.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="dtl-form-row">
                      {cstmrdtl.addtype === "auto" ? (
                        <div className="ato-con">
                          <ReactSearchAutocomplete
                            items={loca}
                            onSelect={handleOnSelect}
                            onClear={handleOnClear}
                            showIcon={false}
                            showItemsOnFocus={true}
                            placeholder={`Pickup address in ${
                              servicedata.from.split(",")[0]
                            }`}
                            styling={{
                              height: "34px",
                              border: "1px solid rgb(118, 118, 118)",
                              borderRadius: "0px",
                              backgroundColor: "white",
                              boxShadow: "none",
                              hoverBackgroundColor: "#efeeee",
                              fontSize: "14px",
                              iconColor: "red",
                              lineColor: "lightgray",
                              clearIconMargin: "3px 8px 0 0",
                              zIndex: 2,
                              color: "black !important",
                            }}
                            maxResults={6}
                          />
                        </div>
                      ) : (
                        <input
                          type="text"
                          name="address"
                          placeholder={`Pickup address in ${
                            servicedata.from.split(",")[0]
                          }`}
                          className="add-inpt"
                          onChange={handelinput}
                          value={cstmrdtl.address}
                          autoComplete="off"
                        />
                      )}
                      <select
                        className="add-tgl"
                        name="addtype"
                        onChange={handelinput}
                      >
                        <option value="auto">Auto</option>
                        <option value="custom">Custom</option>
                      </select>

                      {/* <div className="loca-wrap">
                        <input
                          type="text"
                          name="address"
                          placeholder={`Pickup address in ${
                            servicedata.from.split(",")[0]
                          }`}
                          className="dtl-input"
                          onChange={handelinput}
                          value={cstmrdtl.address}
                          autoComplete="off"
                          onClick={() => {
                            setshowsug(true);
                          }}
                        />
                        {showsug ? (
                          <div className="autocomplete-wrapper">
                            {loca.map((itm, i) => {
                              return (
                                <div
                                  key={i}
                                  className="suggestion"
                                  onClick={() => {
                                    setcstmrdtl({
                                      ...cstmrdtl,
                                      address: `${itm.name}`,
                                    });
                                    setshowsug(false);
                                  }}
                                >
                                  <div className="location-icon">
                                    <ImLocation2 />
                                  </div>
                                  <div
                                    className="location-text"
                                    style={{ height: "19px" }}
                                  >
                                    <div className="location-city">
                                      {itm.name}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          ""
                        )}
                      </div> */}
                    </div>

                    <div className="dtl-form-row">
                      <select
                        name="trprsn"
                        className="dtl-input"
                        onChange={handelinput}
                        value={cstmrdtl.trprsn}
                        style={{ width: "calc( 100% - 64px )" }}
                      >
                        <option value="">Select Trip Reason</option>
                        <option value="Personal">PERSONAL</option>
                        <option value="Business">BUSINESS</option>
                      </select>
                      <Tippy
                        content={
                          <div className="tpy-dtl">
                            <div className="tpy-sbcon">
                              <div className="tpy-sbhd">Personal</div>
                              <div className="tpy-ctnt">
                                If the guest is traveling for the personal
                                purpose and he will not submit the invoice in
                                the office for the reimbursement .
                              </div>
                            </div>
                            <div className="tpy-sbcon">
                              <div className="tpy-sbhd">Business</div>
                              <div className="tpy-ctnt">
                                If the guest is traveling for the official
                                purpose and he will have to submit the Invoice
                                into the Office for the reimbursement.
                              </div>
                            </div>
                          </div>
                        }
                      >
                        <div>
                          <BsFillPatchQuestionFill
                            style={{ color: "#ff6c04" }}
                          />
                        </div>
                      </Tippy>
                    </div>
                    {cstmrdtl.trprsn === "Business" ? (
                      <>
                        <div className="dtl-form-row">
                          <div className="di-con">
                            <input
                              type="text"
                              name="comgstno"
                              placeholder="Company GST No."
                              className="dtl-input-di"
                              onChange={handelinput}
                              value={cstmrdtl.comgstno}
                              autoComplete="off"
                            />
                          </div>
                          <div className="di-con">
                            <input
                              type="text"
                              name="comname"
                              placeholder="Company Name"
                              className="dtl-input-di"
                              onChange={handelinput}
                              value={cstmrdtl.comname}
                              autoComplete="off"
                            />
                          </div>
                        </div>
                        <div className="dtl-form-row">
                          <input
                            type="text"
                            name="comaddress"
                            placeholder="Company Address"
                            className="dtl-input"
                            onChange={handelinput}
                            value={cstmrdtl.comaddress}
                            autoComplete="off"
                          />
                        </div>
                      </>
                    ) : (
                      ""
                    )}
                    <div className="dtl-form-row">
                      <button
                        type="submit"
                        className={ld.crt ? "action-btn loading" : "action-btn"}
                        onClick={crtbooking}
                        style={{ margin: "0px 16px" }}
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
                className={ld.py ? "dtl-form progress-layer" : "dtl-form"}
                style={{ marginTop: "4px" }}
              >
                <div className={viewstate === "pmts" ? "Cbhead" : "Cbhead gry"}>
                  <HiCurrencyRupee style={{ marginRight: "5px" }} /> Billing
                  Details
                </div>
                {viewstate === "pmts" ? (
                  <form>
                    <div className="cb-img ovrly-ad">
                      <img
                        src={`/car/${itm.cab_id}/${itm.name}.png`}
                        alt=""
                        srcset=""
                      />
                    </div>
                    <table className="blng-tbl">
                      <tbody>
                        <tr>
                          <td>Cab</td>
                          <td> {itm.name}</td>
                        </tr>
                        <tr>
                          <td>Trip type</td>
                          <td>
                            {`${servicedata.bookingtype
                              .charAt(0)
                              .toUpperCase()
                              .concat(servicedata.bookingtype.slice(1))} ${
                              servicedata.bookingtype === "outstation"
                                ? `( ${itm.distance} KM )`
                                : `( ${itm.distance} KM ) || ( ${itm.hour} HR ) )`
                            }`}
                          </td>
                        </tr>
                        <tr>
                          <td>
                            {servicedata.bookingtype === "outstation"
                              ? "Route"
                              : "City"}
                          </td>
                          <td>
                            {servicedata.from.split(",")[0]}

                            {servicedata.bookingtype === "outstation" ? (
                              <>
                                {servicedata.outstationtype === "Oneway" ? (
                                  <CgArrowRight style={{ fontSize: "25px" }} />
                                ) : (
                                  <CgArrowsExchange
                                    style={{ fontSize: "25px" }}
                                  />
                                )}{" "}
                                {servicedata.to.split(",")[0]} ({" "}
                                {servicedata.outstationtype} )
                              </>
                            ) : (
                              ""
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td>Pickup Date & Time</td>
                          <td>
                            {new Date(servicedata.pickupat).toLocaleString(
                              "en-IN"
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td>
                            Estimated Fare{" "}
                            <Tippy
                              content={
                                <div className="tpy-dtl">
                                  <div
                                    className="tpy-ctnt"
                                    style={{ border: "none" }}
                                  >
                                    This is an Estimated Fare because the final
                                    fare may change if the cab travel more than{" "}
                                    {itm.distance ? itm.distance : "Quoted"} KM
                                    or if the client make any change in trip.
                                  </div>
                                </div>
                              }
                            >
                              <div style={{ marginLeft: "10px" }}>
                                <BsFillPatchQuestionFill
                                  style={{ color: "#ff6c04" }}
                                />
                              </div>
                            </Tippy>
                          </td>
                          <td className="gr-txt">₹ {itm.totalpayable}</td>
                        </tr>
                      </tbody>
                    </table>
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
                    <table className="blng-tbl">
                      <tbody>
                        <tr>
                          <td>
                            Estimated Balance{" "}
                            <Tippy
                              content={
                                <div className="tpy-dtl">
                                  <div
                                    className="tpy-ctnt"
                                    style={{ border: "none" }}
                                  >
                                    This is an Estimated Balance because the
                                    final Balance may change if the cab travel
                                    more than{" "}
                                    {itm.distance ? itm.distance : "Quoted"} KM
                                    or if the client make any change in trip.
                                  </div>
                                </div>
                              }
                            >
                              <div style={{ marginLeft: "10px" }}>
                                <BsFillPatchQuestionFill
                                  style={{ color: "#ff6c04" }}
                                />
                              </div>
                            </Tippy>
                          </td>
                          <td
                            className={
                              itm.totalpayable - pmt.samount <= 0
                                ? "gr-txt"
                                : "rd-txt"
                            }
                          >
                            {" "}
                            ₹ {itm.totalpayable - pmt.samount}
                          </td>
                        </tr>
                        <tr>
                          <td>State Tax & Toll</td>
                          <td
                            className={
                              itm.othercharges.Tolltaxes.isinclude
                                ? "gr-txt"
                                : "rd-txt"
                            }
                          >
                            {itm.othercharges.Tolltaxes.isinclude
                              ? "Include"
                              : "Exclude"}
                          </td>
                        </tr>
                        <tr>
                          <td>Gst</td>
                          <td
                            className={
                              itm.othercharges.GST.isinclude
                                ? "gr-txt"
                                : "rd-txt"
                            }
                          >
                            {itm.othercharges.GST.isinclude
                              ? "Include"
                              : "Exclude"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <button
                      type="submit"
                      className={ld.py ? "pay-btn load-btn" : "pay-btn"}
                      onClick={pmt.samount === 0 ? nadv : displayRazorpay}
                    >
                      <span>{pmt.samount === 0 ? "Confirm" : "Proceed"}</span>
                    </button>
                  </form>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="alert-con">
              <div className="alert-head">Trip Terms</div>
              {itm.pickupat - new Date().getTime() > 86400000 ? (
                <div className="alert-bx">
                  <span>
                    <FcApproval /> Free Cancellation applicable before{" "}
                    {new Date(itm.pickupat - 86400000).toLocaleString()}
                  </span>
                </div>
              ) : (
                ""
              )}
              <div className="alert-sub-con">
                <ul className="info-li">
                  <li>
                    {itm.othercharges.GST.isinclude ? (
                      <>
                        <span>
                          <FcApproval />
                        </span>
                        Gst Included (5%)
                      </>
                    ) : (
                      <>
                        <p>
                          <FaTimesCircle />
                        </p>
                        Gst Excluded (5%)
                      </>
                    )}
                  </li>
                  <li>
                    {itm.othercharges.Tolltaxes.isinclude ? (
                      <>
                        <span>
                          <FcApproval />
                        </span>
                        Inclusive of Toll's and State Tax
                      </>
                    ) : (
                      <>
                        <p>
                          <FaTimesCircle />
                        </p>
                        Exclusive of Toll's and State Tax
                      </>
                    )}
                  </li>
                  <li>
                    {itm.othercharges.Night.isinclude ? (
                      <>
                        <span>
                          <FcApproval />
                        </span>
                        Night charges Included{" "}
                      </>
                    ) : (
                      <>
                        <p>
                          <FaTimesCircle />
                        </p>
                        Night charges (10 PM - 6 AM) - Rs.
                        {itm.othercharges.Night.amount}
                      </>
                    )}
                  </li>
                  <li>
                    <p>
                      <FaTimesCircle />
                    </p>
                    Wating charge - Rs.{itm.othercharges.Extrahour.amount}/hr
                  </li>
                  <li>
                    <p>
                      <FaTimesCircle />
                    </p>
                    Extra charges after {itm.distance} km - Rs.
                    {itm.othercharges.Extrakm.amount}/km
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
          <div className="cmplt-con-rgt ovrly-ad">
            <img src="/car/ad1.jpg" alt="" srcSet="" className="cmplt-image" />
          </div>
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
