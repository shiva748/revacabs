import React, { useState,useRef , useEffect } from "react";
import "./css/Login.css";
import { useHistory } from "react-router-dom";
import { GiBossKey } from "react-icons/gi";
import { FaUserSecret, FaRegEyeSlash, FaRegEye } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import validator from "validator";
import { Helmet } from "react-helmet";
const Login = () => {
  const history = useHistory();
  const inputRef = useRef();
  if (localStorage.getItem("amloin") === "nuphhjk") {
    history.push("/dashboard");
  }
  const [vw, setvw] = useState({ password: false, prcs: false });
  const [logdata, setlogdata] = useState({ email: "", password: "" });
  const logger = async (e) => {
    e.preventDefault();
    const { email, password } = logdata;
    if (!email || !password) {
      return alert("please fill all the fields");
    }
    if (!validator.isEmail(email)) {
      if (email.length !== 10) {
        return alert("Please enter a valid email or username");
      }
    }
    if (!validator.isStrongPassword(password)) {
      return alert("Invalid password");
    }
    setvw({ ...vw, prcs: true });
    const res = await fetch("/oceannodes/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: logdata.email,
        password: logdata.password,
      }),
    });
    const data = await res.json();
    if (res.status !== 200) {
      window.alert(data);
      setvw({ ...vw, prcs: false });
    } else {
      window.alert("Login successfull");
      history.push("/pin");
    }
  };
  let name, value;
  const handelinput = (e) => {
    name = e.target.name;
    value = e.target.value;
    setlogdata({ ...logdata, [name]: value });
  };
  useEffect(() => {
    inputRef.current.focus();
  }, []);
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Admin Panel - Login page | RevaCabs </title>
        <meta name="description" content="Admin Login page" />
        <link rel="canonical" href="http://partner.revacabs.com/" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="flsz-con">
        <div className="lgn-lgo">
          <img src="/icons/logo.png" alt="" />
        </div>
        <div className="lgn-bx">
          <div className="lgn-hd">
            <GiBossKey style={{ marginRight: "10px" }} /> ADMIN PANEL
          </div>
          <div className="lgn-con">
            <form>
              <div className="lgninput-con">
                <div className="inpt-aside">
                  <FaUserSecret />
                </div>
                <input
                  type="text"
                  placeholder="Email or username"
                  className="lgninput"
                  name="email"
                  value={logdata.email}
                  onChange={handelinput}
                  ref={inputRef}
                  required
                />
              </div>
              <div className="lgninput-con">
                <div className="inpt-aside">
                  <RiLockPasswordFill />
                </div>
                <input
                  type={vw.password ? "text" : "password"}
                  placeholder="Password"
                  className="lgninput tw-as"
                  required
                  name="password"
                  value={logdata.password}
                  onChange={handelinput}
                />
                <div
                  className="inpt-aside trans-aside"
                  onClick={() => {
                    //eslint-disable-next-line
                    setvw({ ...vw, ["password"]: !vw.password });
                  }}
                >
                  {vw.password ? <FaRegEye /> : <FaRegEyeSlash />}
                </div>
              </div>
              <div className={vw.prcs ? "lgnbtn-con ovrly-ad" : "lgnbtn-con"}>
                <button
                  type="submit"
                  className={vw.prcs ? "lgn-btn ldng-btn" : "lgn-btn ovrly-ad"}
                  onClick={logger}
                >
                  <span>Login</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
