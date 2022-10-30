import React, { useState, useEffect } from "react";
import { AiOutlineClear } from "react-icons/ai";
import { ImSearch, ImLocation2 } from "react-icons/im";
import {
  MdOutlineAddLocationAlt,
  MdFullscreen,
  MdDelete,
} from "react-icons/md";
import { FaTimes } from "react-icons/fa";
import { SiAddthis } from "react-icons/si";
import { RiEditBoxLine } from "react-icons/ri";
import Dataload from "../templates/Loading/Dataload";
import Tourdtl from "../templates/servicesdtl/Tourdtl";
import { Helmet } from "react-helmet";
const Tourpackage = () => {
  const df = { cty: "", id: "" };
  const [lst, setlst] = useState({ entry: "10", pag: 1, data: [] });
  const [filter, setfilter] = useState(df);
  const [dtl, setdtl] = useState({ display: false, id: "", url: "" });
  const [prcs, setprcs] = useState(false);
  const [Zoom, setZoom] = useState(false);
  const [autoco, setautoco] = useState({
    display: false,
    addisplay: false,
    sugge: [],
  });
  const da = {
    display: false,
    name: "",
    citys: [],
    days: "",
    nights: "",
    plan: [],
    bnrimg: "",
    temcty: { cityname: "", citycode: "" },
    templan: { day: "", title: "", description: "" },
    actn: "nw",
    title: "",
    description: "",
    keywords:""
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

  // === === === handel templan === === === //
  const htemplan = (e) => {
    name = e.target.name;
    value = e.target.value;
    setadd({ ...add, templan: { ...add.templan, [name]: value } });
  };
  // === === === Hourly loader === === === //

  const tourlstr = async (bypass) => {
    const { cty, id } = filter;
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
    if (id) {
      if (typeof id !== "string") {
        return alert("Invalid Tour Package ID");
      }
    }
    setprcs(true);
    const result = await fetch("/oceannodes/service/tourpackage", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        entry: entry,
        pag: pag.toString(),
        cty,
        id,
        typ: "lst",
      }),
    });
    const data = await result.json();
    if (result.status === 200) {
      setlst({
        ...lst,
        data: data,
        prv: { pag, entry },
        flt: { cty, id },
      });
    } else {
      alert(data);
      setlst({
        ...lst,
        data: [],
        prv: { pag, entry },
        flt: { cty, id },
      });
    }
    setprcs(false);
  };

  // === === === Tour package loader end === === === //

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
    tourlstr();
    // eslint-disable-next-line
  }, []);

  // === === === add package === === === //

  const addtour = async () => {
    const { citys, plan, name, days, nights, bnrimg, title, description, keywords } = add;
    if (
      !citys ||
      !plan ||
      !name ||
      !days ||
      !nights ||
      !bnrimg ||
      !title ||
      !description ||
      !keywords||
      typeof title !== "string" ||
      typeof description !== "string" ||
      typeof name !== "string" ||
      typeof days !== "string" ||
      typeof nights !== "string" ||
      typeof bnrimg !== "string" ||
      isNaN(days) ||
      isNaN(nights)
    ) {
      return alert("invaid request");
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
    const result = await fetch("/oceannodes/service/tourpackage/new", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        citys,
        name,
        days,
        nights,
        plan,
        bnrimg,
        title,
        description,
        keywords
      }),
    });
    const data = await result.json();
    if (result.status === 201) {
      alert("Added successfully");
      setadd(da);
      tourlstr(true);
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
  const handelimage = (e) => {
    if (!e.target.files[0]) {
      return;
    } else if (e.target.files[0].size > 1000000) {
      return alert("Maximum allowed Size 100KB");
    }
    var reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = function () {
      setadd({ ...add, bnrimg: reader.result });
    };
    reader.onerror = function (error) {
      console.log("Error: ", error);
    };
  };
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
  // === === === handel plan === === === //

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
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Tour Package - RevaCabs </title>
        <meta name="description" content="Manage Tourpackage" />
        <link rel="canonical" href="http://partner.revacabs.com/" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      {prcs ? (
        <Dataload />
      ) : dtl.display ? (
        <Tourdtl dtl={dtl} setdtl={setdtl} tourlstr={tourlstr} />
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
                  <input
                    type="text"
                    name="id"
                    className="fltr-input"
                    placeholder="Tour Package ID"
                    autoComplete="off"
                    value={filter.id}
                    onChange={handelfilter}
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
                  onClick={tourlstr}
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
                    <MdOutlineAddLocationAlt /> Add Package
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
              <div className="nrc-con" style={{ margin: "auto" }}>
                <img src="/icons/nrec.png" alt="" />
                <p className="nrc-txt">No records found</p>
              </div>
            ) : (
              <table className="cstm-tbl">
                <thead>
                  <tr>
                    <td>Name</td>
                    <td>Days</td>
                    <td>Night</td>
                    <td>#</td>
                  </tr>
                </thead>
                <tbody>
                  {lst.data.map((itm, i) => {
                    return (
                      <tr key={i}>
                        <td name="Name">{itm.name}</td>
                        <td name="Days">{itm.days} Day</td>
                        <td name="Nights">{itm.nights} Night</td>
                        <td>
                          <button
                            className="ctl-btn"
                            onClick={() => {
                              setdtl({
                                display: true,
                                id: itm.id,
                                url: itm.url,
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
                onClick={tourlstr}
              >
                Previous
              </button>
              <div>{lst.pag}</div>
              <button
                onMouseDown={() => {
                  handellst(true);
                }}
                onClick={tourlstr}
              >
                Next
              </button>
            </div>
          </div>
          {add.display ? (
            <div className="form-container">
              <div className="form-box">
                <div className="form-lgocon">
                  <img src="/icons/logo.png" alt="" />
                </div>
                <div className="form-hdcon">Add Tour Package</div>
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
                    className={
                      Zoom ? "img-prvwcon img-prvconzmd" : "img-prvwcon"
                    }
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
                  ""
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
                        id=""
                        cols="30"
                        rows="10"
                        style={{
                          maxWidth: "100%",
                          minWidth: "100%",
                          minHeight: "60px",
                        }}
                        onChange={handeladd}
                        value={add.description}
                        placeholder="Meta Description"
                      ></textarea>
                    </td>
                  </tr>
                  <tr>
                    <td>Keywords</td>
                    <td>
                      <textarea
                        name="keywords"
                        className="fltr-input"
                        id=""
                        cols="30"
                        rows="10"
                        style={{
                          maxWidth: "100%",
                          minWidth: "100%",
                          minHeight: "60px",
                        }}
                        onChange={handeladd}
                        value={add.keywords}
                        placeholder="Meta Keywords"
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
                    style={{ margin: "5px 10px", background: "red" }}
                    onClick={() => setadd(da)}
                  >
                    close
                  </button>
                  <button
                    className="dtl-clsr"
                    style={{ margin: "5px 10px", background: "lightgreen" }}
                    onClick={addtour}
                  >
                    Add
                  </button>
                </div>
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

export default Tourpackage;
