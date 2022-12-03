import React, { useState, useEffect } from "react";
import { NavLink, useHistory } from "react-router-dom";
import { ImLocation2, ImSearch } from "react-icons/im";
import { FaTimesCircle, FaTimes } from "react-icons/fa";
import { FcApproval } from "react-icons/fc";
import { AiOutlineClear } from "react-icons/ai";
import { GoLocation } from "react-icons/go";
import "./css/package.css";
import Loading from "../templates/loading/Loading";
import Enquiry from "../templates/tour/Enquiry";
import { Helmet } from "react-helmet";
const Tourpackage = () => {
  const history = useHistory();
  const [alertd, setalertd] = useState({
    display: false,
    title: "",
    message: "",
    type: "",
  });
  const [hgt, sethgt] = useState();
  const resizer = () => {
    const height = window.innerHeight - 125;
    sethgt(height);
  };
  window.addEventListener("resize", resizer);

  const [packages, setpackages] = useState([]);
  let [fr, setfr] = useState(true);
  const [filter, setfilter] = useState({ cts: "", days: "", actv: "" });
  const [Enqu, setEnqu] = useState({ display: false, data: {} });

  const listpackage = async () => {
    let srchdt = {};
    if (fr) {
      setfr(false);
      let ssndt = JSON.parse(sessionStorage.getItem("tour-data"));
      const urld = window.location.pathname.split("/")[3];
      if (urld) {
        srchdt = {
          actn: "fnd",
          cts: urld.replaceAll("-", ", ").replaceAll("_", " "),
        };
      } else if (!ssndt) {
        srchdt = { actn: "fnd" };
      } else if (ssndt.from || typeof ssndt === "string") {
        srchdt = { cts: ssndt.from, actn: "fnd" };
      }
    } else {
      let { cts, days } = filter;
      if (cts) {
        if (typeof cts !== "string") {
          return setalertd({
            display: true,
            type: "danger",
            message: "Invalid city input",
            title: "",
          });
        }
        if (!autoco.some((e) => e.cityname === cts)) {
          return setalertd({
            display: true,
            title: "",
            message: "Please select a city from list",
            type: "danger",
          });
        }
        srchdt = { cts };
      }
      if (days) {
        if (typeof days !== "string" || isNaN(days) || days * 1 > 10) {
          return setalertd({
            display: true,
            title: "",
            message: "Invalid Days Selected",
            type: "danger",
          });
        }
        srchdt = { ...srchdt, days };
      }
      srchdt = { ...srchdt, actn: "fnd" };
    }
    setloading(true);
    const res = await fetch("/api/tourpackages", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(srchdt),
    });
    const data = await res.json();
    if (res.status === 200) {
      if (srchdt.cts) {
        history.push(
          "/tourpackages/list/".concat(
            srchdt.cts.replaceAll(", ", "-").replaceAll(" ", "_")
          )
        );
        setfilter({
          ...filter,
          actv: srchdt.cts.split(",")[0],
          cts: srchdt.cts,
        });
        setautoco({
          display: false,
          sugge: [{ cityname: srchdt.cts }],
        });
      } else {
        history.push("/tourpackages/list/");
      }
      setpackages(data);
    } else {
      setpackages([]);
    }
    setloading(false);
  };

  

  // === === === === changes === === === ===
  const [def, setdef] = useState([]);

  //search api
  const [dis, setdis] = useState(false);
  const [autoco, setautoco] = useState([]);
  const firstload = async ()=>{
    const res = await fetch("/api/public/autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ frst:true}),
        });
        const data = await res.json();
        setautoco(data)
        setdef(data)
  }
  useEffect(() => {
    resizer();
    listpackage();
    firstload()
    // eslint-disable-next-line
  }, []);
  const autocomplete = async (e) => {
    if (e.target.value <= 0) {
      setautoco(def);
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
    if (res.status !== 200) {
      return setautoco([]);
    } else {
      return setautoco(data);
    }
  };
  const [loading, setloading] = useState(true);
  useEffect(() => {
    const closeDropdown = (e) => {
      if (
        e.path[0].tagName !== "INPUT" &&
        !["tourcity"].some((itm) => itm === e.path[0].id)
      ) {
        setdis(false)
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
          Book {filter.actv ? `${filter.actv} ` : ""}Holiday Packages:{" "}
          {filter.actv ? `${filter.actv} ` : ""}Tour Package,{" "}
          {filter.actv ? `${filter.actv} ` : ""}Vacation Now With REVACABS
        </title>
        <meta
          name="description"
          content={`Search ${
            filter.actv ? `${filter.actv} ` : ""
          } holiday packages at REVACABS and enjoy a memorable tour. Search the list of best ${
            filter.actv ? `${filter.actv} ` : ""
          } holiday packages and go for exciting ${
            filter.actv ? `${filter.actv} ` : ""
          } trip.`}
        />
        <link rel="canonical" href="http://revacabs.com/" />
      </Helmet> */}
      <div
        className="tour-con"
        style={{
          height: `${hgt}px`,
          marginTop: "0px",
        }}
      >
        {loading ? (
          <Loading />
        ) : (
          <div className="tour-result">
            <div className="conw-rg">
              <div className="fltr-con">
                <div className="sub-fltr">
                  <div className="sub-fltrprtn">
                    <div className="input-wrapper">
                      <input
                        type="text"
                        name="City"
                        id="tourcity"
                        className="fltr-input"
                        placeholder="City"
                        value={filter.cts}
                        onChange={(e) => {
                          setfilter({ ...filter, cts: e.target.value });
                        }}
                        autoComplete="off"
                        onFocus={() => {
                          // eslint-disable-next-line
                          setdis(true)
                        }}
                        onKeyUp={autocomplete}
                      />
                      {dis? (
                        <div className="auto-con">
                          <div className="auto-wrapper">
                            {autoco.map((itm, i) => {
                              return (
                                <div
                                  key={i}
                                  className="suggestion"
                                  onClick={() => {
                                    setfilter({
                                      ...filter,
                                      cts: itm.cityname,
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
                            {autoco.length <= 0 ? "No city Found" : ""}
                          </div>
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                  <div className="sub-fltrprtn">
                    <div className="input-wrapper">
                      <select
                        name="type"
                        className="fltr-input"
                        onChange={(e) => {
                          setfilter({ ...filter, days: e.target.value });
                        }}
                        value={filter.days}
                      >
                        <option value="">Select Days</option>
                        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(
                          (itm) => (
                            <option value={itm}>{itm}</option>
                          )
                        )}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="sub-fltr">
                  <div className="sub-fltrprtn">
                    <button
                      className="inpt-btn bg-rd"
                      onClick={() => setfilter({ cts: "", days: "" })}
                    >
                      <span>
                        <AiOutlineClear /> Filter
                      </span>
                    </button>
                    <button
                      type="submit"
                      className="inpt-btn bg-gr"
                      onClick={listpackage}
                    >
                      <span>
                        <ImSearch /> Search
                      </span>
                    </button>
                  </div>
                  <div className="sub-fltrprtn">
                    <button
                      className="inpt-btn bg-bl"
                      style={{ width: "100%" }}
                      onClick={() => {
                        setEnqu({
                          ...Enqu,
                          display: true,
                          data: { id: "other" },
                        });
                        document.body.classList.add("no-scrol");
                      }}
                    >
                      <span>Enquiry Now</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="trcrd-con">
              {packages.length === 0 ? (
                <div className="nrc-con"><img src="/icons/nrec.png" alt=""/><p className="nrc-txt">No Tour package found</p></div>
              ) : (
                packages.map((itm) => {
                  return (
                    <div className="tr-crd marg" style={{ width: "360px" }}>
                      <div className="tr-imgcon">
                        <img src={`/tour/${itm.id}/${itm.bnrimg}`} alt="" />
                        <p className="tr-drtn">
                          <span>Duration</span>{" "}
                          {itm.nights < 10 ? `0${itm.nights}` : itm.nights}{" "}
                          Night / {itm.days < 10 ? `0${itm.days}` : itm.days}{" "}
                          Days
                        </p>
                      </div>
                      <div className="tr-dtlcon">
                        <p>
                          <GoLocation />{" "}
                          {itm.citys.map((dt, i) =>
                            i + 1 === itm.citys.length
                              ? dt.cityname.split(",")[0]
                              : `${dt.cityname.split(",")[0]} / `
                          )}
                        </p>
                        <h4>{itm.name}</h4>
                        <span className="rtng">⭐⭐⭐⭐⭐</span>
                        <div>
                          <NavLink
                            to={"/tourpackages/details/".concat(itm.url)}
                          >
                            View Details
                          </NavLink>
                          <button
                            className="inqu-btn"
                            onClick={() => {
                              setEnqu({
                                ...Enqu,
                                display: true,
                                data: { id: itm.id },
                              });
                              document.body.classList.add("no-scrol");
                            }}
                          >
                            Enquiry Now
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
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
      {Enqu.display ? <Enquiry Enqu={Enqu} setEnqu={setEnqu} /> : ""}
    </>
  );
};

export default Tourpackage;
