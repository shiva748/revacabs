import React, { useState, useEffect } from "react";
import { NavLink, useHistory } from "react-router-dom";
import Loading from "../templates/loading/secloading";
import { FaEdit, FaTimesCircle, FaTimes } from "react-icons/fa";
import { FcApproval } from "react-icons/fc";
// FaRegCalendarAlt, FaClock,
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "./css/selectcar.css";
import Gst from "../images/car/gst.png";
import drvr from "../images/car/driver.png";
import toll from "../images/car/toll.png";
import tip from "../images/car/tip.png";
import ac from "../images/car/ac.png";
import distance from "../images/car/distance.png";
import people from "../images/car/people.png";
import soldout from "../images/car/soldout.png";
import paybl from "../images/car/paybl.png";
import night from "../images/car/night.png";
import parking from "../images/car/parking.png";
import wating from "../images/car/wating.png";
import { Helmet } from "react-helmet";

const Selectcar = () => {
  const [alertd, setalertd] = useState({
    display: false,
    title: "",
    message: "",
    type: "",
  });
  const [hgt, sethgt] = useState();
  const resizer = () => {
    const height = window.innerHeight - 145;
    sethgt(height);
  };

  window.addEventListener("resize", resizer);
  const history = useHistory();
  const [servicedata, setservicedata] = useState({
    bookingtype: "outstation",
    outstationtype: "Oneway",
    from: "",
    fromcode: "",
    to: "",
    tocode: "",
    pickupdate: new Date(),
    pickupat: "",
    returnat: "",
  });
  const [toshow, settoshow] = useState("4-40");
  const handelshow = (e) => {
    settoshow(e.target.value);
  };
  const isbkng = () => {
    if (
      localStorage.getItem("service-data") &&
      sessionStorage.getItem("service-data")
    ) {
      if (
        localStorage.getItem("service-data") !==
        sessionStorage.getItem("service-data")
      ) {
        history.push("/");
      } else {
        selectcar();
        setservicedata(JSON.parse(sessionStorage.getItem("service-data")));
      }
    } else {
      history.push("/");
    }
  };
  useEffect(() => {
    resizer();
    isbkng();
    // eslint-disable-next-line
  }, []);

  const [loadscr, setloadscr] = useState(true);
  const [result, setresult] = useState([]);
  const selectcar = async () => {
    let qury = {};
    const {
      bookingtype,
      outstationtype,
      from,
      fromcode,
      to,
      tocode,
      pickupdate,
      pickupat,
      returnat,
    } = JSON.parse(localStorage.getItem("service-data"));
    const bookingtypes = ["outstation", "local", "tour"];
    if (
      !bookingtype ||
      typeof bookingtype !== "string" ||
      !bookingtypes.some((itm) => itm === bookingtype) ||
      !from ||
      typeof from !== "string" ||
      !fromcode ||
      typeof fromcode !== "string" ||
      !pickupdate ||
      typeof pickupdate !== "number" ||
      !pickupat ||
      typeof pickupat !== "number"
    ) {
      return history.push("/");
    }
    qury = {
      ...qury,
      bookingtype,
      from,
      fromcode,
      pickupdate,
      pickupat,
    };
    if (bookingtype === "outstation") {
      const valout = ["Oneway", "Roundtrip"];
      if (
        !to ||
        !tocode ||
        typeof to !== "string" ||
        typeof tocode !== "string" ||
        !outstationtype ||
        typeof outstationtype !== "string" ||
        !valout.some((itm) => itm === outstationtype)
      ) {
        return history.push("/");
      }
      qury = { ...qury, to, tocode, outstationtype };
      if (outstationtype === "Roundtrip") {
        if (!returnat || typeof returnat !== "number") {
          return history.push("/");
        }
        qury = { ...qury, returnat };
      }
    }
    const res = await fetch("/api/selectcar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(qury),
    });
    const data = await res.json();
    if (res.status === 200) {
      setloadscr(false);
      if (!data.result) {
        window.alert(data);
        history.push("/");
      } else {
        setresult(data.result);
      }
      //request to server done
    } else {
      window.alert(data);
      history.push("/");
    }
  };
  const handleselection = (data) => {
    if (!data.isavilable) {
      return setalertd({
        display: true,
        title: "",
        message: "Please select another trip",
        type: "danger",
      });
    }
    const stringed = JSON.stringify(data);
    localStorage.setItem("selected", stringed);
    sessionStorage.setItem("selected", stringed);
    history.push("/booking/details");
  };
  return (
    <>
      {/* <Helmet>
        <meta charSet="utf-8" />
        <title>
          {servicedata.bookingtype === "local"
            ? `${servicedata.from.split(",")[0]} Local Cab booking.`
            : `${servicedata.from.split(",")[0]} to ${
                servicedata.to.split(",")[0]
              } ${servicedata.outstationtype} cab booking`}
        </title>
        <meta
          name="description"
          content={
            servicedata.bookingtype === "local"
              ? `${servicedata.from.split(",")[0]} Local Cab booking.`
              : `${servicedata.from.split(",")[0]} to ${
                  servicedata.to.split(",")[0]
                } ${
                  servicedata.outstationtype
                } cab booking with RevaCabs. We provide most reasonable rates & reliable service`
          }
        />
        <link rel="canonical" href="http://revacabs.com/" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet> */}
      <div className="schead">
        <div className="schead-ptn">
          <div className="ptn-head">Route Detail</div>
          <div className="ptn-content">
            <div className="ptn-content-tc">
              <span className="pickup">{servicedata.from.split(",")[0]}</span>
              {servicedata.bookingtype === "outstation" ? "➤" : ""}
              <span className="drop">
                {" "}
                {servicedata.to ? servicedata.to.split(",")[0] : servicedata.to}
              </span>
            </div>
            <p className="bookingtype">
              {servicedata.bookingtype === "outstation"
                ? `(${servicedata.outstationtype})`
                : `(${servicedata.bookingtype})`}
            </p>
          </div>
        </div>
        {/* <div className="schead-ptn2">
          <div className="ptn-head">Pick up</div>
          <div className="ptn-content">
            <div className="ptn-content-icon">
              <FaRegCalendarAlt />
              <FaClock />
            </div>
            <div className="ptn-content-t">
              <span>{new Date(servicedata.pickupdate * 1).toDateString()}</span>
              <span>
                {new Date(servicedata.pickupat * 1).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
        {servicedata.returnat ? (
          <div className="schead-ptn2">
            <div className="ptn-head">Returned at</div>
            <div className="ptn-content">
              <div className="ptn-content-icon">
                <FaRegCalendarAlt />
              </div>
              <div className="ptn-content-t">
                <span>{new Date(servicedata.returnat * 1).toDateString()}</span>
              </div>
            </div>
          </div>
        ) : (
          ""
        )} */}
        <NavLink className="mdf-t" to="/">
          <div className="et-ico">
            <FaEdit />
          </div>{" "}
          Remake
        </NavLink>
      </div>
      {loadscr ? (
        <Loading />
      ) : (
        <div
          className="res-con"
          style={{
            height: `${hgt}px`,
          }}
        >
          {servicedata.bookingtype === "local" ? (
            <div className="lp-con">
              <div className="lp-menu">
                <div
                  className={
                    toshow === "4-40" ? "lp-itm form-selected" : "lp-itm"
                  }
                >
                  <input
                    className="radio"
                    type="radio"
                    name="pkg-type"
                    id="4hr"
                    value="4-40"
                    onClick={handelshow}
                  />
                  <div className=""></div>
                  <label htmlFor="4hr" className="radio-label">
                    4hrs-40km
                  </label>
                </div>
                <div
                  className={
                    toshow === "8-80" ? "lp-itm form-selected" : "lp-itm"
                  }
                >
                  <input
                    className="radio"
                    type="radio"
                    name="pkg-type"
                    id="8hr"
                    value="8-80"
                    onClick={handelshow}
                  />
                  <div className=""></div>
                  <label htmlFor="8hr" className="radio-label">
                    8hrs-80km
                  </label>
                </div>
                <div
                  className={
                    toshow === "12-120" ? "lp-itm form-selected" : "lp-itm"
                  }
                >
                  <input
                    className="radio"
                    type="radio"
                    name="pkg-type"
                    id="12hr"
                    value="12-120"
                    onClick={handelshow}
                  />
                  <div className=""></div>
                  <label htmlFor="12hr" className="radio-label">
                    12hrs-120km
                  </label>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
          {result.map((itm, i) => {
            if (servicedata.bookingtype === "local") {
              const parameter = toshow.split("-");
              if (
                itm.hour !== parameter[0] * 1 ||
                itm.distance !== parameter[1] * 1
              ) {
                return "";
              }
            }
            return (
              <div className="bkng-card" key={i}>
                <div className="bkng-sub-l">
                  <div className="bkng-img">
                    <img
                      src={`/car/${itm.cab_id}/${itm.name}.png`}
                      alt=""
                      srcSet=""
                    />
                  </div>
                  <div className="bkng-cade">
                    <div className="h-t3">{itm.name}</div>
                    {itm.equivalent.isequi ? (
                      <div className="tool-tip">
                        or Equivalent
                        <Tippy content={"Like " + itm.equivalent.txt}>
                          <img src={tip} alt="" />
                        </Tippy>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div className="bkng-sub">
                  <div className="bkng-ftr">
                    <div className="sub-ftr">
                      <ul className="ftr-list">
                        <li>
                          <img
                            src={people}
                            alt=""
                            srcSet=""
                            className="sml-icn"
                          />
                          {itm.rdr} Rider + Driver
                        </li>
                        <li>
                          <img src={ac} alt="" srcSet="" className="sml-icn" />
                          Ac Cab
                        </li>
                        <li>
                          <img
                            src={distance}
                            alt=""
                            srcSet=""
                            className="sml-icn"
                          />
                          {itm.distance}
                          km in Quote
                        </li>
                      </ul>
                    </div>
                    <div className="bkng-prc">
                      <div>
                        <span
                          className="prc-text"
                          style={{
                            color: `${
                              itm.totalpayable < itm.regularamount
                                ? "red"
                                : "yellowgreen"
                            }`,
                            textDecorationLine: "line-through",
                          }}
                        >
                          ₹{itm.regularamount}
                        </span>
                      </div>
                      <div>
                        <span
                          className="prc-text"
                          style={{
                            color: `${
                              itm.totalpayable > itm.regularamount
                                ? "red"
                                : "yellowgreen"
                            }`,
                          }}
                        >
                          ₹{itm.totalpayable}{" "}
                          <Tippy
                            content={
                              <div className="tooltip-prc">
                                <p className="incl">Fare Breakup</p>
                                <ul>
                                  <li>
                                    <span>
                                      <img
                                        src={distance}
                                        alt=""
                                        srcSet=""
                                        className="tooltip-icn"
                                      />
                                      for {itm.distance} km
                                    </span>
                                    ₹ {itm.basefare}
                                  </li>
                                  <li>
                                    <span>
                                      <img
                                        src={drvr}
                                        alt=""
                                        srcSet=""
                                        className="tooltip-icn"
                                      />
                                      Driver aid
                                    </span>
                                  </li>
                                  {itm.othercharges.Tolltaxes.isinclude ? (
                                    <li>
                                      <span>
                                        <img
                                          src={toll}
                                          alt=""
                                          srcSet=""
                                          className="tooltip-icn"
                                        />
                                        Toll & State tax
                                      </span>
                                      ₹{itm.othercharges.Tolltaxes.amount}
                                    </li>
                                  ) : (
                                    ""
                                  )}
                                  <li>
                                    <span>
                                      <img
                                        src={Gst}
                                        alt=""
                                        srcSet=""
                                        className="tooltip-icn"
                                      />
                                      Taxes & fee
                                    </span>
                                  </li>
                                  <li>
                                    <span>
                                      <img
                                        src={paybl}
                                        alt=""
                                        srcSet=""
                                        className="tooltip-icn"
                                      />
                                      EST Total
                                    </span>
                                    ₹{itm.totalpayable}
                                  </li>
                                  <p
                                    className="excl"
                                    style={{ marginTop: "10px" }}
                                  >
                                    Exclusion
                                  </p>
                                  <li>
                                    <span>
                                      <img
                                        src={night}
                                        alt=""
                                        srcSet=""
                                        className="tooltip-icn"
                                      />
                                      Night
                                    </span>
                                    ₹{itm.othercharges.Night.amount}
                                  </li>
                                  {itm.othercharges.Tolltaxes.isinclude ||
                                  servicedata.bookingtype === "local" ? (
                                    ""
                                  ) : (
                                    <li
                                      className={
                                        itm.othercharges.Tolltaxes.isinclude
                                          ? "incl"
                                          : ""
                                      }
                                    >
                                      <span>
                                        <img
                                          src={toll}
                                          alt=""
                                          srcSet=""
                                          className="tooltip-icn"
                                        />
                                        Toll & State tax
                                      </span>
                                      ₹{itm.othercharges.Tolltaxes.amount}
                                    </li>
                                  )}
                                  <li>
                                    <span>
                                      <img
                                        src={distance}
                                        alt=""
                                        srcSet=""
                                        className="tooltip-icn"
                                      />
                                      After {itm.distance} Km
                                    </span>
                                    ₹{itm.othercharges.Extrakm.amount}/km
                                  </li>
                                  <li>
                                    <span>
                                      <img
                                        src={wating}
                                        alt=""
                                        srcSet=""
                                        className="tooltip-icn"
                                      />
                                      Breaks
                                    </span>
                                    ₹{itm.othercharges.Extrahour.amount}/hr
                                  </li>
                                  <li>
                                    <span>
                                      <img
                                        src={parking}
                                        alt=""
                                        srcSet=""
                                        className="tooltip-icn"
                                      />
                                      Parking
                                    </span>
                                  </li>
                                </ul>
                              </div>
                            }
                          >
                            <img
                              src={tip}
                              alt=""
                              srcSet=""
                              className="sml-icn"
                            />
                          </Tippy>
                        </span>
                      </div>
                      <div>
                        <span
                          style={{
                            color: `${
                              itm.totalpayable > itm.regularamount
                                ? "red"
                                : "yellowgreen"
                            }`,
                          }}
                        >
                          {itm.regularamount > itm.totalpayable
                            ? `Save : ₹${itm.regularamount - itm.totalpayable}`
                            : `Increase : ₹${
                                itm.totalpayable - itm.regularamount
                              }`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bkng-btn">
                    {itm.isavilable ? (
                      <button
                        className="action-btn"
                        onClick={() =>
                          itm.isavilable ? handleselection(itm) : ""
                        }
                      >
                        Select
                      </button>
                    ) : (
                      <img src={soldout} alt="" className="soldot" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
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
    </>
  );
};

export default Selectcar;
