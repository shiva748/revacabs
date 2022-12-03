import React, { useEffect, useState } from "react";
import Loading from "../templates/loading/Loading";
import Countdown from "react-countdown";
import "./css/bookings.css";
import { FaTimes, FaTimesCircle, FaEye } from "react-icons/fa";
import { CgArrowRight, CgArrowsExchange } from "react-icons/cg";
import { FcApproval } from "react-icons/fc";
import { ImLocation2, ImSearch, ImCancelCircle } from "react-icons/im";
import { AiOutlineClear } from "react-icons/ai";
import "tippy.js/dist/tippy.css";
import { NavLink, useHistory } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Helmet } from "react-helmet";
const Ongoing = () => {
  const [dtl, setdtl] = useState({ display: false, data: {} });
  const [alertd, setalertd] = useState({
    display: false,
    title: "",
    message: "",
    type: "",
  });
  const history = useHistory();
  const [loading, setloading] = useState(true);
  const df = {
    from: "",
    fromcode: "",
    to: "",
    tocode: "",
    type: "",
    Package: "",
  };
  const [filter, setfilter] = useState(df);

  const [def, setdef] = useState([]);
  const [dis, setdis] = useState({from:false, to:false});
  const [autoco, setautoco] = useState({
    from: [],
    to: [],
  });
  const firstload = async () => {
    const res = await fetch("/api/public/autocomplete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frst: true }),
    });
    const data = await res.json();
    setautoco({
      from: data,
      to: data,
    });
    setdef(data)
  };
  const autocomplete = async (e) => {
    if (e.target.value.length <= 0) {
      setautoco({
        from: def,
        to: def,
      });
      return;
    }
    if (typeof e.target.value !== "string") {
      return;
    }
    const res = await fetch("/api/public/autocomplete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: e.target.value }),
    });
    const data = await res.json();
    if (e.target.name === "from") {
      if (res.status !== 200) {
        return setautoco({ ...autoco, from: []});
      } else {
        return setautoco({ ...autoco, from: data });
      }
    } else if (e.target.name === "to") {
      if (res.status !== 200) {
        return setautoco({ ...autoco, to: [] });
      } else {
        return setautoco({ ...autoco, to: data });
      }
    }
  };
  // upcoming

  const bknglstr = async (bypass) => {
    if (localStorage.getItem("islogged") !== "y") {
      return document.location.replace("/");
    }
    let qury = {};
    let { from, fromcode, to, Package, tocode, type } = filter;
    let { entry, pag } = lst;
    if (!entry || isNaN(entry) || !pag || typeof pag !== "number") {
      return alert("Invalid request");
    }
    if (lst.prv && bypass !== true) {
      if (entry === lst.prv.entry && pag === lst.prv.pag) {
        return;
      }
    }
    qury = { ...qury, pag, entry };
    if (type) {
      if (
        typeof type !== "string" ||
        !["Oneway", "Roundtrip", "Local"].some((itm) => itm === type)
      ) {
        return;
      }
      qury = { ...qury, type };
      if (type === "Local") {
        to = "";
      } else {
        Package = "";
      }
    }
    if (from) {
      if (
        (typeof from !== "string",
        !fromcode || typeof fromcode !== "string" || isNaN(fromcode))
      ) {
        return;
      }
      if (
        !autoco.from.some(
          (itm) => itm.citycode === fromcode && itm.cityname === from
        )
      ) {
        return;
      }
      qury = { ...qury, from, fromcode };
    }
    if (to) {
      if (
        typeof to !== "string" ||
        !tocode ||
        typeof tocode !== "string" ||
        isNaN(tocode)
      ) {
        return;
      }
      if (
        !autoco.to.some(
          (itm) => itm.citycode === tocode && itm.cityname === to
        )
      ) {
        return;
      }
      qury = { ...qury, to, tocode };
    }
    if (Package) {
      if (
        typeof Package !== "string" ||
        !["4-40", "8-80", "12-120"].some((itm) => itm === type)
      ) {
        return;
      }
      qury = { ...qury, Package };
    }
    setloading(true);
    const res = await fetch("/api/booking/ongoing", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(qury),
    });
    // eslint-disable-next-line
    const data = await res.json();
    if (res.status !== 200) {
      history.push("/");
    } else {
      setlst({
        ...lst,
        data: data.bookings,
        prv: { pag, entry },
        flt: { from, fromcode, to, tocode, type, Package },
      });
      setloading(false);
    }
  };
  useEffect(() => {
    bknglstr();
    firstload();
    // eslint-disable-next-line
  }, []);
  const cancelbooking = async (e) => {
    e.preventDefault();
    const { data, feedback, reason } = cncl;
    setcncl({ ...cncl, load: true });
    const res = await fetch("/api/cancelbooking", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ bookingid: data.bookingid, reason, feedback }),
    });
    const result = await res.json();
    if (res.status === 200) {
      setcncl(dcl);
      bknglstr(true);
      setalertd({
        display: true,
        title: "",
        message: result,
        type: "green",
      });
    } else {
      setcncl({ ...cncl, load: false });
      setalertd({
        display: true,
        title: "",
        message: result,
        type: "danger",
      });
    }
  };
  let name, value;
  const dcl = {
    shw: false,
    freecncl: false,
    load: false,
  };
  const [cncl, setcncl] = useState(dcl);
  const handelinput = (e) => {
    name = e.target.name;
    value = e.target.value;
    setcncl({ ...cncl, [name]: value });
  };
  const dres = { shw: false, date: "", time: "", data: {}, load: false };
  const [timear, settimear] = useState([]);
  const [resc, setresc] = useState(dres);
  const gentime = (selected) => {
    let sd;
    let timearray = [];
    if (selected instanceof Date) {
      sd = selected;
    } else {
      sd = new Date();
    }
    const todaydate = new Date();
    let hours =
      todaydate.getMonth() === sd.getMonth() &&
      todaydate.getDate() === sd.getDate() &&
      todaydate.getFullYear() === sd.getFullYear()
        ? todaydate.getHours() + 3
        : 0;
    let minutes = 0;
    while (hours <= 23) {
      if (minutes < 60) {
        timearray.push({
          text: `${hours > 12 ? hours - 12 : hours === 0 ? 12 : hours}:${
            minutes === 0 ? "0" + minutes : minutes
          }${hours >= 12 ? "PM" : "AM"}`,
          value: new Date(
            sd.getFullYear(),
            sd.getMonth(),
            sd.getDate(),
            hours,
            minutes,
            0,
            0
          ).getTime(),
        });
        minutes = minutes + 15;
      } else if (hours === 23 && minutes === 60) {
        hours = 24;
      } else {
        minutes = 0;
        hours = hours + 1;
        timearray.push({
          text: `${hours > 12 ? hours - 12 : hours}:${
            minutes === 0 ? "0" + minutes : minutes
          }${hours >= 12 ? "PM" : "AM"}`,
          value: new Date(
            sd.getFullYear(),
            sd.getMonth(),
            sd.getDate(),
            hours,
            minutes,
            0,
            0
          ).getTime(),
        });
        minutes = 15;
      }
    }
    settimear(timearray);
  };
  // === === === intator === === === //

  const intator = () => {
    if (lst.flt) {
      const { fromcode, to, tocode, from, type, Package } = lst.flt;
      if (
        from !== filter.from ||
        fromcode !== filter.fromcode ||
        type !== filter.type ||
        Package !== filter.Package ||
        to !== filter.to ||
        tocode !== filter.tocode ||
        lst.prv.entry !== lst.entry
      ) {
        return setlst({ ...lst, pag: 1, prv: {} });
      }
    }
    setlst({ ...lst, prv: {} });
  };

  // === === === lst controller === === === //
  const [lst, setlst] = useState({
    entry: "10",
    pag: 1,
    data: [],
    flt: {},
    prv: {},
  });
  const handellst = (type) => {
    let pag = lst.pag;
    if (
      lst.flt.from !== filter.from ||
      lst.flt.fromcode !== filter.fromcode ||
      lst.flt.type !== filter.type ||
      lst.flt.Package !== filter.Package ||
      lst.flt.to !== filter.to ||
      lst.flt.tocode !== filter.tocode ||
      lst.prv.entry !== lst.entry
    ) {
      return setlst({ ...lst, pag: 1, prv: {} });
    }
    if (type) {
      if (lst.data.length < lst.prv.entry * 1) {
        return;
      }
      setlst({ ...lst, pag: pag + 1 });
    } else {
      if (pag <= 1) {
        setlst({ ...lst, pag: 1 });
      } else {
        setlst({ ...lst, pag: pag - 1 });
      }
    }
  };
  // === === === show cancel === === === //
  // eslint-disable-next-line
  let tmr;
  const showcncl = (itm, bypass) => {
    let isConfirmed;
    if (bypass) {
      isConfirmed = true;
    } else {
      isConfirmed = window.confirm(
        "Are you sure you want to cancel this booking ?"
      );
    }
    if (!isConfirmed) {
      return;
    }
    if (itm.pickupat - 86400000 > Date.now()) {
      setcncl({ ...cncl, shw: true, freecncl: true, data: itm });
      tmr = setTimeout(() => {
        showcncl(itm, true);
      }, itm.pickupat - 86400000 - Date.now());
    } else {
      setcncl({ ...cncl, shw: true, freecncl: false, data: itm });
    }
  };
  const Reschedule = async (e) => {
    e.preventDefault();
    const { date, time, data } = resc;
    setresc({ ...resc, load: true });
    const res = await fetch("/api/booking/resheduled", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        bookingid: data.bookingid,
        date: date.toString(),
        time: time.toString(),
      }),
    });
    const result = await res.json();
    if (res.status === 201) {
      setresc(dres);
      bknglstr(true);
      setalertd({
        display: true,
        title: "",
        message: result,
        type: "green",
      });
    } else {
      setresc({ ...resc, load: false });
      setalertd({
        display: true,
        title: "",
        message: result,
        type: "danger",
      });
    }
  };
  useEffect(() => {
    const closeDropdown = (e) => {
      if (
        e.path[0].tagName !== "INPUT" &&
        !["from", "to"].some((itm) => itm === e.path[0].id)
      ) {
        setdis({from:false, to:false})
      } else if (
        e.path[0].id === "from"
      ) {
        setdis({from:true, to:false})
      } else if (e.path[0].id === "to") {
        setdis({from:false, to:true})
      }
    };
    document.body.addEventListener("click", closeDropdown);
    return () => document.body.removeEventListener("click", closeDropdown);
  }, []);
  return (
    <>
      {/* <Helmet>
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
          } - Ongoing Bookings`}
        </title>
        <meta
          name="description"
          content={`${
            sessionStorage.getItem.userdata
              ? sessionStorage.getItem.userdata.name
              : ""
          } Ongoing Bookings`}
        />
        <link rel="canonical" href="http://revacabs.com/" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet> */}
      {loading ? (
        <Loading />
      ) : (
        <section className={loading ? "hide" : ""}>
          <div className="conw-rg">
            <div className="fltr-con">
              <div className="sub-fltr">
                <div className="sub-fltrprtn">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="from"
                      id="from"
                      className="fltr-input"
                      placeholder="From"
                      value={filter.from}
                      onChange={(e) => {
                        setfilter({ ...filter, from: e.target.value });
                      }}
                      autoComplete="off"
                      
                      onKeyUp={autocomplete}
                    />
                    {dis.from ? (
                      <div className="auto-con">
                        <div className="auto-wrapper">
                          {autoco.from.map((itm, i) => {
                            return (
                              <div
                                key={i}
                                className="suggestion"
                                onClick={() => {
                                  setfilter({
                                    ...filter,
                                    from: itm.cityname,
                                    fromcode: itm.citycode,
                                  });
                                }}
                              >
                                <div className="location-icon">
                                  <ImLocation2 />
                                </div>
                                <div className="location-text">
                                  <div className="location-city">
                                    {itm.cityname.split(",")[0]}
                                  </div>
                                  <div className="location-state">
                                    {itm.cityname.split(",")[1]}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          {autoco.from.length <= 0 ? "No city Found" : ""}
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                {filter.type === "Local" ? (
                  <div className="sub-fltrprtn">
                    <div className="input-wrapper">
                      <select
                        name="Package"
                        className="fltr-input"
                        onChange={(e) => {
                          setfilter({ ...filter, Package: e.target.value });
                        }}
                        value={filter.Package}
                      >
                        <option value="">Select Rental package</option>
                        <option value="4-40">4HR || 40KM</option>
                        <option value="8-80">8HR || 80KM</option>
                        <option value="12-120">12HR || 120KM</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="sub-fltrprtn">
                    <div className="input-wrapper">
                      <input
                        type="text"
                        name="to"
                        id="to"
                        className="fltr-input"
                        placeholder="to"
                        value={filter.to}
                        onChange={(e) => {
                          setfilter({ ...filter, to: e.target.value });
                        }}
                        autoComplete="off"
                        onKeyUp={autocomplete}
                      />
                      {dis.to ? (
                        <div className="auto-con">
                          <div className="auto-wrapper">
                            {autoco.to.map((itm, i) => {
                              return (
                                <div
                                  key={i}
                                  className="suggestion"
                                  onClick={() => {
                                    setfilter({
                                      ...filter,
                                      to: itm.cityname,
                                      tocode: itm.citycode,
                                    });
                                    
                                  }}
                                >
                                  <div className="location-icon">
                                    <ImLocation2 />
                                  </div>
                                  <div className="location-text">
                                    <div className="location-city">
                                      {itm.cityname.split(",")[0]}
                                    </div>
                                    <div className="location-state">
                                      {itm.cityname.split(",")[1]}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            {autoco.to.length <= 0 ? "No city Found" : ""}
                          </div>
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="sub-fltr">
                <div className="sub-fltrprtn">
                  <div className="input-wrapper">
                    <select
                      name="type"
                      className="fltr-input"
                      onChange={(e) => {
                        setfilter({ ...filter, type: e.target.value });
                      }}
                      value={filter.type}
                    >
                      <option value="">Select Type</option>
                      <option value="Oneway">Oneway</option>
                      <option value="Roundtrip">Round Trip</option>
                      <option value="Local">Hourly Rental</option>
                    </select>
                  </div>
                </div>
                <div className="sub-fltrprtn">
                  <button
                    className="inpt-btn bg-rd"
                    onClick={() => setfilter(df)}
                  >
                    <span>
                      <AiOutlineClear /> Filter
                    </span>
                  </button>
                  <button
                    type="submit"
                    className="inpt-btn bg-gr"
                    onMouseDown={intator}
                    onClick={bknglstr}
                  >
                    <span>
                      <ImSearch /> Search
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="page-section">
            <div className="page-container">
              {lst.data.length <= 0 ? (
                <div className="no-bkng">
                  <p>
                    You don't have any Ongoing bookings with us. would you like
                    to book one ?
                  </p>
                  <NavLink to="/" className="blue-link">
                    Book a cab!
                  </NavLink>
                </div>
              ) : (
                lst.data.map((itm, i) => {
                  return (
                    <>
                      <div className="bkng-crd" key={i}>
                        <div
                          className="bkng-crd-hd crd-txtflx"
                          style={{ justifyContent: "left" }}
                        >
                          {itm.bookingid}
                        </div>
                        <div className="sb-crd">
                          <div className="crd-prtn">
                            <div className="crd-cl">
                              <div className="crd-hd">Route Details</div>
                              <div className="bold-txt crd-txtflx">
                                {itm.sourcecity.from.split(",")[0]}
                                {itm.bookingtype === "Local" ? (
                                  ""
                                ) : itm.outstation === "Roundtrip" ? (
                                  <>
                                    <CgArrowsExchange />
                                    {itm.endcity.to.split(",")[0]}
                                  </>
                                ) : (
                                  <>
                                    <CgArrowRight />
                                    {itm.endcity.to.split(",")[0]}
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="crd-cl">
                              <div className="crd-hd">Booking Type</div>
                              <div className="bold-txt crd-txtflx">
                                {itm.bookingtype === "Outstation"
                                  ? itm.outstation
                                  : "Hourly Rental"}
                              </div>
                            </div>
                          </div>
                          <div className="crd-prtn">
                            <div className="crd-cl">
                              <div className="crd-hd">Pickup</div>
                              <div className="bold-txt crd-txtflx">
                                {new Date(itm.pickupat).toLocaleString("en-IN")}
                              </div>
                            </div>
                            <div className="crd-cl">
                              <div className="crd-hd">Driver No</div>
                              <div className="bold-txt crd-txtflx">
                                {itm.pickupat - new Date().getTime() <
                                86400000 ? (
                                  itm.driverinfo.assigned ? (
                                    <a
                                      href={"tel:+91".concat(
                                        itm.driverinfo.phone
                                      )}
                                      style={{
                                        color: "skyblue",
                                        display: "inline",
                                        width: "auto",
                                        padding: "0px",
                                      }}
                                      className="ftr-link"
                                    >
                                      {itm.driverinfo.phone}
                                    </a>
                                  ) : (
                                    "Driver not assigned yet"
                                  )
                                ) : (
                                  <span
                                    style={{
                                      color: "skyblue",
                                    }}
                                  >
                                    <Countdown
                                      date={
                                        Date.now() +
                                        (itm.pickupat - 86399990 - Date.now())
                                      }
                                      onComplete={() => {
                                        bknglstr(true);
                                      }}
                                    />
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="gv-con">
                          <button
                            className="gv-btn icn-btn"
                            onClick={() => {
                              setdtl({ display: true, data: itm });
                            }}
                          >
                            View
                            <FaEye
                              style={{
                                fontSize: "20px",
                                margin: "0px 7px",
                              }}
                            />
                          </button>
                          <button
                            style={{ background: "#ff5353" }}
                            className="gv-btn icn-btn"
                            onClick={() => {
                              showcncl(itm);
                            }}
                          >
                            Cancel
                            <ImCancelCircle
                              style={{
                                fontSize: "20px",
                                margin: "0px 7px",
                              }}
                            />
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })
              )}
            </div>
          </div>
          {cncl.shw ? (
            <>
              <div className="form-container">
                <div
                  className="frm-clsr"
                  onClick={() => {
                    setcncl(dcl);
                  }}
                ></div>
                <div className={cncl.load ? "cncl-con ovrly-ad" : "cncl-con"}>
                  <div className="cncl-hd">Cancel Booking</div>
                  <table className="bkngdtl-tbl">
                    <tbody>
                      <tr>
                        <td>Booking Type</td>
                        <td>{cncl.data.bookingtype}</td>
                      </tr>
                      <tr>
                        <td>
                          {cncl.data.bookingtype === "Outstation"
                            ? "Outstation Type"
                            : "Rental Package"}
                        </td>
                        <td>
                          {cncl.data.bookingtype === "Outstation"
                            ? `${cncl.data.outstation} (${cncl.data.tripinfo.distance} KM)`
                            : `(${cncl.data.tripinfo.hour} Hour ||${cncl.data.tripinfo.distance} KM)`}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          {cncl.data.bookingtype === "Local" ? "City" : "Route"}
                        </td>
                        <td>
                          {cncl.data.sourcecity.from.split(",")[0]}

                          {cncl.data.bookingtype === "Local" ? (
                            ""
                          ) : cncl.data.outstation === "Roundtrip" ? (
                            <>
                              <CgArrowsExchange />
                              {cncl.data.endcity.to.split(",")[0]}
                            </>
                          ) : (
                            <>
                              <CgArrowRight />
                              {cncl.data.endcity.to.split(",")[0]}
                            </>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Cab</td>
                        <td>
                          {cncl.data.tripinfo.equivalent.isequi
                            ? `${cncl.data.tripinfo.name} or equi`
                            : cncl.data.tripinfo.name}
                        </td>
                      </tr>
                      <tr>
                        <td>Pickup Date</td>
                        <td>
                          {new Date(cncl.data.pickupat).toLocaleDateString(
                            "en-IN"
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Pickup at</td>
                        <td>
                          {new Date(cncl.data.pickupat).toLocaleTimeString(
                            "en-IN"
                          )}
                        </td>
                      </tr>
                      {cncl.data.bookingtype === "Outstation" ? (
                        cncl.data.outstation === "Roundtrip" ? (
                          <tr>
                            <td>Return Date</td>
                            <td>
                              {new Date(cncl.data.returnat).toLocaleDateString(
                                "en-IN"
                              )}
                            </td>
                          </tr>
                        ) : (
                          ""
                        )
                      ) : (
                        ""
                      )}
                      <tr>
                        <td>Booking Amount</td>
                        <td>₹ {cncl.data.payable}</td>
                      </tr>
                      <tr>
                        <td>
                          {cncl.freecncl
                            ? "Free Cancellation Till"
                            : "Free Cancellation"}
                        </td>
                        <td
                          style={{
                            color: cncl.freecncl ? "lightgreen" : "skyblue",
                          }}
                        >
                          {cncl.freecncl ? (
                            <Countdown
                              date={
                                Date.now() +
                                (cncl.data.pickupat - 86400000 - Date.now())
                              }
                            />
                          ) : (
                            <NavLink to="/" style={{ color: "skyblue" }}>
                              N/A
                            </NavLink>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table className="bkngdtl-tbl">
                    <tbody>
                      <tr>
                        <td>Cancellation Reason</td>
                        <td>
                          <select
                            name="reason"
                            id="cnclrsn-inp"
                            onChange={handelinput}
                          >
                            <option value="">Select a reason</option>
                            <option value="Will travel later">
                              Will travel later
                            </option>
                            <option value="Travel plan cancelled">
                              Travel plan cancelled
                            </option>
                            <option value="Travel plan changed">
                              Travel plan changed
                            </option>
                            <option value="Rate issue">Rate issue</option>
                            <option value="Can't find preferred car mode">
                              Can't find preferred car model
                            </option>
                            <option value="Changing cab type">
                              Changing cab type
                            </option>
                            <option value="Problem in Payment">
                              Problem in Payment
                            </option>
                          </select>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={{ display: "flex" }}>
                    <button
                      className={
                        cncl.load ? "gv-btn icn-btn load-btn" : "gv-btn icn-btn"
                      }
                      style={{ backgroundColor: "lightgreen", margin: "auto" }}
                      onClick={cancelbooking}
                    >
                      <span>Submit</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            ""
          )}
          {resc.shw ? (
            <>
              <div className="form-container">
                <div
                  className="frm-clsr"
                  onClick={() => {
                    setresc(dres);
                  }}
                ></div>
                <div className={resc.load ? "cncl-con ovrly-ad" : "cncl-con"}>
                  <div className="cncl-hd">Reschedule Booking</div>
                  <table className="bkngdtl-tbl">
                    <tbody>
                      <tr>
                        <td>Booking Type</td>
                        <td>{resc.data.bookingtype}</td>
                      </tr>
                      <tr>
                        <td>
                          {resc.data.bookingtype === "Outstation"
                            ? "Outstation Type"
                            : "Rental Package"}
                        </td>
                        <td>
                          {resc.data.bookingtype === "Outstation"
                            ? `${resc.data.outstation} (${resc.data.tripinfo.distance} KM)`
                            : `(${resc.data.tripinfo.hour} Hour ||${resc.data.tripinfo.distance} KM)`}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          {resc.data.bookingtype === "Local" ? "City" : "Route"}
                        </td>
                        <td>
                          {resc.data.sourcecity.from.split(",")[0]}

                          {resc.data.bookingtype === "Local" ? (
                            ""
                          ) : dres.data.outstation === "Roundtrip" ? (
                            <>
                              <CgArrowsExchange />
                              {resc.data.endcity.to.split(",")[0]}
                            </>
                          ) : (
                            <>
                              <CgArrowRight />
                              {resc.data.endcity.to.split(",")[0]}
                            </>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Cab</td>
                        <td>
                          {resc.data.tripinfo.equivalent.isequi
                            ? `${resc.data.tripinfo.name} or equi`
                            : resc.data.tripinfo.name}
                        </td>
                      </tr>
                      <tr>
                        <td>Pickup Date</td>
                        <td>
                          {new Date(resc.data.pickupat).toLocaleDateString(
                            "en-IN"
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Pickup at</td>
                        <td>
                          {new Date(resc.data.pickupat).toLocaleTimeString(
                            "en-IN"
                          )}
                        </td>
                      </tr>
                      {resc.data.bookingtype === "Outstation" ? (
                        resc.data.outstation === "Roundtrip" ? (
                          <tr>
                            <td>Return Date</td>
                            <td>
                              {new Date(resc.data.returnat).toLocaleDateString(
                                "en-IN"
                              )}
                            </td>
                          </tr>
                        ) : (
                          ""
                        )
                      ) : (
                        ""
                      )}
                      <tr>
                        <td>Booking Amount</td>
                        <td>₹ {resc.data.payable}</td>
                      </tr>
                      <tr>
                        <td>
                          {resc.freecncl
                            ? "Free Cancellation Till"
                            : "Free Cancellation"}
                        </td>
                        <td
                          style={{
                            color: resc.freecncl ? "lightgreen" : "skyblue",
                          }}
                        >
                          {resc.freecncl ? (
                            <Countdown
                              date={
                                Date.now() +
                                (resc.data.pickupat - 86400000 - Date.now())
                              }
                            />
                          ) : (
                            <NavLink to="/" style={{ color: "skyblue" }}>
                              N/A
                            </NavLink>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table className="bkngdtl-tbl">
                    <tbody>
                      <tr>
                        <td>Pickup Date</td>
                        <td>
                          <DatePicker
                            placeholderText="Select Date"
                            required={true}
                            name="pickupdate"
                            readonlyInput={true}
                            className="rsc-inp"
                            selected={
                              resc.date ? resc.date : resc.data.pickupat
                            }
                            dateFormat="dd/MM/yyyy"
                            autoComplete="off"
                            onChange={(date) => {
                              // eslint-disable-next-line
                              gentime(date);
                              setresc({
                                ...resc,
                                date: date.getTime(),
                              });
                            }}
                            minDate={
                              new Date(
                                new Date().getFullYear(),
                                new Date().getMonth(),
                                new Date().getDate(),
                                0,
                                0,
                                0,
                                0
                              )
                            }
                            maxDate={
                              new Date(
                                new Date().getFullYear(),
                                new Date().getMonth() + 1,
                                new Date().getDate(),
                                0,
                                0,
                                0,
                                0
                              )
                            }
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Pickup time</td>
                        <td>
                          <select
                            required={true}
                            name="time"
                            className="rsc-inp"
                            id="pickupat"
                            onClick={() => {
                              gentime(
                                resc.date
                                  ? new Date(resc.date)
                                  : new Date(resc.data.pickupat)
                              );
                            }}
                            onChange={(e) => {
                              setresc({ ...resc, time: e.target.value });
                            }}
                            value={resc.time}
                          >
                            <option value="">Select Time</option>
                            {timear.map((itm, i) => {
                              return (
                                <option value={itm.value} key={i}>
                                  {itm.text}
                                </option>
                              );
                            })}
                          </select>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={{ display: "flex" }}>
                    <button
                      className="gv-btn icn-btn"
                      style={{ backgroundColor: "lightgreen", margin: "auto" }}
                      onClick={Reschedule}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            ""
          )}
          <div className="lst-btm">
            <div>
              Show{" "}
              <select
                name="entry"
                onChange={(e) => {
                  setlst({ ...lst, entry: e.target.value });
                }}
                value={lst.entry}
              >
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
                <option value="25">25</option>
              </select>{" "}
              entries
            </div>
            <div className="nvgtr">
              <button
                onMouseDown={() => {
                  handellst(false);
                }}
                onClick={bknglstr}
              >
                Previous
              </button>
              <div>{lst.pag}</div>
              <button
                onMouseDown={() => {
                  handellst(true);
                }}
                onClick={bknglstr}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      )}
      {dtl.display ? (
        <div className="form-container">
          <div
            className="form-box2"
            style={{ height: "fit-content", margin: "auto" }}
          >
            <div className="bkngdtl-hd">
              {dtl.data.bookingid}
              <div
                className="clsr-con"
                onClick={() => {
                  setdtl({ display: false, data: {} });
                }}
              >
                <FaTimes />
              </div>{" "}
            </div>
            <div className="bkng-dtlcon">
              <table className="bkngdtl-tbl">
                <tbody>
                  <tr>
                    <td>Booking Type</td>
                    <td>{dtl.data.bookingtype}</td>
                  </tr>
                  <tr>
                    <td>
                      {dtl.data.bookingtype === "Outstation"
                        ? "Outstation Type"
                        : "Rental Package"}
                    </td>
                    <td>
                      {dtl.data.bookingtype === "Outstation"
                        ? `${dtl.data.outstation} (${dtl.data.tripinfo.distance} KM)`
                        : `(${dtl.data.tripinfo.hour} Hour ||${dtl.data.tripinfo.distance} KM)`}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      {dtl.data.bookingtype === "Local" ? "City" : "Route"}
                    </td>
                    <td>
                      {dtl.data.sourcecity.from.split(",")[0]}

                      {dtl.data.bookingtype === "Local" ? (
                        ""
                      ) : dtl.data.outstation === "Roundtrip" ? (
                        <>
                          <CgArrowsExchange />
                          {dtl.data.endcity.to.split(",")[0]}
                        </>
                      ) : (
                        <>
                          <CgArrowRight />
                          {dtl.data.endcity.to.split(",")[0]}
                        </>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>Cab</td>
                    <td>
                      {dtl.data.tripinfo.equivalent.isequi
                        ? `${dtl.data.tripinfo.name} or equi`
                        : dtl.data.tripinfo.name}
                    </td>
                  </tr>
                  <tr>
                    <td>Pickup Date</td>
                    <td>
                      {new Date(dtl.data.pickupat).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                  <tr>
                    <td>Pickup at</td>
                    <td>
                      {new Date(dtl.data.pickupat).toLocaleTimeString("en-IN")}
                    </td>
                  </tr>
                  {dtl.data.bookingtype === "Outstation" ? (
                    dtl.data.outstation === "Roundtrip" ? (
                      <tr>
                        <td>Return Date</td>
                        <td>
                          {new Date(dtl.data.returnat).toLocaleDateString(
                            "en-IN"
                          )}
                        </td>
                      </tr>
                    ) : (
                      ""
                    )
                  ) : (
                    ""
                  )}
                  <tr>
                    <td>Booking Amount</td>
                    <td>₹ {dtl.data.payable}</td>
                  </tr>
                  <tr>
                    <td>Driver aid</td>
                    <td
                      style={{
                        color: dtl.data.tripinfo.othercharges.Driveraid
                          .isinclude
                          ? "#00ff00"
                          : "red",
                      }}
                    >
                      {dtl.data.tripinfo.othercharges.Driveraid.isinclude
                        ? "Included"
                        : "Extra"}
                    </td>
                  </tr>
                  <tr>
                    <td>Gst Charges</td>
                    <td
                      style={{
                        color: dtl.data.tripinfo.othercharges.GST.isinclude
                          ? "#00ff00"
                          : "red",
                      }}
                    >
                      {dtl.data.tripinfo.othercharges.GST.isinclude
                        ? "Included"
                        : "Extra"}
                    </td>
                  </tr>
                  <tr>
                    <td>Advance recived</td>
                    <td style={{ color: "#00ff00" }}> ₹ {dtl.data.advance}</td>
                  </tr>
                  <tr>
                    <td>State tax & toll</td>
                    <td
                      style={{
                        color: dtl.data.tripinfo.othercharges.Tolltaxes
                          .isinclude
                          ? "#00ff00"
                          : "red",
                      }}
                    >
                      {dtl.data.tripinfo.othercharges.Tolltaxes.isinclude
                        ? "Included"
                        : "Excluded"}
                    </td>
                  </tr>

                  <tr>
                    <td>Assigned Cab & Driver</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>Driver Name</td>
                    <td>
                      {dtl.data.pickupat - new Date().getTime() < 86400000 ? (
                        dtl.data.driverinfo ? (
                          dtl.data.driverinfo.assigned ? (
                            dtl.data.driverinfo.name
                              .charAt(0)
                              .toUpperCase()
                              .concat(
                                dtl.data.driverinfo.name.slice(1).toLowerCase()
                              )
                          ) : (
                            "Driver not assigned yet"
                          )
                        ) : (
                          <span onMouseDown={intator} onClick={bknglstr}>
                            Reload
                          </span>
                        )
                      ) : (
                        <span
                          style={{
                            color: "skyblue",
                          }}
                        >
                          <Countdown
                            date={
                              Date.now() +
                              (dtl.data.pickupat - 86400000 - Date.now())
                            }
                            onComplete={() => {
                              setdtl({ display: false, data: {} });
                            }}
                          />
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>Driver Number</td>
                    <td>
                      {dtl.data.pickupat - new Date().getTime() < 86400000 ? (
                        dtl.data.driverinfo ? (
                          dtl.data.driverinfo.assigned ? (
                            <a
                              href={"tel:+91".concat(dtl.data.driverinfo.phone)}
                              style={{
                                color: "skyblue",
                                display: "inline",
                                width: "auto",
                                padding: "0px",
                              }}
                              className="ftr-link"
                            >
                              {dtl.data.driverinfo.phone}
                            </a>
                          ) : (
                            "Driver not assigned yet"
                          )
                        ) : (
                          <span onMouseDown={intator} onClick={bknglstr}>
                            Reload
                          </span>
                        )
                      ) : (
                        <span
                          style={{
                            color: "skyblue",
                          }}
                        >
                          <Countdown
                            date={
                              Date.now() +
                              (dtl.data.pickupat - 86400000 - Date.now())
                            }
                          />
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>Cab Model</td>
                    <td>
                      {dtl.data.pickupat - new Date().getTime() < 86400000 ? (
                        dtl.data.cabinfo ? (
                          dtl.data.cabinfo.assigned ? (
                            dtl.data.cabinfo.name
                          ) : (
                            "Driver not assigned yet"
                          )
                        ) : (
                          <span onMouseDown={intator} onClick={bknglstr}>
                            Reload
                          </span>
                        )
                      ) : (
                        <span
                          style={{
                            color: "skyblue",
                          }}
                        >
                          <Countdown
                            date={
                              Date.now() +
                              (dtl.data.pickupat - 86400000 - Date.now())
                            }
                          />
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>Driver Number</td>
                    <td>
                      {dtl.data.pickupat - new Date().getTime() < 86400000 ? (
                        dtl.data.cabinfo ? (
                          dtl.data.cabinfo.assigned ? (
                            dtl.data.cabinfo.carNumber
                          ) : (
                            "Driver not assigned yet"
                          )
                        ) : (
                          <span onMouseDown={intator} onClick={bknglstr}>
                            Reload
                          </span>
                        )
                      ) : (
                        <span
                          style={{
                            color: "skyblue",
                          }}
                        >
                          <Countdown
                            date={
                              Date.now() +
                              (dtl.data.pickupat - 86400000 - Date.now())
                            }
                          />
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
              {dtl.data.pickupat - new Date().getTime() > 86400000 ? (
                <div style={{ display: "flex" }}>
                  <button
                    className="resld-btn"
                    onClick={() => {
                      setresc({ shw: true, data: dtl.data });
                      setdtl({ display: false, data: {} });
                    }}
                  >
                    Reschedule
                  </button>
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      ) : (
        ""
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
export default Ongoing;
