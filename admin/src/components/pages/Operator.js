import React, { useState, useEffect } from "react";
import { AiOutlineClear } from "react-icons/ai";
import { ImSearch } from "react-icons/im";
import validator from "validator";
import Dataload from "../templates/Loading/Dataload";
import Oprtrdtl from "../templates/oprtrdtl/Oprtrdtl";
import { Helmet } from "react-helmet";
const Operator = () => {
  const df = { oprtrid: "", phone: "", status: "" };
  const [lst, setlst] = useState({ entry: "10", pag: 1, data: [] });
  const [filter, setfilter] = useState(df);
  const [dtl, setdtl] = useState({ display: false, oprtrid: "", phone: "" });
  let name, value;
  const handelfilter = (e) => {
    name = e.target.name;
    value = e.target.value;
    setfilter({ ...filter, [name]: value });
  };
  const handellst = (type) => {
    let pag = lst.pag;
    if (
      lst.flt.oprtrid !== filter.oprtrid ||
      lst.flt.phone !== filter.phone ||
      lst.flt.status !== filter.status ||
      lst.prv.entry !== lst.entry
    ) {
      console.log("reset");
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
  const operator = async () => {
    const { oprtrid, phone, status } = filter;
    let { entry, pag } = lst;
    if (!entry || isNaN(entry) || typeof pag !== "number") {
      return alert("Invalid request");
    }
    if (lst.prv) {
      if (entry === lst.prv.entry && pag === lst.prv.pag) {
        return;
      }
    }
    if (oprtrid) {
      if (typeof oprtrid !== "string") {
        return alert("Invalid operator id");
      }
    }
    if (phone) {
      if (
        typeof phone !== "string" ||
        !validator.isMobilePhone(phone, "en-IN")
      ) {
        return alert("Invalid phone");
      }
    }
    if (status) {
      if (
        typeof status !== "string" ||
        !["request", "pending", "verified", "locked"].some(
          (itm) => itm === status
        )
      ) {
        return alert("Invalid status ");
      }
    }
    setprcs(true);
    const result = await fetch("/oceannodes/operator", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        entry: entry * 1,
        pag,
        oprtrid,
        phone,
        status,
        typ: "lst",
      }),
    });
    const data = await result.json();
    if (result.status === 200) {
      setlst({
        ...lst,
        data: data,
        prv: { pag, entry },
        flt: { oprtrid, phone, status },
      });
    } else {
      alert(data);
      setlst({
        ...lst,
        data: [],
        prv: { pag, entry },
        flt: { oprtrid, phone, status },
      });
    }
    setprcs(false);
  };
  const intator = () => {
    if (lst.flt) {
      const { oprtrid, phone, status } = lst.flt;
      if (
        oprtrid !== filter.oprtrid ||
        phone !== filter.phone ||
        status !== filter.status ||
        lst.prv.entry !== lst.entry
      ) {
        return setlst({ ...lst, pag: 1, prv: {} });
      }
    }
    setlst({ ...lst, prv: {} });
  };
  useEffect(() => {
    operator();
    // eslint-disable-next-line
  }, []);
  const [prcs, setprcs] = useState(true);
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Operator - RevaCabs </title>
        <meta name="description" content="Manage Operator" />
        <link rel="canonical" href="http://partner.revacabs.com/" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      {prcs ? (
        <Dataload />
      ) : dtl.display ? (
        <Oprtrdtl dtl={dtl} setdtl={setdtl} />
      ) : (
        <div className="comp-con">
          <div className="fltr-con">
            <div className="sub-fltr">
              <div className="sub-fltrprtn">
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="oprtrid"
                    className="fltr-input"
                    placeholder="Operator id"
                    autoComplete="off"
                    onChange={handelfilter}
                    value={filter.oprtrid}
                  />
                </div>
              </div>
              <div className="sub-fltrprtn">
                <div className="input-wrapper">
                  <input
                    type="tel"
                    name="phone"
                    className="fltr-input"
                    placeholder="Phone"
                    autoComplete="off"
                    onChange={handelfilter}
                    value={filter.phone}
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
                    <option value="">Select status</option>
                    <option value="request">Request</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="locked">locked</option>
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
                  onClick={operator}
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
                <p className="nrc-txt">No Operator found</p>
              </div>
            ) : (
              <table className="cstm-tbl">
                <thead>
                  <tr>
                    <td>ID</td>
                    <td>Name</td>
                    <td>Phone</td>
                    <td>#</td>
                  </tr>
                </thead>
                <tbody>
                  {lst.data.map((itm, i) => {
                    return (
                      <tr key={i}>
                        <td name="Id">
                          {itm.operatorid ? itm.operatorid : "N/A"}
                        </td>
                        <td name="Name">
                          {itm.firstName
                            .charAt(0)
                            .toUpperCase()
                            .concat(
                              itm.firstName.length <= 6
                                ? itm.firstName.slice(1)
                                : itm.firstName.slice(1, 6).concat("..")
                            )}
                        </td>
                        <td name="Number">
                          <a
                            href={"tel:+91".concat(itm.phone)}
                            className="blu-links"
                          >
                            {itm.phone}
                          </a>
                        </td>
                        <td>
                          <button
                            className="ctl-btn"
                            onClick={() => {
                              setdtl({
                                display: true,
                                phone: itm.phone,
                                oprtrid: itm.operatorid,
                                email: itm.email,
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
                onClick={operator}
              >
                Previous
              </button>
              <div>{lst.pag}</div>
              <button
                onMouseDown={() => {
                  handellst(true);
                }}
                onClick={operator}
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

export default Operator;
