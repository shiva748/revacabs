import React, { useEffect, useState } from "react";
import Loading from "../templates/loading/Loading";
import { FaTimes, FaTimesCircle, FaEye } from "react-icons/fa";
import { CgArrowRight, CgArrowsExchange } from "react-icons/cg";
import { FcApproval } from "react-icons/fc";
import { ImLocation2, ImSearch } from "react-icons/im";
import { AiOutlineClear } from "react-icons/ai";
import "tippy.js/dist/tippy.css";
import { NavLink, useHistory } from "react-router-dom";
import { Helmet } from "react-helmet";
const Cancelled = () => {
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
        return setautoco({ ...autoco, from: [] });
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
        console.log("hello");
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
    const res = await fetch("/api/booking/cancelled", {
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
    firstload()
    // eslint-disable-next-line
  }, []);

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
          } - Cancelled Bookings`}
        </title>
        <meta
          name="description"
          content={`${
            sessionStorage.getItem.userdata
              ? sessionStorage.getItem.userdata.name
              : ""
          } Cancelled Bookings`}
        />
        <link rel="canonical" href="http://revacabs.com/" />
        <meta name="robots" content="noindex,nofollow" />
        <meta http-equiv="Content-Security-Policy" content="script-src https://checkout.razorpay.com/v1/checkout.js 'self';"/>
      </Helmet>
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
                {filter.type === "hourlyrental" ? (
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
                    You don't have any Cancelled bookings with us. would you
                    like to book one ?
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
                                  : "Houtly Rental"}
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
                              <div className="crd-hd">Cancel fee</div>
                              <div className="bold-txt crd-txtflx">
                              ₹ {itm.billing.cancel.cancelfee}
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
                        </div>
                      </div>
                    </>
                  );
                })
              )}
            </div>
          </div>

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
                    <td>Advance</td>
                    <td>₹ {dtl.data.advance}</td>
                  </tr>
                  <tr>
                    <td>Cancelled On</td>
                    <td>
                      {new Date(
                        dtl.data.billing.cancel.cancelon
                      ).toLocaleString("en-IN")}
                    </td>
                  </tr>
                  <tr>
                    <td>Cancellation fee</td>
                    <td>₹ {dtl.data.billing.cancel.cancelfee}</td>
                  </tr>
                  <tr>
                    <td>Refund</td>
                    <td>₹ {dtl.data.billing.cancel.refund}</td>
                  </tr>
                  <tr>
                    <td>Refund status</td>
                    <td>
                      {dtl.data.billing.cancel.refunded
                        ? "Processed"
                        : "Processing"}
                    </td>
                  </tr>
                  {dtl.data.billing.cancel.refunded &&
                  dtl.data.billing.cancel.refundedon ? (
                    <tr>
                      <td>Refunded on</td>
                      <td>
                        {new Date(
                          dtl.data.billing.cancel.refundedon
                        ).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ) : (
                    ""
                  )}
                </tbody>
              </table>
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
export default Cancelled;
