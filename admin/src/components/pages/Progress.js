import React, { useState, useEffect } from "react";
import { ImLocation2, ImSearch } from "react-icons/im";
import { AiOutlineClear } from "react-icons/ai";
import Dataload from "../templates/Loading/Dataload";
import { CgArrowsExchange, CgArrowRight } from "react-icons/cg";
import { FaEye } from "react-icons/fa";
import "./css/Progress.css";
import Prcsdtl from "../templates/bookingdtl/Prcsdtl";
import { Helmet } from "react-helmet";
const Progress = () => {
  const [lst, setlst] = useState({ entry: "10", pag: 1, data: [] });
  const handellst = (type) => {
    let pag = lst.pag;
    if (
      lst.flt.type !== filter.type ||
      lst.flt.bkngid !== filter.bkngid ||
      lst.flt.from !== filter.from ||
      lst.prv.fromcode !== lst.fromcode
    ) {
      console.log("reset");
      return setlst({ ...lst, pag: 1, prv: {} });
    }
    if (type) {
      if (prgrs.length < lst.prv.entry * 1) {
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

  const intator = () => {
    if (lst.flt) {
      const { from, fromcode, type, bkngid } = lst.flt;
      if (
        from !== filter.from ||
        fromcode !== filter.fromcode ||
        type !== filter.type ||
        bkngid !== filter.bkngid ||
        lst.prv.entry !== lst.entry
      ) {
        return setlst({ ...lst, pag: 1, prv: {} });
      }
    }
    setlst({ ...lst, prv: {} });
  };
  const [dtl, setdtl] = useState({ display: false, itm: {} });
  const df = {
    type: "",
    bkngid: "",
    from: "",
    fromCode: "",
  };
  const [filter, setfilter] = useState(df);
  const [autoco, setautoco] = useState({ display: false, sugge: [] });
  const autocomplete = async (e) => {
    const key = e.target.value;
    if (key.length <= 0) {
      return;
    }
    const res = await fetch("/api/public/autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
      }),
    });
    let data = await res.json();
    if (res.status === 200) {
      // eslint-disable-next-line
      setautoco({ ...autoco, ["sugge"]: data });
    } else {
      // eslint-disable-next-line
      setautoco({ ...autoco, ["sugge"]: [] });
    }
  };
  const progress = async () => {
    const { type, bkngid, from, fromCode } = filter;
    let { entry, pag } = lst;
    if (!entry || isNaN(entry) || typeof pag !== "number") {
      return alert("Invalid request");
    }
    if (lst.prv) {
      if (entry === lst.prv.entry && pag === lst.prv.pag) {
        return;
      }
    }
    const aa = ["Oneway", "Roundtrip", "Local", ""];
    if (!aa.some((itm) => itm === type)) {
      return alert("please select a valid type");
    }
    if (typeof from !== "string" || typeof fromCode !== "string") {
      return alert("Invalid city selected");
    }
    if (typeof bkngid !== "string") {
      return alert("Invalid booking id");
    }
    setprcs(true);
    const res = await fetch("/oceannodes/booking/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        entry: entry,
        pag: pag.toString(),
        type,
        from,
        fromCode,
        bkngid,
        prcstyp: "lst",
      }),
    });
    const data = await res.json();
    if (res.status !== 200) {
      setprcs(false);
      return alert("failed to load the inquiry");
    } else {
      setlst({
        ...lst,
        prv: { pag, entry },
        flt: { type, bkngid, from, fromCode },
      });
      setprgrs(data);
      setprcs(false);
    }
  };
  useEffect(() => {
    progress();
    // eslint-disable-next-line
  }, []);

  const [prcs, setprcs] = useState(false);
  const [prgrs, setprgrs] = useState([]);
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Booking under progress - RevaCabs </title>
        <meta name="description" content="Admin Login page" />
        <link rel="canonical" href="http://partner.revacabs.com/" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      {prcs ? (
        <Dataload />
      ) : dtl.display ? (
        <Prcsdtl dtl={dtl} setdtl={setdtl} />
      ) : (
        <div className="comp-con">
          <div className="fltr-con">
            <div className="sub-fltr">
              <div className="sub-fltrprtn">
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="City"
                    className="fltr-input"
                    placeholder="City"
                    value={filter.from}
                    onChange={(e) => {
                      // eslint-disable-next-line
                      setfilter({ ...filter, ["from"]: e.target.value });
                    }}
                    autoComplete="off"
                    onFocus={() => {
                      // eslint-disable-next-line
                      setautoco({ ...autoco, ["display"]: true });
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        // eslint-disable-next-line
                        setautoco({ ...autoco, ["display"]: false });
                      }, 200);
                    }}
                    onKeyUp={autocomplete}
                  />
                  {autoco.display ? (
                    <div className="auto-con">
                      <div className="auto-wrapper">
                        {autoco.sugge.map((itm, i) => {
                          return (
                            <div
                              key={i}
                              className="suggestion"
                              onClick={() => {
                                setfilter({
                                  ...filter,
                                  // eslint-disable-next-line
                                  ["from"]: itm.cityname,
                                  // eslint-disable-next-line
                                  ["fromCode"]: itm.citycode,
                                });
                                // eslint-disable-next-line
                                setautoco({ ...autoco, ["display"]: false });
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
                        {autoco.sugge.length <= 0 ? "No city Found" : ""}
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
            </div>
            <div className="sub-fltr">
              <div className="sub-fltrprtn">
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="bkngid"
                    className="fltr-input"
                    placeholder="Booking Id"
                    value={filter.bkngid}
                    onChange={(e) => {
                      setfilter({ ...filter, bkngid: e.target.value });
                    }}
                    autoComplete="off"
                  />
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
                  onClick={progress}
                >
                  <span>
                    <ImSearch /> Search
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div
            className="cstm-tbl-con"
            style={{ display: "flex", flexDirection: "column" }}
          >
            {prgrs.map((itm, i) => {
              return (
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
                        <div className="crd-hd">Status</div>
                        <div className="bold-txt crd-txtflx">
                          {itm.bookingstatus.charAt(0).toUpperCase() +
                            itm.bookingstatus.slice(1)}
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
                        <div className="crd-hd">Assinged to</div>
                        <div className="bold-txt crd-txtflx">
                          {itm.assignedto ? (
                            itm.assignedto.operatorid ? (
                              <span
                                className="links"
                                style={{ color: "skyblue", cursor: "pointer" }}
                              >
                                {itm.assignedto.operatorid}
                              </span>
                            ) : (
                              "N/A"
                            )
                          ) : (
                            "N/A"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="gv-con">
                    <button
                      className="gv-btn icn-btn"
                      onClick={() => {
                        setdtl({ display: true, id: itm.bookingid });
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
              );
            })}
            {prgrs.length <= 0 ? (
              <div className="nrc-con">
                <img src="/icons/nrec.png" alt="" />
                <p className="nrc-txt">No Booking found</p>
              </div>
            ) : (
              ""
            )}
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
                onClick={progress}
              >
                Previous
              </button>
              <div>{lst.pag}</div>
              <button
                onMouseDown={() => {
                  handellst(true);
                }}
                onClick={progress}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Progress;
