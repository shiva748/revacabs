import React, { useState, useEffect } from "react";
import { AiOutlineClear, AiOutlineArrowRight } from "react-icons/ai";
import { ImSearch, ImLocation, ImLocation2 } from "react-icons/im";
import { MdOutlineAddRoad } from "react-icons/md";
import { FaTimes } from "react-icons/fa";
import Dataload from "../templates/Loading/Dataload";
import Outstationdtl from "../templates/servicesdtl/Outstationdtl";
import { Helmet } from "react-helmet";
const Outstation = () => {
  const df = { cty: "", lstng: "" };
  const [lst, setlst] = useState({ entry: "10", pag: 1, data: [] });
  const [filter, setfilter] = useState(df);
  const [dtl, setdtl] = useState({
    display: false,
    from: "",
    fromcode: "",
    to: "",
    tocode: "",
  });
  const [prcs, setprcs] = useState(false);
  const [autoco, setautoco] = useState({
    display: false,
    addisplay: false,
    addisplay1: false,
    sugge: [],
  });
  const da = {
    display: false,
    from: "",
    fromcode: "",
    fromlonglat: "",
    to: "",
    tocode: "",
    tolonglat: "",
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
      lst.flt.lstng !== filter.lstng ||
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
  // === === === Hourly loader === === === //

  const outstnlstr = async (bypass) => {
    const { cty, lstng } = filter;
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
        return alert("Invalid City id");
      }
    }
    if (lstng) {
      if (
        typeof lstng !== "string" ||
        !["true", "false"].some((itm) => itm === lstng)
      ) {
        return alert("Invalid Listing");
      }
    }
    setprcs(true);
    const result = await fetch("/oceannodes/service/outstation", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        entry: entry,
        pag: pag.toString(),
        cty,
        lstng,
        typ: "lst",
      }),
    });
    const data = await result.json();
    if (result.status === 200) {
      setlst({
        ...lst,
        data: data,
        prv: { pag, entry },
        flt: { cty, lstng },
      });
    } else {
      alert(data);
      setlst({
        ...lst,
        data: [],
        prv: { pag, entry },
        flt: { cty, lstng },
      });
    }
    setprcs(false);
  };

  // === === === Hourly package loader end === === === //

  const intator = () => {
    if (lst.flt) {
      const { cty, lstng } = lst.flt;
      if (
        cty !== filter.cty ||
        lstng !== filter.lstng ||
        lst.prv.entry !== lst.entry
      ) {
        return setlst({ ...lst, pag: 1, prv: {} });
      }
    }
    setlst({ ...lst, prv: {} });
  };
  useEffect(() => {
    outstnlstr();
    // eslint-disable-next-line
  }, []);

  // === === === add package === === === //

  const addpackage = async () => {
    const { from, fromcode, fromlonglat, to, tocode, tolonglat } = add;
    if (
      !from ||
      !fromcode ||
      !fromlonglat ||
      !to ||
      !tocode ||
      !tolonglat ||
      typeof from !== "string" ||
      typeof fromcode !== "string" ||
      typeof fromlonglat !== "string" ||
      typeof to !== "string" ||
      typeof tocode !== "string" ||
      typeof tolonglat !== "string" ||
      isNaN(tocode) ||
      isNaN(fromcode)
    ) {
      return alert("invaid request");
    }
    const result = await fetch("/oceannodes/service/outstation/add", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        fromcode,
        fromlonglat,
        to,
        tocode,
        tolonglat,
      }),
    });
    const data = await result.json();
    if (result.status === 201) {
      alert("Added successfully");
      setadd(da);
      outstnlstr(true);
    } else {
      alert(data);
    }
  };
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
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Outstation Rates - RevaCabs </title>
        <meta name="description" content="Manage Outstation Rates" />
        <link rel="canonical" href="http://partner.revacabs.com/" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      {prcs ? (
        <Dataload />
      ) : dtl.display ? (
        <Outstationdtl dtl={dtl} setdtl={setdtl} outstnlstr={outstnlstr} />
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
                    value={filter.cty}
                    onKeyUp={autocomplete}
                    onChange={handelfilter}
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
                                setfilter({
                                  ...filter,
                                  // eslint-disable-next-line
                                  ["cty"]: itm.cityname,
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
                  <select
                    name="lstng"
                    className="fltr-input"
                    value={filter.lstng}
                    onChange={handelfilter}
                  >
                    <option value="">Select Listing</option>
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
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
                  onClick={outstnlstr}
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
                    <MdOutlineAddRoad /> Add Route
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
                <p className="nrc-txt">No records found</p>
              </div>
            ) : (
              <table className="cstm-tbl">
                <thead>
                  <tr>
                    <td>Route</td>
                    <td>Listing</td>
                    <td>On Map</td>
                    <td>#</td>
                  </tr>
                </thead>
                <tbody>
                  {lst.data.map((itm, i) => {
                    return (
                      <tr key={i}>
                        <td name="Route">
                          <span
                            style={{
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {itm.from.split(",")[0]}
                            <AiOutlineArrowRight />
                            {itm.to.split(",")[0]}
                          </span>
                        </td>
                        <td name="Listing">
                          {itm.list ? "Enabled" : "Disabled"}
                        </td>
                        <td name="Map">
                          <a
                            className="blu-links"
                            rel="noreferrer"
                            target="_blank"
                            href={`https://www.google.com/maps/dir/${itm.fromlonglat}/${itm.tolonglat}`}
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
                                fromcode: itm.fromcode,
                                tocode: itm.tocode,
                                lstng: itm.list ? "true" : "false",
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
                onClick={outstnlstr}
              >
                Previous
              </button>
              <div>{lst.pag}</div>
              <button
                onMouseDown={() => {
                  handellst(true);
                }}
                onClick={outstnlstr}
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
                    Add Route
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
                    <span className="edt-span">Start City</span>
                    <div
                      className="input-wrapper"
                      style={{ width: "50%", minWidth: "190px" }}
                    >
                      <input
                        style={{ width: "100%" }}
                        type="text"
                        name="from"
                        placeholder="Start City"
                        className="edt-inpt"
                        onChange={handeladd}
                        value={add.from}
                        autoComplete="off"
                        onKeyUp={autocomplete}
                        onFocus={() => {
                          // eslint-disable-next-line
                          setautoco({ ...autoco, ["addisplay"]: true });
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            // eslint-disable-next-line
                            setautoco({ ...autoco, ["addisplay"]: false });
                          }, 200);
                        }}
                      />
                      {autoco.addisplay ? (
                        <div className="auto-con">
                          <div className="auto-wrapper">
                            {autoco.sugge.map((itm, i) => {
                              return (
                                <div
                                  key={i}
                                  className="suggestion"
                                  onClick={() => {
                                    setadd({
                                      ...add,
                                      from: itm.cityname,
                                      fromlonglat: itm.longlat,
                                      fromcode: itm.citycode,
                                    });
                                    // eslint-disable-next-line
                                    setautoco({
                                      ...autoco,
                                      addisplay: false,
                                    });
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
                  <div className="inpt-row" style={{ margin: "8px 5%" }}>
                    <span className="edt-span">End City</span>
                    <div
                      className="input-wrapper"
                      style={{ width: "50%", minWidth: "190px" }}
                    >
                      <input
                        style={{ width: "100%" }}
                        type="text"
                        name="to"
                        placeholder="End City"
                        className="edt-inpt"
                        onChange={handeladd}
                        value={add.to}
                        autoComplete="off"
                        onKeyUp={autocomplete}
                        onFocus={() => {
                          // eslint-disable-next-line
                          setautoco({ ...autoco, ["addisplay1"]: true });
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            // eslint-disable-next-line
                            setautoco({ ...autoco, ["addisplay1"]: false });
                          }, 200);
                        }}
                      />
                      {autoco.addisplay1 ? (
                        <div className="auto-con">
                          <div className="auto-wrapper">
                            {autoco.sugge.map((itm, i) => {
                              return (
                                <div
                                  key={i}
                                  className="suggestion"
                                  onClick={() => {
                                    setadd({
                                      ...add,
                                      to: itm.cityname,
                                      tolonglat: itm.longlat,
                                      tocode: itm.citycode,
                                    });
                                    // eslint-disable-next-line
                                    setautoco({
                                      ...autoco,
                                      addisplay: false,
                                    });
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
                  <div className="inpt-row" style={{ margin: "8px 5%" }}>
                    <button
                      type="submit"
                      className="ctl-btn"
                      style={{ margin: "auto" }}
                      onClick={addpackage}
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

export default Outstation;
