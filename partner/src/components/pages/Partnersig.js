import React, { useEffect, useState } from "react";
import {
  FaCaretRight,
  FaPhoneAlt,
  FaWhatsappSquare,
  FaTimesCircle,
  FaTimes,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { NavLink, useHistory } from "react-router-dom";
import "./css/partnersig.css";
import validator from "validator";
import { FcApproval } from "react-icons/fc";
import { Helmet } from "react-helmet";
const Partnersig = () => {
  const history = useHistory();
  if (localStorage.islogged === "y") {
    history.push("/dashboard");
  }
  const [hgt, sethgt] = useState();
  const resizer = () => {
    const height = window.innerHeight - 60;
    sethgt(height);
  };
  window.addEventListener("resize", resizer);
  useEffect(() => {
    resizer();
    // eslint-disable-next-line
  }, []);
  // === === === alert === === === //
  const [alert, setalert] = useState({
    display: false,
    title: "",
    message: "",
    type: "",
  });

  // === === === register request === === === //
  // === === === ldngbtn === === ===//
  const [ldngst, setldngst] = useState(false);
  // === === === ldng-btn end === === ===//

  const dr = {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    cPassword: "",
  };
  const [rdata, setrdata] = useState(dr);
  let name, value;
  const handelinput = (e) => {
    name = e.target.name;
    value = e.target.value;
    setrdata({ ...rdata, [name]: value });
  };

  // === === === input validation === === === //
  const ert = {
    firstName: { display: false, message: "" },
    lastName: { display: false, message: "" },
    email: { display: false, message: "" },
    phone: { display: false, message: "" },
    password: { display: false, message: "" },
    cPassword: { display: false, message: "" },
  };
  const [error, seterror] = useState(ert);
  const isfirstName = () => {
    var pattern = /^[a-zA-Z]{2,50}$/;
    if (!rdata.firstName.match(pattern)) {
      seterror({
        ...error,
        firstName: { display: true, message: "Please enter a valid name" },
      });
      return false;
    } else {
      return true;
    }
  };
  const islastName = () => {
    var pattern = /^[a-zA-Z]{2,50}$/;
    if (!rdata.lastName.match(pattern)) {
      seterror({
        ...error,
        lastName: { display: true, message: "Please enter a valid name" },
      });
      return false;
    } else {
      return true;
    }
  };
  const isemail = () => {
    if (!validator.isEmail(rdata.email)) {
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
    if (!validator.isMobilePhone(rdata.phone, "en-IN")) {
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
  const ispassword = () => {
    if (rdata.password.length < 8) {
      seterror({
        ...error,
        // eslint-disable-next-line
        ["password"]: {
          display: true,
          message: "please enter atleast 8 character's",
        },
      });
      return false;
    } else if (rdata.cPassword) {
      if (rdata.password !== rdata.cPassword) {
        seterror({
          ...error,
          // eslint-disable-next-line
          ["cPassword"]: {
            display: true,
            message: "Passwords do not match",
          },
        });
        return false;
      } else {
        seterror({
          ...error,
          // eslint-disable-next-line
          ["cPassword"]: {
            display: false,
            message: "",
          },
        });
        return true;
      }
    } else {
      return true;
    }
  };
  const isvalid = () => {
    let error = false;
    if (!isfirstName()) {
      error = true;
    }
    if (!islastName()) {
      error = true;
    }
    if (!isemail()) {
      error = true;
    }
    if (!isphone()) {
      error = true;
    }
    if (!ispassword()) {
      error = true;
    }
    return error;
  };
  const postdata = async (e) => {
    e.preventDefault();
    const { firstName, lastName, phone, email, password, cPassword } = rdata;
    if (
      !firstName ||
      !lastName ||
      !phone ||
      !email ||
      !password ||
      !cPassword
    ) {
      return setalert({
        display: true,
        title: "Failed",
        message: `Please fill all the fields`,
        type: "danger",
      });

      // === === ==== name validate karwana hai ===//
    }
    if (
      typeof email !== "string" ||
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof password !== "string" ||
      typeof cPassword !== "string"
    ) {
      return setalert({
        display: true,
        title: "Failed",
        message: `Invalid data type`,
        type: "danger",
      });
    }
    if (isvalid()) {
      return;
    }
    setldngst(true);
    const res = await fetch("/partner/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        phone,
        email,
        password,
        cPassword,
      }),
    });
    const data = await res.json();
    if (res.status !== 201) {
      setldngst(false);
      return setalert({
        display: true,
        title: "",
        message: `${data.error}`,
        type: "danger",
      });
    } else {
      setrdata(dr);
      setldngst(false);
      return setalert({
        display: true,
        title: "",
        message: `${data.message}`,
        type: "green",
      });
    }
  };

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>RevaCabs | Operator Registration</title>
        <meta
          name="Keywords"
          content="RevaCabs Operator Registration, RevaCabs Operator, Car Rental Service"
        ></meta>
        <meta
          name="description"
          content="Revacabs Operator Registration, Provide the required details our executive will reach you shortly"
        />
        <link rel="canonical" href="http://partner.revacabs.com/" />
      </Helmet>
      <div className="temp-hd">
        <img src="/icons/logo.png" alt="" className="logo" />
        <NavLink to="/login" className="temp-hdbtn">
          <span>Login</span>
        </NavLink>
      </div>
      <section className="partner-sig" style={{ height: `${hgt}px` }}>
        <div className={ldngst ? "ovrly-ad apltn-con" : "apltn-con"}>
          <div className="apltn-hd">Start registration</div>
          <form id="prtnr-rgstr">
            <div className="rgstr-row">
              <span className="bold-txt rgstr-txt">
                First name (as shown on your Id's)
              </span>
              <input
                type="text"
                className="rgstr-inpt"
                placeholder="First Name"
                name="firstName"
                onChange={handelinput}
                value={rdata.firstName}
                onBlur={isfirstName}
                onFocus={() => {
                  seterror({
                    ...error,
                    // eslint-disable-next-line
                    ["firstName"]: { display: false, message: "" },
                  });
                }}
              />
              {error.firstName.display ? (
                <span className="input-err">{error.firstName.message}</span>
              ) : (
                ""
              )}
            </div>
            <div className="rgstr-row">
              <span className="bold-txt rgstr-txt">
                Last name (as shown on your Id's)
              </span>
              <input
                type="text"
                className="rgstr-inpt"
                placeholder="Last Name"
                name="lastName"
                onChange={handelinput}
                value={rdata.lastName}
                onBlur={islastName}
                onFocus={() => {
                  seterror({
                    ...error,
                    // eslint-disable-next-line
                    ["lastName"]: { display: false, message: "" },
                  });
                }}
              />
              {error.lastName.display ? (
                <span className="input-err">{error.lastName.message}</span>
              ) : (
                ""
              )}
            </div>
            <div className="rgstr-row">
              <span className="bold-txt rgstr-txt">Email</span>
              <input
                type="email"
                className="rgstr-inpt"
                placeholder="Email"
                name="email"
                value={rdata.email}
                onChange={handelinput}
                onFocus={() =>
                  seterror({
                    ...error,
                    // eslint-disable-next-line
                    ["email"]: { display: false, message: "" },
                  })
                }
                onBlur={isemail}
              />
              {error.email.display ? (
                <span className="input-err">{error.email.message}</span>
              ) : (
                ""
              )}
            </div>
            <div className="rgstr-row">
              <span className="bold-txt rgstr-txt">Phone</span>
              <input
                type="tel"
                className="rgstr-inpt"
                placeholder="Phone"
                name="phone"
                onChange={handelinput}
                value={rdata.phone}
                onFocus={() =>
                  seterror({
                    ...error,
                    // eslint-disable-next-line
                    ["phone"]: { display: false, message: "" },
                  })
                }
                onBlur={isphone}
              />
              {error.phone.display ? (
                <span className="input-err">{error.phone.message}</span>
              ) : (
                ""
              )}
            </div>
            <div className="rgstr-row">
              <span className="bold-txt rgstr-txt">Password</span>
              <input
                type="password"
                className="rgstr-inpt"
                placeholder="Password"
                name="password"
                onChange={handelinput}
                value={rdata.password}
                onFocus={() =>
                  seterror({
                    ...error,
                    // eslint-disable-next-line
                    ["password"]: { display: false, message: "" },
                  })
                }
                onBlur={ispassword}
              />
              {error.password.display ? (
                <span className="input-err">{error.password.message}</span>
              ) : (
                ""
              )}
            </div>
            <div className="rgstr-row">
              <span className="bold-txt rgstr-txt">Confirm Password</span>
              <input
                type="password"
                className="rgstr-inpt"
                placeholder="Confirm Password"
                name="cPassword"
                onChange={handelinput}
                value={rdata.cPassword}
                onFocus={() =>
                  seterror({
                    ...error,
                    // eslint-disable-next-line
                    ["cPassword"]: { display: false, message: "" },
                  })
                }
                onBlur={ispassword}
              />
              {error.cPassword.display ? (
                <span className="input-err">{error.cPassword.message}</span>
              ) : (
                ""
              )}
            </div>
            <div>
              <button
                type="submit"
                className={ldngst ? "rgstr-btn ldng-btn" : "rgstr-btn"}
                onClick={postdata}
              >
                <span>Register</span>
              </button>
            </div>
          </form>
        </div>
        <div className="prcs-con">
          <p className="prcs-hd">Registration process</p>
          <div className="stp-con">
            <div className="stp-row">
              <FaCaretRight />
              <span>Fill the registration form and note down the Code</span>
            </div>
            <div className="stp-row">
              <FaCaretRight />
              <span>You will receive a call within 24 working hours</span>
            </div>
            <div className="stp-row">
              <FaCaretRight />
              <span>
                The executive will ask for code and give you instruction's about
                the verification process
              </span>
            </div>
            <div className="stp-row">
              <FaCaretRight />
              <span>
                As your Verification is done add your drivers and cars and
                verify them
              </span>
            </div>
            <div className="stp-row">
              <FaCaretRight />
              <span>Start business with us</span>
            </div>
          </div>
          <p className="apltn-hd">Any Question? Contact Our team at</p>
          <div className="stp-row">
            <a href="mailto:Shivagautam2002@gmail.com" className="blu-txt">
              <MdEmail /> Shivagautam2002@gmail.com
            </a>
          </div>
          <div className="stp-row">
            <a href="tel:+919997548384" className="blu-txt">
              <FaPhoneAlt /> 9997548384
            </a>
          </div>
          <div className="stp-row">
            <a
              href=" https://wa.me/917599928115"
              className="blu-txt"
              target="_blank"
            >
              <FaWhatsappSquare style={{ color: "#34B7F1" }} /> 7599928115
            </a>
          </div>
        </div>
      </section>
      {alert.display ? (
        alert.type === "danger" ? (
          <div className="danger-alert">
            <span>
              <FaTimesCircle className="dismiss-alert" />
              {alert.title ? `${alert.title}:` : ""} {alert.message}
            </span>
            <FaTimes
              className="dismiss-alert"
              onClick={() => {
                // eslint-disable-next-line
                setalert({ ...alert, ["display"]: false });
              }}
            />
          </div>
        ) : (
          <div className="green-alert">
            <span>
              <FcApproval className="dismiss-alert" />
              {alert.title ? `${alert.title} :` : ""} {alert.message}
            </span>
            <FaTimes
              className="dismiss-alert"
              onClick={() => {
                // eslint-disable-next-line
                setalert({ ...alert, ["display"]: false });
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

export default Partnersig;
