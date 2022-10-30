import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import "./Verifyemail.css";
import validator from "validator";

const Verifyemail = (recived) => {
  const { emlver, setemlver, callAccount } = recived;
  const email = emlver.email;
  const [vrfy, setvrfy] = useState({
    display: false,
    email: email,
    code: "",
    load: false,
  });
  const sendotp = async () => {
    const { email } = vrfy;
    if (!email || typeof email !== "string" || !validator.isEmail(email)) {
      return alert("hello");
      // return setalertd({
      //   display: true,
      //   title: "",
      //   message: "Some error occured",
      //   type: "danger",
      // });
    }
    const res = await fetch("/api/verifyemail", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
      }),
    });
    const data = await res.json();
    if (res.status !== 201) {
      //   return setalertd({
      //     display: true,
      //     title: "",
      //     message: data.error,
      //     type: "danger",
      //   });
      alert(data);
      callAccount();
      setemlver({ display: false, email: "" });
    } else {
      //   setalertd({
      //     display: true,
      //     title: "",
      //     message: "An otp has been sent to your email",
      //     type: "green",
      //   });
      setvrfy({ ...vrfy, display: true });
      alert("An otp has been sent to your email");
    }
  };
  useEffect(() => {
    sendotp();
    // eslint-disable-next-line
  }, []);
  const validateotp = async () => {
    const { email, code } = vrfy;
    if (!email || !code) {
      return alert("please fill all the fields");
    }
    if (typeof email !== "string" || !validator.isEmail(email)) {
      return;
      // return setalertd({
      //   display: true,
      //   title: "",
      //   message: "Some error occured",
      //   type: "danger",
      // });
    }
    if (typeof code !== "string") {
      return res.status(400).json("invalid data type");
    }
    setvrfy({ ...vrfy, load: true });
    const res = await fetch("/api/verifyemail/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        email,
      }),
    });
    const data = await res.json();
    if (res.status === 202) {
      setvrfy({ ...vrfy, load: false });
      callAccount();
      alert("Verification sucessful");
      setemlver({ display: false, email: "" });
    } else {
      return alert(data);
    }
  };
  return (
    <>
      {vrfy.display ? (
        <div className="form-container">
          <div className="emlvrfy-bx">
            <div
              class="bkngdtl-hd"
              style={{
                padding: "5px 10px",
                height: "30px",
                backgroundColor: "#202a4e",
              }}
            >
              Verify Email
              <div class="clsr-con">
                <FaTimes />
              </div>
            </div>
            <div className="otp-messagec" style={{ marginTop: "10px" }}>
              <span className="otp-message">
                We've sent a verification code to your email
                {email}
              </span>
            </div>
            <div className="inpt-con">
              <input
                type="text"
                name="code"
                onChange={(e) => {
                  setvrfy({ ...vrfy, code: e.target.value });
                }}
                id="OTP-input"
                value={vrfy.code}
                maxLength="6"
                placeholder="Enter OTP"
                autoComplete="off"
              />
            </div>
            <div className="inpt-con">
              <button
                type="submit"
                className={vrfy.load ? "action-btn loading" : "action-btn"}
                onClick={validateotp}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="traload"></div>
      )}
    </>
  );
};

export default Verifyemail;
