import React, { useState, useEffect } from "react";
import "./bookingform.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ImLocation2 } from "react-icons/im";
import { useHistory } from "react-router-dom";
import { matchSorter } from "match-sorter";

const Bookingform = () => {
  const history = useHistory();
  // time
  let timearray = [];
  const [timear, settimear] = useState(timearray);
  const gentime = (selected) => {
    let sd;
    timearray = [];
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
        ? todaydate.getHours() + 4
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
  //time

  //search api
  const [suggest, setsuggest] = useState([]);
  const [showsug, setshowsug] = useState(false);
  const [catalon, setcatalon] = useState([]);
  const getcatalon = async () => {
    // try {
    let catalan = JSON.parse(localStorage.getItem("catalan"));
    if (!catalan) {
      const res = await fetch("/api/public/catalon", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();
      localStorage.setItem("catalan", JSON.stringify(data));
      catalan = data;
    }
    setcatalon(catalan);
    setsuggest(catalan.slice(0, 20));
    setendcity(catalan.slice(0,20));
    // } catch (err) {}
  };
  useEffect(() => {
    getcatalon();
    // eslint-disable-next-line
  }, []);

  const autoComplete = async (e) => {
    let cts = catalon;
    let key = e.target.value;
    if (key <= 0) {
      setsuggest(catalon.slice(0, 20));
    } else {
      let ct = matchSorter(cts, key, {
        keys: ["cityname"],
        threshold: matchSorter.rankings.WORD_STARTS_WITH,
      });
      setsuggest(ct);
    }
    if (!showsug) {
      setshowsug(true);
    }
  };
  //toautocomplete
  const [endsug, setendsug] = useState(false);
  const [endcity, setendcity] = useState([]);
  const endsuggest = async (e) => {
    let cts = catalon;
    let key = e.target.value;
    if (key <= 0) {
      setendcity(catalon.slice(0, 20));
    } else {
      let ct = matchSorter(cts, key, {
        keys: ["cityname"],
        threshold: matchSorter.rankings.WORD_STARTS_WITH,
      });
      setendcity(ct);
    }
    if (!endsug) {
      setendsug(true);
    }
  };
  //search api
  //o data
  let name, value;
  const [odata, setodata] = useState({
    bookingtype: "outstation",
    outstationtype: "Oneway",
    from: "",
    fromcode: "",
    to: "",
    tocode: "",
    pickupdate: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      0,
      0,
      0,
      0
    ),
    pickupat: "",
    returnat: "",
  });
  const handelodata = (e) => {
    name = e.target.name;
    value = e.target.value;
    setodata({ ...odata, [name]: value });
  };

  const postodata = async (e) => {
    e.preventDefault();
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
    } = odata;
    const bookingtypes = ["outstation", "local", "tour"];
    if (!bookingtypes.some((e) => e === bookingtype)) {
      window.alert("Invalid booking type: " + bookingtype);
      return;
    }
    const validateres = validate();
    if (!validateres) {
      return;
    }
    if (bookingtype === "outstation") {
      if (outstationtype === "Oneway") {
        const service = {
          bookingtype,
          outstationtype,
          from,
          fromcode,
          to,
          tocode,
          pickupdate: pickupdate.getTime(),
          pickupat: pickupat * 1,
        };
        const stringed = JSON.stringify(service);
        localStorage.setItem("service-data", stringed);
        sessionStorage.setItem("service-data", stringed);
        history.push("/booking/selectcar");
      } else if (outstationtype === "Roundtrip") {
        const service = {
          bookingtype,
          outstationtype,
          from,
          fromcode,
          to,
          tocode,
          pickupdate: pickupdate.getTime(),
          pickupat: pickupat * 1,
          returnat: returnat.getTime(),
        };
        const stringed = JSON.stringify(service);
        localStorage.setItem("service-data", stringed);
        sessionStorage.setItem("service-data", stringed);
        history.push("/booking/selectcar");
      } else {
        window.alert("please select valid outstation type");
      }
    } else if (bookingtype === "local") {
      const service = {
        bookingtype,
        from,
        fromcode,
        pickupdate: pickupdate.getTime(),
        pickupat: pickupat * 1,
      };
      const stringed = JSON.stringify(service);
      localStorage.setItem("service-data", stringed);
      sessionStorage.setItem("service-data", stringed);
      history.push("/booking/selectcar");
    } else if (bookingtype === "tour") {
      const service = {
        bookingtype,
        from,
        fromcode,
      };
      const stringed = JSON.stringify(service);
      localStorage.setItem("tour-data", stringed);
      sessionStorage.setItem("tour-data", stringed);
      history.push("/tourpackages/list/");
    }
  };
  // validate o data fields
  const ert = {
    fromer: { display: false, message: "" },
    toer: { display: false, message: "" },
    pickupdateer: { display: false, message: "" },
    pickupater: { display: false, message: "" },
    returnater: { display: false, message: "" },
  };
  const [error, seterror] = useState(ert);
  const validate = () => {
    let iserror = false;
    const errors = {
      fromer: { display: false, message: "" },
      toer: { display: false, message: "" },
      pickupdateer: { display: false, message: "" },
      pickupater: { display: false, message: "" },
      returnater: { display: false, message: "" },
    };
    if (
      !catalon.some(
        (e) => e.cityname === odata.from && e.citycode === odata.fromcode
      )
    ) {
      errors.fromer = { display: true, message: "Select start city from list" };
      iserror = true;
    } else {
      errors.fromer = { display: false, message: "" };
    }
    if (odata.bookingtype === "local" || odata.bookingtype === "outstation") {
      if (odata.pickupdate instanceof Date) {
        const date = odata.pickupdate;
        const today = new Date();
        const compare = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          0,
          0,
          0,
          0
        );
        if (!date >= compare) {
          errors.pickupdateer = {
            display: true,
            message: "please select a valid date",
          };
          iserror = true;
        } else {
          errors.pickupdateer = {
            display: false,
            message: "",
          };
        }
      } else {
        errors.pickupdateer = {
          display: true,
          message: "please select a valid date",
        };
        iserror = true;
      }
      // eslint-disable-next-line
      if (!timear.some((e) => e.value == odata.pickupat)) {
        iserror = true;
        errors.pickupater = {
          display: true,
          message: "please select the time",
        };
      } else {
        errors.pickupater = { display: false, message: "" };
      }
    }
    if (odata.bookingtype === "outstation") {
      if (
        !catalon.some(
          (e) => e.cityname === odata.to && e.citycode === odata.tocode
        )
      ) {
        errors.toer = { display: true, message: "Select end city from list " };
        iserror = true;
      } else {
        errors.toer = { display: false, message: "" };
        if (odata.from === odata.to || odata.fromcode === odata.tocode) {
          // eslint-disable-next-line
          setodata({ ...odata, ["to"]: "", ["tocode"]: "" });
          errors.toer = {
            display: true,
            message: "Start and end city cant be same",
          };
          iserror = true;
        }
      }
      if (odata.returnat instanceof Date) {
        if (!odata.returnat >= odata.pickupdate) {
          errors.returnater = {
            display: true,
            message: "please select valid date",
          };
          iserror = true;
        } else {
          errors.returnater = {
            display: false,
            message: "",
          };
        }
      }
    }
    seterror(errors);
    return !iserror;
  };
  const disableer = (todisble) => {
    const errlist = [
      "fromer",
      "toer",
      "pickupdateer",
      "pickupater",
      "returnater",
    ];
    if (todisble === "all") {
      seterror(ert);
    } else if (errlist.some((e) => e === todisble)) {
      seterror({ ...error, [todisble]: { display: false, message: "" } });
    }
  };
  //validation end
  // formshowstate
  const [outstation, setoutstation] = useState(true);
  const [local, setlocal] = useState(false);
  const [tour, settour] = useState(false);
  useEffect(() => {
    const closeDropdown = (e) => {
      if (
        e.srcElement.nodeName !== "INPUT" &&
        !["from", "to", "city", "tourcity"].some(
          (itm) => itm === e.srcElement.id
        )
      ) {
        setshowsug(false);
        setendsug(false);
      } else if (
        e.srcElement.id === "from" ||
        e.srcElement.id === "city" ||
        e.srcElement.id === "tourcity"
      ) {
        setendsug(false);
        setshowsug(true);
        disableer("fromer");
      } else if (e.srcElement.id === "to") {
        setendsug(true);
        disableer("toer");
        setshowsug(false);
      }
    };
    document.body.addEventListener("click", closeDropdown);
    return () => document.body.removeEventListener("click", closeDropdown);
  }, []);

  return (
    <>
      <section className="booking-form-section">
        <div className="booking-nav">
          <div
            className={
              outstation ? "booking-nav-itm form-selected" : "booking-nav-itm"
            }
            onClick={() => {
              setoutstation(true);
              setlocal(false);
              settour(false);
              setshowsug(false);
              disableer("all");
              //eslint-disable-next-line
              setodata({ ...odata, ["bookingtype"]: "outstation" });
            }}
          >
            <span className="booking-nav-text">Outstation</span>
          </div>
          <div
            className={
              local ? "booking-nav-itm form-selected" : "booking-nav-itm"
            }
            onClick={() => {
              setoutstation(false);
              setlocal(true);
              settour(false);
              setshowsug(false);
              disableer("all");
              //eslint-disable-next-line
              setodata({ ...odata, ["bookingtype"]: "local" });
            }}
          >
            <span className="booking-nav-text">Local</span>
          </div>
          <div
            className={
              tour ? "booking-nav-itm form-selected" : "booking-nav-itm"
            }
            onClick={() => {
              setoutstation(false);
              setlocal(false);
              settour(true);
              setshowsug(false);
              disableer("all");
              // eslint-disable-next-line
              setodata({ ...odata, ["bookingtype"]: "tour" });
            }}
          >
            <span className="booking-nav-text">Tour</span>
          </div>
        </div>
        <div className="booking-form-container">
          {outstation ? (
            <div className="booking-form">
              <form id="outstation">
                <div className="form-row">
                  <div className="outstation-nav-itm">
                    <input
                      className="radio"
                      type="radio"
                      name="outstationtype"
                      id="Oneway"
                      value="Oneway"
                      onClick={handelodata}
                    />
                    <div
                      className={
                        odata.outstationtype === "Oneway"
                          ? "radio-circle radio-active"
                          : "radio-circle"
                      }
                    ></div>
                    <label htmlFor="Oneway" className="radio-label">
                      Oneway
                    </label>
                  </div>
                  <div className="outstation-nav-itm">
                    <input
                      className="radio"
                      type="radio"
                      name="outstationtype"
                      id="Roundtrip"
                      value="Roundtrip"
                      onClick={handelodata}
                    />
                    <div
                      className={
                        odata.outstationtype === "Roundtrip"
                          ? "radio-circle radio-active"
                          : "radio-circle"
                      }
                    ></div>
                    <label htmlFor="Roundtrip" className="radio-label">
                      Roundtrip
                    </label>
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="from" className="bkng-lbl">
                    FROM
                  </label>
                  <div className="ia-wrapper">
                    <input
                      required={true}
                      type="text"
                      id="from"
                      name="from"
                      autoComplete="off"
                      value={odata.from}
                      onChange={handelodata}
                      onKeyUp={autoComplete}
                      placeholder="Enter City..."
                      // onFocus={() => {
                      //   setshowsug(true);
                      //   disableer("fromer");
                      // }}
                      // onBlur={() => {
                      //   setTimeout(() => {
                      //     setshowsug(false);
                      //   }, 250);
                      // }}
                    />
                    {showsug ? (
                      <div className="autocomplete-wrapper">
                        {suggest.map((itm, i) => {
                          const citydetails = itm.cityname.split(",");
                          return (
                            <div
                              key={i}
                              className="suggestion"
                              onClick={() => {
                                setodata({
                                  ...odata,
                                  // eslint-disable-next-line
                                  ["from"]: itm.cityname,
                                  // eslint-disable-next-line
                                  ["fromcode"]: itm.citycode,
                                });
                                setshowsug(false);
                              }}
                            >
                              <div className="location-icon">
                                <ImLocation2 />
                              </div>
                              <div className="location-text">
                                <div className="location-city">
                                  {citydetails[0]}
                                </div>
                                <div className="location-state">
                                  {citydetails[1]}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      ""
                    )}
                    {error.fromer.display ? (
                      <p className="danger">{error.fromer.message}</p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="to" className="bkng-lbl">
                    TO
                  </label>
                  <div className="ia-wrapper">
                    <input
                      required={true}
                      type="text"
                      id="to"
                      name="to"
                      value={odata.to}
                      onChange={handelodata}
                      onKeyUp={endsuggest}
                      autoComplete="off"
                      placeholder="Enter City..."
                      // onFocus={() => {
                      //   setendsug(true);
                      //   disableer("toer");
                      // }}
                      // onBlur={() => {
                      //   setTimeout(() => {
                      //     setendsug(false);
                      //   }, 250);
                      // }}
                    />
                    {endsug ? (
                      <div className="autocomplete-wrapper">
                        {endcity.map((itm, i) => {
                          const citydetails = itm.cityname.split(",");
                          return (
                            <div
                              key={i}
                              className="suggestion"
                              onClick={() => {
                                setodata({
                                  ...odata,
                                  // eslint-disable-next-line
                                  ["to"]: itm.cityname,
                                  //eslint-disable-next-line
                                  ["tocode"]: itm.citycode,
                                });
                                setendsug(false);
                              }}
                            >
                              <div className="location-icon">
                                <ImLocation2 />
                              </div>
                              <div className="location-text">
                                <div className="location-city">
                                  {citydetails[0]}
                                </div>
                                <div className="location-state">
                                  {citydetails[1]}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      ""
                    )}
                    {error.toer.display ? (
                      <p className="danger">{error.toer.message}</p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-cell">
                    <label htmlFor="pickupat">Pickup Date</label>

                    <DatePicker
                      placeholder="Select date"
                      required={true}
                      name="pickupdate"
                      readonlyInput={true}
                      className="datepicker"
                      selected={odata.pickupdate}
                      autoComplete="off"
                      onChange={(date) => {
                        // eslint-disable-next-line
                        setodata({ ...odata, ["pickupdate"]: date });
                        gentime(date);
                      }}
                      onFocus={() => {
                        disableer("pickupdateer");
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
                    {error.pickupdateer.display ? (
                      <p className="danger-p">{error.pickupdateer.message}</p>
                    ) : (
                      ""
                    )}
                  </div>
                  <div className="form-cell">
                    <label htmlFor="pickupat">Pickup Time</label>
                    <select
                      required={true}
                      name="pickupat"
                      className="timepicker"
                      id="pickupat"
                      onClick={() => gentime(odata.pickupdate)}
                      onFocus={() => {
                        disableer("pickupater");
                      }}
                      value={odata.pickupat}
                      onChange={handelodata}
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
                    {error.pickupater.display ? (
                      <p className="danger-p">{error.pickupater.message}</p>
                    ) : (
                      ""
                    )}
                  </div>
                  {odata.outstationtype === "Roundtrip" ? (
                    <div className="form-cell">
                      <label htmlFor="returnat">Return at</label>
                      <DatePicker
                        required={true}
                        className="datepicker"
                        name="returnat"
                        placeholderText="mm/dd/yyyy"
                        selected={
                          odata.pickupdate > odata.returnat
                            ? odata.outstationtype === "Roundtrip"
                              ? setodata({
                                  ...odata,
                                  // eslint-disable-next-line
                                  ["returnat"]: odata.pickupdate,
                                })
                              : ""
                            : odata.returnat
                        }
                        minDate={odata.pickupdate}
                        onChange={(date) => {
                          // eslint-disable-next-line
                          setodata({ ...odata, ["returnat"]: date });
                        }}
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
                    </div>
                  ) : (
                    ""
                  )}
                </div>
                <div className="form-row">
                  <input
                    type="submit"
                    id="form-btn"
                    value="Select car"
                    onClick={postodata}
                  />
                </div>
              </form>
            </div>
          ) : (
            ""
          )}
          {local ? (
            <div className="booking-form">
              <form id="local">
                <div className="form-row">
                  <label htmlFor="city" className="bkng-lbl">
                    City
                  </label>
                  <div className="ia-wrapper">
                    <input
                      type="text"
                      name="from"
                      id="city"
                      value={odata.from}
                      onChange={handelodata}
                      onKeyUp={autoComplete}
                      placeholder="Enter city..."
                      autoComplete="off"
                      // onFocus={() => {
                      //   setshowsug(true);
                      //   disableer("fromer");
                      // }}
                      // onBlur={() => {
                      //   setTimeout(() => {
                      //     setshowsug(false);
                      //   }, 250);
                      // }}
                    />
                    {showsug ? (
                      <div className="autocomplete-wrapper">
                        {suggest.map((itm, i) => {
                          const citydetails = itm.cityname.split(",");
                          return (
                            <div
                              key={i}
                              className="suggestion"
                              onClick={() =>
                                setodata({
                                  ...odata,
                                  // eslint-disable-next-line
                                  ["from"]: itm.cityname,
                                  //eslint-disable-next-line
                                  ["fromcode"]: itm.citycode,
                                })
                              }
                            >
                              <div className="location-icon">
                                <ImLocation2 />
                              </div>
                              <div className="location-text">
                                <div className="location-city">
                                  {citydetails[0]}
                                </div>
                                <div className="location-state">
                                  {citydetails[1]}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      ""
                    )}
                    {error.fromer.display ? (
                      <p className="danger">{error.fromer.message}</p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-cell">
                    <label htmlFor="Localdate">Pickup Date</label>
                    <DatePicker
                      id="Localdate"
                      name="pickupdate"
                      className="datepicker"
                      selected={odata.pickupdate}
                      onChange={(date) => {
                        // eslint-disable-next-line
                        setodata({ ...odata, ["pickupdate"]: date });
                        gentime(date);
                      }}
                      onFocus={() => {
                        disableer("pickupdateer");
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
                    {error.pickupdateer.display ? (
                      <p className="danger-p">{error.pickupdateer.message}</p>
                    ) : (
                      ""
                    )}
                  </div>
                  <div className="form-cell">
                    <label htmlFor="Starttime">Pickup Time</label>
                    <select
                      name="pickupat"
                      className="timepicker"
                      id="pickupat"
                      onClick={() => gentime(odata.pickupdate)}
                      onFocus={() => {
                        disableer("pickupater");
                      }}
                      value={odata.pickupat}
                      onChange={handelodata}
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
                    {error.pickupater.display ? (
                      <p className="danger-p">{error.pickupater.message}</p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <input
                    type="submit"
                    id="form-btn"
                    value="Select car"
                    onClick={postodata}
                  />
                </div>
              </form>
            </div>
          ) : (
            ""
          )}
          {tour ? (
            <div className="booking-form">
              <form id="tour">
                <div className="form-row">
                  <label htmlFor="tourcity" className="bkng-lbl">
                    City
                  </label>
                  <div className="ia-wrapper">
                    <input
                      type="text"
                      name="from"
                      id="tourcity"
                      value={odata.from}
                      onChange={handelodata}
                      onKeyUp={autoComplete}
                      placeholder="Enter City..."
                      // onFocus={() => {
                      //   setshowsug(true);
                      //   disableer("fromer");
                      // }}
                      // onBlur={() => {
                      //   setTimeout(() => {
                      //     setshowsug(false);
                      //   }, 250);
                      // }}
                      autoComplete="off"
                    />
                    {showsug ? (
                      <div className="autocomplete-wrapper">
                        {suggest.map((itm, i) => {
                          const citydetails = itm.cityname.split(",");
                          return (
                            <div
                              key={i}
                              className="suggestion"
                              onClick={() => {
                                // eslint-disable-next-line
                                setodata({
                                  ...odata,
                                  // eslint-disable-next-line
                                  ["from"]: itm.cityname,
                                  //eslint-disable-next-line
                                  ["fromcode"]: itm.citycode,
                                });
                              }}
                            >
                              <div className="location-icon">
                                <ImLocation2 />
                              </div>
                              <div className="location-text">
                                <div className="location-city">
                                  {citydetails[0]}
                                </div>
                                <div className="location-state">
                                  {citydetails[1]}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      ""
                    )}
                    {error.fromer.display ? (
                      <p className="danger">{error.fromer.message}</p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                {/* <div className="form-row">
                  <label htmlFor="pickupat">Start date</label>
                  <DatePicker
                    className="tour-date"
                    autoComplete="off"
                    name="pickupdate"
                    selected={odata.pickupdate}
                    onChange={(date) => {
                      // eslint-disable-next-line
                      setodata({ ...odata, ["pickupdate"]: date });
                      gentime(date);
                    }}
                    onFocus={() => {
                      disableer("pickupdateer");
                    }}
                    minDate={new Date()}
                    maxDate={
                      new Date(new Date().setMonth(new Date().getMonth() + 4))
                    }
                  />
                </div>
                {error.pickupdateer.display ? (
                  <p className="danger">{error.pickupdateer.message}</p>
                ) : (
                  ""
                )} */}
                <div className="form-row">
                  <input
                    type="submit"
                    id="form-btn"
                    value="Search tour"
                    onClick={postodata}
                  />
                </div>
              </form>
            </div>
          ) : (
            ""
          )}
        </div>
      </section>
    </>
  );
};
export default Bookingform;
