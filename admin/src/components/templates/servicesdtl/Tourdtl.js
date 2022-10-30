import React, { useState, useEffect } from "react";
import Dataload from "../Loading/Dataload";
import { FiRefreshCw } from "react-icons/fi";
import { TiArrowBackOutline } from "react-icons/ti";
import { ImLocation2 } from "react-icons/im";
import { SiAddthis } from "react-icons/si";
import {  AiOutlineClear } from "react-icons/ai";
import { MdDelete, MdFullscreen } from "react-icons/md";
import { RiEditBoxLine } from "react-icons/ri";
import { FaTimes } from "react-icons/fa";
const Tourdtl = (recived) => {
  const setdtl = recived.setdtl;
  const dtl = recived.dtl;
  const tourlstr = recived.tourlstr;
  const [itm, setitm] = useState();
  const [prcs, setprcs] = useState(true);
  const [optn, setoptn] = useState({ tdl: "cty" });
  const { id, url } = dtl;
  const [Zoom, setZoom] = useState(false);
  const [autoco, setautoco] = useState({
    display: false,
    addisplay: false,
    sugge: [],
  });
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
  const da = {
    name: "",
    citys: [],
    days: "",
    nights: "",
    plan: [],
    bnrimg: "",
    temcty: { cityname: "", citycode: "" },
    templan: { day: "", title: "", description: "" },
    actn: "nw",
    img: false,
    description:"",
    title:"",
    keywords:""
  };
  const [plndtl, setplndtl] = useState({ display: false, data: {} });
  const [add, setadd] = useState(da);
  let name, value;

  const handeladd = (e) => {
    name = e.target.name;
    value = e.target.value;
    setadd({ ...add, [name]: value });
  };
  // === === === acc city === === === //

  const addcity = () => {
    const { cityname, citycode } = add.temcty;
    if (!cityname || !citycode) {
      return;
    }
    if (
      add.citys.some(
        (itm) => itm.cityname === cityname || itm.citycode === citycode
      )
    ) {
      setadd({ ...add, temcty: { cityname: "", citycode: "" } });
      return alert("already added");
    }
    setadd({
      ...add,
      citys: [...add.citys, { cityname: cityname, citycode: citycode }],
      temcty: { cityname: "", citycode: "" },
    });
  };

  // === === === remove city === === === //

  const removecity = (data) => {
    const { cityname, citycode } = data;
    if (!cityname || !citycode) {
      return;
    }
    const nwcitys = add.citys.filter(
      (itm) => itm.cityname !== cityname || itm.citycode !== citycode
    );
    setadd({ ...add, citys: nwcitys });
  };

  const mtourlstr = async () => {
    setprcs(true);
    const result = await fetch("/oceannodes/service/tourpackage", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        entry: "1",
        pag: "1",
        id,
        url,
        typ: "dtl",
      }),
    });
    const data = await result.json();
    if (result.status === 200) {
      setitm(data[0]);
      let plan = [];
      data[0].plan.map((itm) => {
        return (plan = [
          ...plan,
          {
            day: itm.day.toString(),
            title: itm.title,
            description: itm.description,
          },
        ]);
      });
      setadd({
        ...add,
        id: data[0].id,
        name: data[0].name,
        citys: data[0].citys,
        days: data[0].days.toString(),
        nights: data[0].nights.toString(),
        plan,
        bnrimg: "",
        title: data[0].meta.title,
        description: data[0].meta.description,
        keywords: data[0].meta.keywords
      });
    } else {
      setdtl({ display: false, id: "", url: "" });
    }
    setprcs(false);
  };
  const htemplan = (e) => {
    name = e.target.name;
    value = e.target.value;
    setadd({ ...add, templan: { ...add.templan, [name]: value } });
  };
  // === === === add plan === === === //
  const addplan = () => {
    const { day, title, description } = add.templan;
    const { actn, ind } = add;
    if (!title || !description || !day || !actn) {
      return;
    }
    if (!["edt", "nw"].some((itm) => itm === actn)) {
      return alert("invalid request");
    }

    if (actn === "nw") {
      if (!add.days) {
        return alert("Please quote the total Days and Nights");
      } else if (day * 1 > add.days * 1) {
        return alert("plan day can't be greater then total quoted day");
      } else if (add.plan.length !== day * 1 - 1) {
        return alert("Please input previous day plan");
      }
      if (
        add.plan.some(
          (itm) => itm.day === day || itm.description === description
        )
      ) {
        return alert("already added");
      }
      setadd({
        ...add,
        plan: [...add.plan, { day, title, description }],
        templan: { title: "", description: "", day: "" },
      });
    } else if (actn === "edt") {
      if (!ind || typeof ind !== "string" || isNaN(ind)) {
        return alert("invalid request 6");
      } else if (
        add.plan.some(
          (itm) =>
            itm.day === day &&
            itm.description === description &&
            itm.title === title
        )
      ) {
        return alert("No changes were made");
      }
      let plan = add.plan;
      plan[ind * 1] = { title, day, description };
      setadd({
        ...add,
        plan: plan,
        templan: { title: "", description: "", day: "" },
        actn: "nw",
        ind: "",
      });
    }
  };
  const handelplan = (data, actn) => {
    const { day, title, description } = data;
    if (!day || !title || !description) {
      return;
    }

    if (
      !add.plan.some(
        (itm) =>
          itm.day === day ||
          itm.title === title ||
          itm.description === description
      )
    ) {
      return;
    }
    if (actn === "edit") {
      let i = add.plan.findIndex(
        (itm) =>
          itm.day === day &&
          itm.title === title &&
          itm.description === description
      );
      let toedt = add.plan.filter(
        (itm) =>
          itm.day === day &&
          itm.title === title &&
          itm.description === description
      )[0];
      setadd({
        ...add,
        templan: toedt,
        actn: "edt",
        ind: i.toString(),
      });
    } else {
      let i = add.plan.findIndex(
        (itm) =>
          itm.day === day &&
          itm.title === title &&
          itm.description === description
      );
      if (add.plan.length - 1 === i) {
        let plan = add.plan.filter(
          (itm) =>
            itm.day !== day &&
            itm.title !== title &&
            itm.description !== description
        );
        setadd({ ...add, plan });
      } else {
        return alert("can't delete this element");
      }
    }
  };

  // === === === handel image === === === //

  const handelimage = (e) => {
    if (!e.target.files[0]) {
      return;
    } else if (e.target.files[0].size > 1000000) {
      return alert("Maximum allowed Size 100KB");
    }
    var reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = function () {
      setadd({ ...add, bnrimg: reader.result, img: true });
    };
    reader.onerror = function (error) {
      console.log("Error: ", error);
    };
  };
  useEffect(() => {
    mtourlstr();
    // eslint-disable-next-line
  }, []);

  // === === === update tour === === === //

  const updttour = async () => {
    const { citys, plan, name, days, nights, bnrimg, title, description, keywords } = add;
    if (
      !citys ||
      !plan ||
      !name ||
      !days ||
      !nights ||
      !title ||
      !description ||
      !keywords||
      typeof title !== "string" ||
      typeof description !== "string" ||
      typeof name !== "string" ||
      typeof days !== "string" ||
      typeof nights !== "string" ||
      typeof keywords !== "string"||
      isNaN(days) ||
      isNaN(nights)
    ) {
      return alert("invaid request");
    }
    
    if (
      plan.some(
        (itm) =>
          !itm.day ||
          !itm.title ||
          !itm.description ||
          typeof itm.day !== "string" ||
          typeof itm.title !== "string" ||
          typeof itm.description !== "string" ||
          isNaN(itm.day)
      )
    ) {
      return alert("invalid request");
    }
    if (title.length > 100) {
      return alert("Meta title can not contain more then 70 character");
    }
    if (description.length > 170) {
      return alert("Meta description can not contain more then 170 character");
    }
    if (keywords.length > 200) {
      return alert("Meta keywords can not contain more then 200 character");
    }
    if (
      citys.some(
        (itm) =>
          !itm.cityname ||
          !itm.citycode ||
          typeof itm.citycode !== "string" ||
          typeof itm.cityname !== "string" ||
          isNaN(itm.citycode)
      )
    ) {
      return alert("invalid request");
    }
    const result = await fetch("/oceannodes/service/tourpackage/update", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        id: itm.id,
        citys,
        name,
        days,
        nights,
        plan,
        bnrimg: add.img ? bnrimg : "",
        url: itm.url,
        title,
        description,
        keywords
      }),
    });
    const data = await result.json();
    if (result.status === 201) {
      alert("Updated successfully");
      setadd(da);
      tourlstr(true);
      setdtl({ display: false, id: "", url: "" });
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
            Tour
            <div>
              <button
                className="dtl-clsr"
                style={{ backgroundColor: "lightgreen", margin: "0px 5px" }}
                onClick={mtourlstr}
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
                  <td>Tour id</td>
                  <td>{itm.id}</td>
                </tr>
                <tr>
                  <td>Days</td>
                  <td>{itm.days} Days</td>
                </tr>
                <tr>
                  <td>Nights</td>
                  <td>{itm.nights} Nights</td>
                </tr>
                <tr>
                  <td>City count</td>
                  <td>{itm.citys.length}</td>
                </tr>
                <tr>
                  <td>Url</td>
                  <td>
                    <a
                      href={`http://localhost:3006/tourpackages/details/${itm.url}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Click here
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bkng-optn">
            <div
              className={
                optn.tdl === "cty"
                  ? "optn-itm optn-actv ovrly-ad"
                  : "optn-itm ovrly-ad"
              }
              onClick={() => {
                setoptn({ tdl: "cty" });
              }}
            >
              City's
            </div>
            <div
              className={
                optn.tdl === "pln"
                  ? "optn-itm optn-actv ovrly-ad"
                  : "optn-itm ovrly-ad"
              }
              onClick={() => {
                setoptn({ tdl: "pln" });
              }}
            >
              Plan
            </div>
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
          </div>
          {optn.tdl === "cty" ? (
            <div className="bkngedt-con" style={{ padding: "0px 5% 0px 5%" }}>
              <div className="bkng-edthd">City's</div>
              <table className="cstm-tbl">
                <thead>
                  <tr>
                    <td>#</td>
                    <td>City</td>
                    <td>Code</td>
                  </tr>
                </thead>
                <tbody>
                  {itm.citys.map((itm, i) => {
                    return (
                      <tr>
                        <td name="#">{i + 1}</td>
                        <td name="City name">{itm.cityname}</td>
                        <td name="City code">{itm.citycode}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            ""
          )}
          {optn.tdl === "pln" ? (
            <>
              <div className="bkngedt-con" style={{ padding: "0px 5% 0px 5%" }}>
                <div className="bkng-edthd">City's</div>
                <table className="cstm-tbl">
                  <thead>
                    <tr>
                      <td>Day</td>
                      <td>Title</td>
                      <td>Description</td>
                      <td>#</td>
                    </tr>
                  </thead>
                  <tbody>
                    {itm.plan.map((itm, i) => {
                      return (
                        <tr>
                          <td name="Day">{itm.day}</td>
                          <td name="Title">
                            {itm.title.length <= 10
                              ? itm.title
                              : itm.title.slice(0, 10).concat("...")}
                          </td>
                          <td name="Description">
                            {itm.description.slice(0, 10).concat("...")}
                          </td>
                          <td>
                            <button
                              className="ctl-btn"
                              onClick={() => {
                                setplndtl({ display: true, data: itm });
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
              </div>
              {plndtl.display ? (
                <div className="form-container">
                  <div className="form-box">
                    <div className="form-lgocon">
                      <img src="/icons/logo.png" alt="" srcSet="" />
                    </div>
                    <div className="form-hdcon">Package details</div>
                    <table className="dtl-tbl">
                      <tbody>
                        <tr>
                          <td>Day</td>
                          <td>{plndtl.data.day}</td>
                        </tr>
                        <tr>
                          <td>Title</td>
                          <td>{plndtl.data.title}</td>
                        </tr>
                        <tr style={{ border: "solid 1px lightgrey" }}>
                          <td>Description</td>
                          <td>{plndtl.data.description}</td>
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
                          background: "rgb(255, 42, 42)",
                        }}
                        onClick={() => setplndtl({ display: false, data: {} })}
                      >
                        <span>Close</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}
            </>
          ) : (
            ""
          )}
          {optn.tdl === "updt" ? (
            <div className="bkngedt-con" style={{ padding: "0px 5% 0px 5%" }}>
              <div className="bkng-edthd">Update</div>
              <table className="frm-table">
                <tbody>
                  <tr>
                    <td>
                      City <span className="rd-txt">*</span>
                    </td>
                    <td>
                      <input
                        style={{ width: "100%" }}
                        type="text"
                        placeholder="City"
                        className="edt-inpt"
                        autoComplete="off"
                        onChange={(e) => {
                          setadd({
                            ...add,
                            temcty: { cityname: e.target.value },
                          });
                        }}
                        value={add.temcty.cityname}
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
                                      temcty: {
                                        cityname: itm.cityname,
                                        citycode: itm.citycode,
                                      },
                                    });
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
                <div
                  className="icn-btnn"
                  style={{
                    margin: "0px 10px",
                  }}
                  onClick={addcity}
                >
                  <SiAddthis />
                </div>
                <div
                  className="icn-btnn"
                  style={{
                    backgroundColor: "red",
                    borderRadius: "5px",
                    margin: "0px 10px",
                  }}
                >
                  <AiOutlineClear style={{ color: "white" }} />
                </div>
              </div>
              <table className="cstm-tbl">
                <thead>
                  <tr>
                    <td>City</td>
                    <td>State</td>
                    <td>City code</td>
                    <td>#</td>
                  </tr>
                </thead>
                <tbody>
                  {add.citys.map((itm) => {
                    return (
                      <tr>
                        <td name="City">{itm.cityname.split(",")[0]}</td>
                        <td name="State">{itm.cityname.split(",")[1]}</td>
                        <td name="Code">{itm.citycode}</td>
                        <td style={{ display: "flex" }}>
                          <div
                            className="icn-btnn"
                            style={{
                              background: "red",
                              borderRadius: "5px",
                              margin: "auto",
                              display: "flex",
                            }}
                            onClick={() => {
                              removecity(itm);
                            }}
                          >
                            <MdDelete
                              style={{ color: "white", margin: "auto" }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <table className="frm-table">
                <tbody>
                  <tr>
                    <td>Days</td>
                    <td>
                      <input
                        type="number"
                        name="days"
                        className="edt-inpt"
                        onChange={handeladd}
                        style={{ width: "100%" }}
                        placeholder="Days"
                        value={add.days}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Nights</td>
                    <td>
                      <input
                        type="number"
                        name="nights"
                        className="edt-inpt"
                        onChange={handeladd}
                        style={{ width: "100%" }}
                        placeholder="Nights"
                        value={add.nights}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="frm-sbhd">Plan</div>
              <table className="frm-table">
                <tr>
                  <td>Day</td>
                  <td>
                    <input
                      type="number"
                      name="day"
                      className="fltr-input"
                      placeholder="Day"
                      onChange={htemplan}
                      value={add.templan.day}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Title</td>
                  <td>
                    <input
                      type="text"
                      name="title"
                      className="fltr-input"
                      placeholder="Title"
                      onChange={htemplan}
                      value={add.templan.title}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Description</td>
                  <td>
                    <textarea
                      name="description"
                      className="fltr-input"
                      id=""
                      cols="30"
                      rows="10"
                      style={{
                        maxWidth: "100%",
                        minWidth: "100%",
                        minHeight: "60px",
                      }}
                      onChange={htemplan}
                      value={add.templan.description}
                      placeholder="Description"
                    ></textarea>
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
                  onClick={addplan}
                >
                  <SiAddthis />
                </div>
                <div
                  className="icn-btnn"
                  style={{
                    backgroundColor: "red",
                    borderRadius: "5px",
                    margin: "0px 10px",
                  }}
                  onClick={() => {
                    setadd({
                      ...add,
                      templan: { day: "", description: "", title: "" },
                      actn: "nw",
                    });
                  }}
                >
                  <AiOutlineClear style={{ color: "white" }} />
                </div>
              </div>
              <table className="cstm-tbl">
                <thead>
                  <tr>
                    <td>Day</td>
                    <td>Title</td>
                    <td>Description</td>
                    <td>#</td>
                  </tr>
                </thead>
                <tbody>
                  {add.plan.map((itm) => {
                    return (
                      <tr>
                        <td name="Day">{itm.day}</td>
                        <td name="Title">
                          {itm.title.length > 10
                            ? itm.title.slice(0, 10).concat("...")
                            : itm.title}
                        </td>
                        <td name="Description">
                          {itm.description.slice(0, 10).concat("...")}
                        </td>
                        <td style={{ display: "flex" }}>
                          <div
                            className="icn-btnn"
                            style={{
                              background: "lightgreen",
                              borderRadius: "5px",
                              margin: "auto",
                              display: "flex",
                            }}
                            onClick={() => {
                              handelplan(itm, "edit");
                            }}
                          >
                            <RiEditBoxLine
                              style={{ color: "white", margin: "auto" }}
                            />
                          </div>
                          <div
                            className="icn-btnn"
                            style={{
                              background: "red",
                              borderRadius: "5px",
                              margin: "auto",
                              display: "flex",
                            }}
                            onClick={() => {
                              handelplan(itm, "del");
                            }}
                          >
                            <MdDelete
                              style={{ color: "white", margin: "auto" }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <table className="frm-table">
                <tbody>
                  <tr>
                    <td>Name</td>
                    <td>
                      <input
                        type="text"
                        name="name"
                        className="edt-inpt"
                        onChange={handeladd}
                        style={{ width: "100%" }}
                        placeholder="Name"
                        value={add.name}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Banner image (.png)<span className="rd-txt">*</span>
                    </td>
                    <td>
                      <input
                        type="file"
                        name="modimg"
                        accept="image/png, image/jpg"
                        onChange={handelimage}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              {add.bnrimg ? (
                <div
                  className={Zoom ? "img-prvwcon img-prvconzmd" : "img-prvwcon"}
                >
                  <div className={Zoom ? "img-prv img-prvzmd" : "img-prv"}>
                    <img
                      src={add.bnrimg}
                      alt=""
                      className={Zoom ? "zmd-img" : "zmbl-img"}
                    />
                    {Zoom ? (
                      <div
                        className="cls-prv"
                        onClick={() => {
                          setZoom(false);
                        }}
                      >
                        <FaTimes />
                      </div>
                    ) : (
                      <div className="img-ovrly">
                        <span
                          onClick={() => {
                            setZoom(true);
                          }}
                        >
                          <MdFullscreen />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className={Zoom ? "img-prvwcon img-prvconzmd" : "img-prvwcon"}
                >
                  <div className={Zoom ? "img-prv img-prvzmd" : "img-prv"}>
                    <img
                      src={`/tour/${itm.id}/${itm.bnrimg}`}
                      alt=""
                      className={Zoom ? "zmd-img" : "zmbl-img"}
                    />
                    {Zoom ? (
                      <div
                        className="cls-prv"
                        onClick={() => {
                          setZoom(false);
                        }}
                      >
                        <FaTimes />
                      </div>
                    ) : (
                      <div className="img-ovrly">
                        <span
                          onClick={() => {
                            setZoom(true);
                          }}
                        >
                          <MdFullscreen />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="frm-sbhd">Meta data</div>
              <table className="frm-table">
                <tr>
                  <td>Title</td>
                  <td>
                    <input
                      type="text"
                      name="title"
                      className="fltr-input"
                      placeholder="Meta Title"
                      onChange={handeladd}
                      value={add.title}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Description</td>
                  <td>
                    <textarea
                      name="description"
                      className="fltr-input"
                      cols="30"
                      rows="10"
                      style={{
                        maxWidth: "100%",
                        minWidth: "100%",
                        minHeight: "60px",
                      }}
                      onChange={handeladd}
                      value={add.description}
                      placeholder="Description"
                    ></textarea>
                  </td>
                </tr>
                <tr>
                  <td>Keywords</td>
                  <td>
                    <textarea
                      name="keywords"
                      className="fltr-input"
                      cols="30"
                      rows="10"
                      style={{
                        maxWidth: "100%",
                        minWidth: "100%",
                        minHeight: "60px",
                      }}
                      onChange={handeladd}
                      value={add.keywords}
                      placeholder="keywords"
                    ></textarea>
                  </td>
                </tr>
              </table>

              <div
                className="form-btmcon"
                style={{ display: "flex", justifyContent: "center" }}
              >
                <button
                  className="dtl-clsr"
                  style={{ margin: "5px 10px", background: "lightgreen" }}
                  onClick={updttour}
                >
                  update
                </button>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      )}
    </>
  );
};

export default Tourdtl;
