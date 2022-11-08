import React, { useState, useEffect } from "react";
import Dataload from "../Loading/Dataload";
import { FiRefreshCw } from "react-icons/fi";
import { TiArrowBackOutline } from "react-icons/ti";
import { ImLocation } from "react-icons/im";
import { states } from "../../pages/config/State";
import { FaTimes } from "react-icons/fa";

const Citydtl = (recived) => {
  const setdtl = recived.setdtl;
  const dtl = recived.dtl;
  const [itm, setitm] = useState();
  const [prcs, setprcs] = useState(true);
  const [optn, setoptn] = useState({ tdl: "updt" });
  const { cty, ctycode } = dtl;
  const [updtd, setupdtd] = useState();
  const da = {
    display: false,
    prcs: false,
    nme: "",
    longlat: "",
    localitycode: "",
    actn: "",
  };
  const [add, setadd] = useState(da);
  let name, value;
  const handeladd = (e) => {
    name = e.target.name;
    value = e.target.value;
    setadd({ ...add, [name]: value });
  };
  const lstcty = recived.citylstr;
  const citylstr = async (bypass) => {
    setprcs(true);
    console.log(cty, ctycode);
    const result = await fetch("/oceannodes/service/city", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        entry: "1",
        pag: "1",
        cty,
        ctycode,
        typ: "dtl",
      }),
    });
    const data = await result.json();
    if (result.status === 200) {
      setitm(data[0]);
      setupdtd({
        cty: data[0].cityname.split(",")[0],
        state: data[0].cityname.split(",")[1].slice(1),
        longlat: data[0].longlat,
      });
    } else {
      setdtl({ display: false, cityname: "", citycode: "" });
    }
    setprcs(false);
  };
  useEffect(() => {
    citylstr();
    // eslint-disable-next-line
  }, []);

  const handelupdtd = (e) => {
    name = e.target.name;
    value = e.target.value;
    setupdtd({ ...updtd, [name]: value });
  };

  const update = async () => {
    let { cty, state, longlat } = updtd;
    if (
      !cty ||
      !state ||
      !longlat ||
      typeof longlat !== "string" ||
      typeof state !== "string" ||
      typeof cty !== "string" ||
      !states.some((itm) => itm === state)
    ) {
      return alert("Please fill all the fields");
    }
    cty = cty.charAt(0).toUpperCase().concat(cty.slice(1));
    let updt = {};
    if (cty !== itm.cityname.split(",")[0]) {
      updt = { ...updt, city: cty, state };
    }
    if (state !== itm.cityname.split(",")[1].slice(1)) {
      updt = { ...updt, city: cty, state };
    }
    if (longlat !== itm.longlat) {
      updt = { ...updt, longlat };
    }
    updt = { ...updt, code: itm.citycode };
    setprcs(true);
    const result = await fetch("/oceannodes/service/city/update", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(updt),
    });
    const data = await result.json();
    if (result.status === 201) {
      alert("update successfull");
      setdtl({ display: false, cty: "", ctycode: "" });
      lstcty(true);
    } else {
      alert(data);
    }
    setprcs(false)
  };

  // === === === locality === === === //
  const locality = async () => {
    let { nme, longlat, actn, localitycode } = add;
    if (
      !nme ||
      !actn ||
      !longlat ||
      typeof longlat !== "string" ||
      typeof nme !== "string" ||
      typeof actn !== "string" ||
      !["upd", "add"].some((itm) => itm === actn)
    ) {
      return alert("Please fill all the fields");
    }
    let updt = {};
    if (actn === "upd") {
      if (!localitycode || typeof localitycode !== "string") {
        return alert("invalid reuest");
      }
      updt = { ...updt, localitycode };
    }
    updt = {
      ...updt,
      name: nme,
      longlat,
      citycode: itm.citycode,
      cityname: itm.cityname,
      actn,
    };
    setprcs(true);
    const result = await fetch("/oceannodes/service/city/locality", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(updt),
    });
    const data = await result.json();
    if (result.status === 201) {
      alert("update successfull");
      setadd(da);
      citylstr();
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
            City
            <div>
              <button
                className="dtl-clsr"
                style={{ backgroundColor: "lightgreen", margin: "0px 5px" }}
                onClick={citylstr}
              >
                <FiRefreshCw />
              </button>
              <button
                className="dtl-clsr"
                onClick={() => {
                  setdtl({ display: false, cty: "", ctycode: "" });
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
                  <td>City</td>
                  <td>{itm.cityname}</td>
                </tr>
                <tr>
                  <td>City Code</td>
                  <td>{itm.citycode}</td>
                </tr>
                <tr>
                  <td>On Map</td>
                  <td>
                    <a
                      className="blu-links"
                      rel="noreferrer"
                      target="_blank"
                      href={"https://www.google.com/maps/place/".concat(
                        itm.longlat
                      )}
                    >
                      <ImLocation /> View
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>Locality Count</td>
                  <td>{itm.localitycount ? itm.localitycount : 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bkng-optn">
            <div
              className={
                optn.tdl === "updt"
                  ? "optn-itm optn-actv ovrly-ad"
                  : "optn-itm ovrly-ad"
              }
              onClick={() => {
                setoptn({ tdl: "updt" });
              }}
            >
              Update
            </div>
            <div
              className={
                optn.tdl === "lclty"
                  ? "optn-itm optn-actv ovrly-ad"
                  : "optn-itm ovrly-ad"
              }
              onClick={() => {
                setoptn({ tdl: "lclty" });
              }}
            >
              Locality
            </div>
          </div>
          {optn.tdl === "updt" ? (
            <div className="bkngedt-con">
              <div className="bkng-edthd">Update</div>
              <table className="frm-tbl">
                <tbody>
                  <tr>
                    <td>City code</td>
                    <td>{itm.citycode}</td>
                  </tr>
                  <tr>
                    <td>City</td>
                    <td>
                      <input
                        type="text"
                        name="cty"
                        className="frm-tblinp"
                        value={updtd.cty}
                        onChange={handelupdtd}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>State</td>
                    <td>
                      <select
                        name="state"
                        value={updtd.state}
                        className="frm-tblinp"
                        onChange={handelupdtd}
                      >
                        {states.map((itm, i) => {
                          return (
                            <option value={itm} key={i}>
                              {itm}
                            </option>
                          );
                        })}
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td>Longlat</td>
                    <td>
                      <input
                        type="text"
                        name="longlat"
                        value={updtd.longlat}
                        className="frm-tblinp"
                        onChange={handelupdtd}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="inpt-row">
                <button
                  className="ctl-btn"
                  style={{ margin: "auto" }}
                  onClick={update}
                >
                  Update
                </button>
              </div>
            </div>
          ) : (
            ""
          )}
          {optn.tdl === "lclty" ? (
            <div className="bkngedt-con">
              <div className="bkng-edthd">
                Locality{" "}
                <button
                  className="dtl-clsr"
                  style={{
                    padding: "0px 5px",
                    width: "100px",
                    position: "absolute",
                    right: "10px",
                  }}
                  onClick={() => setadd({ ...add, display: true, actn: "add" })}
                >
                  Add locality
                </button>
              </div>
              <div style={{ padding: "0px 2%" }}>
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
                    {itm.locality.map((itm) => {
                      return (
                        <tr>
                          <td name="Name">{itm.name}</td>
                          <td name="Code">{itm.code}</td>
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
                                setadd({
                                  display: true,
                                  actn: "upd",
                                  nme: itm.name,
                                  longlat: itm.longlat,
                                  localitycode: itm.code,
                                });
                              }}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {itm.locality.length <= 0 ? (
                <div className="nrc-con">
                  <img src="/icons/nrec.png" alt="" />
                  <p className="nrc-txt">No locality found</p>
                </div>
              ) : (
                ""
              )}
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
                            setadd(da);
                          }}
                        >
                          <FaTimes />
                        </div>
                      </div>
                      <div className="inpt-row" style={{ margin: "8px 5%" }}>
                        <span className="edt-span">Locality Name</span>
                        <input
                          type="text"
                          name="nme"
                          placeholder="Locality"
                          className="edt-inpt"
                          value={add.nme}
                          onChange={handeladd}
                        />
                      </div>
                      <div className="inpt-row" style={{ margin: "8px 5%" }}>
                        <span className="edt-span">LAT/LONG</span>
                        <input
                          type="text"
                          name="longlat"
                          className="edt-inpt"
                          placeholder="LAT/LONG"
                          value={add.longlat}
                          onChange={handeladd}
                        />
                      </div>
                      <div className="inpt-row" style={{ margin: "8px 5%" }}>
                        <button
                          type="submit"
                          className="ctl-btn"
                          style={{ margin: "auto" }}
                          onClick={locality}
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
          ) : (
            ""
          )}
        </div>
      )}
    </>
  );
};

export default Citydtl;
