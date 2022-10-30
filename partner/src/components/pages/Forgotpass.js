import React, { useState} from "react";
import { FaUserAlt, FaTimes, FaTimesCircle, FaPhone } from "react-icons/fa";
import { FcApproval } from "react-icons/fc";
import { GiThink } from "react-icons/gi";
import { NavLink, useHistory } from "react-router-dom";
import { Helmet } from "react-helmet";
const Forgotpass = () => {
  const history = useHistory();
  const [ldngst, setldngst] = useState(false);
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

  // === === === input validation === === === //
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
    setldngst(true);
    const res = await fetch("/partner/forgot-password", {
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
      sessionStorage.setItem(
        "frgtpass",
        JSON.stringify({ email, phone, result: true })
      );
      history.push("/resetpassword");
    } else {
      setldngst(false);
      setalert({
        display: true,
        title: "",
        message: data.error,
        type: "danger",
      });
    }
  };
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>RevaCabs | Operator Forgot password</title>
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
            <GiThink />
          </div>
          <div className="log-hd">
            <h1 className="log-hdtxt">Forgot password</h1>
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

export default Forgotpass;
