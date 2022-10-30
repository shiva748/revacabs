import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { GiStarKey } from "react-icons/gi";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";
import Loading from "../templates/Loading/Loading";
import { Helmet } from "react-helmet";
const Security = () => {
  const history = useHistory();
  const [vw, setvw] = useState({
    password: false,
    load: true,
    prcs: false,
    data: "",
    code: "",
  });
  const getdet = async () => {
    const res = await fetch("/oceannodes/pin", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await res.json();
    if (res.status !== 200) {
      history.push("/login");
    } else {
      setvw({ ...vw, data: data.name, load: false });
    }
  };
  useEffect(() => {
    if (localStorage.getItem("amloin") === "nuphhjk") {
      return history.push("/dashboard");
    }
    getdet();
    // eslint-disable-next-line
  }, []);
  const activate = async (e) => {
    e.preventDefault();
    if (!vw.code) {
      return alert("please fill all the fields");
    }
    setvw({ ...vw, prcs: true });
    const res = await fetch("/oceannodes/pin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ code: vw.code }),
    });
    const data = await res.json();
    if (res.status !== 201) {
      setvw({ ...vw, prcs: false, code: "" });
      if (data.left) {
        if (data.left <= 0) {
          history.push("/");
        } else {
          alert(data.message);
        }
      } else {
        alert(data);
        history.push("/");
      }
    } else {
      localStorage.setItem("amloin", "nuphhjk");
      history.push("/dashboard");
    }
  };
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Admin Panel - Security | RevaCabs </title>
        <meta name="description" content="Admin Login page" />
        <link rel="canonical" href="http://partner.revacabs.com/" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {vw.load ? (
        <Loading />
      ) : (
        <div className={vw.load ? "flsz-con ovrly-ad" : "flsz-con"}>
          <div className="lgn-lgo">
            <img src="/icons/logo.png" alt="" />
          </div>
          <div className="lgn-bx">
            <div className="lgn-hd">Hi {vw.data}</div>
            <div className="lgn-con">
              <form>
                <div className="lgninput-con">
                  <div className="inpt-aside">
                    <GiStarKey />
                  </div>
                  <input
                    type={vw.password ? "text" : "password"}
                    placeholder="Secret Pin"
                    className="lgninput tw-as"
                    required
                    name="pin"
                    value={vw.code}
                    onChange={(e) => {
                      setvw({ ...vw, code: e.target.value });
                    }}
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
                    className={
                      vw.prcs ? "lgn-btn ldng-btn" : "lgn-btn ovrly-ad"
                    }
                    onClick={activate}
                  >
                    <span>Login</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Security;
