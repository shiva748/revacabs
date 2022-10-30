import React, { useState } from "react";
import {
  FaUserAlt,
  FaTimes,
  FaTimesCircle,
  FaCarAlt,
  FaPhone,
} from "react-icons/fa";
import { FcApproval } from "react-icons/fc";
import { BsShieldLockFill } from "react-icons/bs";
import { NavLink, useHistory } from "react-router-dom";
import { CgPassword } from "react-icons/cg";
import validator from "validator";
import Timer from "../../template/Navbar/Timer";
import { Helmet } from "react-helmet";
const Driverlog = () => {
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
  if (localStorage.drilogged === "y") {
    history.push("/driver/dashboard");
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
    }
    if (isvalid()) {
      return;
    }
    setldngst(true);
    const res = await fetch("/driver/login", {
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
        localStorage.setItem("drilogged", "y");
        setrdata(dr);
        history.push("/driver/dashboard");
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

  // === === === form to view === === === //

  const [frmvw, setfrmvw] = useState({ form: "login" });

  // === === === reset data === === === //

  const drs = {
    email: "",
    phone: "",
    code: "",
    password: "",
    cPassword: "",
  };
  const [rstd, setrstd] = useState(drs);

  const handelinputr = (e) => {
    name = e.target.name;
    value = e.target.value;
    setrstd({ ...rstd, [name]: value });
  };

  const [over, setover] = useState(false);

  // === === === forgot password === === === //
  const forgotpass = async () => {
    const email = rstd.email;
    const phone = rstd.phone;
    if (!email || !phone) {
      window.alert("invalid request");
      // return setalert({
      //   display: true,
      //   title: "",
      //   message: `Please fill all the fields`,
      //   type: "danger",
      // });
    }
    const res = await fetch("/driver/forgot-password", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        phone,
      }),
    });
    const data = await res.json();
    if (res.status === 201) {
      setfrmvw({ ...frmvw, form: "forgotpass-otp" });
      setalert({
        display: true,
        title: "",
        message: `A code had been sent to ${phone}`,
        type: "green",
      });
    } else {
      setalert({
        display: true,
        title: "",
        message: data.error,
        type: "danger",
      });
    }
  };

  // === === === reset password === === === //
  const resetpass = async () => {
    // ===================validate karwa
    const { email, phone, code, password, cPassword } = rstd;
    if (!password || !cPassword || !code || !email || !phone) {
      return setalert({
        display: true,
        title: "",
        message: `Please fill all the fields`,
        type: "danger",
      });
    }
    if (password !== cPassword) {
      return setalert({
        display: true,
        title: "",
        message: `Password and confirm do not match `,
        type: "danger",
      });
    }
    if (password.length < 8) {
      return setalert({
        display: true,
        title: "",
        message: `Please enter a strong password`,
        type: "danger",
      });
    }
    const res = await fetch("/driver/reset-pass", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        phone,
        code,
        password,
        cPassword,
      }),
    });
    const data = await res.json();
    if (res.status === 200) {
      // eslint-disable-next-line
      setfrmvw({ ...frmvw, form: "login" });
      setrstd(drs);
      return setalert({
        display: true,
        title: "",
        message: `Password changed Successfully `,
        type: "green",
      });
    } else {
      return setalert({
        display: true,
        title: "",
        message: `${data.error}`,
        type: "danger",
      });
    }
  };

  // === === === reqverification === === === //

  const resendotp = async () => {
    if (!over) {
      return;
    } else {
      setover(false);
    }
    const { email, phone } = rstd;
    if (!email || !phone) {
      return setalert({
        display: true,
        title: "",
        message: `Please fill all the fields`,
        type: "danger",
      });
    }
    const ores = await fetch("/driver/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        phone,
        rsn: "forgotpass",
      }),
    });
    const ordata = await ores.json();
    if (ordata.result) {
      return true;
    } else {
      return false;
    }
  };
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>RevaCabs | Driver Login</title>
        <meta
          name="Keywords"
          content="RevaCabs Operator Login, RevaCabs Operator, Car Rental Service"
        ></meta>
        <meta
          name="description"
          content="Revacabs Driver login, Login via email password or Forgot password"
        />
        <link rel="canonical" href="http://partner.revacabs.com/" />
      </Helmet>
      <div className="temp-hd">
        <img src="/icons/logo.png" alt="" className="logo" />
      </div>
      <section className="partner-log">
        <div className="log-container">
          {frmvw.form === "login" ? (
            <>
              <div className="log-top">
                <FaCarAlt />
              </div>
              <div className="log-hd">
                <h1 className="log-hdtxt">Driver Login</h1>
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
                  <span
                    className="blu-txt"
                    onClick={() => {
                      setfrmvw({ ...frmvw, form: "rstpassword" });
                    }}
                  >
                    Forgot Password ?
                  </span>
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
                <NavLink className="blu-txt" to="/login">
                  <span>Operator login ?</span>
                </NavLink>
              </div>
            </>
          ) : (
            ""
          )}
          {frmvw.form === "rstpassword" ? (
            <>
              <div className="log-top">
                <CgPassword />
              </div>
              <div className="log-hd">
                <h1 className="log-hdtxt">Reset password</h1>
              </div>
              <div className="form-row">
                <div className="irt">
                  <FaUserAlt />
                </div>
                <input
                  type="email"
                  className="log-input"
                  placeholder="Email Address"
                  name="email"
                  onChange={handelinputr}
                  value={rstd.email}
                />
              </div>
              <div className="form-row">
                <div className="irt">
                  <FaPhone />
                </div>
                <input
                  type="tel"
                  className="log-input"
                  placeholder="Phone No"
                  name="phone"
                  onChange={handelinputr}
                  value={rstd.phone}
                />
              </div>
              <div className={ldngst ? "form-row ovrly-ad" : "form-row"}>
                <button
                  type="submit"
                  className={ldngst ? "log-btn ldng-btn" : "log-btn"}
                  onClick={forgotpass}
                >
                  <span>Submit</span>
                </button>
              </div>
              <div className="log-btm">
                <div
                  className="blu-txt"
                  onClick={() => {
                    setfrmvw({ form: "login" });
                    setrstd(drs);
                  }}
                >
                  <span>Login</span>
                </div>
                <NavLink className="blu-txt" to="/driver/login">
                  <span>Driver login ?</span>
                </NavLink>
              </div>
            </>
          ) : (
            ""
          )}
          {frmvw.form === "forgotpass-otp" ? (
            <>
              <div className="log-top">
                <CgPassword />
              </div>
              <div className="log-hd">
                <h1 className="log-hdtxt">Reset password</h1>
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
                  onChange={handelinputr}
                  value={rstd.password}
                />
              </div>
              <div className="form-row">
                <div className="irt">
                  <BsShieldLockFill />
                </div>
                <input
                  type="password"
                  className="log-input"
                  placeholder="Confirm Password"
                  name="cPassword"
                  onChange={handelinputr}
                  value={rstd.cPassword}
                />
              </div>
              <div className="form-row">
                <div className="irt">
                  <CgPassword />
                </div>
                <input
                  type="number"
                  className="log-input"
                  placeholder="OTP"
                  name="code"
                  onChange={handelinputr}
                  value={rstd.code}
                />
              </div>
              <div className="form-row">
                {over ? (
                  <span onClick={resendotp} className="blu-txt">
                    Resend Otp ?
                  </span>
                ) : (
                  <Timer over={over} setover={setover} sec={60} />
                )}
              </div>
              <div className={ldngst ? "form-row ovrly-ad" : "form-row"}>
                <button
                  type="submit"
                  className={ldngst ? "log-btn ldng-btn" : "log-btn"}
                  onClick={resetpass}
                >
                  <span>Submit</span>
                </button>
              </div>
              <div className="log-btm">
                <div
                  className="blu-txt"
                  onClick={() => {
                    setfrmvw({ form: "login" });
                    setrstd(drs);
                  }}
                >
                  <span>Login</span>
                </div>
                <NavLink className="blu-txt" to="/driver/login">
                  <span>Driver login ?</span>
                </NavLink>
              </div>
            </>
          ) : (
            ""
          )}
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

export default Driverlog;
