import React, { useState, useEffect } from "react";
import "./css/Coustumer.css";
import { AiOutlineClear } from "react-icons/ai";
import { FaTimes } from "react-icons/fa";
import { ImSearch } from "react-icons/im";
import Dataload from "../templates/Loading/Dataload";
import { Helmet } from "react-helmet";
const Payment = () => {
  const df = { id: "", rsn: "booking advance", status: "" };
  const [lst, setlst] = useState({ entry: "10", pag: 1, data: [] });
  const [filter, setfilter] = useState(df);
  let dfd = {
    display: false,
    orderid: "",
    status: "",
    amount: "",
    operatorid: "",
    reason: "",
    rzp_orderid: "",
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
      lst.flt.id !== filter.id ||
      lst.flt.rsn !== filter.rsn ||
      lst.flt.status !== filter.status ||
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
  const payment = async (bypass) => {
    const { id, rsn, status } = filter;
    let { entry, pag } = lst;
    if(bypass !== true){
    if (
      !entry ||
      isNaN(entry) ||
      typeof pag !== "number" ||
      !rsn ||
      typeof rsn !== "string"
    ) {
      return alert("Invalid request");
    }
    if (lst.prv) {
      if (entry === lst.prv.entry && pag === lst.prv.pag) {
        return;
      }
    }
  }
    if (id) {
      if (typeof id !== "string") {
        return alert("Invalid id");
      }
    }
    if (rsn) {
      if (
        typeof rsn !== "string" ||
        ![
          "booking advance",
          "operator fee",
          "booking balance",
          "penalty payment",
        ].some((itm) => itm === rsn)
      ) {
        return alert("Invalid reason");
      }
    }
    if (status) {
      if (
        typeof status !== "string" ||
        !["received", "created"].some((itm) => itm === status)
      ) {
        return alert("Invalid status ");
      }
    }
    setprcs(true);
    const result = await fetch("/oceannodes/payment", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        entry: entry,
        pag: pag.toString(),
        id,
        rsn,
        status,
      }),
    });
    const data = await result.json();
    if (result.status === 200) {
      setlst({
        ...lst,
        data: data,
        prv: { pag, entry },
        flt: { id, rsn, status },
      });
    } else {
      alert(data);
      setlst({
        ...lst,
        data: [],
        prv: { pag, entry },
        flt: { id, rsn, status },
      });
    }
    setprcs(false);
  };
  const intator = () => {
    if (lst.flt) {
      const { id, rsn, status } = lst.flt;
      if (
        id !== filter.id ||
        rsn !== filter.rsn ||
        status !== filter.status ||
        lst.prv.entry !== lst.entry
      ) {
        return setlst({ ...lst, pag: 1, prv: {} });
      }
    }
    setlst({ ...lst, prv: {} });
  };
  useEffect(() => {
    payment();
    // eslint-disable-next-line
  }, []);
  const [prcs, setprcs] = useState(true);

  // === === === update payment === === === //

  const [updtpmt, setupdtpmt] = useState({ status: "", load:"" });
  const updtpmts = async () => {
    if(updtpmt.load){
      return
    }
    let { status } = updtpmt;
    let { rzp_orderid } = dtl;
    if (
      !rzp_orderid ||
      typeof rzp_orderid !== "string" ||
      !status ||
      typeof status !== "string" ||
      !["created", "received"].some((itm) => itm === status)
    ) {
      return alert("Invalid request");
    }
    setupdtpmt({...updtpmt, load:true})
    const result = await fetch("/oceannodes/payment/update", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        rzp_orderid,
        status,
      }),
    });
    const data = await result.json();
    if (result.status === 201) {
      payment(true);
      setdtl({ dfd });
      setupdtpmt({ status: "", load:false });
      alert(data);
    } else {
      alert(data);
      setupdtpmt({...updtpmt, load:false})
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
                    name="id"
                    className="fltr-input"
                    placeholder={
                      filter.rsn === "booking advance"
                        ? "Booking id"
                        : "Operator id"
                    }
                    autoComplete="off"
                    onChange={handelfilter}
                    value={filter.id}
                  />
                </div>
              </div>
              <div className="sub-fltrprtn">
                <div className="input-wrapper">
                  <select
                    name="rsn"
                    className="fltr-input"
                    onChange={handelfilter}
                    value={filter.rsn}
                  >
                    <option value="booking advance">Booking Advance</option>
                    <option value="operator fee">Operator Fee</option>
                    <option value="booking balance">Booking Balance</option>
                    <option value="penalty payment">Penalty Payment</option>
                  </select>
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
                    <option value="">Select status</option>
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
                  onClick={payment}
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
                    <td>Id</td>
                    <td>Reason</td>
                    <td>Status</td>
                    <td>#</td>
                  </tr>
                </thead>
                <tbody>
                  {lst.data.map((itm, i) => {
                    return (
                      <tr key={i}>
                        <td name="Id">
                          {itm.reason === "booking advance"
                            ? itm.orderid
                            : itm.operatorid}
                        </td>
                        <td name="Reason">
                          {itm.reason
                            .split(" ")[0]
                            .charAt(0)
                            .toUpperCase()
                            .concat(itm.reason.split(" ")[0].slice(1))
                            .concat(
                              " " +
                                itm.reason
                                  .split(" ")[1]
                                  .charAt(0)
                                  .toUpperCase()
                                  .concat(itm.reason.split(" ")[1].slice(1))
                            )}
                        </td>
                        <td name="Status">
                          {itm.status
                            .charAt(0)
                            .toUpperCase()
                            .concat(itm.status.slice(1))}
                        </td>
                        <td>
                          <button
                            className="ctl-btn"
                            onClick={() => {
                              setdtl({
                                display: true,
                                ...itm,
                              });
                              setupdtpmt({ status: itm.status });
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
                onClick={payment}
              >
                Previous
              </button>
              <div>{lst.pag}</div>
              <button
                onMouseDown={() => {
                  handellst(true);
                }}
                onClick={payment}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
      {dtl.display ? (
        <div className={updtpmt.load?"sml-dtl ovrly-ad":"sml-dtl"}>
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
                  <td>
                    {dtl.reason === "booking advance"
                      ? "Order Id"
                      : dtl.reason === "operator fee" ||
                        dtl.reason === "booking balance"
                      ? "Operator Id"
                      : ""}
                  </td>
                  <td>
                    {dtl.reason === "booking advance"
                      ? dtl.orderid
                      : dtl.reason === "operator fee" ||
                        dtl.reason === "booking balance"
                      ? dtl.operatorid
                      : ""}
                  </td>
                </tr>
                {["booking advance", "booking balance", "penalty payment"].some(
                  (itm) => itm === dtl.reason
                ) ? (
                  <>
                    <tr>
                      <td>Booking Id</td>
                      <td>{dtl.bookingid}</td>
                    </tr>
                  </>
                ) : (
                  ""
                )}
                <tr>
                  <td>Razorpay Id</td>
                  <td>{dtl.rzp_orderid}</td>
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
              <span className="edt-span">Status</span>
              <select
                className="edt-inpt"
                name="Status"
                value={updtpmt.status}
                onChange={(e) => {
                  setupdtpmt({ ...updtpmt, status: e.target.value });
                }}
              >
                <option value="created">Created</option>
                <option value="received">Received</option>
              </select>
            </div>
            <div className="inpt-row">
              <button
                type="submit"
                className={updtpmt.load?"ctl-btn ldng-btn":"ctl-btn"}
                style={{ margin: "auto" }}
                onClick={updtpmts}
              >
                <span>Submit</span>
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

export default Payment;
