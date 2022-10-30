import React, { useState, useEffect } from "react";
import {ImSearch } from "react-icons/im";
import { AiOutlineClear } from "react-icons/ai";
import { FaEye } from "react-icons/fa";
import Dataload from "../templates/Loading/Dataload";
import Hstrydtl from "../templates/bookingdtl/Historydtl";
import Datepicker from "react-datepicker";
import { Helmet } from "react-helmet";
const Tourbkng = () => {
  const [lst, setlst] = useState({ entry: "10", pag: 1, data: [] });
  const handellst = (type) => {
    let pag = lst.pag;
    if (
      lst.flt.type !== filter.type ||
      lst.flt.bkngid !== filter.bkngid ||
      lst.flt.from !== filter.from ||
      lst.prv.fromcode !== lst.fromcode
    ) {
      return setlst({ ...lst, pag: 1, prv: {} });
    }
    if (type) {
      if (blng.length < lst.prv.entry * 1) {
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
      const { date, contact, status } = lst.flt;
      if (
        date !== filter.date ||
        contact !== filter.contact ||
        status !== filter.status ||
        lst.prv.entry !== lst.entry
      ) {
        return setlst({ ...lst, pag: 1, prv: {} });
      }
    }
    setlst({ ...lst, prv: {} });
  };

  const df = {
    date: "",
    status: "",
    contact: "",
  };
  const [filter, setfilter] = useState(df);
  const [blng, setblng] = useState([]);
  const [prcs, setprcs] = useState(true);
  const [dtl, setdtl] = useState({ display: false, id: "" });
  const tourbkng = async () => {
    setprcs(false);
    const { date, status, contact } = filter;
    let { entry, pag } = lst;
    if (!entry || isNaN(entry) || typeof pag !== "number") {
      return alert("Invalid request");
    }
    if (lst.prv) {
      if (entry === lst.prv.entry && pag === lst.prv.pag) {
        return;
      }
    }

    setprcs(true);
    const res = await fetch("/oceannodes/booking/tour", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        entry: entry,
        pag: pag.toString(),
        date,
        contact,
        status,
        tourtyp: "lst",
      }),
    });
    const data = await res.json();
    if (res.status !== 200) {
      setprcs(false);
      return alert("failed to load the bookings");
    } else {
      setlst({
        ...lst,
        prv: { pag, entry },
        flt: { date, contact, status },
      });
      setprcs(false);
      setblng(data);
    }
  };
  useEffect(() => {
    tourbkng();
    // eslint-disable-next-line
  }, []);
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Tour Inquiry & Bookings - RevaCabs </title>
        <meta name="description" content="Manage Tour Inquiry & Bookings" />
        <link rel="canonical" href="http://partner.revacabs.com/" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      {prcs ? (
        <Dataload />
      ) : dtl.display ? (
        <Hstrydtl dtl={dtl} setdtl={setdtl} tourbkng={tourbkng} />
      ) : (
        <>
          <div className="comp-con">
            <div className="fltr-con">
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
                  <div className="input-wrapper">
                    <select
                      name="status"
                      className="fltr-input"
                      onChange={(e) => {
                        setfilter({ ...filter, status: e.target.value });
                      }}
                      value={filter.status}
                    >
                      <option value="">Select Status</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="sub-fltr">
                <div className="sub-fltrprtn">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="contact"
                      className="fltr-input"
                      placeholder="Email or Phone no"
                      value={filter.contact}
                      onChange={(e) => {
                        setfilter({ ...filter, contact: e.target.value });
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
                    onClick={tourbkng}
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
              {blng.map((itm, i) => {
                return (
                  <div className="bkng-crd" key={i}>
                    <div
                      className="bkng-crd-hd crd-txtflx"
                      style={{ justifyContent: "left" }}
                    >
                      Tour
                    </div>
                    <div className="sb-crd">
                      <div className="crd-prtn">
                        <div className="crd-cl">
                          <div className="crd-hd">Email</div>
                          <div className="bold-txt crd-txtflx">{itm.email}</div>
                        </div>
                        <div className="crd-cl">
                          <div className="crd-hd">Phone</div>
                          <div className="bold-txt crd-txtflx">{itm.phone}</div>
                        </div>
                      </div>
                      <div className="crd-prtn">
                        <div className="crd-cl">
                          <div className="crd-hd">Date</div>
                          <div className="bold-txt crd-txtflx">
                            {new Date(itm.startdate).toLocaleDateString(
                              "en-IN"
                            )}
                          </div>
                        </div>
                        <div className="crd-cl">
                          <div className="crd-hd">Member</div>
                          <div className="bold-txt crd-txtflx">
                            <span className="blu-links">{itm.person}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="gv-con">
                      <button
                        className="gv-btn icn-btn"
                        onClick={() => {
                          setdtl({ display: true });
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
              {blng.length <= 0 ? (
                <div className="nrc-con">
                  <img src="/icons/nrec.png" alt="" />
                  <p className="nrc-txt">No booking need to be billed</p>
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
                  onClick={tourbkng}
                >
                  Previous
                </button>
                <div>{lst.pag}</div>
                <button
                  onMouseDown={() => {
                    handellst(true);
                  }}
                  onClick={tourbkng}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Tourbkng;
