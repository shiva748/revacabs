import React, { useEffect, useState } from "react";
import "./css/partnerlog.css";
import {
  FaTimes,
  FaTimesCircle,
} from "react-icons/fa";
import { FcApproval } from "react-icons/fc";
import { CgPassword } from "react-icons/cg";
import { BsShieldLockFill } from "react-icons/bs";
import { NavLink, useHistory } from "react-router-dom";
import { Helmet } from "react-helmet";

const Resetpass = () => {
  const history = useHistory();
  const [ldngst, setldngst] = useState({ fin: false, rsnd: false });
  const [alert, setalert] = useState({
    display: false,
    title: "",
    message: "",
    type: "",
  });
  if (localStorage.islogged === "y") {
    history.push("/dashboard");
  } else if (!sessionStorage.getItem("frgtpass")) {
    window.alert("hi");
    history.push("/login");
  }
  // === === === counter === === === //

  const [count, setcount] = useState(60);
  const [over, setover] = useState(false);
  function timer() {
    setover(false);
    let time = 60;
    let timer1 = setInterval(() => {
      if (time <= 1) {
        clearInterval(timer1);
        setover(true);
        setcount(60);
      } else {
        time--;
        setcount(time);
      }
    }, 1000);
  }
  useEffect(() => {
    timer();
  }, []);

  let drs;
  let data = JSON.parse(sessionStorage.getItem("frgtpass"));
  if (!data.result) {
    history.push("/login");
  } else {
    drs = {
      email: data.email,
      phone: data.phone,
      code: "",
      password: "",
      cPassword: "",
    };
  }
  let name, value;

  // === === === input validation === === === //
  //   const ert = {
  //     email: { display: false, message: "" },
  //     password: { display: false, message: "" },
  //   };
  //   const [error, seterror] = useState(ert);
  //   const isemail = () => {
  //     if (!validator.isEmail(rdata.email)) {
  //       seterror({
  //         ...error,
  //         // eslint-disable-next-line
  //         ["email"]: { display: true, message: "Please enter a valid email" },
  //       });
  //       return false;
  //     } else {
  //       return true;
  //     }
  //   };

  //   const ispassword = () => {
  //     if (rdata.password.length < 8) {
  //       seterror({
  //         ...error,
  //         // eslint-disable-next-line
  //         ["password"]: {
  //           display: true,
  //           message: "please enter atleast 8 character's",
  //         },
  //       });
  //       return false;
  //     } else {
  //       return true;
  //     }
  //   };
  //   const isvalid = () => {
  //     let error = false;
  //     if (!isemail()) {
  //       error = true;
  //     }
  //     if (!ispassword()) {
  //       error = true;
  //     }
  //     return error;
  //   };
  const [rstd, setrstd] = useState(drs);
  const handelinputr = (e) => {
    name = e.target.name;
    value = e.target.value;
    setrstd({ ...rstd, [name]: value });
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
    setldngst({ ...ldngst, fin: true });
    const res = await fetch("/partner/reset-pass", {
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
      history.push("/login");
    } else {
      setldngst({ ...ldngst, fin: false });
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
    setldngst({ ...ldngst, rsnd: true });
    const ores = await fetch("/partner/resend-otp", {
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
      setldngst({ ...ldngst, rsnd: false });
      timer();
      return true;
    } else {
      return false;
    }
  };

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>RevaCabs | Reset password</title>
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
            <div className={ldngst.rsnd ? "ldng-lnk" : ""}>
              <span onClick={resendotp} className="blu-txt">
                Resend Otp {over ? "?" : `in ${count} sec ?`}
              </span>
            </div>
          </div>
          <div className={ldngst.fin ? "form-row ovrly-ad" : "form-row"}>
            <button
              type="submit"
              className={ldngst.fin ? "log-btn ldng-btn" : "log-btn"}
              onClick={resetpass}
            >
              <span>Submit</span>
            </button>
          </div>
          <div className="log-btm">
            <NavLink className="blu-txt" to="/login">
              <span>Login</span>
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

export default Resetpass;
