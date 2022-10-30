import React, { useState, useEffect } from "react";
import { states } from "./config/State";
import { AiOutlineClear } from "react-icons/ai";
import { ImSearch, ImLocation, ImLocation2 } from "react-icons/im";
import { MdOutlineAddLocationAlt } from "react-icons/md";
import { FaTimes } from "react-icons/fa";
import Dataload from "../templates/Loading/Dataload";
import Citydtl from "../templates/servicesdtl/Citydtl";
import { Helmet } from "react-helmet";
const City = () => {
  const df = { cty: "", ctycode: "", status: "" };
  const [lst, setlst] = useState({ entry: "10", pag: 1, data: [] });
  const [filter, setfilter] = useState(df);
  const [dtl, setdtl] = useState({ display: false, cty: "", ctycode: "" });
  const [autoco, setautoco] = useState({ display: false, sugge: [] });
  const [prcs, setprcs] = useState(false);
  const da = {
    display: false,
    cty: "",
    state: "",
    longlat: "",
  };
  const [add, setadd] = useState(da);
  let name, value;
  const handelfilter = (e) => {
    name = e.target.name;
    value = e.target.value;
    setfilter({ ...filter, [name]: value });
  };

  const handellst = (type) => {
    let pag = lst.pag;
    if (
      lst.flt.cty !== filter.cty ||
      lst.flt.ctycode !== filter.ctycode ||
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

  const handeladd = (e) => {
    name = e.target.name;
    value = e.target.value;
    setadd({ ...add, [name]: value });
  };

  // === === === auto complete === === === //

  const autocomplete = async (e) => {
    const cty = e.target.value;
    if (cty.length <= 0) {
      return;
    }
    const res = await fetch("/oceannodes/service/city", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        entry: "10",
        pag: "1",
        cty,
        typ: "lst",
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

  // === === === city loader === === === //

  const citylstr = async (bypass) => {
    const { cty, ctycode } = filter;
    let { entry, pag } = lst;
    if (!entry || isNaN(entry) || typeof pag !== "number") {
      return alert("Invalid request");
    }
    if (lst.prv && bypass !== true) {
      if (entry === lst.prv.entry && pag === lst.prv.pag) {
        return;
      }
    }
    if (cty) {
      if (typeof cty !== "string") {
        return alert("Invalid city");
      }
    }
    if (ctycode) {
      if (typeof ctycode !== "string") {
        return alert("Invalid request");
      }
    }

    setprcs(true);
    const result = await fetch("/oceannodes/service/city", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        entry: entry,
        pag: pag.toString(),
        cty,
        ctycode: ctycode,
        typ: "lst",
      }),
    });
    const data = await result.json();
    if (result.status === 200) {
      setlst({
        ...lst,
        data: data,
        prv: { pag, entry },
        flt: { cty, ctycode },
      });
    } else {
      alert(data);
      setlst({
        ...lst,
        data: [],
        prv: { pag, entry },
        flt: { cty, ctycode },
      });
    }
    setprcs(false);
  };

  // === === === city loader end === === === //

  const intator = () => {
    if (lst.flt) {
      const { cty, ctycode } = lst.flt;
      if (
        cty !== filter.cty ||
        ctycode !== filter.ctycode ||
        lst.prv.entry !== lst.entry
      ) {
        return setlst({ ...lst, pag: 1, prv: {} });
      }
    }
    setlst({ ...lst, prv: {} });
  };
  useEffect(() => {
    citylstr();
    // eslint-disable-next-line
  }, []);

  // === === === add city === === === //

  const addcty = async () => {
    const { cty, state, longlat } = add;
    if (
      !cty ||
      !state ||
      !longlat ||
      typeof cty !== "string" ||
      typeof state !== "string" ||
      typeof longlat !== "string"
    ) {
      return alert("invaid request");
    }
    const result = await fetch("/oceannodes/service/city/add", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        city: cty,
        state,
        longlat,
      }),
    });
    const data = await result.json();
    if (result.status === 201) {
      alert("Added successfully");
      setadd(da);
      citylstr(true);
    } else {
      alert(data);
    }
  };
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>City - RevaCabs </title>
        <meta name="description" content="Manage citys" />
        <link rel="canonical" href="http://partner.revacabs.com/" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      {prcs ? (
        <Dataload />
      ) : dtl.display ? (
        <Citydtl dtl={dtl} setdtl={setdtl} citylstr={citylstr} />
      ) : (
        <div className="comp-con">
          <div className="fltr-con">
            <div className="sub-fltr">
              <div className="sub-fltrprtn">
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="cty"
                    className="fltr-input"
                    placeholder="Enter city"
                    autoComplete="off"
                    onKeyUp={autocomplete}
                    onChange={handelfilter}
                    value={filter.cty}
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
                                setlst({
                                  ...lst,
                                  data: [itm],
                                  prv: { entry: "10", pag: 1 },
                                  entry: "10",
                                  pag: 1,
                                  flt: {
                                    cty: itm.cityname,
                                    ctycode: itm.citycode,
                                  },
                                });
                                setfilter({
                                  ...filter,
                                  // eslint-disable-next-line
                                  ["cty"]: itm.cityname,
                                  // eslint-disable-next-line
                                  ["ctycode"]: itm.citycode,
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
                  <input
                    type="number"
                    name="ctycode"
                    className="fltr-input hdwebkit"
                    placeholder="City code"
                    autoComplete="off"
                    onChange={handelfilter}
                    value={filter.ctycode}
                  />
                </div>
              </div>
            </div>
            <div className="sub-fltr">
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
                  onClick={citylstr}
                >
                  <span>
                    <ImSearch /> Search
                  </span>
                </button>
              </div>
              <div className="sub-fltrprtn">
                <button
                  className="inpt-btn bg-bl"
                  onClick={() => setadd({ ...add, display: true })}
                >
                  <span>
                    <MdOutlineAddLocationAlt /> Add City
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
                <p className="nrc-txt">No Cars found</p>
              </div>
            ) : (
              <table className="cstm-tbl">
                <thead>
                  <tr>
                    <td>Name</td>
                    <td>Code</td>
                    <td>On Map</td>
                    <td>#</td>
                  </tr>
                </thead>
                <tbody>
                  {lst.data.map((itm, i) => {
                    return (
                      <tr key={i}>
                        <td name="Name">{itm.cityname}</td>
                        <td name="Code">{itm.citycode}</td>
                        <td name="On map">
                          <a
                            className="blu-links"
                            target="_blank"
                            rel="noreferrer"
                            href={"https://www.google.com/maps/place/".concat(
                              itm.longlat
                            )}
                          >
                            <ImLocation /> View
                          </a>
                        </td>
                        <td>
                          <button
                            className="ctl-btn"
                            onClick={() => {
                              setdtl({
                                display: true,
                                cty: itm.cityname,
                                ctycode: itm.citycode,
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
                onClick={citylstr}
              >
                Previous
              </button>
              <div>{lst.pag}</div>
              <button
                onMouseDown={() => {
                  handellst(true);
                }}
                onClick={citylstr}
              >
                Next
              </button>
            </div>
          </div>
          {add.display ? (
            <div className="sml-dtl">
              {prcs ? (
                <Dataload style={{ height: "100%" }} />
              ) : (
                <div className="sml-dtlbx">
                  <div className="dtl-hd">
                    Add city
                    <div
                      className="clsr"
                      onClick={() => {
                        setadd({ display: false });
                      }}
                    >
                      <FaTimes />
                    </div>
                  </div>
                  <div className="inpt-row" style={{ margin: "8px 5%" }}>
                    <span className="edt-span">City</span>
                    <input
                      type="text"
                      name="cty"
                      placeholder="City"
                      className="edt-inpt"
                      onChange={handeladd}
                      value={add.city}
                    />
                  </div>
                  <div className="inpt-row" style={{ margin: "8px 5%" }}>
                    <span className="edt-span">State</span>
                    <select
                      name="state"
                      className="edt-inpt"
                      onChange={handeladd}
                      value={add.state}
                    >
                      <option value="">Select State</option>
                      {states.map((itm, i) => {
                        return (
                          <option key={i} value={itm}>
                            {itm}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="inpt-row" style={{ margin: "8px 5%" }}>
                    <span className="edt-span">Long and Lat</span>
                    <input
                      type="text"
                      name="longlat"
                      className="edt-inpt"
                      placeholder="State"
                      onChange={handeladd}
                      value={add.longlat}
                    />
                  </div>
                  <div className="inpt-row" style={{ margin: "8px 5%" }}>
                    <button
                      type="submit"
                      className="ctl-btn"
                      style={{ margin: "auto" }}
                      onClick={addcty}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            ""
          )}
        </div>
      )}
    </>
  );
};

export default City;
