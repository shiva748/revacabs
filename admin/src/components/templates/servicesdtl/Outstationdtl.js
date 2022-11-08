import React, { useState, useEffect } from "react";
import Dataload from "../Loading/Dataload";
import { FiRefreshCw } from "react-icons/fi";
import { TiArrowBackOutline } from "react-icons/ti";
import { ImLocation } from "react-icons/im";
import { SiAddthis } from "react-icons/si";
import { RiEditBoxLine } from "react-icons/ri";
import { AiOutlineClear } from "react-icons/ai";
import { CgDetailsMore } from "react-icons/cg";
import { FaTimes } from "react-icons/fa";
import "./Hrlydtl.css";
import { set } from "mongoose";

const Outstationdtl = (recived) => {
  const setdtl = recived.setdtl;
  const dtl = recived.dtl;
  const outstnlstr = recived.outstnlstr;
  const [itm, setitm] = useState();
  const [prcs, setprcs] = useState(true);
  const [optn, setoptn] = useState({ tdl: "lst" });
  const { fromcode, tocode, lstng } = dtl;
  const [pkgd, setpkgd] = useState({
    display: false,
    data: {},
    subdisplay: false,
    subdata: {},
  });
  const [upd, setupd] = useState({ lstng: "" });
  const da = {
    display: false,
    prcs: false,
    actn: "",
    name: "",
    eqvcab: "false",
    regamt: "",
    totalamt: "",
    gst: "false",
    driverad: "false",
    adv: "true",
    avil: "false",
    oprtramt: "",
    minbd: "",
    distance: "",
    hours: "",
    bsfr: "",
    sttx: "false",
    sttxamt: "",
    dayrates: [],
    nwday: true,
    day: "",
    expand: {},
  };
  const [add, setadd] = useState(da);
  let name, value;
  const moutstnlstr = async (bypass) => {
    setprcs(true);
    const result = await fetch("/oceannodes/service/outstation", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        entry: "1",
        pag: "1",
        fromcode,
        tocode,
        lstng,
        typ: "dtl",
      }),
    });
    const data = await result.json();
    if (result.status === 200) {
      setitm(data[0]);
      setupd({ lstng: data[0].list ? "true" : "false" });
    } else {
      setdtl({ display: false, fromcode: "", tocode: "", lstng: "" });
    }
    setprcs(false);
  };
  const outstationupd = async () => {
    const { lstng } = upd;
    if (itm.list.toString() === lstng) {
      return alert("No changes has been made");
    }
    const fromcode = itm.fromcode;
    const tocode = itm.tocode;
    if (
      !fromcode ||
      !tocode ||
      !lstng ||
      typeof fromcode !== "string" ||
      typeof tocode !== "string" ||
      typeof lstng !== "string" ||
      !["true", "false"].some((itm) => itm === lstng)
    ) {
      return alert("invalid request");
    }
    setprcs(true);
    const result = await fetch("/oceannodes/service/outstation/update", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        fromcode,
        tocode,
        lstng,
      }),
    });
    const data = await result.json();
    if (result) {
      alert(data);
      setdtl({ display: false });
      outstnlstr(true);
    } else {
      alert("Failed");
    }
    setprcs(false);
  };
  const addonepackage = async () => {
    let {
      actn,
      name,
      eqvcab,
      regamt,
      totalamt,
      gst,
      driverad,
      adv,
      avil,
      oprtramt,
      minbd,
      distance,
      hours,
      bsfr,
      sttx,
      sttxamt,
    } = add;
    setadd({ ...add, prcs: true });
    const result = await fetch("/oceannodes/service/outstation/add/oneway", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: itm.from,
        fromcode: itm.fromcode,
        to: itm.to,
        tocode: itm.tocode,
        actn,
        name,
        eqvcab,
        regamt: regamt * 1,
        totalamt: totalamt * 1,
        gst,
        driverad,
        adv,
        avil,
        oprtramt: oprtramt * 1,
        minbd: minbd * 1,
        distance: distance * 1,
        hours: hours * 1,
        bsfr: bsfr * 1,
        sttx,
        sttxamt,
      }),
    });

    const data = await result.json();
    if (result.status === 201) {
      alert("Success");
      moutstnlstr();
      setadd(da);
    } else {
      alert(data);
    }
    setadd({ ...add, prcs: false });
  };

  // === === === add or edt roundtrip package === === === //

  const addroundpackage = async () => {
    let {
      actn,
      name,
      eqvcab,
      gst,
      driverad,
      adv,
      avil,
      sttx,
      sttxamt,
      expand,
      dayrates,
    } = add;
    setadd({ ...add, prcs: true });
    const result = await fetch("/oceannodes/service/outstation/add/roundtrip", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: itm.from,
        fromcode: itm.fromcode,
        to: itm.to,
        tocode: itm.tocode,
        actn,
        name,
        eqvcab,
        gst,
        driverad,
        adv,
        avil,
        sttx,
        sttxamt,
        expand,
        dayrates,
      }),
    });

    const data = await result.json();
    if (result.status === 201) {
      alert("Success");
      moutstnlstr();
      setadd(da);
    } else {
      alert(data);
    }
    setadd({ ...add, prcs: false });
  };

  // === === === roundtrip add end  === === === //

  useEffect(() => {
    moutstnlstr();
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
  const handelpkgad = (data, type) => {
    if (type === "one") {
      if (!itm.results.some((itm) => itm === data)) {
        setadd({ ...add, display: true, actn: "nw" });
      } else {
        setadd({
          display: true,
          prcs: false,
          actn: "edt",
          name: data.name,
          eqvcab: data.equivalent.isequi ? "true" : "false",
          distance: data.distance,
          regamt: data.regularamount,
          bsfr: data.basefare,
          totalamt: data.totalpayable,
          sttx: data.othercharges.Tolltaxes.isinclude ? "true" : "false",
          sttxamt: data.othercharges.Tolltaxes.amount,
          gst: data.othercharges.GST.isinclude ? "true" : "false",
          driverad: data.othercharges.Driveraid.isinclude ? "true" : "false",
          adv: data.zero ? "true" : "false",
          avil: data.isavilable ? "true" : "false",
          oprtramt: data.oprtramt,
          minbd: data.minchrg,
          hours: data.hours.toString(),
        });
      }
    } else if (type === "round") {
      if (!itm.roundresults.some((itm) => itm === data)) {
        setadd({ ...add, display: true, actn: "nw" });
      } else {
        let dayrates = [];
        data.dayrates.map((itm) => {
          return dayrates.push({
            day: itm.day.toString(),
            distance: itm.distance.toString(),
            minchrg: itm.minchrg.toString(),
            oprtramt: itm.oprtramt.toString(),
            regularamount: itm.regularamount.toString(),
            totalpayable: itm.totalpayable.toString(),
            bsfr: itm.bsfr.toString(),
          });
        });
        setadd({
          display: true,
          prcs: false,
          actn: "edt",
          name: data.name,
          eqvcab: data.equivalent.isequi ? "true" : "false",
          sttx: data.othercharges.Tolltaxes.isinclude ? "true" : "false",
          sttxamt: data.othercharges.Tolltaxes.amount,
          gst: data.othercharges.GST.isinclude ? "true" : "false",
          driverad: data.othercharges.Driveraid.isinclude ? "true" : "false",
          adv: data.zero ? "true" : "false",
          avil: data.isavilable ? "true" : "false",
          expand: {
            distance: data.expand.distance.toString(),
            minchrg: data.expand.minchrg.toString(),
            oprtramt: data.expand.oprtramt.toString(),
            bsfr: data.expand.bsfr.toString(),
            regularamount: data.expand.regularamount.toString(),
            totalpayable: data.expand.totalpayable.toString(),
          },
          dayrates,
        });
      }
    }
  };
  const handeldayrts = () => {
    const { distance, regamt, totalamt, oprtramt, minbd, bsfr } = add;
    if (!distance || !regamt || !totalamt || !oprtramt || !minbd || !bsfr) {
      return alert("Please fill all the fields of day rates");
    }
    let dayrates = add.dayrates;
    if (add.nwday) {
      dayrates.push({
        day: `${add.dayrates.length + 1}`,
        distance,
        regularamount: regamt,
        totalpayable: totalamt,
        oprtramt,
        bsfr: bsfr,
        minchrg: minbd,
      });
    } else {
      dayrates[add.day - 1] = {
        day: add.day,
        distance,
        regularamount: regamt,
        totalpayable: totalamt,
        oprtramt,
        bsfr: bsfr,
        minchrg: minbd,
      };
    }
    setadd({
      ...add,
      distance: "",
      regamt: "",
      totalamt: "",
      oprtramt: "",
      bsfr: "",
      minbd: "",
      dayrates,
    });
  };
  const handelex = (e) => {
    name = e.target.name;
    value = e.target.value;
    setadd({ ...add, expand: { ...add.expand, [name]: value } });
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
                onClick={moutstnlstr}
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
                  <td>From</td>
                  <td>{itm.from}</td>
                </tr>
                <tr>
                  <td>From Code</td>
                  <td>{itm.fromcode}</td>
                </tr>
                <tr>
                  <td>To</td>
                  <td>{itm.to}</td>
                </tr>
                <tr>
                  <td>To Code</td>
                  <td>{itm.tocode}</td>
                </tr>
                <tr>
                  <td>Direction link</td>
                  <td>
                    <a
                      className="blu-links"
                      rel="noreferrer"
                      target="_blank"
                      href={`https://www.google.com/maps/dir/${itm.fromlonglat}/${itm.tolonglat}`}
                    >
                      <ImLocation /> View
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>Oneway package Count</td>
                  <td>{itm.onecount ? itm.onecount : 0}</td>
                </tr>
                <tr>
                  <td>Round package Count</td>
                  <td>{itm.roundcount ? itm.roundcount : 0}</td>
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
                optn.tdl === "one"
                  ? "optn-itm optn-actv ovrly-ad"
                  : "optn-itm ovrly-ad"
              }
              onClick={() => {
                setoptn({ tdl: "one" });
              }}
            >
              Oneway
            </div>
            <div
              className={
                optn.tdl === "round"
                  ? "optn-itm optn-actv ovrly-ad"
                  : "optn-itm ovrly-ad"
              }
              onClick={() => {
                setoptn({ tdl: "round" });
              }}
            >
              Round trip
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
                  onClick={outstationupd}
                >
                  Update
                </button>
              </div>
            </div>
          ) : (
            ""
          )}
          {optn.tdl === "one" ? (
            <div className="bkngedt-con">
              <div className="bkng-edthd" style={{ position: "relative" }}>
                Oneway
                <button
                  className="dtl-clsr"
                  style={{
                    padding: "0px 5px",
                    width: "100px",
                    position: "absolute",
                    right: "10px",
                  }}
                  onClick={() => {
                    setadd({ ...add, display: true, actn: "nw" });
                  }}
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
                      <td>Avilable</td>
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
                            {itm.equivalent.isequi ? "Yes" : "No"}
                          </td>
                          <td name="Avilable">
                            {itm.isavilable ? "Yes" : "No"}
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
                  <div className={add.prcs ? "form-box ovrly-ad" : "form-box"}>
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
                                  {add.eqvcab === "true" ? "Yes" : "False"}
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
                            <td>Distance</td>
                            <td>
                              <input
                                type="number"
                                name="distance"
                                className="fltr-input"
                                value={add.distance}
                                placeholder="Distance"
                                onChange={handelpkg}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>Hours</td>
                            <td>
                              <input
                                type="number"
                                name="hours"
                                className="fltr-input"
                                value={add.hours}
                                placeholder="Hours"
                                onChange={handelpkg}
                              />
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
                            <td>Base Fare</td>
                            <td>
                              <input
                                type="number"
                                name="bsfr"
                                className="fltr-input"
                                value={add.bsfr}
                                onChange={handelpkg}
                                placeholder="Base fare/Km"
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
                            <td>State taxes & tolls</td>
                            <td>
                              <select
                                name="sttx"
                                className="fltr-input"
                                value={add.sttx}
                                onChange={handelpkg}
                              >
                                <option value="true">Include</option>
                                <option value="false">Exclude</option>
                              </select>
                            </td>
                          </tr>
                          <tr>
                            <td>Toll & Tax amount</td>
                            <td>
                              <input
                                type="text"
                                name="sttxamt"
                                className="fltr-input"
                                value={add.sttxamt}
                                onChange={handelpkg}
                                placeholder="Toll & tax amount"
                              />
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
                          className={
                            add.prcs ? "dtl-clsr ldng-btn" : "dtl-clsr"
                          }
                          style={{
                            margin: "0px 10px",
                            background: "lightgreen",
                          }}
                          onClick={addonepackage}
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
                          handelpkgad(pkgd.data, "one");
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
          {optn.tdl === "round" ? (
            <div className="bkngedt-con">
              <div className="bkng-edthd" style={{ position: "relative" }}>
                Round trip
                <button
                  className="dtl-clsr"
                  style={{
                    padding: "0px 5px",
                    width: "100px",
                    position: "absolute",
                    right: "10px",
                  }}
                  onClick={() => {
                    setadd({ ...add, display: true, actn: "nw" });
                  }}
                  // here checking add and edit
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
                      <td>Avilable</td>
                      <td>#</td>
                    </tr>
                  </thead>
                  <tbody>
                    {itm.roundresults.map((itm, i) => {
                      return (
                        <tr key={i}>
                          <td name="Cab">
                            {itm.name}
                            {itm.equivalent.isequi ? ` (${itm.category})` : ""}
                          </td>
                          <td name="Equivalent">
                            {itm.equivalent.isequi ? "Yes" : "No"}
                          </td>
                          <td name="Avilable">
                            {itm.isavilable ? "Yes" : "No"}
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
                  <div className={add.prcs ? "form-box ovrly-ad" : "form-box"}>
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
                            <td>State taxes & tolls</td>
                            <td>
                              <select
                                name="sttx"
                                className="fltr-input"
                                value={add.sttx}
                                onChange={handelpkg}
                              >
                                <option value="true">Include</option>
                                <option value="false">Exclude</option>
                              </select>
                            </td>
                          </tr>
                          <tr>
                            <td>Toll & Tax amount</td>
                            <td>
                              <input
                                type="text"
                                name="sttxamt"
                                className="fltr-input"
                                value={add.sttxamt}
                                onChange={handelpkg}
                                placeholder="Toll & tax amount"
                              />
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
                        </tbody>
                      </table>
                      <div className="frm-sbhd">Add Day Rates</div>
                      <table className="frm-table">
                        <tr>
                          <td>Distance</td>
                          <td>
                            <input
                              type="number"
                              name="distance"
                              className="fltr-input"
                              value={add.distance}
                              placeholder="Distance"
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
                              onChange={handelpkg}
                              placeholder="Base fare"
                            />
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
                              placeholder="Regular Price"
                              onChange={handelpkg}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>Total amount</td>
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
                          <td>Operator amount</td>
                          <td>
                            <input
                              type="number"
                              name="oprtramt"
                              className="fltr-input"
                              value={add.oprtramt}
                              placeholder="Operator amount"
                              onChange={handelpkg}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>Minimum Bid</td>
                          <td>
                            <input
                              type="number"
                              name="minbd"
                              className="fltr-input"
                              value={add.minbd}
                              placeholder="Minimum Bid"
                              onChange={handelpkg}
                            />
                          </td>
                        </tr>
                      </table>
                      <div
                        className="form-btmcon"
                        style={{
                          display: "flex",
                          padding: "5px 0px",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          className="icn-btnn"
                          style={{
                            margin: "0px 10px",
                          }}
                          onClick={handeldayrts}
                        >
                          {add.nwday ? <SiAddthis /> : <RiEditBoxLine />}
                        </div>
                        <div
                          className="icn-btnn"
                          onClick={() => {
                            setadd({
                              ...add,
                              distance: "",
                              regamt: "",
                              totalamt: "",
                              oprtramt: "",
                              minbd: "",
                              nwday: true,
                              day: "",
                            });
                          }}
                          style={{
                            backgroundColor: "red",
                            borderRadius: "5px",
                            margin: "0px 10px",
                          }}
                        >
                          <AiOutlineClear style={{ color: "white" }} />
                        </div>
                      </div>
                      <div className="frm-sbhd">Day Rates</div>
                      <table className="cstm-tbl">
                        <thead>
                          <tr>
                            <td>Days</td>
                            <td>Distance</td>
                            <td>Total Payable</td>
                            <td>#</td>
                          </tr>
                        </thead>
                        <tbody>
                          {add.dayrates.map((itm) => {
                            return (
                              <tr>
                                <td name="Days">{itm.day}</td>
                                <td name="Distance">{itm.distance}</td>
                                <td name="Total amount">{itm.totalpayable}</td>
                                <td style={{ display: "flex" }}>
                                  <div
                                    className="icn-btnn"
                                    onClick={() => {
                                      setadd({
                                        ...add,
                                        distance: itm.distance,
                                        day: itm.day,
                                        regamt: itm.regularamount,
                                        totalamt: itm.totalpayable,
                                        oprtramt: itm.oprtramt,
                                        minbd: itm.minchrg,
                                        bsfr: itm.bsfr,
                                        nwday: false,
                                      });
                                    }}
                                    style={{
                                      backgroundColor: "lightgreen",
                                      borderRadius: "5px",
                                      margin: "auto",
                                      display: "flex",
                                    }}
                                  >
                                    <RiEditBoxLine
                                      style={{ color: "white", margin: "auto" }}
                                    />
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <div className="frm-sbhd">Extension pack</div>
                      <table className="frm-table">
                        <tr>
                          <td>Distance</td>
                          <td>
                            <input
                              type="number"
                              name="distance"
                              className="fltr-input"
                              value={add.expand.distance}
                              placeholder="Distance"
                              onChange={handelex}
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
                              value={add.expand.bsfr}
                              onChange={handelex}
                              placeholder="Base fare"
                            />
                          </td>
                        </tr>
                        <tr></tr>
                        <tr>
                          <td>Regular amount</td>
                          <td>
                            <input
                              type="number"
                              name="regularamount"
                              className="fltr-input"
                              value={add.expand.regularamount}
                              placeholder="Regular Price"
                              onChange={handelex}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>Total amount</td>
                          <td>
                            <input
                              type="number"
                              name="totalpayable"
                              className="fltr-input"
                              value={add.expand.totalpayable}
                              placeholder="Total amount"
                              onChange={handelex}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>Operator amount</td>
                          <td>
                            <input
                              type="number"
                              name="oprtramt"
                              className="fltr-input"
                              value={add.expand.oprtramt}
                              placeholder="Operator amount"
                              onChange={handelex}
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>Minimum Bid</td>
                          <td>
                            <input
                              type="number"
                              name="minchrg"
                              className="fltr-input"
                              value={add.expand.minchrg}
                              placeholder="Minimum Bid"
                              onChange={handelex}
                            />
                          </td>
                        </tr>
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
                          className={
                            add.prcs ? "dtl-clsr ldng-btn" : "dtl-clsr"
                          }
                          style={{
                            margin: "0px 10px",
                            background: "lightgreen",
                          }}
                          onClick={addroundpackage}
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
                          <td>Advance</td>
                          <td>
                            {pkgd.data.zero ? "Not Required" : "Required"}
                          </td>
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
                    <div className="frm-sbhd">Day Rates</div>
                    {pkgd.subdisplay ? (
                      <>
                        <table className="dtl-tbl">
                          <tr>
                            <td>Day</td>
                            <td>{pkgd.subdata.day}</td>
                          </tr>
                          <tr>
                            <td>Distance</td>
                            <td>{pkgd.subdata.distance} Km</td>
                          </tr>
                          <tr>
                            <td>Regular amount</td>
                            <td>₹ {pkgd.subdata.regularamount}</td>
                          </tr>
                          <tr>
                            <td>Total amount</td>
                            <td>₹ {pkgd.subdata.totalpayable}</td>
                          </tr>
                          <tr>
                            <td>Operator amount</td>
                            <td>₹ {pkgd.subdata.oprtramt}</td>
                          </tr>
                          <tr>
                            <td>Minimum Bid</td>
                            <td>₹ {pkgd.subdata.minchrg}</td>
                          </tr>
                        </table>
                        <div
                          className="form-btmcon"
                          style={{
                            display: "flex",
                            padding: "5px 0px",
                            justifyContent: "center",
                          }}
                        >
                          <div
                            className="icn-btnn"
                            onClick={() => {
                              setpkgd({
                                ...pkgd,
                                subdisplay: false,
                                subdata: {},
                              });
                            }}
                            style={{
                              backgroundColor: "red",
                              borderRadius: "5px",
                              margin: "auto",
                              display: "flex",
                            }}
                          >
                            <FaTimes
                              style={{ color: "white", margin: "auto" }}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      ""
                    )}
                    <table className="cstm-tbl">
                      <thead>
                        <tr>
                          <td>Days</td>
                          <td>Distance</td>
                          <td>Total Payable</td>
                          <td>#</td>
                        </tr>
                      </thead>
                      <tbody>
                        {pkgd.data.dayrates.map((itm) => {
                          return (
                            <tr>
                              <td name="Days">{itm.day}</td>
                              <td name="Distance">{itm.distance}</td>
                              <td name="Total amount">{itm.totalpayable}</td>
                              <td style={{ display: "flex" }}>
                                <div
                                  className="icn-btnn"
                                  onClick={() => {
                                    setpkgd({
                                      ...pkgd,
                                      subdisplay: true,
                                      subdata: itm,
                                    });
                                  }}
                                  style={{
                                    backgroundColor: "lightgreen",
                                    borderRadius: "5px",
                                    margin: "auto",
                                    display: "flex",
                                  }}
                                >
                                  <CgDetailsMore
                                    style={{ color: "white", margin: "auto" }}
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div className="frm-sbhd">Extension package</div>
                    <table className="dtl-tbl">
                      <tbody>
                        <tr>
                          <td>Distance</td>
                          <td>₹ {pkgd.data.expand.distance}</td>
                        </tr>
                        <tr>
                          <td>Regular amount</td>
                          <td>₹ {pkgd.data.expand.regularamount}</td>
                        </tr>
                        <tr>
                          <td>Total Amount</td>
                          <td>₹ {pkgd.data.expand.totalpayable}</td>
                        </tr>
                        <tr>
                          <td>Operator Amount</td>
                          <td>₹ {pkgd.data.expand.oprtramt}</td>
                        </tr>
                        <tr>
                          <td>Minimum Bid</td>
                          <td>₹ {pkgd.data.expand.minchrg}</td>
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
                          handelpkgad(pkgd.data, "round");
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

export default Outstationdtl;
