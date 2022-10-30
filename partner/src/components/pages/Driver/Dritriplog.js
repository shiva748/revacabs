import React, { useState, useEffect } from "react";
import { CgArrowsExchange, CgArrowRight } from "react-icons/cg";
import { MdOutlineAddCircle, MdVerified } from "react-icons/md";
import { FaSearch, FaTimes, FaRegTimesCircle } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { FcCancel } from "react-icons/fc";
import DatePicker from "react-datepicker";
import Loading from "../../template/loading/Loading";
import Startrip from "../../template/startendtrp/Startrip";
import EndTrip from "../../template/startendtrp/Endtrip";
import { Helmet } from "react-helmet";
const Dritriplog = () => {
  const [hgt, sethgt] = useState();
  const resizer = () => {
    const height = window.innerHeight - 110;
    sethgt(height);
  };
  window.addEventListener("resize", resizer);
  useEffect(() => {
    resizer();
    // eslint-disable-next-line
  }, []);

  const [ldng, setldng] = useState(false);
  const [fltr, setfltr] = useState({ type: "ongng", from: "", to: "" });
  const triplog = async (type) => {
    const data = {};
    if (type === "ongng") {
      data.type = "Ongoing";
    } else if (type === "upcmng") {
      data.type = "Upcoming";
    } else if (type === "hstry") {
      data.type = "History";
      data.from = fltr.from ? new Date(fltr.from).getTime() : "";
      data.to = fltr.to ? new Date(fltr.to).getTime() : "";
    } else {
      return alert("invalid request");
    }
    setldng(true);
    const res = await fetch("/driver/triplog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.status === 200) {
      setbkngs(result.ary);
    } else {
      alert("failed");
    }
    setldng(false);
  };
  useEffect(() => {
    setfltr({ ...fltr, type: "ongng" });
    triplog("ongng");
    // eslint-disable-next-line
  }, []);
  const [bkngs, setbkngs] = useState([]);
  const [dtl, setdtl] = useState({ display: false, data: {} });
  const [start, setstart] = useState({
    display: false,
    bkng: "",
  });
  const [end, setend] = useState({
    display: false,
    bkng: "",
  });

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>
          RevaCabs |{" "}
          {fltr.type === "ongng"
            ? "Ongoing Booking"
            : fltr.type === "upcmng"
            ? "Upcoming Booking"
            : "Booking History"}
        </title>

        <meta
          name="description"
          content="Page to add, manage and update the cars"
        />
        <link rel="canonical" href="http://partner.revacabs.com/" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="multicon-hd">
        <span className="h-t1">Trip log</span>
      </div>
      {ldng ? (
        <Loading />
      ) : (
        <section
          className="multi-con"
          style={{
            height: `${hgt}px`,
          }}
        >
          <div className="lp-con">
            <div className="lp-menu">
              <div
                className={
                  fltr.type === "ongng" ? "lp-itm frm-selected" : "lp-itm"
                }
              >
                <input
                  className="radio-hdn"
                  type="radio"
                  name="type"
                  id="ongng"
                  value="ongng"
                  onChange={() => {
                    triplog("ongng");
                    setfltr({ ...fltr, type: "ongng" });
                  }}
                />
                <label htmlFor="ongng" className="radio-label">
                  Ongoing
                </label>
              </div>
              <div
                className={
                  fltr.type === "upcmng" ? "lp-itm frm-selected" : "lp-itm"
                }
              >
                <input
                  className="radio-hdn"
                  type="radio"
                  name="type"
                  id="upcmng"
                  value="upcmng"
                  onChange={() => {
                    setfltr({ type: "upcmng", from: "", to: "" });
                    triplog("upcmng");
                  }}
                />
                <label htmlFor="upcmng" className="radio-label">
                  Upcoming
                </label>
              </div>
              <div
                className={
                  fltr.type === "hstry" ? "lp-itm frm-selected" : "lp-itm"
                }
              >
                <input
                  className="radio-hdn"
                  type="radio"
                  name="type"
                  id="hstry"
                  value="hstry"
                  onChange={() => {
                    triplog("hstry");
                  }}
                />
                <label
                  htmlFor="hstry"
                  className="radio-label"
                  onClick={() => {
                    setfltr({ type: "hstry", from: "", to: "" });
                  }}
                >
                  History
                </label>
              </div>
            </div>
          </div>
          {fltr.type === "hstry" ? (
            <div className="fltr-con">
              <div className="sub-fltr">
                <DatePicker
                  className="inpt-t1"
                  placeholderText="From Date"
                  autoComplete="off"
                  dateFormat="dd/MM/yyyy"
                  selected={fltr.from}
                  onChange={(value) => {
                    setfltr({ ...fltr, from: value });
                  }}
                  minDate={new Date(2022, 0, 1, 0, 0, 0, 0)}
                  maxDate={new Date()}
                />
              </div>
              <div className="sub-fltr">
                <DatePicker
                  className="inpt-t1"
                  placeholderText="To Date"
                  autoComplete="off"
                  dateFormat="dd/MM/yyyy"
                  selected={fltr.to}
                  onChange={(value) => {
                    setfltr({ ...fltr, to: value });
                  }}
                  maxDate={new Date()}
                  minDate={
                    fltr.from ? fltr.from : new Date(2022, 0, 1, 0, 0, 0, 0)
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
                  onClick={() => triplog("hstry")}
                >
                  <FaSearch /> Search
                </button>
                <button
                  type="submit"
                  className="fltr-btn"
                  onClick={() => {
                    setfltr({ ...fltr, from: "", to: "" });
                  }}
                >
                  Clear filter
                </button>
              </div>
            </div>
          ) : (
            ""
          )}
          {bkngs.map((itm, i) => {
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
                      <div className="crd-hd">Date</div>
                      <div className="bold-txt crd-txtflx">
                        {new Date(itm.pickupat).toLocaleDateString("en-IN")}
                        {itm.bookingtype === "Outstation" &&
                        itm.outstation === "Roundtrip" ? (
                          new Date(itm.pickupDate).getDate() ===
                          new Date(itm.returnat).getDate() ? (
                            "(SameDay)"
                          ) : (
                            <>
                              <CgArrowRight />
                              {new Date(itm.returnat).toLocaleDateString(
                                "en-IN"
                              )}{" "}
                            </>
                          )
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="crd-prtn">
                    {itm.bookingstatus === "assigned" ||
                    itm.bookingstatus === "ongoing" ? (
                      <div className="crd-cl">
                        <div className="crd-hd">Cab</div>
                        <div className="bold-txt crd-txtflx">
                          {itm.cabinfo ? `${itm.cabinfo.carNumber}` : "N/A"}
                        </div>
                      </div>
                    ) : (
                      <div className="crd-cl">
                        <div className="crd-hd">Status</div>
                        <div className="bold-txt crd-txtflx">
                          {itm.bookingstatus === "completed" ? (
                            <>
                              <TiTick
                                style={{
                                  color: "#6cff6c",
                                  fontSize: "20px",
                                  margin: "0px 7px",
                                }}
                              />
                              Completed
                            </>
                          ) : itm.bookingstatus === "cancelled" ? (
                            <>
                              <FcCancel
                                style={{
                                  fontSize: "20px",
                                  margin: "0px 7px",
                                }}
                              />
                              Cancelled
                            </>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    )}
                    <div className="crd-cl">
                      <div className="crd-hd">
                        {itm.billing && itm.billing.oprtramt
                          ? "Earning"
                          : "Rate"}
                      </div>
                      <div className="bold-txt crd-txtflx">
                        ₹
                        {itm.billing && itm.billing.oprtramt
                          ? itm.billing.oprtramt
                          : itm.assignedto.amount}
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
                  {itm.bookingstatus === "assigned" &&
                  itm.status === "upcoming" &&
                  itm.pickupat - new Date().getTime() < 1800000 ? (
                    <button
                      className="gv-btn"
                      onClick={() => {
                        setstart({ display: true, bkng: itm });
                      }}
                    >
                      Start trip
                    </button>
                  ) : (
                    ""
                  )}
                  {itm.bookingstatus === "ongoing" ? (
                    <button
                      className="gv-btn"
                      onClick={() => {
                        setend({ display: true, bkng: itm });
                      }}
                    >
                      End Trip
                    </button>
                  ) : (
                    ""
                  )}
                  <button
                    className="gv-btn"
                    style={{ backgroundColor: "lightgreen" }}
                    onClick={() => {
                      setdtl({ display: true, data: itm });
                    }}
                  >
                    Details
                  </button>
                </div>
              </div>
            );
          })}
          {bkngs.length <= 0 ? (
            <div className="nrc-con">
              <img src="/icons/nrec.png" alt="" />
              <p className="nrc-txt">No booking's found</p>
            </div>
          ) : (
            ""
          )}
        </section>
      )}
      {dtl.display ? (
        <div className="form-container">
          <div
            className="form-box"
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
                    <td>Pickup Time</td>
                    <td>
                      {new Date(dtl.data.pickupat).toLocaleTimeString("en-IN")}
                    </td>
                  </tr>
                  {dtl.data.bookingtype === "Outstation" &&
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
                  )}
                  {dtl.data.bookingstatus === "ongoing" ? (
                    <>
                      <tr>
                        <td>Trip Started on</td>
                        <td>
                          {new Date(
                            dtl.data.billing.tripstats.startat
                          ).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    </>
                  ) : (
                    ""
                  )}
                  {dtl.data.bookingstatus !== "completed" &&
                  dtl.data.bookingstatus !== "cancelled" ? (
                    <>
                      <tr>
                        <td>Booking Amount</td>
                        <td>₹ {dtl.data.payable}</td>
                      </tr>
                      <tr>
                        <td>Advance recived</td>
                        <td>₹ {dtl.data.advance}</td>
                      </tr>
                      <tr>
                        <td>Cash to Collect</td>
                        <td>₹ {dtl.data.remaning}</td>
                      </tr>
                      <tr>
                        <td>Rate</td>
                        <td>₹ {dtl.data.assignedto.amount}</td>
                      </tr>
                      <tr>
                        <td>State tax & toll</td>
                        <td>
                          {dtl.data.tripinfo.othercharges.Tolltaxes.isinclude
                            ? "Include"
                            : "Extra if Appl."}
                        </td>
                      </tr>
                    </>
                  ) : (
                    ""
                  )}
                </tbody>
              </table>
              {dtl.data.bookingstatus === "completed" ? (
                <>
                  <div className="scndry-hd">Billing</div>
                  <table className="bkngdtl-tbl">
                    <tbody>
                      <tr>
                        <td>Car runned</td>
                        <td>
                          {dtl.data.billing.tripstats.endkm -
                            dtl.data.billing.tripstats.startkm}{" "}
                          KM
                        </td>
                      </tr>
                      <tr>
                        <td>Billing amount</td>
                        <td>₹ {dtl.data.billing.billamount}</td>
                      </tr>
                      <tr>
                        <td>Advance</td>
                        <td>₹ {dtl.data.advance}</td>
                      </tr>
                      <tr>
                        <td>Booking amount</td>
                        <td>₹ {dtl.data.assignedto.amount}</td>
                      </tr>
                      <tr>
                        <td>Extra km</td>
                        <td>
                          ₹{" "}
                          {dtl.data.billing.extrakm
                            ? dtl.data.billing.extrakm.partner
                            : "0"}
                        </td>
                      </tr>
                      <tr>
                        <td>Extra hour</td>
                        <td>
                          ₹{" "}
                          {dtl.data.billing.extrahour
                            ? dtl.data.billing.extrahour.partner
                            : "0"}
                        </td>
                      </tr>
                      <tr>
                        <td>Final amount</td>
                        <td>₹ {dtl.data.billing.oprtramt}</td>
                      </tr>
                      <tr>
                        <td>Cash Collected</td>
                        <td>₹ {dtl.data.billing.cash}</td>
                      </tr>
                      <tr>
                        <td>
                          {dtl.data.billing.companybal.amount
                            ? "Company Balance"
                            : "Your Balance"}
                        </td>
                        <td>
                          ₹
                          {dtl.data.billing.companybal.amount
                            ? dtl.data.billing.companybal.amount
                            : dtl.data.billing.partnerbal.amount}
                        </td>
                      </tr>
                      {dtl.data.billing.companybal.date ? (
                        <>
                          <tr>
                            <td>Last attempt</td>
                            <td>
                              {new Date(
                                dtl.data.billing.companybal.date
                              ).toLocaleString("en-IN")}
                            </td>
                          </tr>
                          <tr>
                            <td>Status</td>
                            <td>
                              {dtl.data.billing.companybal.status ? (
                                <>
                                  <MdVerified
                                    style={{
                                      color: "lightgreen",
                                      marginRight: "5px",
                                    }}
                                  />
                                  Recived
                                </>
                              ) : (
                                <>
                                  <FaRegTimesCircle
                                    style={{
                                      color: "red",
                                      marginRight: "5px",
                                    }}
                                  />{" "}
                                  Failed
                                </>
                              )}
                            </td>
                          </tr>
                        </>
                      ) : (
                        ""
                      )}
                    </tbody>
                  </table>
                </>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      {start.display ? (
        <Startrip start={start} setstart={setstart} triplog={triplog} />
      ) : (
        ""
      )}
      {end.display ? (
        <EndTrip end={end} setend={setend} triplog={triplog} />
      ) : (
        ""
      )}
    </>
  );
};

export default Dritriplog;
