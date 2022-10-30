import React, { useState, useEffect } from "react";
import "./navbar.css";
import { NavLink, useHistory } from "react-router-dom";
import Verification from "../verification/Verification";
import validator from "validator";
import {
  FaBook,
  FaUserAlt,
  FaAngleRight,
  FaHome,
  FaTimes,
  FaTimesCircle,
  FaAngleDown,
  FaAngleUp,
} from "react-icons/fa";
import { FcApproval } from "react-icons/fc";
import { MdOutlineLogout, MdPassword } from "react-icons/md";
import { HiDocumentText } from "react-icons/hi";
const Navbar = () => {
  const history = useHistory();
  const trp = [
    "/driver/dashboard/triplog",
    "/driver/dashboard/profile",
    "/driver/dashboard",
  ];
  const updt = () => {
    const path = window.location.pathname;
    if (trp.some((e) => e === path)) {
      setpg(path);
    } else {
      setpg(path);
      history.push("/driver/dashboard");
    }
  };
  useEffect(updt, [updt]);
  const [hgt, sethgt] = useState();
  const resizer = () => {
    const height = window.innerHeight - 60;
    sethgt(height);
  };
  const [alert, setalert] = useState({
    display: false,
    title: "",
    message: "",
    type: "",
  });
  const [udata, setudata] = useState({ display: false, data: { name: "" } });
  const autolog = async () => {
    if (localStorage.getItem("drilogged") === "y") {
      const res = await fetch("/driver/autologin", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (res.status === 200) {
        const data = await res.json();
        setudata({ display: true, data });
        if (data.reqvrftn) {
          setvrftn(true);
        }
      } else {
        localStorage.removeItem("drilogged");
        history.push("/driver/login");
      }
    } else {
      localStorage.removeItem("drilogged");
      history.push("/driver/login");
    }
  };
  useEffect(() => {
    resizer();
    autolog();
    // eslint-disable-next-line
  }, []);
  const logout = async () => {
    // eslint-disable-next-line
    const res = await fetch("/driver/logout", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    localStorage.removeItem("islogged");
    history.push("/driver/login");
  };
  window.addEventListener("resize", resizer);
  const [naviw, setnaviw] = useState(false);
  const [pg, setpg] = useState();
  const [vrftn, setvrftn] = useState(false);
  const [drpvw, setdrpvw] = useState(false);
  const dpa = {
    display: false,
    prcs: false,
    oldpass: "",
    newpass: "",
    cnfrmpass: "",
  };
  const [pass, setpass] = useState(dpa);
  const Changepass = async () => {
    const { newpass, oldpass, cnfrmpass } = pass;
    if (!newpass || !oldpass || !cnfrmpass) {
      return window.alert("please fill all the fields");
    }
    if (newpass === oldpass) {
      return window.alert("old password and new password are same");
    }
    if (newpass !== cnfrmpass) {
      return window.alert("password and confirm password not matching");
    }
    if (!validator.isStrongPassword(newpass)) {
      return window.alert("please enter Strong password");
    }
    setpass({ ...pass, prcs: true });
    const res = await fetch("/driver/changepassword", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        oldpass: oldpass,
        newpass: newpass,
        cnfrmpass: cnfrmpass,
      }),
    });
    const data = await res.json();
    if (res.status === 201) {
      setpass({ dpa });
      window.alert("password changed successfully");
    } else {
      window.alert(data);
      setpass({ ...pass, prcs: false });
    }
  };
  let name, value;
  const handelpass = (e) => {
    name = e.target.name;
    value = e.target.value;
    setpass({ ...pass, [name]: value });
  };
  return (
    <>
      <div className="prtnr-nav">
        <div className="logo-con ovrly-ad">
          <img src="/icons/logo.png" alt="" className="logo" />
        </div>
        <div
          className="usr-ic ovrly-ad"
          onClick={() => {
            setdrpvw(!drpvw);
          }}
        >
          <span>
            <FaUserAlt />
          </span>
          <span>{udata.data.firstName}</span>
          <span>{drpvw ? <FaAngleDown /> : <FaAngleUp />}</span>
        </div>
        <div className={drpvw ? "drop-down drop-open" : "drop-down"}>
          <div
            className="drop-itm"
            onClick={() => {
              setdrpvw(false);
            }}
          >
            <HiDocumentText style={{ marginRight: "10px" }} /> Driver terms
          </div>
          <div
            className="drop-itm"
            onClick={() => {
              setdrpvw(false);
              //eslint-disable-next-line
              setpass({ ...pass, ["display"]: true });
            }}
          >
            <MdPassword style={{ marginRight: "10px" }} /> Change Password
          </div>
        </div>
      </div>
      <nav
        className={naviw ? "side-nav nav-o" : "side-nav"}
        style={{ height: `${hgt}px` }}
      >
        <div>
          <NavLink
            onClick={() => {
              setpg();
              setnaviw(false);
            }}
            to="/driver/dashboard"
            style={{ textDecoration: "none" }}
          >
            <div
              className={
                pg === "/driver/dashboard" ? "sdnav-itm nav-actv" : "sdnav-itm"
              }
            >
              <div className="sd-navicon">
                <FaHome />
              </div>
              <div className="sd-navtxt">Dashboard</div>
            </div>
          </NavLink>
          <NavLink
            onClick={() => {
              setpg();
              setnaviw(false);
            }}
            to="/driver/dashboard/triplog"
            style={{ textDecoration: "none" }}
          >
            <div
              className={
                pg === "/driver/dashboard/triplog"
                  ? "sdnav-itm nav-actv"
                  : "sdnav-itm"
              }
            >
              <div className="sd-navicon">
                <FaBook />
              </div>
              <div className="sd-navtxt">Trip log</div>
            </div>
          </NavLink>
          {/* <div className="sdnav-itm">
            <div className="sd-navicon">
              <FaEdit />
            </div>
            <div className="sd-navtxt">Create Booking</div>
          </div> */}
          <NavLink
            to="/driver/dashboard/profile"
            onClick={() => {
              setpg();
              setnaviw(false);
            }}
            style={{ textDecoration: "none" }}
          >
            <div
              className={
                pg === "/driver/dashboard/profile"
                  ? "sdnav-itm nav-actv"
                  : "sdnav-itm"
              }
            >
              <div className="sd-navicon">
                <FaUserAlt />
              </div>
              <div className="sd-navtxt">Account</div>
            </div>
          </NavLink>
        </div>

        <div>
          <div
            style={{ textDecoration: "none" }}
            onClick={logout}
            className="ovrly-ad"
          >
            <div className="sdnav-itm">
              <div className="sd-navicon">
                <MdOutlineLogout />
              </div>
              <div className="sd-navtxt">Logout</div>
            </div>
          </div>
        </div>
      </nav>
      <div
        className={naviw ? "tgl-nav tgl-o" : "tgl-nav"}
        onClick={() => {
          setnaviw(!naviw);
        }}
      >
        <FaAngleRight />
      </div>
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
      {vrftn ? (
        <Verification
          faultin={udata.data.faultin}
          prefill={udata.data.prefill}
          setvrftn={setvrftn}
        />
      ) : (
        ""
      )}
      {pass.display ? (
        <div className="form-container">
          <div className={pass.prcs ? "pass-con ovrly-ad" : "pass-con"}>
            <div class="form-lgocon">
              <img src="/icons/logo.png" alt="" srcset="" />
            </div>
            <div class="form-hdcon">Change Password?</div>
            <div className="pass-row">
              <input
                type="password"
                name="oldpass"
                placeholder="Old password"
                className="pass-inp"
                onChange={handelpass}
              />
            </div>
            <div className="pass-row">
              <input
                type="password"
                name="newpass"
                placeholder="New password"
                className="pass-inp"
                onChange={handelpass}
              />
            </div>
            <div className="pass-row">
              <input
                type="password"
                name="cnfrmpass"
                placeholder="Confirm new password"
                className="pass-inp"
                onChange={handelpass}
              />
            </div>
            <p className="note">
              Changing the password will logout you from all other device
            </p>
            <div class="form-btmcon">
              <button
                class="frm-sbmtbtn"
                style={{ backgroundColor: "red" }}
                onClick={() => {
                  // eslint-disable-next-line
                  setpass({ ...pass, ["display"]: false });
                }}
              >
                Close
              </button>
              <button
                class={pass.prcs ? "frm-sbmtbtn ldng-btn" : "frm-sbmtbtn"}
                onClick={Changepass}
              >
                <span>Submit</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default Navbar;
