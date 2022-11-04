import React, { useState, useEffect } from "react";
import { NavLink, useHistory } from "react-router-dom";
import "./Navbar.css";
import "./login.css";
import "../../Pages/css/Register.css";
import Rgstr from "../../images/Home/rgstr.jpg";
import { FcOnlineSupport, FcApproval } from "react-icons/fc";
import { FiUsers, FiLogOut } from "react-icons/fi";
import { GiMountainRoad } from "react-icons/gi";
import { VscThreeBars } from "react-icons/vsc";
import { MdDateRange, MdOutlinePendingActions } from "react-icons/md";
import { TiArrowSortedDown } from "react-icons/ti";
import { ImHome, ImCheckmark2, ImCross, ImFontSize } from "react-icons/im";
import { HiEye, HiEyeOff } from "react-icons/hi";
import {
  FaTimesCircle,
  FaWhatsappSquare,
  FaTimes,
  FaRegUser,
} from "react-icons/fa";
import validator from "validator";
import Timer from "./Timer";
const Navbar = () => {
  const history = useHistory();
  const [alert, setalert] = useState({
    display: false,
    title: "",
    message: "",
    type: "",
  });
  const [pdis, setpdis] = useState({ pass: false, cpass: false });
  const [udata, setudata] = useState({ display: false, data: { name: "" } });
  const [vw, setvw] = useState({
    load: true,
    nav: false,
    nvactv: "dash",
    drpdn: "",
    bkng: false,
    account: false,
  });
  const handelnav = (value) => {
    // eslint-disable-next-line
    setvw({ ...vw, ["nvactv"]: value, ["nav"]: false });
  };

  // === === === auto login === === === //

  const userlog = async () => {
    if (localStorage.getItem("islogged") === "y") {
      const res = await fetch("/api/autologin", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const dataa = await res.json();
      if (res.status !== 200) {
        localStorage.removeItem("islogged");
      } else {
        setfrmvw({ ...frmvw, display: false, loading: false });
        document.body.classList.remove("no-scrol");
        setudata({ display: true, data: dataa });
        sessionStorage.setItem("userdata", JSON.stringify(dataa));
        locator();
      }
    }
  };
  const locator = () => {
    const data = [
      {
        path: "/",
        actv: "hme",
      },
      { path: "/account", actv: "acnt" },
      { path: "/booking/ongoing", actv: "ongng" },
      { path: "/booking/completed", actv: "cmpltd" },
      { path: "/booking/cancelled", actv: "cncld" },
    ];
    let path = window.location.pathname;
    if (path.includes("/tourpackages")) {
      setvw({ ...vw, nvactv: "tor" });
    } else if (data.some((itm) => itm.path === window.location.pathname)) {
      const [match] = data.filter((itm) => itm.path === path);
      setvw({ ...vw, nvactv: match.actv });
    } else {
      setvw({ ...vw, nvactv: "" });
    }
  };
  const [frmvw, setfrmvw] = useState({
    display: false,
    form: "login",
    loading: false,
  });
  const [lr, setlr] = useState(true);
  useEffect(() => {
    userlog();
    // eslint-disable-next-line
  }, []);
  let name, value;

  const loginpost = async (e) => {
    e.preventDefault();
    if (isvalid("login")) {
      return;
    }
    setfrmvw({ ...frmvw, loading: true });
    const { email, password } = rdata;
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.status === 201) {
      setalert({
        display: true,
        title: "Verification",
        message: data.message,
        type: "green",
      });
      setrresult(data.details)
      setfrmvw({ ...frmvw, loading: false, form: "firstver" });
    } else if (res.status !== 200) {
      setalert({
        display: true,
        title: "Login failed",
        message: `${data.error}`,
        type: "danger",
      });
      setfrmvw({ ...frmvw, loading: false });
    } else {
      setalert({
        display: true,
        title: "",
        message: `Login Successfull`,
        type: "green",
      });
      setfrmvw({ ...frmvw, display: false, loading: false });
      localStorage.setItem("islogged", "y");
      document.body.classList.remove("no-scrol");
      window.location.reload();
      // userlog();
      setRdata(dr);
    }
  };

  // === === === singup === === === //

  const dr = {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    cPassword: "",
    code: "",
  };
  const [rdata, setRdata] = useState(dr);
  const handelinputs = (e) => {
    name = e.target.name;
    value = e.target.value;
    setRdata({ ...rdata, [name]: value });
  };
  const [rresult, setrresult] = useState();

  const postdata = async (e) => {
    e.preventDefault();
    if (isvalid("register")) {
      return;
    }
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
    setfrmvw({ ...frmvw, loading: true });
    const res = await fetch("/api/register", {
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
      setfrmvw({ ...frmvw, loading: false });
      setalert({
        display: true,
        title: "Failed",
        message: `${data.error}`,
        type: "danger",
      });
    } else {
      setrresult(data.details);
      setfrmvw({ ...frmvw, form: "firstver", loading: false });
      setalert({
        display: true,
        title: "",
        message: `A code had been sent to ${data.details.phone}`,
        type: "green",
      });
      setover({ ...over, regi: false });
    }
  };

  // === === === logout === === === //
  const logout = async () => {
    const res = await fetch("/api/logout", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    await res.json();
    localStorage.removeItem("islogged");
    setudata({ display: false, data: "" });
    history.push("/");
  };

  // === === === reqverification === === === //

  const reqverification = async (email, phone, rsn) => {
    if (
      !email ||
      !phone ||
      !rsn ||
      typeof rsn !== "string" ||
      !["forgotpass", "verification"].some((itm) => itm === rsn)
    ) {
      return setalert({
        display: true,
        title: "",
        message: `Please fill all the fields`,
        type: "danger",
      });
    }
    const ores = await fetch("/api/reqverification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        phone,
        rsn,
      }),
    });
    const ordata = await ores.json();
    if (ordata.result) {
      setover(
        rsn === "forgotpass"
          ? { ...over, frgt: false }
          : { ...over, regi: false }
      );
      return true;
    } else {
      return false;
    }
  };
  // === === === validateotp === === === //

  const validateotp = async (e) => {
    e.preventDefault();
    if (isvalid("vldtotp")) {
      return;
    }
    setfrmvw({ ...frmvw, loading: true });
    const res = await fetch("/api/validateotp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: rdata.code,
        email: rdata.email,
      }),
    });
    const data = await res.json();
    if (data.result && res.status === 200) {
      localStorage.setItem("islogged", "y");
      document.body.classList.remove("no-scrol");
      setfrmvw({ ...frmvw, display: false, form: "login", loading: false });
      // changes
      setlr(true);
      setRdata(dr);
      setrresult();
      setalert({
        display: true,
        title: "",
        message: `Successfully registered`,
        type: "green",
      });
      //changes;
      userlog();
    } else {
      setfrmvw({ ...frmvw, loading: false });
      setalert({
        display: true,
        title: "",
        message: `${data.error}`,
        type: "danger",
      });
    }
  };
  //register end
  const [over, setover] = useState({ frgt: true, regi: true });

  // === === === forgot password === === === //
  const forgotpass = async (e) => {
    e.preventDefault();
    if (isvalid("frgtpass")) {
      return;
    }
    const email = rdata.email;
    const phone = rdata.phone;
    if (!email || !phone) {
      return setalert({
        display: true,
        title: "",
        message: `Please fill all the fields`,
        type: "danger",
      });
    }
    const res = await fetch("/api/forgot-password", {
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
      setover({ ...over, frgt: false });
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
  const resetpass = async (e) => {
    e.preventDefault();
    // ===================validate karwa
    const { email, phone, code, password, cPassword } = rdata;
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
    const res = await fetch("/api/reset-pass", {
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
      setfrmvw({ ...frmvw, display: true, form: "login" });
      setRdata(dr);
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
  // === === === input validation === === === //
  const ert = {
    firstName: { display: false, message: "" },
    lastName: { display: false, message: "" },
    email: { display: false, message: "" },
    phone: { display: false, message: "" },
    password: { display: false, message: "" },
    cPassword: { display: false, message: "" },
    code: { display: false, message: "" },
  };
  const [error, seterror] = useState(ert);

  const isvalid = (type) => {
    let iser = false;
    let erdt = {};
    if (
      type === "email" ||
      type === "register" ||
      type === "login" ||
      type === "frgtpass" ||
      type === "vldtotp"
    ) {
      if (!validator.isEmail(rdata.email)) {
        erdt = {
          ...erdt,
          email: { display: true, message: "Please enter a valid email" },
        };
        iser = true;
      }
    }
    if (type === "phone" || type === "register" || type === "frgtpass") {
      if (!validator.isMobilePhone(rdata.phone, "en-IN")) {
        erdt = {
          ...erdt,
          phone: {
            display: true,
            message: "Please enter valid mobile number.",
          },
        };
        iser = true;
      }
    }
    if (type === "password" || type === "login" || type === "register") {
      if (rdata.password.length < 8) {
        erdt = {
          ...erdt,
          password: {
            display: true,
            message: "please enter atleast 8 character's",
          },
        };
        iser = true;
      }
    }
    if (type === "cpassword" || type === "register") {
      if (rdata.password !== rdata.cPassword) {
        erdt = {
          ...erdt,
          cPassword: {
            display: true,
            message: "Passwords do not match",
          },
        };
        iser = true;
      } else {
        if (rdata.cPassword.length < 8) {
          erdt = {
            ...erdt,
            cPassword: {
              display: true,
              message: "please enter atleast 8 character's",
            },
          };
          iser = true;
        }
      }
    }
    if (type === "code" || type === "vldtotp") {
      if (rdata.code.length !== 6) {
        erdt = {
          ...erdt,
          code: { display: true, message: "please enter a valid otp" },
        };
        iser = true;
      }
    }
    if (type === "firstName" || type === "register") {
      var regName = /^[ a-zA-Z\-/']+$/;
      if (!regName.test(rdata.firstName)) {
        erdt = {
          ...erdt,
          firstName: {
            display: true,
            message: "please enter a valid first name",
          },
        };
        iser = true;
      }
    }
    if (type === "lastName" || type === "register") {
      var regName = /^[ a-zA-Z\-/']+$/;
      if (!regName.test(rdata.lastName)) {
        erdt = {
          ...erdt,
          lastName: {
            display: true,
            message: "please enter a valid last name",
          },
        };
        iser = true;
      }
    }
    seterror({ ...error, ...erdt });
    if (
      type === "register" ||
      type === "login" ||
      type === "frgtpass" ||
      type === "vldtotp"
    ) {
      return iser;
    } else {
      return;
    }
  };
  return (
    <>
      <header className="top_header">
        <div className="top_link_container">
          <div className="top_link_itm">
            <a
              href="http://partners.revacabs.com/"
              className="top_link_facebook"
            >
              Partner
            </a>
          </div>
          <div className="top_link_itm">
            <a
              href="https://api.whatsapp.com/send/?phone=9456878882&text=Hi+RevaCabs%2C+Whatsup&type=phone_number&app_absent=0"
              target="_blank"
              className="top_link_whatsapp"
            >
              <FaWhatsappSquare /> Whatsapp
            </a>
          </div>
          <div className="top_link_itm">
            <NavLink to="/contactus" className="top_link_support">
              <FcOnlineSupport />
              Contact Us
            </NavLink>
          </div>
        </div>
      </header>
      <nav className="main-nav">
        <NavLink
          to="/"
          className="logo-link"
          onClick={() => {
            setvw({ ...vw, nav: false });
            handelnav("hme");
            document.body.classList.remove("no-scrol");
          }}
        >
          <img src="/icons/logo.png" alt="" srcSet="" className="logo" />
        </NavLink>
        <div className="Menu-div">
          <div
            className="user-btn"
            onClick={
              udata.data.name
                ? () => {
                    document.body.classList.add("no-scrol");
                    setvw({ ...vw, nav: true });
                  }
                : () => {
                    setfrmvw({ display: true, form: "login" });
                    document.body.classList.add("no-scrol");
                  }
            }
          >
            <span
              className="user-logo"
              style={udata.data.name ? { border: "none" } : {}}
            >
              {udata.data.name ? <VscThreeBars /> : <FaRegUser />}
            </span>
            {udata.data.name ? "" : "login"}
          </div>
        </div>
      </nav>
      {frmvw.display ? (
        <div className="form-container">
          {lr ? (
            <div className={frmvw.loading ? "form-box ovrly-ad" : "form-box"}>
              <div className="frm-sbx">
                <img
                  src={Rgstr}
                  alt=""
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
              <div className="frm-sbx">
                {frmvw.form === "login" ? (
                  <>
                    <div className="otp-hd">
                      Login{" "}
                      <div
                        class="clsr-con"
                        style={{
                          position: "absolute",
                          right: "15px",
                          fontSize: "22px",
                          top: "9px",
                        }}
                        onClick={() => {
                          setfrmvw({ ...frmvw, display: false, form: "login" });
                          setRdata(dr);
                          seterror(ert);
                          document.body.classList.remove("no-scrol");
                        }}
                      >
                        <FaTimes />
                      </div>
                    </div>
                    <form className="login-form" method="POST">
                      <div className="inpt-con">
                        <input
                          type="email"
                          name="email"
                          value={rdata.email}
                          onChange={handelinputs}
                          onFocus={() =>
                            seterror({
                              ...error,
                              // eslint-disable-next-line
                              ["email"]: { display: false, message: "" },
                            })
                          }
                          onBlur={() => isvalid("email")}
                          id="Email"
                          placeholder="Email"
                          required
                        />
                        {error.email.display ? (
                          <span className="input-err">
                            {error.email.message}
                          </span>
                        ) : (
                          ""
                        )}
                      </div>
                      <div className="inpt-con">
                        <input
                          type="password"
                          name="password"
                          value={rdata.password}
                          onChange={handelinputs}
                          id="password"
                          onFocus={() =>
                            seterror({
                              ...error,
                              // eslint-disable-next-line
                              ["password"]: { display: false, message: "" },
                            })
                          }
                          onBlur={() => isvalid("password")}
                          placeholder="Password"
                          required
                        />
                        {error.password.display ? (
                          <span className="input-err">
                            {error.password.message}
                          </span>
                        ) : (
                          ""
                        )}
                        <div style={{ width: "100%" }}>
                          <span
                            style={{ margin: "5px 0px 0px 10%" }}
                            className="form-link"
                            onClick={() => {
                              setfrmvw({ ...frmvw, form: "forgotpass" });
                              setRdata(dr);
                            }}
                          >
                            Forgot Password?
                          </span>
                        </div>
                      </div>

                      <div className="inpt-con">
                        <button
                          className={
                            frmvw.loading ? "action-btn loading" : "action-btn"
                          }
                          style={{ margin: "auto", backgroundColor: "#2a315d" }}
                          type="submit"
                          id="login-btn"
                          onClick={loginpost}
                        >
                          Login
                        </button>
                      </div>
                      <div className="inpt-con">
                        <span
                          className="form-link"
                          onClick={() => {
                            setfrmvw({ ...frmvw, form: "register" });
                            setRdata(dr);
                            seterror(ert);
                          }}
                        >
                          New User?
                        </span>
                      </div>
                    </form>
                  </>
                ) : (
                  ""
                )}
                {frmvw.form === "register" ? (
                  <>
                    <div className="otp-hd">
                      Register{" "}
                      <div
                        class="clsr-con"
                        style={{
                          position: "absolute",
                          right: "15px",
                          fontSize: "22px",
                          top: "9px",
                        }}
                        onClick={() => {
                          setfrmvw({ ...frmvw, display: false, form: "login" });
                          setRdata(dr);
                          seterror(ert);
                          document.body.classList.remove("no-scrol");
                        }}
                      >
                        <FaTimes />
                      </div>
                    </div>
                    <form method="POST" className="form-registration">
                      <div className="input-container">
                        <input
                          type="text"
                          placeholder="First-Name"
                          name="firstName"
                          value={rdata.firstName}
                          onChange={handelinputs}
                          className="input-field-2"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Last-Name"
                          name="lastName"
                          value={rdata.lastName}
                          onChange={handelinputs}
                          className="input-field-2"
                          required
                        />
                      </div>
                      <div className="input-container">
                        <input
                          type="tel"
                          name="phone"
                          placeholder="Phone Number"
                          value={rdata.phone}
                          onChange={handelinputs}
                          onFocus={() =>
                            seterror({
                              ...error,
                              // eslint-disable-next-line
                              ["phone"]: { display: false, message: "" },
                            })
                          }
                          onBlur={() => isvalid("phone")}
                          className="input-field"
                          required
                        />
                        {error.phone.display ? (
                          <span className="input-err">
                            {error.phone.message}
                          </span>
                        ) : (
                          ""
                        )}
                      </div>
                      <div className="input-container">
                        <input
                          type="email"
                          name="email"
                          placeholder="Email"
                          value={rdata.email}
                          onChange={handelinputs}
                          onFocus={() =>
                            seterror({
                              ...error,
                              // eslint-disable-next-line
                              ["email"]: { display: false, message: "" },
                            })
                          }
                          onBlur={() => isvalid("email")}
                          className="input-field"
                          required
                        />
                        {error.email.display ? (
                          <span className="input-err">
                            {error.email.message}
                          </span>
                        ) : (
                          ""
                        )}
                      </div>
                      <div className="input-container">
                        <input
                          type="password"
                          name="password"
                          placeholder="Password"
                          value={rdata.password}
                          onChange={handelinputs}
                          onBlur={() => isvalid("password")}
                          onFocus={() =>
                            seterror({
                              ...error,
                              // eslint-disable-next-line
                              ["password"]: { display: false, message: "" },
                            })
                          }
                          className="input-field"
                          required
                        />
                        {error.password.display ? (
                          <span className="input-err">
                            {error.password.message}
                          </span>
                        ) : (
                          ""
                        )}
                      </div>
                      <div className="input-container">
                        <input
                          type="password"
                          name="cPassword"
                          placeholder="Confirm Password"
                          value={rdata.cPassword}
                          onChange={handelinputs}
                          onBlur={() => isvalid("cPassword")}
                          onFocus={() =>
                            seterror({
                              ...error,
                              // eslint-disable-next-line
                              ["cPassword"]: { display: false, message: "" },
                            })
                          }
                          className="input-field"
                          required
                        />
                        {error.cPassword.display ? (
                          <span className="input-err">
                            {error.cPassword.message}
                          </span>
                        ) : (
                          ""
                        )}
                      </div>
                      <div className="input-container">
                        <button
                          className={
                            frmvw.loading ? "action-btn loading" : "action-btn"
                          }
                          style={{ backgroundColor: "#2a315d" }}
                          type="submit"
                          id="login-btn"
                          onClick={postdata}
                        >
                          Singup
                        </button>
                      </div>
                      <div className="inpt-con">
                        <span
                          className="form-link"
                          onClick={() => {
                            setfrmvw({ ...frmvw, form: "login" });
                            setRdata(dr);
                            seterror(ert);
                          }}
                        >
                          Already A User?
                        </span>
                      </div>
                    </form>
                  </>
                ) : (
                  ""
                )}
                {frmvw.form === "firstver" ? (
                  <>
                    <div className="otp-hd">
                      OTP Verification{" "}
                      <div
                        class="clsr-con"
                        style={{
                          position: "absolute",
                          right: "15px",
                          fontSize: "22px",
                          top: "9px",
                        }}
                        onClick={() => {
                          setfrmvw({ ...frmvw, display: false, form: "login" });
                          setRdata(dr);
                          seterror(ert);
                          document.body.classList.remove("no-scrol");
                        }}
                      >
                        <FaTimes />
                      </div>
                    </div>
                    <form className="login-form">
                      <div className="otp-messagec">
                        <span className="otp-message">
                          We've sent a verification code to your number
                          {rresult.phone}
                        </span>
                      </div>
                      <div className="inpt-con">
                        <input
                          type="text"
                          name="code"
                          onChange={handelinputs}
                          id="OTP-input"
                          value={rdata.code}
                          maxLength="6"
                          placeholder="Enter OTP"
                          autoComplete="off"
                          onFocus={() => {
                            seterror({
                              ...error,
                              // eslint-disable-next-line
                              ["code"]: { display: false, message: "" },
                            });
                          }}
                          onBlur={() => isvalid("code")}
                        />
                        {error.code.display ? (
                          <span className="input-err">
                            {error.code.message}
                          </span>
                        ) : (
                          ""
                        )}
                      </div>
                      <div className="inpt-con">
                        <button
                          type="submit"
                          className={
                            frmvw.loading ? "action-btn loading" : "action-btn"
                          }
                          style={{ backgroundColor: "#2a315d" }}
                          onClick={validateotp}
                        >
                          Submit
                        </button>
                      </div>
                      <div className="inpt-con">
                        {over.regi ? (
                          <div
                            onClick={() => {
                              reqverification(
                                rresult.email,
                                rresult.phone,
                                "verification"
                              );
                            }}
                            className="Resend-div"
                          >
                            Resend OTP ?
                          </div>
                        ) : (
                          <Timer setover={setover} sec={90} over={over} />
                        )}
                      </div>
                    </form>
                  </>
                ) : (
                  ""
                )}
                {frmvw.form === "forgotpass-otp" ? (
                  <>
                    <div className="otp-hd">
                      Reset password{" "}
                      <div
                        class="clsr-con"
                        style={{
                          position: "absolute",
                          right: "15px",
                          fontSize: "22px",
                          top: "9px",
                        }}
                        onClick={() => {
                          setfrmvw({ ...frmvw, display: false, form: "login" });
                          setRdata(dr);
                          seterror(ert);
                          document.body.classList.remove("no-scrol");
                        }}
                      >
                        <FaTimes />
                      </div>
                    </div>
                    <form className="login-form">
                      <div className="inpt-con">
                        <div
                          className="pass-div"
                          style={{ width: "80%", height: "25px" }}
                        >
                          <input
                            type={pdis.pass ? "text" : "password"}
                            name="password"
                            // className="reset-input"
                            placeholder="Password"
                            value={rdata.password}
                            onChange={handelinputs}
                            onFocus={() => {
                              seterror({
                                ...error,
                                // eslint-disable-next-line
                                ["password"]: { display: false, message: "" },
                              });
                            }}
                          />
                          <div
                            className="pass-tgl"
                            onClick={() => {
                              setpdis({ ...pdis, pass: !pdis.pass });
                            }}
                          >
                            {pdis.pass ? <HiEye /> : <HiEyeOff />}
                          </div>
                        </div>
                      </div>
                      <div className="inpt-con">
                        <div
                          className="pass-div"
                          style={{ width: "80%", height: "25px" }}
                        >
                          <input
                            type={pdis.cpass ? "text" : "password"}
                            name="cPassword"
                            // className="reset-input"
                            placeholder="Confirm Password"
                            value={rdata.cPassword}
                            onChange={handelinputs}
                            onFocus={() => {
                              seterror({
                                ...error,
                                // eslint-disable-next-line
                                ["cPassword"]: { display: false, message: "" },
                              });
                            }}
                          />
                          <div
                            className="pass-tgl"
                            onClick={() => {
                              setpdis({ ...pdis, cpass: !pdis.cpass });
                            }}
                          >
                            {pdis.cpass ? <HiEye /> : <HiEyeOff />}
                          </div>
                        </div>
                      </div>
                      <hr />
                      <div className="inpt-con">
                        <input
                          type="text"
                          name="code"
                          className="reset-input"
                          placeholder="Verification code"
                          value={rdata.code}
                          onChange={handelinputs}
                        />
                      </div>
                      <button
                        type="submit"
                        className="action-btn"
                        style={{ backgroundColor: "#2a315d" }}
                        onClick={resetpass}
                      >
                        Submit
                      </button>
                      <div
                        className="inpt-con"
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          padding: "10px",
                        }}
                      >
                        <span
                          className="reset-login"
                          onClick={() => {
                            setfrmvw({ ...frmvw, form: "login" });
                            setRdata(dr);
                            seterror(ert);
                          }}
                        >
                          Login?
                        </span>
                        {over.frgt ? (
                          <div
                            onClick={() => {
                              reqverification(
                                rdata.email,
                                rdata.phone,
                                "forgotpass"
                              );
                            }}
                            className="Resend-div"
                          >
                            Resend OTP ?
                          </div>
                        ) : (
                          <Timer setover={setover} sec={90} over={over} />
                        )}
                      </div>
                    </form>
                  </>
                ) : (
                  ""
                )}
                {frmvw.form === "forgotpass" ? (
                  <>
                    <div className="otp-hd">
                      Reset password{" "}
                      <div
                        class="clsr-con"
                        style={{
                          position: "absolute",
                          right: "15px",
                          fontSize: "22px",
                          top: "9px",
                        }}
                        onClick={() => {
                          setfrmvw({ ...frmvw, display: false, form: "login" });
                          setRdata(dr);
                          seterror(ert);
                          document.body.classList.remove("no-scrol");
                        }}
                      >
                        <FaTimes />
                      </div>
                    </div>
                    <form className="login-form">
                      <div className="inpt-con">
                        <input
                          type="email"
                          name="email"
                          className="reset-input"
                          placeholder="Email"
                          value={rdata.email}
                          onChange={handelinputs}
                          onFocus={() => {
                            seterror({
                              ...error,
                              // eslint-disable-next-line
                              ["email"]: { display: false, message: "" },
                            });
                          }}
                          onBlur={() => isvalid("email")}
                        />
                        {error.email.display ? (
                          <span className="input-err">
                            {error.email.message}
                          </span>
                        ) : (
                          ""
                        )}
                      </div>
                      <div className="inpt-con">
                        <input
                          type="tel"
                          name="phone"
                          className="reset-input"
                          placeholder="Phone Number"
                          value={rdata.phone}
                          onChange={handelinputs}
                          onFocus={() => {
                            seterror({
                              ...error,
                              // eslint-disable-next-line
                              ["phone"]: { display: false, message: "" },
                            });
                          }}
                          onBlur={() => isvalid("phone")}
                        />
                        {error.phone.display ? (
                          <span className="input-err">
                            {error.phone.message}
                          </span>
                        ) : (
                          ""
                        )}
                      </div>
                      <div className="inpt-con">
                        <button
                          type="submit"
                          className={
                            frmvw.loading ? "action-btn loading" : "action-btn"
                          }
                          style={{ backgroundColor: "#2a315d" }}
                          onClick={forgotpass}
                        >
                          Submit
                        </button>
                      </div>
                      <span
                        className="reset-login"
                        onClick={() => {
                          setfrmvw({ ...frmvw, form: "login" });
                          setRdata(dr);
                          seterror(ert);
                        }}
                      >
                        Login?
                      </span>
                    </form>
                  </>
                ) : (
                  ""
                )}
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
      )}
      {udata.display ? (
        <>
          {vw.nav ? (
            <div
              className="nav-ovrly"
              onClick={() => {
                document.body.classList.remove("no-scrol");
                // eslint-disable-next-line
                setvw({ ...vw, ["nav"]: false });
              }}
            ></div>
          ) : (
            ""
          )}
          <nav className={vw.nav ? "sd-nav sd-navopn" : "sd-nav"}>
            <div className="nv-log">
              <img src="/icons/logo.png" alt="Company Logo" />
            </div>
            <ul>
              <div className="nav-hd">Website</div>
              <NavLink
                onClick={() => {
                  handelnav("hme");
                  document.body.classList.remove("no-scrol");
                }}
                className="links"
                to="/"
              >
                <div
                  className={
                    vw.nvactv === "hme"
                      ? "nav-itm itm-actv ovrly-ad"
                      : "nav-itm ovrly-ad"
                  }
                >
                  <div className="aling-cntr">
                    <ImHome className="nv-icn" />
                    Home
                  </div>
                </div>
              </NavLink>
              <NavLink
                onClick={() => {
                  localStorage.removeItem("tour-data");
                  localStorage.removeItem("tour-data");
                  document.body.classList.remove("no-scrol");
                  handelnav("tor");
                }}
                className="links"
                to="/tourpackages/list"
              >
                <div
                  className={
                    vw.nvactv === "tor"
                      ? "nav-itm itm-actv ovrly-ad"
                      : "nav-itm ovrly-ad"
                  }
                >
                  <div className="aling-cntr">
                    <GiMountainRoad className="nv-icn" />
                    Tour Packages
                  </div>
                </div>
              </NavLink>
              <div className="nav-hd">Bookings</div>
              <div className={vw.bkng ? "drpdn-con drpdn-actv" : "drpdn-con"}>
                <div
                  className={
                    vw.bkng ? "nav-itm itm-actv ovrly-ad " : "nav-itm ovrly-ad"
                  }
                  // eslint-disable-next-line
                  onClick={() => setvw({ ...vw, ["bkng"]: !vw.bkng })}
                >
                  <div className="aling-cntr">
                    <MdDateRange className="nv-icn" /> Bookings
                  </div>
                  <TiArrowSortedDown
                    className={vw.bkng ? "drp-stt drp-sttactv" : "drp-stt"}
                  />
                </div>
                <div className="drp-itmcon">
                  <NavLink to="/booking/ongoing" className="links">
                    <div
                      className={
                        vw.nvactv === "ongng"
                          ? "subnav-itm ovrly-ad subnav-actv"
                          : "subnav-itm ovrly-ad"
                      }
                      onClick={() => {
                        document.body.classList.remove("no-scrol");
                        handelnav("ongng");
                      }}
                    >
                      <MdOutlinePendingActions className="nv-icn" /> Ongoing
                    </div>
                  </NavLink>
                  <NavLink to="/booking/completed" className="links">
                    <div
                      className={
                        vw.nvactv === "cmpltd"
                          ? "subnav-itm ovrly-ad subnav-actv"
                          : "subnav-itm ovrly-ad"
                      }
                      onClick={() => {
                        document.body.classList.remove("no-scrol");
                        handelnav("cmpltd");
                      }}
                    >
                      <ImCheckmark2 className="nv-icn" /> Completed
                    </div>
                  </NavLink>
                  <NavLink to="/booking/cancelled" className="links">
                    <div
                      className={
                        vw.nvactv === "cncld"
                          ? "subnav-itm ovrly-ad subnav-actv"
                          : "subnav-itm ovrly-ad"
                      }
                      onClick={() => {
                        document.body.classList.remove("no-scrol");
                        handelnav("cncld");
                      }}
                    >
                      <ImCross className="nv-icn" /> Cancelled
                    </div>
                  </NavLink>
                </div>
              </div>
              <div className="nav-hd">Account</div>
              <NavLink
                onClick={() => {
                  document.body.classList.remove("no-scrol");
                  handelnav("acnt");
                }}
                className="links"
                to="/account"
              >
                <div
                  className={
                    vw.nvactv === "acnt"
                      ? "nav-itm itm-actv ovrly-ad"
                      : "nav-itm ovrly-ad"
                  }
                >
                  <div className="aling-cntr">
                    <FiUsers className="nv-icn" />
                    Account
                  </div>
                </div>
              </NavLink>
              <NavLink
                onClick={() => {
                  document.body.classList.remove("no-scrol");
                  setvw({ ...vw, nav: false });
                  logout();
                }}
                to="/"
                className="links"
              >
                <div className="nav-itm ovrly-ad">
                  <div className="aling-cntr">
                    <FiLogOut className="nv-icn" />
                    Logout
                  </div>
                </div>
              </NavLink>
            </ul>
          </nav>
        </>
      ) : (
        ""
      )}
      {/* nav bar start */}
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

export default Navbar;
