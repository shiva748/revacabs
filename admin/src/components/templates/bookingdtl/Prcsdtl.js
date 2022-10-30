import React, { useState, useEffect } from "react";
import { TiArrowBackOutline } from "react-icons/ti";
import { CgArrowsExchange, CgArrowRight } from "react-icons/cg";
import { FiRefreshCw } from "react-icons/fi";
import { FaTimes } from "react-icons/fa";
import Dataload from "../Loading/Dataload";
const Prcsdtl = (recived) => {
  const { dtl, setdtl } = recived;
  const [prcs, setprcs] = useState(true);
  const id = dtl.id;
  const [itm, setitm] = useState({});
  const progress = async () => {
    setprcs(true);
    const res = await fetch("/oceannodes/booking/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bkngid: id,
        prcstyp: "dtl",
      }),
    });
    const data = await res.json();
    if (res.status !== 200 || data.length <= 0) {
      alert("failed to load the Booking");
      setdtl({ display: false, id: "" });
    } else {
      setitm(data[0]);
      setprcs(false);
    }
  };

  const assignop = async (operatorid) => {
    if (itm.bookingstatus === "assigned") {
      return alert("Please refuse the existing operator first");
    }
    setprcs(true);
    const res = await fetch("/oceannodes/booking/progress/assignop", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingid: id,
        operatorid,
      }),
    });
    const data = await res.json();
    if (res.status === 201) {
      setoptn({ tdl: "asgnd" });
      progress();
      alert(data);
    } else {
      alert(data);
    }
    setprcs(false);
  };
  const [rfs, setrfs] = useState("No");
  const rfsop = async (operatorid) => {
    setprcs(true);
    const res = await fetch("/oceannodes/booking/progress/rfsop", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingid: id,
        operatorid,
        isapplicable: rfs,
      }),
    });
    const data = await res.json();
    if (res.status === 201) {
      setoptn({ tdl: "ofr" });
      progress();
      alert(data);
    } else {
      alert(data);
    }
    setprcs(false);
  };
  const [optn, setoptn] = useState({ tdl: "asgnd" });
  const [pnlty, setpnlty] = useState([]);
  const Penalty = async () => {
    setprcs(true);
    const res = await fetch("/oceannodes/penalty", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pag: "1",
        entry: "100",
        bookingid: id,
      }),
    });
    const data = await res.json();
    if (res.status !== 200) {
      alert("failed to load the Booking");
    } else {
      setpnlty(data);
      setprcs(false);
    }
  };
  useEffect(() => {
    progress();
    Penalty();
    // eslint-disable-next-line
  }, []);
  let dfd = {
    display: false,
    operatorid: "",
    bookingid: "",
    reason: "",
    amount: "",
    received: "",
    closed: "",
    closereason: "",
  };
  const [dtld, setdtld] = useState(dfd);
  const [updtpnlty, setupdtpnlty] = useState({ received: "", close: "" });
  const updtpnlt = async () => {
    let { received, close } = updtpnlty;
    let { bookingid, operatorid } = dtld;
    if (
      !bookingid ||
      typeof bookingid !== "string" ||
      !operatorid ||
      typeof operatorid !== "string" ||
      !received ||
      typeof received !== "string" ||
      !close ||
      typeof close !== "string" ||
      !["true", "false"].some((itm) => itm === received) ||
      !["true", "false"].some((itm) => itm === close)
    ) {
      return alert("Invalid request");
    }
    let updt = {};
    if (received !== dtld.received) {
      updt = { ...updt, received };
    }
    if (close !== dtld.close) {
      updt = { ...updt, close };
    }
    if (JSON.stringify(updt) === "{}") {
      return alert("No changes has been made");
    }
    updt = { ...updt, bookingid, operatorid };
    const result = await fetch("/oceannodes/penalty/update", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(updt),
    });
    const data = await result.json();
    if (result.status === 201) {
      Penalty();
      setdtld({ dfd });
      setupdtpnlty({ received: "", close: "" });
      alert(data);
    } else {
      alert(data);
    }
  };
  return (
    <>
      {prcs ? (
        <Dataload />
      ) : (
        <div className="dlt-con">
          <div className="dtl-hd">
            {itm.bookingid}{" "}
            <div>
              <button
                className="dtl-clsr"
                onClick={progress}
                style={{ backgroundColor: "lightgreen", margin: "0px 5px" }}
              >
                <FiRefreshCw />
              </button>
              <button
                className="dtl-clsr"
                onClick={() => {
                  setdtl({ display: false, id: "" });
                }}
              >
                <TiArrowBackOutline /> Back
              </button>
            </div>
          </div>
          <div className="tbl-con">
            <table className="dtl-tbl">
              <tbody>
                <tr>
                  <td>{itm.bookingtype === "Local" ? "City" : "Route"}</td>
                  <td>
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
                  </td>
                </tr>
                <tr>
                  <td>
                    {itm.bookingtype === "Local"
                      ? "Rental type"
                      : "Outstation type "}
                  </td>
                  <td>
                    {itm.bookingtype === "Local"
                      ? `${itm.tripinfo.hour}hr || ${itm.tripinfo.distance}km`
                      : `${itm.outstation} (${itm.tripinfo.distance}km)`}
                  </td>
                </tr>
                <tr>
                  <td>Pickup date</td>
                  <td>{new Date(itm.pickupat).toLocaleDateString("gu-IN")}</td>
                </tr>
                <tr>
                  <td>Pickup time</td>
                  <td>{new Date(itm.pickupat).toLocaleTimeString("en-IN")}</td>
                </tr>
                <tr>
                  <td>Booking amount</td>
                  <td>₹{itm.payable}</td>
                </tr>
                {itm.advance ? (
                  <tr>
                    <td>Advance</td>
                    <td>₹{itm.advance}</td>
                  </tr>
                ) : (
                  ""
                )}
                {itm.bookingtype === "Local" ? (
                  ""
                ) : (
                  <tr>
                    <td>State tax & tolls</td>
                    <td>
                      {itm.tripinfo.othercharges.Tolltaxes.isinclude
                        ? "Included"
                        : "Extra"}
                    </td>
                  </tr>
                )}
                <tr>
                  <td>Email</td>
                  <td>{itm.email}</td>
                </tr>
                <tr>
                  <td>Phone</td>
                  <td>
                    <a href={"tel:+91".concat(itm.phone)} className="blu-links">
                      {itm.phone}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>Status</td>
                  <td>
                    {itm.bookingstatus.charAt(0).toUpperCase() +
                      itm.bookingstatus.slice(1)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bkng-optn">
            <div
              className={
                optn.tdl === "asgnd"
                  ? "optn-itm optn-actv ovrly-ad"
                  : "optn-itm ovrly-ad"
              }
              onClick={() => {
                setoptn({ tdl: "asgnd" });
              }}
            >
              Assigned
            </div>
            {itm.bookingstatus === "assigned" ? (
              <div
                className={
                  optn.tdl === "rfso"
                    ? "optn-itm optn-actv ovrly-ad"
                    : "optn-itm ovrly-ad"
                }
                onClick={() => {
                  setoptn({ tdl: "rfso" });
                }}
              >
                Refuse operator
              </div>
            ) : (
              ""
            )}
            {itm.bookingstatus === "confirmed" ? (
              <div
                className={
                  optn.tdl === "ofr"
                    ? "optn-itm optn-actv ovrly-ad"
                    : "optn-itm ovrly-ad"
                }
                onClick={() => {
                  setoptn({ tdl: "ofr" });
                }}
              >
                Offers
              </div>
            ) : (
              ""
            )}
            {itm.bookingstatus === "ongoing" ? (
              <div
                className={
                  optn.tdl === "stts"
                    ? "optn-itm optn-actv ovrly-ad"
                    : "optn-itm ovrly-ad"
                }
                onClick={() => {
                  setoptn({ tdl: "stts" });
                }}
              >
                Stats
              </div>
            ) : (
              ""
            )}
            <div
              className={
                optn.tdl === "pnlty"
                  ? "optn-itm optn-actv ovrly-ad"
                  : "optn-itm ovrly-ad"
              }
              onClick={() => {
                setoptn({ tdl: "pnlty" });
              }}
            >
              Penalty
            </div>
          </div>
          {optn.tdl === "ofr" ? (
            <div className="bkngedt-con" style={{ padding: "0px 5%" }}>
              <div className="bkng-edthd">Offers</div>
              {itm.bids && itm.bids.length > 0 ? (
                <table className="bds-tbl">
                  <thead>
                    <tr>
                      <th>Id</th>
                      <th>Phone</th>
                      <th>Amount</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {itm.bids.map((itm, i) => {
                      return (
                        <tr key={i}>
                          <td lbl="Id">
                            <span className="blu-links">{itm.operatorid}</span>
                          </td>
                          <td lbl="Phone">
                            <a
                              className="blu-links"
                              href={"tel:+91".concat(itm.phone)}
                            >
                              {itm.phone}
                            </a>
                          </td>
                          <td lbl="amount">₹{itm.amount}</td>
                          <td>
                            <button
                              className="Asgn-btn"
                              onClick={() => {
                                assignop(itm.operatorid);
                              }}
                            >
                              Assign
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="nrc-con">
                  <img src="/icons/nrec.png" alt="" />
                  <p className="nrc-txt">No bid's found</p>
                </div>
              )}
            </div>
          ) : (
            ""
          )}
          {optn.tdl === "pnlty" ? (
            <div className="bkngedt-con" style={{ padding: "0px 5%" }}>
              <div className="bkng-edthd">Penalty</div>
              {pnlty.length > 0 ? (
                <table className="bds-tbl">
                  <thead>
                    <tr>
                      <th>To</th>
                      <th>Phone</th>
                      <th>Amount</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pnlty.map((itm, i) => {
                      return (
                        <tr key={i}>
                          <td lbl="Id">
                            <span className="blu-links">{itm.operatorid}</span>
                          </td>
                          <td lbl="Phone">
                            <a
                              className="blu-links"
                              href={"tel:+91".concat(itm.phone)}
                            >
                              {itm.phone}
                            </a>
                          </td>
                          <td lbl="Amount">₹{itm.amount}</td>
                          <td>
                            <button
                              className="Asgn-btn"
                              onClick={() => {
                                setdtld({
                                  display: true,
                                  ...itm,
                                });
                                setupdtpnlty({
                                  received: itm.received ? "true" : "false",
                                  close: itm.close ? "true" : "false",
                                });
                              }}
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="nrc-con">
                  <img src="/icons/nrec.png" alt="" />
                  <p className="nrc-txt">No Penalty found</p>
                </div>
              )}
            </div>
          ) : (
            ""
          )}
          {optn.tdl === "asgnd" ? (
            <div className="bkngedt-con">
              <div className="bkng-edthd">Assigned</div>
              <div className="tbl-con">
                <table className="dtl-tbl">
                  <tbody>
                    {itm.assignedto && itm.assignedto.assigned ? (
                      <>
                        <tr>
                          <td>Operator id</td>
                          <td>
                            <span className="blu-links">
                              {itm.assignedto.operatorid}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>Phone</td>
                          <td>
                            <span className="blu-links">
                              {itm.assignedto.phone}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>Sec phone</td>
                          <td>
                            <span className="blu-links">
                              {itm.assignedto.aPhone}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>Amount</td>
                          <td>
                            <span>₹{itm.assignedto.amount}</span>
                          </td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td>Operator</td>
                        <td>Not assigned</td>
                      </tr>
                    )}
                    {itm.driverinfo && itm.driverinfo.assigned ? (
                      <>
                        <tr>
                          <td>Driver name</td>
                          <td>
                            <span className="blu-links">
                              {itm.driverinfo.name}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>Phone</td>
                          <td>
                            <span className="blu-links">
                              {itm.driverinfo.phone}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>Sec phone</td>
                          <td>
                            <span className="blu-links">
                              {itm.driverinfo.aPhone}
                            </span>
                          </td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td>Driver</td>
                        <td>Not assigned</td>
                      </tr>
                    )}
                    {itm.driverinfo && itm.driverinfo.assigned ? (
                      <>
                        <tr>
                          <td>Cab model</td>
                          <td>
                            <span>
                              {itm.cabinfo.name} ({itm.cabinfo.category})
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>Number</td>
                          <td>
                            <span className="blu-links">
                              {itm.cabinfo.carNumber}
                            </span>
                          </td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td>Cab</td>
                        <td>Not assigned</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            ""
          )}
          {optn.tdl === "rfso" ? (
            <div className="bkngedt-con">
              <div className="bkng-edthd">Refuse operator</div>
              <div className="tbl-con">
                <table className="dtl-tbl">
                  <tbody>
                    <tr>
                      <td>Operator id</td>
                      <td>
                        <span className="blu-links">
                          {itm.assignedto.operatorid}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>Phone</td>
                      <td>
                        <span className="blu-links">
                          {itm.assignedto.phone}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>Sec phone</td>
                      <td>
                        <span className="blu-links">
                          {itm.assignedto.aPhone}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>Amount</td>
                      <td>
                        <span>₹{itm.assignedto.amount}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="inpt-row">
                <span className="edt-span">Penalty</span>
                <select
                  className="edt-inpt"
                  name="rsn"
                  value={rfs}
                  onChange={(e) => {
                    setrfs(e.target.value);
                  }}
                >
                  <option value="no">No Penalty</option>
                  <option value="yes">Apply</option>
                </select>
              </div>
              <div className="inpt-row" style={{ margin: "10px 0px" }}>
                <button
                  type="submit"
                  className="ad-btn"
                  style={{ backgroundColor: "red" }}
                  onClick={() => {
                    rfsop(itm.assignedto.operatorid);
                  }}
                >
                  Refuse
                </button>
              </div>
            </div>
          ) : (
            ""
          )}
          {optn.tdl === "stts" ? (
            <div className="bkngedt-con">
              <div className="bkng-edthd">Stats</div>
              {itm.billing && itm.billing.tripstats ? (
                <table className="dtl-tbl">
                  <tbody>
                    <tr>
                      <td>Start km</td>
                      <td>
                        {itm.billing.tripstats.startkm
                          ? `${itm.billing.tripstats.startkm} km`
                          : "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td>Start at</td>
                      <td>
                        {itm.billing.tripstats.startat
                          ? new Date(
                              itm.billing.tripstats.startat
                            ).toLocaleString("en-IN")
                          : "N/A"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div className="nrc-con">
                  <img src="/icons/break.png" alt="" />
                  <p className="nrc-txt" style={{ fontSize: "16px" }}>
                    Trip not started
                  </p>
                </div>
              )}
            </div>
          ) : (
            ""
          )}
          {dtld.display ? (
            <div className="sml-dtl">
              <div className="sml-dtlbx">
                <div className="dtl-hd" style={{ display: "block" }}>
                  <div
                    className="clsr"
                    style={{ float: "right" }}
                    onClick={() => {
                      setdtld({
                        display: false,
                        orderid: "",
                        status: "",
                        amount: "",
                        operatorid: "",
                        reason: "",
                      });
                    }}
                  >
                    <FaTimes />
                  </div>
                </div>
                <table className="dtl-tbl">
                  <tbody>
                    <tr>
                      <td>Booking Id</td>
                      <td>{dtld.bookingid}</td>
                    </tr>
                    <tr>
                      <td>Operator Id</td>
                      <td>{dtld.operatorid}</td>
                    </tr>
                    <tr>
                      <td>Phone</td>
                      <td>
                        <a
                          href={"tel:+91".concat(dtld.phone)}
                          className="blu-links"
                        >
                          {dtld.phone}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td>Amount</td>
                      <td>₹ {dtld.amount}</td>
                    </tr>
                    <tr>
                      <td>Reason</td>
                      <td>{dtld.reason}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="inpt-row">
                  <span className="edt-span">Received</span>
                  <select
                    className="edt-inpt"
                    name="received"
                    value={updtpnlty.received}
                    onChange={(e) => {
                      setupdtpnlty({ ...updtpnlty, received: e.target.value });
                    }}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="inpt-row">
                  <span className="edt-span">Close</span>
                  <select
                    className="edt-inpt"
                    name="close"
                    value={updtpnlty.close}
                    onChange={(e) => {
                      setupdtpnlty({ ...updtpnlty, close: e.target.value });
                    }}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="inpt-row">
                  <button
                    type="submit"
                    className="ctl-btn"
                    style={{ margin: "auto" }}
                    onClick={updtpnlt}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      )}
    </>
  );
};
export default Prcsdtl;
