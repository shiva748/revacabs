import React, { useState, useEffect } from "react";
import "./css/Coustumer.css";
import { AiOutlineClear } from "react-icons/ai";
import { FaTimes } from "react-icons/fa";
import { ImSearch } from "react-icons/im";
import Dataload from "../templates/Loading/Dataload";
import { Helmet } from "react-helmet";
const Penalty = () => {
  const df = { operatorid: "", bookingid: "", reason: "" };
  const [lst, setlst] = useState({ entry: "10", pag: 1, data: [] });
  const [filter, setfilter] = useState(df);
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
  const [dtl, setdtl] = useState(dfd);
  let name, value;
  const handelfilter = (e) => {
    name = e.target.name;
    value = e.target.value;
    setfilter({ ...filter, [name]: value });
  };
  const handellst = (type) => {
    let pag = lst.pag;
    if (
      lst.flt.operatorid !== filter.operatorid ||
      lst.flt.bookingid !== filter.bookingid ||
      lst.flt.reason !== filter.reason ||
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
  const penalty = async () => {
    const { operatorid, bookingid, reason } = filter;
    let { entry, pag } = lst;
    if (!entry || isNaN(entry) || typeof pag !== "number") {
      return alert("Invalid request");
    }
    if (lst.prv) {
      if (entry === lst.prv.entry && pag === lst.prv.pag) {
        return;
      }
    }

    if (operatorid) {
      if (typeof operatorid !== "string") {
        return alert("Invalid operator id");
      }
    }
    if (bookingid) {
      if (typeof bookingid !== "string") {
        return alert("Invalid booking id");
      }
    }
    if (reason) {
      if (typeof reason !== "string") {
        return alert("Invalid reason ");
      }
    }
    setprcs(true);
    const result = await fetch("/oceannodes/penalty", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        entry: entry,
        pag: pag.toString(),
        operatorid,
        bookingid,
        reason,
      }),
    });
    const data = await result.json();
    if (result.status === 200) {
      setlst({
        ...lst,
        data: data,
        prv: { pag, entry },
        flt: { operatorid, bookingid, reason },
      });
    } else {
      alert(data);
      setlst({
        ...lst,
        data: [],
        prv: { pag, entry },
        flt: { operatorid, bookingid, reason },
      });
    }
    setprcs(false);
  };
  const intator = () => {
    if (lst.flt) {
      const { operatorid, bookingid, reason } = lst.flt;
      if (
        operatorid !== filter.operatorid ||
        bookingid !== filter.bookingid ||
        reason !== filter.reason ||
        lst.prv.entry !== lst.entry
      ) {
        return setlst({ ...lst, pag: 1, prv: {} });
      }
    }
    setlst({ ...lst, prv: {} });
  };
  useEffect(() => {
    penalty();
    // eslint-disable-next-line
  }, []);
  const [prcs, setprcs] = useState(true);

  // === === === update payment === === === //

  const [updtpnlty, setupdtpnlty] = useState({ received: "", close: "" });
  const updtpnlt = async () => {
    let { received, close } = updtpnlty;
    let { bookingid, operatorid } = dtl;
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
    if (received !== dtl.received) {
      updt = { ...updt, received };
    }
    if (close !== dtl.close) {
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
      penalty(true);
      setdtl({ dfd });
      setupdtpnlty({ received: "", close: "" });
      alert(data);
    } else {
      alert(data);
    }
  };

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Coustumers - RevaCabs </title>
        <meta name="description" content="Manage Coustumer" />
        <link rel="canonical" href="http://partner.revacabs.com/" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      {prcs ? (
        <Dataload />
      ) : (
        <div className="comp-con">
          <div className="fltr-con">
            <div className="sub-fltr">
              <div className="sub-fltrprtn">
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="operatorid"
                    className="fltr-input"
                    autoComplete="off"
                    placeholder="Operator id"
                    onChange={handelfilter}
                    value={filter.operatorid}
                  />
                </div>
              </div>
              <div className="sub-fltrprtn">
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="bookingid"
                    className="fltr-input"
                    autoComplete="off"
                    placeholder="Booking id"
                    onChange={handelfilter}
                    value={filter.bookingid}
                  />
                </div>
              </div>
            </div>
            <div className="sub-fltr">
              <div className="sub-fltrprtn">
                <div className="input-wrapper">
                  <select
                    name="status"
                    className="fltr-input"
                    onChange={handelfilter}
                    value={filter.status}
                  >
                    <option value="">Select Reason</option>
                    <option value="received">Received</option>
                    <option value="created">Created</option>
                  </select>
                </div>
              </div>
              <div className="sub-fltrprtn">
                <button
                  className="inpt-btn bg-rd"
                  onClick={() => setfilter({ ...filter, id: "" })}
                >
                  <span>
                    <AiOutlineClear /> Filter
                  </span>
                </button>
                <button
                  type="submit"
                  className="inpt-btn bg-gr"
                  onMouseDown={intator}
                  onClick={penalty}
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
            style={{ display: lst.data.length <= 0 ? "flex" : "" }}
          >
            {lst.data.length <= 0 ? (
              <div className="nrc-con">
                <img src="/icons/nrec.png" alt="" />
                <p className="nrc-txt">No Payment Records found</p>
              </div>
            ) : (
              <table className="cstm-tbl">
                <thead>
                  <tr>
                    <td>Operator Id</td>
                    <td>Booking Id</td>
                    <td>Amount</td>
                    <td>#</td>
                  </tr>
                </thead>
                <tbody>
                  {lst.data.map((itm, i) => {
                    return (
                      <tr key={i}>
                        <td name="Operator Id">{itm.operatorid}</td>
                        <td name="Booking Id">{itm.bookingid}</td>
                        <td name="Amount">{itm.amount}</td>
                        <td>
                          <button
                            className="ctl-btn"
                            onClick={() => {
                              setdtl({
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
                onClick={penalty}
              >
                Previous
              </button>
              <div>{lst.pag}</div>
              <button
                onMouseDown={() => {
                  handellst(true);
                }}
                onClick={penalty}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
      {dtl.display ? (
        <div className="sml-dtl">
          <div className="sml-dtlbx">
            <div className="dtl-hd" style={{ display: "block" }}>
              <div
                className="clsr"
                style={{ float: "right" }}
                onClick={() => {
                  setdtl({
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
                  <td>{dtl.bookingid}</td>
                </tr>
                <tr>
                  <td>Operator Id</td>
                  <td>{dtl.operatorid}</td>
                </tr>
                <tr>
                  <td>Phone</td>
                  <td>
                    <a href={"tel:+91".concat(dtl.phone)} className="blu-links">
                      {dtl.phone}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>Amount</td>
                  <td>₹ {dtl.amount}</td>
                </tr>
                <tr>
                  <td>Reason</td>
                  <td>{dtl.reason}</td>
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
    </>
  );
};

export default Penalty;
