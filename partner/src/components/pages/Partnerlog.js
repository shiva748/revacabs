import React, { useState } from "react";
import "./css/partnerlog.css";
import {
  FaUserAlt,
  FaHandshake,
  FaTimes,
  FaTimesCircle,
} from "react-icons/fa";
import { FcApproval } from "react-icons/fc";
import { BsShieldLockFill } from "react-icons/bs";
import { NavLink, useHistory } from "react-router-dom";
import validator from "validator";
import { Helmet } from "react-helmet";
const Partnerlog = () => {
  const history = useHistory();
  let dr = {
    email: "",
    password: "",
  };
  const [ldngst, setldngst] = useState(false);
  const [rdata, setrdata] = useState(dr);
  const [alert, setalert] = useState({
    display: false,
    title: "",
    message: "",
    type: "",
  });
  if (localStorage.islogged === "y") {
    history.push("/dashboard");
  }
  let name, value;
  const handelinput = (e) => {
    name = e.target.name;
    value = e.target.value;
    setrdata({ ...rdata, [name]: value });
  };
  const loginpost = async (e) => {
    e.preventDefault();
    const { email, password } = rdata;
    if (!email || !password) {
      return setalert({
        display: true,
        title: "",
        message: "Please fill all the fields",
        type: "danger",
      });
    } else if (typeof email !== "string" || typeof password !== "string") {
      return setalert({
        display: true,
        title: "",
        message: "Invalid data type",
        type: "danger",
      });
    }
    if (isvalid()) {
      return;
    }
    setldngst(true);
    const res = await fetch("/partner/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.status !== 200 || data.error) {
      setldngst(false);
      return setalert({
        display: true,
        title: "",
        message: `${data.error}`,
        type: "danger",
      });
    } else {
      if (data.result) {
        localStorage.setItem("islogged", "y");
        setrdata(dr);
        history.push("/dashboard");
      } else {
        setalert({
          display: true,
          title: "",
          message: data.message,
          type: "green",
        });
        setrdata(dr);
      }
      setldngst(false);
    }
  };
  // === === === input validation === === === //
  const ert = {
    email: { display: false, message: "" },
    password: { display: false, message: "" },
  };
  const [error, seterror] = useState(ert);
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
    } else {
      return true;
    }
  };
  const isvalid = () => {
    let error = false;
    if (!isemail()) {
      error = true;
    }
    if (!ispassword()) {
      error = true;
    }
    return error;
  };
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>RevaCabs | Operator Login</title>
        <meta
          name="Keywords"
          content="RevaCabs Operator Login, RevaCabs Operator, Car Rental Service"
        ></meta>
        <meta
          name="description"
          content="Revacabs Operator login, Login via email password or Forgot password"
        />
        <link rel="canonical" href="http://partner.revacabs.com/" />
      </Helmet>
      <div className="temp-hd">
        <img src="/icons/logo.png" alt="" className="logo" />
        <NavLink className="temp-hdbtn" to="/register">
          <span>Register</span>
        </NavLink>
      </div>
      <section className="partner-log">
        <div className="log-container">
          <div className="log-top">
            <FaHandshake />
          </div>
          <div className="log-hd">
            <h1 className="log-hdtxt">Operator Login</h1>
          </div>
          <form>
            <div className="form-row">
              <div className="irt">
                <FaUserAlt />
              </div>
              <input
                type="email"
                className="log-input"
                placeholder="Email Address"
                name="email"
                onChange={handelinput}
                value={rdata.email}
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
            <div className="form-row">
              <div className="irt">
                <BsShieldLockFill />
              </div>
              <input
                type="password"
                className="log-input"
                placeholder="Password"
                name="password"
                value={rdata.password}
                onChange={handelinput}
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
            <div className="form-row">
              <NavLink className="blu-txt" to="/forgotpassword">
                <span>Forgot Password ?</span>
              </NavLink>
            </div>
            <div className={ldngst ? "form-row ovrly-ad" : "form-row"}>
              <button
                type="submit"
                className={ldngst ? "log-btn ldng-btn" : "log-btn"}
                onClick={loginpost}
              >
                <span>Login</span>
              </button>
            </div>
          </form>
          <div className="log-btm">
            <NavLink className="blu-txt" to="/register">
              <span>Register Now ?</span>
            </NavLink>
            <NavLink className="blu-txt" to="/driver/login">
              <span>Driver login ?</span>
            </NavLink>
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

export default Partnerlog;
