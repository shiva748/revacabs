import React, { useState, useEffect } from "react";
import "./css/Coustumer.css";
import { AiOutlineClear } from "react-icons/ai";
import { ImSearch } from "react-icons/im";
import Dataload from "../templates/Loading/Dataload";
import validator from "validator";
import Cstmrdtl from "../templates/cstmrdtl/Cstmrdtl";
import { Helmet } from "react-helmet";
const Coustumer = () => {
  const df = { email: "", phone: "", status: "" };
  const [lst, setlst] = useState({ entry: "10", pag: 1, data: [] });
  const [filter, setfilter] = useState(df);
  const [dtl, setdtl] = useState({ display: false, email: "", phone: "" });
  let name, value;
  const handelfilter = (e) => {
    name = e.target.name;
    value = e.target.value;
    setfilter({ ...filter, [name]: value });
  };
  const handellst = (type) => {
    let pag = lst.pag;
    if (
      lst.flt.email !== filter.email ||
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
  const client = async () => {
    const { email, phone, status } = filter;
    let { entry, pag } = lst;
    if (!entry || isNaN(entry) || typeof pag !== "number") {
      return alert("Invalid request");
    }
    if (lst.prv) {
      if (entry === lst.prv.entry && pag === lst.prv.pag) {
        return;
      }
    }
    if (email) {
      if (typeof email !== "string" || !validator.isEmail(email)) {
        return alert("Invalid email");
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
        !["authorised", "unauthorised", "blocked"].some((itm) => itm === status)
      ) {
        return alert("Invalid status ");
      }
    }
    setprcs(true);
    const result = await fetch("/oceannodes/client", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        entry: entry * 1,
        pag,
        email,
        phone,
        status,
      }),
    });
    const data = await result.json();
    if (result.status === 200) {
      setlst({
        ...lst,
        data: data,
        prv: { pag, entry },
        flt: { email, phone, status },
      });
    } else {
      alert(data);
      setlst({
        ...lst,
        data: [],
        prv: { pag, entry },
        flt: { email, phone, status },
      });
    }
    setprcs(false);
  };
  const intator = () => {
    if (lst.flt) {
      const { email, phone, status } = lst.flt;
      if (
        email !== filter.email ||
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
    client();
    // eslint-disable-next-line
  }, []);
  const [prcs, setprcs] = useState(true);
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
                    name="email"
                    className="fltr-input"
                    placeholder="Email"
                    autoComplete="off"
                    onChange={handelfilter}
                    value={filter.email}
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
                    <option value="unauthorised">Unauthorised</option>
                    <option value="authorised">authorised</option>
                    <option value="blocked">Blocked</option>
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
                  onClick={client}
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
                <p className="nrc-txt">No client found</p>
              </div>
            ) : (
              <table className="cstm-tbl">
                <thead>
                  <tr>
                    <td>Id</td>
                    <td>Name</td>
                    <td>Email</td>
                    <td>#</td>
                  </tr>
                </thead>
                <tbody>
                  {lst.data.map((itm, i) => {
                    return (
                      <tr key={i}>
                        <td name="id">{itm.id}</td>
                        <td name="email">
                          {itm.firstName
                            .charAt(0)
                            .toUpperCase()
                            .concat(
                              itm.firstName.length <= 6
                                ? itm.firstName.slice(1)
                                : itm.firstName.slice(1, 6).concat("..")
                            )}
                        </td>
                        <td name="email">
                          <span className="blu-links">{itm.email}</span>
                        </td>
                        <td>
                          <button
                            className="ctl-btn"
                            onClick={() => {
                              setdtl({
                                display: true,
                                email: itm.email,
                                phone: itm.phone,
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
                onClick={client}
              >
                Previous
              </button>
              <div>{lst.pag}</div>
              <button
                onMouseDown={() => {
                  handellst(true);
                }}
                onClick={client}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
      {dtl.display ? <Cstmrdtl dtl={dtl} setdtl={setdtl} /> : ""}
    </>
  );
};

export default Coustumer;
