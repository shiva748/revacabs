import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import {  FaTimes, FaSearch } from "react-icons/fa";
import { CgArrowsExchange, CgArrowRight } from "react-icons/cg";
import { MdOutlineAddCircle } from "react-icons/md";
import { ImLocation2 } from "react-icons/im";
import "react-datepicker/dist/react-datepicker.css";
import Loading from "../../template/loading/Loading";
import { Helmet } from "react-helmet";
const Driverdashboard = () => {
  useEffect(() => {
    reqbooking();
    // eslint-disable-next-line
  }, []);
  const [id, setid] = useState("");
  const [bkngs, setbkngs] = useState([]);
  const [ldng, setldng] = useState(true);
  const reqbooking = async () => {
    let { entry, pag } = lst;
    if (!entry || isNaN(entry) || typeof pag !== "number") {
      return alert("Invalid request");
    }
    if (lst.prv) {
      if (entry === lst.prv.entry && pag === lst.prv.pag) {
        return;
      }
    }
    let { from, fromcode, date } = filter;
    setldng(true);
    let res = await fetch("/driver/booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        fromcode,
        date,
        pag: pag.toString(),
        entry,
      }),
    });
    let data = await res.json();
    if (res.status !== 200) {
      setlst({
        ...lst,
        prv: { pag, entry },
        flt: { from, fromcode, date },
      });
      alert(data);
      setldng(false);
    } else {
      setlst({
        ...lst,
        prv: { pag, entry },
        flt: { from, fromcode, date },
      });
      setbkngs(data.result);
      setid(data.operatorid);
      setldng(false);
    }
  };
  const df = { fromcode: "", date: "", from: "" };
  const [filter, setfilter] = useState(df);
  const [sugg, setsugg] = useState({ display: false, data: [] });
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
      setsugg({ ...sugg, ["data"]: data });
    } else {
      // eslint-disable-next-line
      setsugg({ ...sugg, ["data"]: [] });
    }
  };
  const [bkngdata, setbkngdata] = useState({ display: false, data: "" });
  const handelinput = (e) => {
    let value = e.target.value;
    // eslint-disable-next-line
    setfilter({ ...filter, ["from"]: value });
  };
  // === === === list code start === === === //

  const [lst, setlst] = useState({ entry: "10", pag: 1, data: [] });
  const handellst = (type) => {
    let pag = lst.pag;
    if (
      lst.flt.fromcode !== filter.fromcode ||
      lst.flt.from !== filter.from ||
      lst.flt.date !== filter.date ||
      lst.prv.entry !== lst.entry
    ) {
      return setlst({ ...lst, pag: 1, prv: {} });
    }
    if (type) {
      if (bkngs.length < lst.prv.entry * 1) {
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
      const { from, fromcode, date } = lst.flt;
      if (
        from !== filter.from ||
        fromcode !== filter.fromcode ||
        date !== filter.date ||
        lst.prv.entry !== lst.entry
      ) {
        return setlst({ ...lst, pag: 1, prv: {} });
      }
    }
    setlst({ ...lst, prv: {} });
  };

  // === === === lst code end === === === //
  const dtl = (itm) => {
    let data = itm;
    if (data.bids.length === 0) {
      data.othersoffer = "N/A";
    } else {
      if (data.bids.some((bid) => bid.operatorid === id)) {
        if (data.bids.length === 1) {
          data.othersoffer = "N/A";
        } else {
          const array = [];
          data.bids.map((bid) => {
            return bid.operatorid === id ? "" : array.push(bid.amount);
          });
          data.othersoffer = "₹ " + array.sort((a, b) => a - b)[0];
        }
      } else {
        const array = [];
        data.bids.map((bid) => {
          return array.push(bid.amount);
        });
        data.othersoffer = "₹ " + array.sort((a, b) => a - b)[0];
      }
    }
    setbkngdata({ display: true, data });
  };
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>RevaCabs | New Booking</title>

        <meta
          name="description"
          content="Page to search new duty and bidding"
        />
        <link rel="canonical" href="http://partner.revacabs.com/" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="multicon-hd">
        <span className="h-t1">New trip</span>
      </div>
      {ldng ? (
        <Loading />
      ) : (
        <section className="multi-con">
          <div className="fltr-con">
            <div className="sub-fltr">
              <input
                type="text"
                name="from"
                className="inpt-t1"
                placeholder="City"
                autoComplete="off"
                value={filter.from}
                onChange={handelinput}
                onKeyUp={autocomplete}
                onFocus={() => {
                  // eslint-disable-next-line
                  setsugg({ ...sugg, ["display"]: true });
                }}
                onBlur={() => {
                  setTimeout(() => {
                    // eslint-disable-next-line
                    setsugg({ ...sugg, ["display"]: false });
                  }, 300);
                }}
              />
              {sugg.display ? (
                <div className="auto-container">
                  <div className="auto-wrapper">
                    {sugg.data.map((itm, i) => {
                      return (
                        <div
                          className="suggestion"
                          onClick={() => {
                            setfilter({
                              ...filter,
                              // eslint-disable-next-line
                              ["from"]: itm.cityname,
                              // eslint-disable-next-line
                              ["fromcode"]: itm.citycode,
                            });
                            // eslint-disable-next-line
                            setsugg({ ...sugg, ["display"]: false });
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
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
            <div className="sub-fltr">
              <DatePicker
                className="inpt-t1"
                placeholderText="Date"
                autoComplete="off"
                selected={filter.date}
                dateFormat="dd/MM/yyyy"
                onChange={(value) => {
                  // eslint-disable-next-line
                  setfilter({
                    ...filter,
                    date: value ? value.getTime() : "",
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
            </div>
            <div
              className="sub-fltr"
              style={{ justifyContent: "space-around" }}
            >
              <button
                type="submit"
                className="fltr-btn"
                onMouseDown={intator}
                onClick={reqbooking}
              >
                <FaSearch /> Search
              </button>
              <button
                type="submit"
                className="fltr-btn"
                onClick={() => {
                  setfilter(df);
                }}
              >
                Clear filter
              </button>
            </div>
          </div>
          <div className="cstm-tbl-con">
            {bkngs.length <= 0 ? (
              <div className="nrc-con">
                <img src="/icons/nrec.png" alt="" />
                <p className="nrc-txt">No Bookings Found</p>
              </div>
            ) : (
              bkngs.map((itm, i) => {
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
                              ? `(${itm.bookingtype} ${itm.tripinfo.hour}hr - ${itm.tripinfo.distance}km)`
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
                            ₹ {itm.oprtramt}
                            {itm.bookingtype === "Local" ? (
                              ""
                            ) : itm.tripinfo.othercharges.Tolltaxes
                                .isinclude ? (
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
                        className="gv-btn"
                        style={{ backgroundColor: "lightgreen" }}
                        // onClick={() => {
                        //   setbkngdata({ display: true, data: itm });
                        // }}
                        onClick={() => {
                          dtl(itm);
                        }}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })
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
                onClick={reqbooking}
              >
                Previous
              </button>
              <div>{lst.pag}</div>
              <button
                onMouseDown={() => {
                  handellst(true);
                }}
                onClick={reqbooking}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      )}
      {bkngdata.display ? (
        <div className="form-container">
          <div
            className="form-box"
            style={{ height: "fit-content", margin: "auto" }}
          >
            <div className="bkngdtl-hd">
              {bkngdata.data.bookingid}
              <div
                className="clsr-con"
                onClick={() => {
                  setbkngdata({ display: false, data: "" });
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
                    <td>{bkngdata.data.bookingtype}</td>
                  </tr>
                  <tr>
                    <td>
                      {bkngdata.data.bookingtype === "Outstation"
                        ? "Outstation Type"
                        : "Rental Package"}
                    </td>
                    <td>
                      {bkngdata.data.bookingtype === "Outstation"
                        ? `${bkngdata.data.outstation}(${bkngdata.data.tripinfo.distance} KM)`
                        : `(${bkngdata.data.tripinfo.hour} Hour ||${bkngdata.data.tripinfo.distance} KM)`}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      {bkngdata.data.bookingtype === "Local" ? "City" : "Route"}
                    </td>
                    <td>
                      {bkngdata.data.sourcecity.from.split(",")[0]}

                      {bkngdata.data.bookingtype === "Local" ? (
                        ""
                      ) : bkngdata.data.outstation === "Roundtrip" ? (
                        <>
                          <CgArrowsExchange />
                          {bkngdata.data.endcity.to.split(",")[0]}
                        </>
                      ) : (
                        <>
                          <CgArrowRight />
                          {bkngdata.data.endcity.to.split(",")[0]}
                        </>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>Cab</td>
                    <td>
                      {bkngdata.data.tripinfo.equivalent.isequi
                        ? `${bkngdata.data.tripinfo.name} or equivalent`
                        : bkngdata.data.tripinfo.name}
                    </td>
                  </tr>

                  <tr>
                    <td>Pickup at</td>
                    <td>
                      {new Date(bkngdata.data.pickupat).toLocaleDateString(
                        "en-IN"
                      )}{" "}
                      at{" "}
                      {new Date(bkngdata.data.pickupat).toLocaleTimeString(
                        "en-IN"
                      )}
                    </td>
                  </tr>
                  {bkngdata.data.outstation === "Roundtrip" ? (
                    <tr>
                      <td>Return</td>
                      <td>
                        {new Date(bkngdata.data.returnat).toLocaleDateString(
                          "en-IN"
                        )}
                      </td>
                    </tr>
                  ) : (
                    ""
                  )}
                  <tr>
                    <td>Booking amount</td>
                    <td>₹ {bkngdata.data.payable}</td>
                  </tr>
                  <tr>
                    <td>Advance</td>
                    <td>₹ {bkngdata.data.advance}</td>
                  </tr>
                  <tr>
                    <td>Cash to Collect</td>
                    <td>₹ {bkngdata.data.remaning}</td>
                  </tr>
                  <tr>
                    <td>Rate</td>
                    <td>₹ {bkngdata.data.oprtramt}</td>
                  </tr>
                  {bkngdata.data.bookingtype === "Local" ? (
                    ""
                  ) : (
                    <tr>
                      <td>Toll taxes</td>
                      <td>
                        {bkngdata.data.tripinfo.othercharges.Tolltaxes.isinclude
                          ? "Included"
                          : "Extra"}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td>Other Operator Offer</td>
                    <td>{bkngdata.data.othersoffer}</td>
                  </tr>
                  <tr>
                    <td>Your Operator Offer</td>
                    <td>
                      {bkngdata.data.bids.some((itm) => itm.operatorid === id)
                        ? bkngdata.data.bids
                            .filter((bid) => bid.operatorid === id)
                            .map((filteredbid) => `₹ ${filteredbid.amount}`)
                        : "N/A"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default Driverdashboard;
