import React, { useEffect, useState } from "react";
import Loading from "../templates/loading/Loading";
import { FcApproval } from "react-icons/fc";
import { FaTimes, FaTimesCircle, FaUser } from "react-icons/fa";
import { MdEmail, MdPhone, MdPassword } from "react-icons/md";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { GoVerified } from "react-icons/go";
import "./css/account.css";
import Verifyemail from "../templates/verify/Verifyemail";
import avatar from "../images/Home/avatar.png";
import { Helmet } from "react-helmet";

const Account = () => {
  const [alertd, setalertd] = useState({
    display: false,
    title: "",
    message: "",
    type: "",
  });
  const [pdis, setpdis] = useState({
    pass: false,
    npass: false,
    ncpass: false,
  });
  let name, value;
  const [vwst, setvwst] = useState("abt");

  const [display, setdisplay] = useState({ valid: true, pawr: false });
  const [Userdata, setUserdata] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    aPhone: "",
  });
  const [edt, setedt] = useState({
    aPhone: "",
    firstName: "",
    lastName: "",
    load: false,
  });
  const handeledt = (e) => {
    name = e.target.name;
    value = e.target.value;
    setedt({ ...edt, [name]: value });
  };
  const [loading, setloading] = useState(true);
  const callAccount = async () => {
    if (localStorage.getItem("islogged") === "y") {
      const res = await fetch("/api/account", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (res.status !== 200) {
        document.location.replace("/");
      } else {
        const data = await res.json();
        setUserdata(data.userdata);
        setedt({
          aPhone: data.userdata.aPhone,
          firstName: data.userdata.firstName,
          lastName: data.userdata.lastName,
          load:false
        });
        setloading(false);
      }
    } else {
      return document.location.replace("/");
    }
  };
  useEffect(() => {
    callAccount();
    // eslint-disable-next-line
  }, []);
  const postupdate = async (e) => {
    e.preventDefault();
    const { firstName, lastName, aPhone } = edt;
    if (!firstName || !lastName || !aPhone) {
      return setalertd({
        display: true,
        title: "",
        message: "please fill all fields",
        type: "danger",
      });
    }
    setedt({ ...edt, load: true });
    const res = await fetch("/api/update-profile", {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: Userdata.email,
        phone: Userdata.phone,
        firstName,
        lastName,
        aPhone,
      }),
    });
    const data = await res.json();
    console.log(data);
    if (res.status !== 202) {
      setedt({ ...edt, load: false });
      return setalertd({
        display: true,
        title: "",
        message: data.error,
        type: "danger",
      });
    } else {
      setalertd({
        display: true,
        title: "",
        message: "Successfully updated",
        type: "green",
      });
      setUserdata({
        ...Userdata,
        email: data.details.email,
        phone: data.details.phone,
        aPhone: data.details.aPhone,
        firstName: data.details.firstName,
        lastName: data.details.lastName,
      });
      // eslint-disable-next-line
      setdisplay({ ...display, ["valid"]: true });
    }
  };
  const dupass = { npassword: "", ncPassword: "", password: "", load: false };
  const [upass, setupass] = useState(dupass);
  const handelupass = (e) => {
    name = e.target.name;
    value = e.target.value;
    setupass({ ...upass, [name]: value });
  };
  const postupass = async (e) => {
    e.preventDefault();
    const { npassword, ncPassword, password } = upass;
    if (!npassword || !ncPassword || !password) {
      return setalertd({
        display: true,
        title: "",
        message: "please fill all fields",
        type: "danger",
      });
    }
    setupass({ ...upass, load: true });
    const res = await fetch("/api/update-pass", {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        npassword,
        ncPassword,
        password,
      }),
    });
    const data = await res.json();
    if (res.status !== 200) {
      setupass({ ...upass, load: false });
      return setalertd({
        display: true,
        title: "",
        message: data.error,
        type: "danger",
      });
    } else {
      setalertd({
        display: true,
        title: "",
        message: data.message,
        type: "green",
      });
      setupass(dupass);
    }
  };
  const [emlver, setemlver] = useState({ display: false, email: "" });
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>
          {`${
            sessionStorage.getItem("userdata")
              ? JSON.parse(sessionStorage.getItem("userdata"))
                  .name.charAt(0)
                  .toUpperCase()
                  .concat(
                    JSON.parse(sessionStorage.getItem("userdata")).name.slice(1)
                  )
              : ""
          } - Account`}
        </title>
        <meta
          name="description"
          content={`${
            sessionStorage.getItem.userdata
              ? sessionStorage.getItem.userdata.name
              : ""
          } Account`}
        />
        <link rel="canonical" href="http://revacabs.com/" />
        <meta name="robots" content="noindex,nofollow" />
        <meta http-equiv="Content-Security-Policy" content="script-src https://checkout.razorpay.com/v1/checkout.js *.revacabs.com;"/>
      </Helmet>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="multi-con">
            <div className="usr-prfl">
              <div className="prfl-img">
                <img src={avatar} alt="" />
              </div>
              <div className="prfl-aside">
                <div className="prfl-row">
                  <span className="prfl-nmtxt">{`${Userdata.firstName} ${Userdata.lastName} `}</span>
                  {Userdata.isverified === "authorised" ? (
                    <span className="vrfd">
                      <GoVerified />
                    </span>
                  ) : (
                    ""
                  )}
                </div>
                <div className="prfl-row">
                  <span className="blu-txt">Coustumer</span>
                </div>
                <div className="prfl-row" style={{ flexWrap: "wrap" }}>
                  <span>
                    <MdEmail style={{ marginRight: "10px" }} />
                    {Userdata.email}
                  </span>
                  {Userdata.verification.email ? (
                    ""
                  ) : (
                    <button
                      className="vrfy-btn"
                      onClick={() => {
                        setemlver({
                          ...emlver,
                          display: true,
                          email: Userdata.email,
                        });
                      }}
                    >
                      Verify email
                    </button>
                  )}
                </div>
                <div className="prfl-row">
                  <MdPhone style={{ marginRight: "10px" }} />
                  <span>{Userdata.phone}</span>{" "}
                </div>
                {Userdata.aPhone ? (
                  <div className="prfl-row">
                    <MdPhone style={{ marginRight: "10px" }} />
                    <span>{Userdata.aPhone}</span>
                  </div>
                ) : (
                  ""
                )}
                <div className="prfl-row">
                  <span>{Userdata.city}</span>
                </div>
              </div>
              <div className="tgl-cntnt">
                <div
                  className={vwst === "abt" ? "tgl-itm tgl-itmo" : "tgl-itm"}
                  onClick={() => {
                    setvwst("abt");
                  }}
                >
                  <FaUser style={{ marginRight: "5px" }} />
                  Update
                </div>
                <div
                  className={vwst === "sts" ? "tgl-itm tgl-itmo" : "tgl-itm"}
                  onClick={() => {
                    setvwst("sts");
                  }}
                >
                  <MdPassword style={{ marginRight: "5px" }} />
                  Password
                </div>
              </div>
            </div>
            <div className="dtld-cntnt">
              {vwst === "abt" ? (
                <>
                  <table className={edt.load ? "dtl-tbl ovrly-ad" : "dtl-tbl"}>
                    <tbody>
                      <tr>
                        <td>First Name</td>
                        <td>
                          <input
                            type="text"
                            name="firstName"
                            onChange={handeledt}
                            className="updt-inpt"
                            value={edt.firstName}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Last Name</td>
                        <td>
                          <input
                            type="text"
                            name="lastName"
                            onChange={handeledt}
                            className="updt-inpt"
                            value={edt.lastName}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Alternate Phone</td>
                        <td>
                          <input
                            type="tel"
                            name="aPhone"
                            onChange={handeledt}
                            className="updt-inpt"
                            value={edt.aPhone}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div>
                    <button
                      onClick={postupdate}
                      className={edt.load ? "sbmt-btn load-btn" : "sbmt-btn"}
                    >
                      <span>Submit</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <table
                    className={upass.load ? "dtl-tbl ovrly-ad" : "dtl-tbl"}
                  >
                    <tbody>
                      <tr>
                        <td>Old Password</td>
                        <td>
                          <div className="pass-div">
                            <input
                              type={pdis.pass ? "text" : "password"}
                              name="password"
                              onChange={handelupass}
                              value={upass.password}
                              placeholder="Old Password"
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
                        </td>
                      </tr>
                      <tr>
                        <td>New Password</td>
                        <td>
                          <div className="pass-div">
                            <input
                              type={pdis.npass ? "text" : "password"}
                              name="npassword"
                              onChange={handelupass}
                              value={upass.npassword}
                              placeholder="New Password"
                            />
                            <div
                              className="pass-tgl"
                              onClick={() => {
                                setpdis({ ...pdis, npass: !pdis.npass });
                              }}
                            >
                              {pdis.npass ? <HiEye /> : <HiEyeOff />}
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>Confirm New Password</td>
                        <td>
                          <div className="pass-div">
                            <input
                              type={pdis.ncpass ? "text" : "password"}
                              name="ncPassword"
                              onChange={handelupass}
                              value={upass.ncPassword}
                              placeholder="Confirm Password"
                            />
                            <div
                              className="pass-tgl"
                              onClick={() => {
                                setpdis({ ...pdis, ncpass: !pdis.ncpass });
                              }}
                            >
                              {pdis.ncpass ? <HiEye /> : <HiEyeOff />}
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div>
                    <button
                      onClick={postupass}
                      className={upass.load ? "sbmt-btn load-btn" : "sbmt-btn"}
                    >
                      <span>Submit</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
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
          {emlver.display ? (
            <Verifyemail
              emlver={emlver}
              setemlver={setemlver}
              callAccount={callAccount}
            />
          ) : (
            ""
          )}
        </>
      )}
    </>
  );
};

export default Account;
