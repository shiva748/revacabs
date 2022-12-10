import React, { useState, useEffect } from "react";
import "./navbar.css";
import { NavLink, useHistory } from "react-router-dom";
import Verification from "../verification/Verification";
import validator from "validator";
import Securityfee from "../verification/Securityfee";
import {
  FaCarAlt,
  FaBook,
  FaUserTie,
  FaUserAlt,
  FaAngleRight,
  FaHome,
  FaTimes,
  FaTimesCircle,
  FaRupeeSign,
  FaAngleDown,
  FaAngleUp,
  FaMoneyBillWave,
} from "react-icons/fa";
import { FcApproval } from "react-icons/fc";
import { MdOutlineLogout, MdPassword } from "react-icons/md";
import { HiDocumentText } from "react-icons/hi";
const Navbar = () => {
  const history = useHistory();
  const trp = [
    "/dashboard",
    "/dashboard/triplog",
    "/dashboard/driver",
    "/dashboard/cars",
    "/dashboard/earning",
    "/dashboard/penalty",
    "/dashboard/profile",
  ];
  const updt = () => {
    const path = window.location.pathname;
    if (trp.some((e) => e === path)) {
      setpg(path);
    } else {
      setpg(path);
      history.push("/dashboard");
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
  const [udata, setudata] = useState({
    display: false,
    data: { name: "", operatorid: "" },
  });
  const autolog = async () => {
    if (localStorage.getItem("islogged") === "y") {
      console.log(localStorage.getItem("islogged"));
      const res = await fetch("/partner/autologin", {
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
        if (data.reqfee) {
          setrf({ display: true });
        }
      } else {
        localStorage.removeItem("islogged");
        history.push("/");
      }
    } else {
      localStorage.removeItem("islogged");
      history.push("/");
    }
  };
  useEffect(() => {
    resizer();
    autolog();
    // eslint-disable-next-line
  }, []);
  const logout = async () => {
    localStorage.removeItem("islogged");
    history.push("/");
    //eslint-disable-next-line
    const res = await fetch("/partner/logout", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
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
    if (newpass.length < 8) {
      return window.alert("Password must have 8 character's");
    }
    setpass({ ...pass, prcs: true });
    const res = await fetch("/partner/changepassword", {
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
  const [rf, setrf] = useState({ display: false });
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
          <NavLink to="/terms-conditions" target="_blank" style={{textDecoration:"none", color:"black"}}>
          <div
            className="drop-itm"
            onClick={() => {
              setdrpvw(false);
            }}
          >
            <HiDocumentText style={{ marginRight: "10px" }} /> Partner Terms
          </div>
          </NavLink>
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
            to="/dashboard"
            style={{ textDecoration: "none" }}
          >
            <div
              className={
                pg === "/dashboard" ? "sdnav-itm nav-actv" : "sdnav-itm"
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
            to="/dashboard/triplog"
            style={{ textDecoration: "none" }}
          >
            <div
              className={
                pg === "/dashboard/triplog" ? "sdnav-itm nav-actv" : "sdnav-itm"
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
            onClick={() => {
              setpg();
              setnaviw(false);
            }}
            to="/dashboard/driver"
            style={{ textDecoration: "none" }}
          >
            <div
              className={
                pg === "/dashboard/driver" ? "sdnav-itm nav-actv" : "sdnav-itm"
              }
            >
              <div className="sd-navicon">
                <FaUserTie />
              </div>
              <div className="sd-navtxt">Drivers</div>
            </div>
          </NavLink>
          <NavLink
            onClick={() => {
              setpg();
              setnaviw(false);
            }}
            style={{ textDecoration: "none" }}
            to="/dashboard/cars"
          >
            <div
              className={
                pg === "/dashboard/cars" ? "sdnav-itm nav-actv" : "sdnav-itm"
              }
            >
              <div className="sd-navicon">
                <FaCarAlt />
              </div>
              <div className="sd-navtxt">Cars</div>
            </div>
          </NavLink>
          <NavLink
            to="/dashboard/earning"
            onClick={() => {
              setpg();
              setnaviw(false);
            }}
            style={{ textDecoration: "none" }}
          >
            <div
              className={
                pg === "/dashboard/earning" ? "sdnav-itm nav-actv" : "sdnav-itm"
              }
            >
              <div className="sd-navicon">
                <FaRupeeSign />
              </div>
              <div className="sd-navtxt">Earning </div>
            </div>
          </NavLink>
          <NavLink
            to="/dashboard/penalty"
            onClick={() => {
              setpg();
              setnaviw(false);
            }}
            style={{ textDecoration: "none" }}
          >
            <div
              className={
                pg === "/dashboard/penalty" ? "sdnav-itm nav-actv" : "sdnav-itm"
              }
            >
              <div className="sd-navicon">
                <FaMoneyBillWave />
              </div>
              <div className="sd-navtxt">Penalty</div>
            </div>
          </NavLink>
          <NavLink
            to="/dashboard/profile"
            onClick={() => {
              setpg();
              setnaviw(false);
            }}
            style={{ textDecoration: "none" }}
          >
            <div
              className={
                pg === "/dashboard/profile" ? "sdnav-itm nav-actv" : "sdnav-itm"
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
      {rf.display ? (
        <Securityfee rf={rf} setrf={setrf} udata={udata.data} />
      ) : (
        ""
      )}
    </>
  );
};

export default Navbar;
