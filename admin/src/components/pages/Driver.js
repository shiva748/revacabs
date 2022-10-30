import React, { useState, useEffect } from "react";
import { AiOutlineClear } from "react-icons/ai";
import { ImSearch } from "react-icons/im";
import Dataload from "../templates/Loading/Dataload";
import Drvrdtl from "../templates/oprtrdtl/Drvrdtl";
import { Helmet } from "react-helmet";
const Driver = () => {
  const df = { oprtrid: "", drvrid: "", status: "" };
  const [lst, setlst] = useState({ entry: "10", pag: 1, data: [] });
  const [filter, setfilter] = useState(df);
  const [dtl, setdtl] = useState({ display: false, drvrid: "" });
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
      lst.flt.drvrid !== filter.drvrid ||
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
  const drivers = async () => {
    const { oprtrid, drvrid, status } = filter;
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
    if (drvrid) {
      if (typeof drvrid !== "string") {
        return alert("Invalid phone");
      }
    }
    if (status) {
      if (
        typeof status !== "string" ||
        ![
          "pending",
          "verified",
          "locked",
          "Active",
          "Suspended",
          "Inactive",
          "Dispute",
          "OnDuty",
        ].some((itm) => itm === status)
      ) {
        return alert("Invalid status ");
      }
    }
    setprcs(true);
    const result = await fetch("/oceannodes/operator/driver", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        entry: entry * 1,
        pag,
        oprtrid,
        drvrid,
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
        flt: { oprtrid, drvrid, status },
      });
    } else {
      alert(data);
      setlst({
        ...lst,
        data: [],
        prv: { pag, entry },
        flt: { oprtrid, drvrid, status },
      });
    }
    setprcs(false);
  };
  const intator = () => {
    if (lst.flt) {
      const { oprtrid, drvrid, status } = lst.flt;
      if (
        oprtrid !== filter.oprtrid ||
        drvrid !== filter.drvrid ||
        status !== filter.status ||
        lst.prv.entry !== lst.entry
      ) {
        return setlst({ ...lst, pag: 1, prv: {} });
      }
    }
    setlst({ ...lst, prv: {} });
  };
  useEffect(() => {
    drivers();
    // eslint-disable-next-line
  }, []);
  const [prcs, setprcs] = useState(true);
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Drivers - RevaCabs </title>
        <meta name="description" content="Magage Drivers" />
        <link rel="canonical" href="http://partner.revacabs.com/" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      {prcs ? (
        <Dataload />
      ) : dtl.display ? (
        <Drvrdtl dtl={dtl} setdtl={setdtl} />
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
                    name="drvrid"
                    className="fltr-input"
                    placeholder="Driver id"
                    autoComplete="off"
                    onChange={handelfilter}
                    value={filter.drvrid}
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
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="locked">locked</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Dispute">Dispute</option>
                    <option value="OnDuty">OnDuty</option>
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
                  onClick={drivers}
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
                    <td>Operated by</td>
                    <td>Name</td>
                    <td>Driver id</td>
                    <td>#</td>
                  </tr>
                </thead>
                <tbody>
                  {lst.data.map((itm, i) => {
                    return (
                      <tr key={i}>
                        <td name="Operated by">
                          {itm.operatedby ? itm.operatedby : "N/A"}
                        </td>
                        <td name="Name">
                          {itm.firstName
                            .charAt(0)
                            .toUpperCase()
                            .concat(
                              itm.firstName.slice(1) + ` ${itm.lastName}`
                            )}
                        </td>
                        <td name="Driver id">{itm.driverid}</td>
                        <td>
                          <button
                            className="ctl-btn"
                            onClick={() => {
                              setdtl({
                                display: true,
                                drvrid: itm.driverid,
                                oprtrid: itm.operatedby,
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
                onClick={drivers}
              >
                Previous
              </button>
              <div>{lst.pag}</div>
              <button
                onMouseDown={() => {
                  handellst(true);
                }}
                onClick={drivers}
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

export default Driver;
