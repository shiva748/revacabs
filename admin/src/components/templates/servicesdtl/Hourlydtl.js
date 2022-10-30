import React, { useState, useEffect } from "react";
import Dataload from "../Loading/Dataload";
import { FiRefreshCw } from "react-icons/fi";
import { TiArrowBackOutline } from "react-icons/ti";
import { ImLocation } from "react-icons/im";
import "./Hrlydtl.css";

const Hourlydtl = (recived) => {
  const setdtl = recived.setdtl;
  const dtl = recived.dtl;
  const mainlstr = recived.hrlylstr;
  const [itm, setitm] = useState();
  const [prcs, setprcs] = useState(true);
  const [optn, setoptn] = useState({ tdl: "lst" });
  const { cty, lstng } = dtl;
  const [pkgd, setpkgd] = useState({ display: false, data: {} });
  const [upd, setupd] = useState({ lstng: "" });
  const da = {
    display: false,
    prcs: false,
    actn: "",
    name: "",
    eqvcab: "false",
    pakg: "",
    regamt: "",
    totalamt: "",
    gst: "false",
    driverad: "false",
    adv: "true",
    avil: "false",
    oprtramt: "",
    minbd: "",
    bsfr: "",
  };
  const [add, setadd] = useState(da);
  let name, value;
  const hrlylstr = async (bypass) => {
    setprcs(true);
    const result = await fetch("/oceannodes/service/hourlypackage", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        entry: "1",
        pag: "1",
        cty,
        lstng,
        typ: "dtl",
      }),
    });
    const data = await result.json();
    if (result.status === 200) {
      setitm(data[0]);
      setupd({ lstng: data[0].list ? "true" : "false" });
    } else {
      setdtl({ display: false, cty: "", lstng: "" });
    }
    setprcs(false);
  };
  const hrlyupd = async () => {
    const { lstng } = upd;
    const cty = itm.from;
    const ctycode = itm.fromcode;
    const longlat = itm.longlat;
    if (
      !cty ||
      !ctycode ||
      !longlat ||
      !lstng ||
      typeof cty !== "string" ||
      typeof ctycode !== "string" ||
      typeof longlat !== "string" ||
      typeof lstng !== "string" ||
      !["true", "false"].some((itm) => itm === lstng)
    ) {
      return alert("invalid request");
    }
    const result = await fetch("/oceannodes/service/hourlypackage/update", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        cty,
        lstng,
        ctycode,
        longlat,
      }),
    });
    const data = await result.json();
    if (result) {
      alert(data);
      setdtl({ display: false });
      return mainlstr(true);
    } else {
      alert("Failed");
    }
  };
  const addpackage = async () => {
    const {
      actn,
      name,
      eqvcab,
      pakg,
      regamt,
      totalamt,
      gst,
      driverad,
      adv,
      avil,
      oprtramt,
      minbd,
      bsfr,
    } = add;
    const result = await fetch("/oceannodes/service/hourlypackage/add", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        city: itm.from,
        citycode: itm.fromcode,
        longlat: itm.longlat,
        actn,
        name,
        eqvcab,
        pakg,
        regamt: regamt * 1,
        totalamt: totalamt * 1,
        gst,
        driverad,
        adv,
        avil,
        oprtramt: oprtramt * 1,
        minbd: minbd * 1,
        bsfr: bsfr * 1,
      }),
    });
    const data = await result.json();
    if (result.status === 201) {
      alert("Success");
      hrlylstr();
      setadd(da);
    } else {
      alert(data);
    }
  };
  useEffect(() => {
    hrlylstr();
    listcar();
    // eslint-disable-next-line
  }, []);
  const [cabmod, setcabmod] = useState([]);
  const listcar = async () => {
    const result = await fetch("/oceannodes/service/cabmodel", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        typ: "sugg",
      }),
    });
    const data = await result.json();
    if (result.status === 200) {
      setcabmod(data);
    }
  };
  const handelpkg = (e) => {
    name = e.target.name;
    value = e.target.value;
    setadd({ ...add, [name]: value });
  };
  const handelpkgad = (data) => {
    if (!itm.results.some((itm) => itm === data)) {
      setadd({ ...add, display: true, actn: "nw" });
    } else {
      setadd({
        display: true,
        prcs: false,
        actn: "edt",
        name: data.name,
        eqvcab: data.equivalent.isequi ? "true" : "false",
        pakg:
          data.distance === 40
            ? "typ1"
            : data.distance === 80
            ? "typ2"
            : data.distance === 120
            ? "typ3"
            : "",
        regamt: data.regularamount,
        totalamt: data.totalpayable,
        gst: data.othercharges.GST.isinclude ? "true" : "false",
        driverad: data.othercharges.Driveraid.isinclude ? "true" : "false",
        adv: data.zero ? "true" : "false",
        avil: data.isavilable ? "true" : "false",
        oprtramt: data.oprtramt,
        minbd: data.minchrg,
        bsfr: data.basefare,
      });
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
                onClick={hrlylstr}
              >
                <FiRefreshCw />
              </button>
              <button
                className="dtl-clsr"
                onClick={() => {
                  setdtl({ display: false, cty: "", lstng: "" });
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
                  <td>{itm.from}</td>
                </tr>
                <tr>
                  <td>City Code</td>
                  <td>{itm.fromcode}</td>
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
                  <td>Total package</td>
                  <td>{itm.count ? itm.count : 0}</td>
                </tr>
                <tr>
                  <td>Listing</td>
                  <td>{itm.list ? "Enabled" : "Disabled"}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bkng-optn">
            <div
              className={
                optn.tdl === "lst"
                  ? "optn-itm optn-actv ovrly-ad"
                  : "optn-itm ovrly-ad"
              }
              onClick={() => {
                setoptn({ tdl: "lst" });
              }}
            >
              Listing
            </div>
            <div
              className={
                optn.tdl === "pkg"
                  ? "optn-itm optn-actv ovrly-ad"
                  : "optn-itm ovrly-ad"
              }
              onClick={() => {
                setoptn({ tdl: "pkg" });
              }}
            >
              Package
            </div>
          </div>
          {optn.tdl === "lst" ? (
            <div className="bkngedt-con">
              <div className="bkng-edthd">Listing</div>
              <table className="frm-tbl">
                <tbody>
                  <tr>
                    <td>Listing</td>
                    <td>
                      <select
                        name="lst"
                        className="frm-tblinp"
                        value={upd.lstng}
                        onChange={(e) => {
                          setupd({ lstng: e.target.value });
                        }}
                      >
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="inpt-row">
                <button
                  class="ctl-btn"
                  style={{ margin: "auto" }}
                  onClick={hrlyupd}
                >
                  Update
                </button>
              </div>
            </div>
          ) : (
            ""
          )}
          {optn.tdl === "pkg" ? (
            <div className="bkngedt-con">
              <div className="bkng-edthd">
                Hourly Rental
                <button
                  className="dtl-clsr"
                  style={{
                    padding: "0px 5px",
                    width: "100px",
                    position: "absolute",
                    right: "10px",
                  }}
                  onClick={handelpkgad}
                >
                  Add package
                </button>
              </div>
              <div style={{ padding: "0px 2%" }}>
                <table className="cstm-tbl">
                  <thead>
                    <tr>
                      <td>Cab</td>
                      <td>Equivalent</td>
                      <td>Package</td>
                      <td>#</td>
                    </tr>
                  </thead>
                  <tbody>
                    {itm.results.map((itm, i) => {
                      return (
                        <tr key={i}>
                          <td name="Cab">
                            {itm.name}
                            {itm.equivalent.isequi ? ` (${itm.category})` : ""}
                          </td>
                          <td name="Equivalent">
                            {itm.equivalent.isequi ? "Yes" : "NO"}
                          </td>
                          <td name="Package">
                            {itm.hour}Hr || {itm.distance}Km
                          </td>
                          <td>
                            <button
                              className="ctl-btn"
                              onClick={() =>
                                setpkgd({ display: true, data: itm })
                              }
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {itm.results.length <= 0 ? (
                <div
                  className="nrc-con"
                  style={{ padding: "calc((100vh - 530px)/2)" }}
                >
                  <img src="/icons/nrec.png" alt="" />
                  <p className="nrc-txt">No Package found</p>
                </div>
              ) : (
                ""
              )}
              {add.display ? (
                <div className="form-container">
                  <div className="form-box">
                    <div className="form-lgocon">
                      <img src="/icons/logo.png" alt="" srcSet="" />
                    </div>
                    <div className="form-hdcon">
                      {add.actn === "nw" ? "Add Package" : "Edit Package"}
                    </div>
                    <div className="form-subcon">
                      <table className="frm-table">
                        <tbody>
                          <tr>
                            <td>Car</td>
                            <td>
                              {add.actn === "edt" ? (
                                <div className="fkfltr-input">{add.name}</div>
                              ) : (
                                <select
                                  name="name"
                                  className="fltr-input"
                                  value={add.name}
                                  onChange={handelpkg}
                                >
                                  <option value="">Select car</option>
                                  {cabmod.map((itm, i) => {
                                    return (
                                      <option value={itm.name} key={i}>
                                        {itm.name}
                                      </option>
                                    );
                                  })}
                                </select>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td>Equivalent cab</td>
                            <td>
                              {add.actn === "edt" ? (
                                <div className="fkfltr-input">
                                  {add.eqvcab === "true" ? "Yes" : "No"}
                                </div>
                              ) : (
                                <select
                                  name="eqvcab"
                                  className="fltr-input"
                                  value={add.eqvcab}
                                  onChange={handelpkg}
                                >
                                  <option value="true">Yes</option>
                                  <option value="false">No</option>
                                </select>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td>Package</td>
                            <td>
                              {add.actn === "edt" ? (
                                <div className="fkfltr-input">
                                  {add.pakg === "typ1"
                                    ? "4hr || 40km"
                                    : add.pakg === "typ2"
                                    ? "8hr || 80km"
                                    : add.pakg === "typ3"
                                    ? "12hr || 120km"
                                    : ""}
                                </div>
                              ) : (
                                <select
                                  name="pakg"
                                  className="fltr-input"
                                  value={add.pakg}
                                  onChange={handelpkg}
                                >
                                  <option value="">Select Package</option>
                                  <option value="typ1">4hr || 40km</option>
                                  <option value="typ2">8hr || 80km</option>
                                  <option value="typ3">12hr || 120km</option>
                                </select>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td>Regular amount</td>
                            <td>
                              <input
                                type="number"
                                name="regamt"
                                className="fltr-input"
                                value={add.regamt}
                                placeholder="Regular amount"
                                onChange={handelpkg}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>Base Fare</td>
                            <td>
                              <input
                                type="number"
                                name="bsfr"
                                className="fltr-input"
                                value={add.bsfr}
                                placeholder="Base Fare"
                                onChange={handelpkg}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>Offer amount</td>
                            <td>
                              <input
                                type="number"
                                name="totalamt"
                                className="fltr-input"
                                value={add.totalamt}
                                placeholder="Total amount"
                                onChange={handelpkg}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>Gst</td>
                            <td>
                              <select
                                name="gst"
                                className="fltr-input"
                                value={add.gst}
                                onChange={handelpkg}
                              >
                                <option value="true">Include</option>
                                <option value="false">Exclude</option>
                              </select>
                            </td>
                          </tr>
                          <tr>
                            <td>Driver aid</td>
                            <td>
                              <select
                                name="driverad"
                                className="fltr-input"
                                value={add.driverad}
                                onChange={handelpkg}
                              >
                                <option value="true">Include</option>
                                <option value="false">Exclude</option>
                              </select>
                            </td>
                          </tr>
                          <tr>
                            <td>Advance</td>
                            <td>
                              <select
                                name="adv"
                                className="fltr-input"
                                value={add.adv}
                                onChange={handelpkg}
                              >
                                <option value="false">Required</option>
                                <option value="true">Not required</option>
                              </select>
                            </td>
                          </tr>
                          <tr>
                            <td>Avilable</td>
                            <td>
                              <select
                                name="avil"
                                className="fltr-input"
                                value={add.avil}
                                onChange={handelpkg}
                              >
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                              </select>
                            </td>
                          </tr>
                          <tr>
                            <td>Operator amount</td>
                            <td>
                              <input
                                type="number"
                                name="oprtramt"
                                className="fltr-input"
                                placeholder="Operator amount"
                                value={add.oprtramt}
                                onChange={handelpkg}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>Minimum bid</td>
                            <td>
                              <input
                                type="number"
                                name="minbd"
                                className="fltr-input"
                                placeholder="Minimum Bid"
                                value={add.minbd}
                                onChange={handelpkg}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <div
                        className="form-btmcon"
                        style={{
                          display: "flex",
                          padding: "5px 0px",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          className="dtl-clsr"
                          style={{
                            margin: "0px 10px",
                            background: "lightgreen",
                          }}
                          onClick={addpackage}
                        >
                          <span>{add.actn === "nw" ? "Add" : "Edit"}</span>
                        </button>
                        <button
                          className="dtl-clsr"
                          style={{
                            margin: "0px 10px",
                            background: "#ff2a2a",
                          }}
                          onClick={() => setadd(da)}
                        >
                          <span>Close</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}
              {pkgd.display ? (
                <div className="form-container">
                  <div className="form-box">
                    <div className="form-lgocon">
                      <img src="/icons/logo.png" alt="" srcSet="" />
                    </div>
                    <div className="form-hdcon">Package details</div>
                    <table className="dtl-tbl">
                      <tbody>
                        <tr>
                          <td>Package Id</td>
                          <td>{pkgd.data._id}</td>
                        </tr>
                        <tr>
                          <td>Rental Type</td>
                          <td>
                            {pkgd.data.hour}Hr || {pkgd.data.distance} Km
                          </td>
                        </tr>
                        <tr>
                          <td>Cab model</td>
                          <td>{pkgd.data.name}</td>
                        </tr>
                        <tr>
                          <td>Category</td>
                          <td>{pkgd.data.category}</td>
                        </tr>
                        <tr>
                          <td>Equivalent</td>
                          <td>{pkgd.data.equivalent.isequi ? "Yes" : "No"}</td>
                        </tr>
                        <tr>
                          <td>Avilable</td>
                          <td>{pkgd.data.isavilable ? "Yes" : "No"}</td>
                        </tr>
                        <tr>
                          <td>Regular amount</td>
                          <td>₹ {pkgd.data.regularamount}</td>
                        </tr>
                        <tr>
                          <td>Total amount</td>
                          <td>₹ {pkgd.data.totalpayable}</td>
                        </tr>
                        <tr>
                          <td>Advance</td>
                          <td>
                            {pkgd.data.zero ? "Not Required" : "Required"}
                          </td>
                        </tr>
                        <tr>
                          <td>Operator amount</td>
                          <td>₹ {pkgd.data.oprtramt}</td>
                        </tr>
                        <tr>
                          <td>Min Bid</td>
                          <td>₹ {pkgd.data.minchrg}</td>
                        </tr>
                        <tr>
                          <td>Gst</td>
                          <td>
                            {pkgd.data.othercharges.GST.isinclude
                              ? "Include"
                              : "Exclude"}
                          </td>
                        </tr>
                        <tr>
                          <td>Driver aid</td>
                          <td>
                            {pkgd.data.othercharges.Driveraid.isinclude
                              ? "Include"
                              : `₹ ${pkgd.data.othercharges.Driveraid.amount}`}
                          </td>
                        </tr>
                        <tr>
                          <td>Extra km</td>
                          <td>₹ {pkgd.data.othercharges.Extrakm.amount}/Km</td>
                        </tr>
                        <tr>
                          <td>Extra Hour</td>
                          <td>
                            ₹ {pkgd.data.othercharges.Extrahour.amount}/Hour
                          </td>
                        </tr>
                        <tr>
                          <td>Night Charge</td>
                          <td>₹ {pkgd.data.othercharges.Night.amount}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div
                      className="form-btmcon"
                      style={{
                        display: "flex",
                        padding: "5px 0px",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        className="dtl-clsr"
                        style={{ margin: "0px 10px", background: "lightgreen" }}
                        onClick={() => {
                          handelpkgad(pkgd.data);
                          setpkgd({ display: false, data: {} });
                        }}
                      >
                        <span>Edit</span>
                      </button>
                      <button
                        className="dtl-clsr"
                        style={{
                          margin: "0px 10px",
                          background: "rgb(255, 42, 42)",
                        }}
                        onClick={() => setpkgd({ display: false, data: {} })}
                      >
                        <span>Close</span>
                      </button>
                    </div>
                  </div>
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

export default Hourlydtl;
