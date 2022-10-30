import React, { useState, useEffect } from "react";
import "./Navbar.css";
import Loading from "../Loading/Loading";
import { lda } from "./navconfig";
import { NavLink, useHistory } from "react-router-dom";
import { RiSettings3Line } from "react-icons/ri";
import { BiTachometer, BiTrip } from "react-icons/bi";
import { FiUsers } from "react-icons/fi";
import { FaMoneyBillWave } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import {
  MdDateRange,
  MdQuestionAnswer,
  MdOutlinePendingActions,
  MdOutlineTour,
  MdLogout,
  MdCreate,
} from "react-icons/md";
import { TiArrowSortedDown } from "react-icons/ti";
import {
  FaRupeeSign,
  FaBars,
  FaCar,
  FaUserTie,
  FaCity,
  FaHourglassHalf,
  FaUserSecret,
  FaRegBell,
} from "react-icons/fa";
import { BsClockHistory } from "react-icons/bs";
const Navbar = () => {
  const [data, setdata] = useState({ name: "", lastName: "" });
  const history = useHistory();
  const [vw, setvw] = useState({
    load: true,
    prfltn: false,
    nav: false,
    nvactv: "dash",
    drpdn: "",
    bkng: false,
    prtnr: false,
    drvr: false,
    car: false,
    brdcm: [{ name: "Dashboard", path: "/dashboard", navactv: "dash" }],
  });
  const handelnav = (value) => {
    const fltr = lda.filter((itm) => itm.nvactv === value);
    const brdcm = fltr.length >= 1 ? fltr[0].brdcm : [];
    // eslint-disable-next-line
    setvw({ ...vw, ["nvactv"]: value, ["nav"]: false, ["brdcm"]: brdcm });
  };
  const autolog = async () => {
    const res = await fetch("/oceannodes/autolog", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await res.json();
    if (res.status === 200) {
      setdata(data.data);
      // eslint-disable-next-line
      setvw({ ...vw, ["load"]: false });
    } else {
      localStorage.removeItem("amloin");
      history.push("/");
    }
  };
  const locator = () => {
    const fltr = lda.filter((itm) => itm.link === window.location.pathname);
    if (fltr.length <= 0) {
      history.push("/dashboard");
    } else {
      if (fltr[0].nvactv === vw.nvactv) {
        return;
      }
      handelnav(fltr[0].nvactv);
    }
  };
  useEffect(() => {
    autolog();
    // eslint-disable-next-line
  }, []);
  useEffect(locator, [locator]);

  window.onpopstate = function () {
    locator();
  };
  const logout = async () => {
    const res = await fetch("/oceannodes/logout", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await res.json();
    alert(data);
    localStorage.removeItem("amloin");
    history.push("/");
  };
  return (
    <>
      {vw.load ? (
        <Loading />
      ) : (
        <>
          <div className="admn-nav ad-nav">
            <div className="nv-prtn">
              <div
                className="tgl-nav"
                onClick={() => {
                  // eslint-disable-next-line
                  setvw({ ...vw, ["nav"]: true });
                }}
              >
                <FaBars />
              </div>
            </div>
            <div className="nv-prtn">
              <div
                className="prl-con"
                onClick={() => {
                  setvw({ ...vw, prfltn: !vw.prfltn });
                }}
              >
                <img src="/icons/pic.png" srcSet="" alt="" />
                <RiSettings3Line className="rtt" />
              </div>
            </div>
            <div
              className={vw.prfltn ? "prfl-drpdn prfl-drpdno" : "prfl-drpdn"}
            >
              <div className="pse-aro"></div>
              <div className="drpdn-prfl ovrly-ad">
                <img src="/icons/pic.png" alt="" />
              </div>
              <p className="nm-txt ovrly-ad">{`${data.name} ${data.lastName}`}</p>
              <p className="dsgt ovrly-ad"> Admin </p>
              <div className="drpdn-itm ovrly-ad">
                <FaUserSecret className="nv-icn" /> Profile
              </div>
              <div className="drpdn-itm ovrly-ad">
                <FaRegBell className="nv-icn" /> Notification
              </div>
              <div className="drpdn-itm ovrly-ad" onClick={logout}>
                <MdLogout className="nv-icn" /> Logout
              </div>
            </div>
          </div>
          <div className="brd-cm">
            <ul>
              {vw.brdcm.map((itm, i) => {
                return i + 1 === vw.brdcm.length ? (
                  <NavLink
                    onClick={() => handelnav(itm.navactv)}
                    to={itm.path}
                    className="links"
                    key={i}
                  >
                    <li key={i}>{itm.name}</li>
                  </NavLink>
                ) : (
                  <NavLink
                    onClick={() => handelnav(itm.navactv)}
                    to={itm.path}
                    className="links"
                    style={{ display: "flex", color: "white" }}
                    key={i}
                  >
                    <li>{itm.name}</li>
                    <IoIosArrowForward />
                  </NavLink>
                );
              })}
            </ul>
          </div>
          {vw.nav ? (
            <div
              className="nav-ovrly"
              onClick={() => {
                // eslint-disable-next-line
                setvw({ ...vw, ["nav"]: false });
              }}
            ></div>
          ) : (
            ""
          )}
          <nav className={vw.nav ? "sd-nav sd-navopn" : "sd-nav"}>
            <div className="nv-log ovrly-ad">
              <img src="/icons/logo.png" alt="Company Logo" />
            </div>
            <ul>
              <div className="nav-hd">Dashboard</div>
              <NavLink
                onClick={() => {
                  handelnav("dash");
                }}
                className="links"
                to="/dashboard"
              >
                <div
                  className={
                    vw.nvactv === "dash"
                      ? "nav-itm itm-actv ovrly-ad"
                      : "nav-itm ovrly-ad"
                  }
                >
                  <div className="aling-cntr">
                    <BiTachometer className="nv-icn" />
                    Dashboard
                  </div>
                </div>
              </NavLink>
              <div className="nav-hd">Client</div>
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
                  <NavLink to="/dashboard/booking/inquiry" className="links">
                    <div
                      className={
                        vw.nvactv === "inqu"
                          ? "subnav-itm ovrly-ad subnav-actv"
                          : "subnav-itm ovrly-ad"
                      }
                      onClick={() => {
                        handelnav("inqu");
                      }}
                    >
                      <MdQuestionAnswer className="nv-icn" /> Inquiry
                    </div>
                  </NavLink>
                  <NavLink to="/dashboard/booking/progress" className="links">
                    <div
                      className={
                        vw.nvactv === "prog"
                          ? "subnav-itm ovrly-ad subnav-actv"
                          : "subnav-itm ovrly-ad"
                      }
                      onClick={() => {
                        handelnav("prog");
                      }}
                    >
                      <MdOutlinePendingActions className="nv-icn" /> Progress
                    </div>
                  </NavLink>
                  <NavLink to="/dashboard/booking/billing" className="links">
                    <div
                      className={
                        vw.nvactv === "bill"
                          ? "subnav-itm ovrly-ad subnav-actv"
                          : "subnav-itm ovrly-ad"
                      }
                      onClick={() => {
                        handelnav("bill");
                      }}
                    >
                      <FaRupeeSign className="nv-icn" /> Billing
                    </div>
                  </NavLink>
                  <NavLink to="/dashboard/booking/history" className="links">
                    <div
                      className={
                        vw.nvactv === "hstry"
                          ? "subnav-itm ovrly-ad subnav-actv"
                          : "subnav-itm ovrly-ad"
                      }
                      onClick={() => {
                        handelnav("hstry");
                      }}
                    >
                      <BsClockHistory className="nv-icn" /> History
                    </div>
                  </NavLink>
                  <NavLink to="/dashboard/booking/tour" className="links">
                    <div
                      className={
                        vw.nvactv === "tourbkng"
                          ? "subnav-itm ovrly-ad subnav-actv"
                          : "subnav-itm ovrly-ad"
                      }
                      onClick={() => {
                        handelnav("tourbkng");
                      }}
                    >
                      <MdOutlineTour className="nv-icn" /> Tour
                    </div>
                  </NavLink>
                  <NavLink to="/dashboard/booking/create" className="links">
                    <div
                      className={
                        vw.nvactv === "tourbkng"
                          ? "subnav-itm ovrly-ad subnav-actv"
                          : "subnav-itm ovrly-ad"
                      }
                      onClick={() => {
                        handelnav("crtbkng");
                      }}
                    >
                      <MdCreate className="nv-icn" /> Create
                    </div>
                  </NavLink>
                </div>
              </div>

              <NavLink to="/dashboard/customer" className="links">
                <div
                  onClick={() => {
                    handelnav("usr");
                  }}
                  className={
                    vw.nvactv === "usr"
                      ? "nav-itm itm-actv ovrly-ad"
                      : "nav-itm ovrly-ad"
                  }
                >
                  <div className="aling-cntr">
                    <FiUsers className="nv-icn" />
                    Customers
                  </div>
                </div>
              </NavLink>
              <div className="nav-hd">Partner</div>
              <NavLink to="/dashboard/operator" className="links">
                <div
                  onClick={() => {
                    handelnav("oprtr");
                  }}
                  className={
                    vw.nvactv === "oprtr"
                      ? "nav-itm itm-actv ovrly-ad"
                      : "nav-itm ovrly-ad"
                  }
                >
                  <div className="aling-cntr">
                    <FaUserTie className="nv-icn" /> Operator
                  </div>
                </div>
              </NavLink>
              <NavLink to="/dashboard/car" className="links">
                <div
                  onClick={() => {
                    handelnav("crs");
                  }}
                  className={
                    vw.nvactv === "crs"
                      ? "nav-itm itm-actv ovrly-ad"
                      : "nav-itm ovrly-ad"
                  }
                >
                  <div className="aling-cntr">
                    <FaCar className="nv-icn" /> Cars
                  </div>
                </div>
              </NavLink>
              <NavLink to="/dashboard/driver" className="links">
                <div
                  onClick={() => {
                    handelnav("drvr");
                  }}
                  className={
                    vw.nvactv === "drvr"
                      ? "nav-itm itm-actv ovrly-ad"
                      : "nav-itm ovrly-ad"
                  }
                >
                  <div className="aling-cntr">
                    <FaUserTie className="nv-icn" /> Drivers
                  </div>
                </div>
              </NavLink>
              <NavLink to="/dashboard/penalty" className="links">
                <div
                  onClick={() => {
                    handelnav("pnlty");
                  }}
                  className={
                    vw.nvactv === "pnlty"
                      ? "nav-itm itm-actv ovrly-ad"
                      : "nav-itm ovrly-ad"
                  }
                >
                  <div className="aling-cntr">
                    <FaMoneyBillWave className="nv-icn" /> Penalty
                  </div>
                </div>
              </NavLink>
              <div className="nav-hd">Service</div>
              <NavLink to="/dashboard/payment" className="links">
                <div
                  onClick={() => {
                    handelnav("pmt");
                  }}
                  className={
                    vw.nvactv === "pmt"
                      ? "nav-itm itm-actv ovrly-ad"
                      : "nav-itm ovrly-ad"
                  }
                >
                  <div className="aling-cntr">
                    <FaRupeeSign className="nv-icn" />
                    Payment
                  </div>
                </div>
              </NavLink>
              <NavLink to="/dashboard/city" className="links">
                <div
                  onClick={() => {
                    handelnav("cty");
                  }}
                  className={
                    vw.nvactv === "cty"
                      ? "nav-itm itm-actv ovrly-ad"
                      : "nav-itm ovrly-ad"
                  }
                >
                  <div className="aling-cntr">
                    <FaCity className="nv-icn" />
                    City
                  </div>
                </div>
              </NavLink>
              <NavLink to="/dashboard/cabmodel" className="links">
                <div
                  onClick={() => {
                    handelnav("cbmdl");
                  }}
                  className={
                    vw.nvactv === "cbmdl"
                      ? "nav-itm itm-actv ovrly-ad"
                      : "nav-itm ovrly-ad"
                  }
                >
                  <div className="aling-cntr">
                    <FaCar className="nv-icn" />
                    Cab Models
                  </div>
                </div>
              </NavLink>
              <NavLink to="/dashboard/hourlyrental" className="links">
                <div
                  onClick={() => {
                    handelnav("hrly");
                  }}
                  className={
                    vw.nvactv === "hrly"
                      ? "nav-itm itm-actv ovrly-ad"
                      : "nav-itm ovrly-ad"
                  }
                >
                  <div className="aling-cntr">
                    <FaHourglassHalf className="nv-icn" />
                    Hourly Packages
                  </div>
                </div>
              </NavLink>
              <NavLink to="/dashboard/outstation" className="links">
                <div
                  onClick={() => {
                    handelnav("outs");
                  }}
                  className={
                    vw.nvactv === "outs"
                      ? "nav-itm itm-actv ovrly-ad"
                      : "nav-itm ovrly-ad"
                  }
                >
                  <div className="aling-cntr">
                    <BiTrip className="nv-icn" />
                    Outstation
                  </div>
                </div>
              </NavLink>
              <NavLink to="/dashboard/tourpackage" className="links">
                <div
                  onClick={() => {
                    handelnav("tur");
                  }}
                  className={
                    vw.nvactv === "tur"
                      ? "nav-itm itm-actv ovrly-ad"
                      : "nav-itm ovrly-ad"
                  }
                >
                  <div className="aling-cntr">
                    <MdOutlineTour className="nv-icn" />
                    Tour Packages
                  </div>
                </div>
              </NavLink>
            </ul>
          </nav>
        </>
      )}
    </>
  );
};

export default Navbar;
