import React, { useState, useEffect } from "react";
import "./css/Inquiry.css";
import Datepicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ImLocation2, ImSearch } from "react-icons/im";
import { AiOutlineClear } from "react-icons/ai";
import { MdOutlineAddCircle } from "react-icons/md";
import { CgArrowsExchange, CgArrowRight } from "react-icons/cg";
import { FaEye } from "react-icons/fa";
import Inquirydlt from "../templates/bookingdtl/Inquirydlt";
import Dataload from "../templates/Loading/Dataload";
import { Helmet } from "react-helmet";
const Inquiry = () => {
  const [lst, setlst] = useState({ entry: "10", pag: 1, data: [] });
  const handellst = (type) => {
    let pag = lst.pag;
    if (
      lst.flt.type !== filter.type ||
      lst.flt.date !== filter.date ||
      lst.flt.from !== filter.from ||
      lst.prv.fromcode !== lst.fromcode
    ) {
      console.log("reset");
      return setlst({ ...lst, pag: 1, prv: {} });
    }
    if (type) {
      if (inqui.length < lst.prv.entry * 1) {
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
      const { from, fromcode, type, date } = lst.flt;
      if (
        from !== filter.from ||
        fromcode !== filter.fromcode ||
        type !== filter.type ||
        date !== filter.date ||
        lst.prv.entry !== lst.entry
      ) {
        return setlst({ ...lst, pag: 1, prv: {} });
      }
    }
    setlst({ ...lst, prv: {} });
  };
  const df = {
    type: "",
    date: "",
    from: "",
    fromCode: "",
  };
  const [filter, setfilter] = useState(df);
  const [autoco, setautoco] = useState({ display: false, sugge: [] });
  const [prcs, setprcs] = useState(true);
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
  const [dtl, setdtl] = useState({ display: false, id: "" });
  const [inqui, setinqui] = useState([]);
  const inquiry = async () => {
    const { type, date, from, fromCode } = filter;
    let { entry, pag } = lst;
    if (!entry || isNaN(entry) || typeof pag !== "number") {
      return alert("Invalid request");
    }
    if (lst.prv) {
      if (entry === lst.prv.entry && pag === lst.prv.pag) {
        return;
      }
    }
    if (
      date <
      new Date(
        new Date().getFullYear(),
        new Date().getMonth,
        new Date().getDate(),
        0,
        0,
        0,
        0
      )
    ) {
      return alert("please select a valid date");
    }
    const aa = ["Oneway", "Roundtrip", "Local", ""];
    if (!aa.some((itm) => itm === type)) {
      return alert("please select a valid type");
    }
    if (typeof from !== "string" || typeof fromCode !== "string") {
      return alert("Invalid city selected");
    }
    setprcs(true);
    const res = await fetch("/oceannodes/booking/inquiry", {
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
        date: date ? new Date(date).getTime() : "",
        inqutyp: "lst",
      }),
    });
    const data = await res.json();
    if (res.status !== 200) {
      return alert("failed to load the inquiry");
    } else {
      setlst({
        ...lst,
        prv: { pag, entry },
        flt: { type, date, from, fromCode },
      });
      setinqui(data);
      setprcs(false);
    }
  };
  useEffect(() => {
    inquiry();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Booking Inquiry - RevaCabs </title>
        <meta name="description" content="Manage Booking Inquiry" />
        <link rel="canonical" href="http://partner.revacabs.com/" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      {prcs ? (
        <Dataload />
      ) : dtl.display ? (
        <Inquirydlt dtl={dtl} setdtl={setdtl} inqu={inquiry} />
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
                  <Datepicker
                    selected={filter.date}
                    className="fltr-input"
                    placeholderText="Date"
                    maxDate={new Date().setMonth(new Date().getMonth() + 1)}
                    onChange={(value) => {
                      setfilter({ ...filter, date: value });
                    }}
                    dateFormat="dd/MM/yyyy"
                    minDate={new Date()}
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
                  onClick={inquiry}
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
            {inqui.map((itm, i) => {
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
                          {itm.bookingtype === "Local"
                            ? `(${itm.bookingtype})`
                            : `(${itm.outstation})`}
                        </div>
                      </div>
                      <div className="crd-cl">
                        <div className="crd-hd">Pickup</div>
                        <div className="bold-txt crd-txtflx">
                          {new Date(itm.pickupat).toLocaleDateString("gu-IN")}{" "}
                          at{" "}
                          {new Date(itm.pickupat).toLocaleTimeString("gu-IN")}
                        </div>
                      </div>
                    </div>
                    <div className="crd-prtn">
                      <div className="crd-cl">
                        <div className="crd-hd">Cab</div>
                        <div className="bold-txt crd-txtflx">
                          {itm.tripinfo.name}{" "}
                          {itm.tripinfo.equivalent.isequi
                            ? `or equivalent`
                            : ""}
                        </div>
                      </div>
                      <div className="crd-cl">
                        <div className="crd-hd">Booking Amount</div>
                        <div className="bold-txt crd-txtflx">
                          ₹ {itm.payable}
                          {itm.bookingtype === "Local" ? (
                            ""
                          ) : itm.tripinfo.othercharges.Tolltaxes.isinclude ? (
                            ""
                          ) : (
                            <>
                              <MdOutlineAddCircle
                                style={{
                                  color: "#6cff6c",
                                  fontSize: "20px",
                                  margin: "0px 7px",
                                }}
                              />
                              Toll & Taxes
                            </>
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
            {inqui.length <= 0 ? (
              <div className="nrc-con">
                <img src="/icons/nrec.png" alt="" />
                <p className="nrc-txt">No inquiry found</p>
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
                onClick={inquiry}
              >
                Previous
              </button>
              <div>{lst.pag}</div>
              <button
                onMouseDown={() => {
                  handellst(true);
                }}
                onClick={inquiry}
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

export default Inquiry;
