import React, { useState, useEffect } from "react";
import { AiOutlineClear } from "react-icons/ai";
import { ImSearch } from "react-icons/im";
import {
  MdOutlineAddLocationAlt,
  MdFullscreen,
  MdDelete,
} from "react-icons/md";
import { FaTimes } from "react-icons/fa";
import { SiAddthis } from "react-icons/si";
import Dataload from "../templates/Loading/Dataload";
import Cabmodtl from "../templates/servicesdtl/Cabmodtl";
import { Helmet } from "react-helmet";
const Cabmodel = () => {
  const df = { name: "", category: "" };
  const [lst, setlst] = useState({ entry: "10", pag: 1, data: [] });
  const [filter, setfilter] = useState(df);
  const [dtl, setdtl] = useState({ display: false, name: "", category: "" });
  const [prcs, setprcs] = useState(false);
  const [Zoom, setZoom] = useState(false);
  const da = {
    display: false,
    name: "",
    category: "",
    rdr: "",
    oneway: "",
    roundtrip: "",
    extrahr: "",
    driveraid: "",
    night: "",
    modimg: "",
    validcat: "",
    upvalid: [],
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
      lst.flt.name !== filter.name ||
      lst.flt.category !== filter.category ||
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
  // === === === cabmodel  loader === === === //

  const cabmodlstr = async (bypass) => {
    const { name, category } = filter;
    let { entry, pag } = lst;
    if (!entry || isNaN(entry) || typeof pag !== "number") {
      return alert("Invalid request");
    }
    if (lst.prv && bypass !== true) {
      if (entry === lst.prv.entry && pag === lst.prv.pag) {
        return;
      }
    }
    if (name) {
      if (typeof name !== "string") {
        return alert("Invalid name");
      }
    }
    if (category) {
      if (
        typeof category !== "string" ||
        !["Hatchback", "Sedan", "Muv", "Suv"].some((itm) => itm === category)
      ) {
        return alert("Invalid Category");
      }
    }
    setprcs(true);
    const result = await fetch("/oceannodes/service/cabmodel", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        entry: entry,
        pag: pag.toString(),
        name,
        category,
        typ: "lst",
      }),
    });
    const data = await result.json();
    if (result.status === 200) {
      console.log(data);
      setlst({
        ...lst,
        data: data,
        prv: { pag, entry },
        flt: { name, category },
      });
    } else {
      alert(data);
      setlst({
        ...lst,
        data: [],
        prv: { pag, entry },
        flt: { name, category },
      });
    }
    setprcs(false);
  };

  // === === === Hourly package loader end === === === //

  const intator = () => {
    if (lst.flt) {
      const { name, category } = lst.flt;
      if (
        name !== filter.name ||
        category !== filter.category ||
        lst.prv.entry !== lst.entry
      ) {
        return setlst({ ...lst, pag: 1, prv: {} });
      }
    }
    setlst({ ...lst, prv: {} });
  };
  useEffect(() => {
    cabmodlstr();
    // eslint-disable-next-line
  }, []);

  // === === === add package === === === //

  const addcabmodel = async () => {
    let {
      name,
      category,
      rdr,
      oneway,
      roundtrip,
      extrahr,
      driveraid,
      night,
      modimg,
      upvalid,
    } = add;
    if (
      !name ||
      !category ||
      !rdr ||
      !oneway ||
      !roundtrip ||
      !extrahr ||
      !night ||
      !modimg ||
      typeof name !== "string" ||
      typeof category !== "string" ||
      typeof oneway !== "string" ||
      typeof roundtrip !== "string" ||
      typeof extrahr !== "string" ||
      typeof rdr !== "string" ||
      typeof night !== "string" ||
      typeof modimg !== "string" ||
      ![
        "Hatchback",
        "Sedan",
        "Muv",
        "Suv",
        "Prime Hatchback",
        "Prime Sedan",
        "Prime Muv",
        "Prime Suv",
      ].some((itm) => itm === category) ||
      !["3", "4", "5", "6", "7"].some((itm) => itm === rdr) ||
      isNaN(rdr) ||
      isNaN(oneway) ||
      isNaN(roundtrip) ||
      isNaN(extrahr)
    ) {
      return alert("Please fill all the fields with a valid input");
    }
    const result = await fetch("/oceannodes/service/cabmodel/add", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name,
        category,
        rdr,
        oneway,
        roundtrip,
        extrahr,
        driveraid,
        night,
        modimg,
        upvalid,
      }),
    });
    const data = await result.json();
    if (result.status === 201) {
      alert("Added successfully");
      setadd(da);
      cabmodlstr(true);
    } else {
      alert(data);
    }
  };
  const handelimage = (e) => {
    if (!e.target.files[0]) {
      return;
    } else if (e.target.files[0].size > 100000) {
      return alert("Maximum allowed Size 100KB");
    }
    // setadd({
    //   ...add,
    //   modimg: URL.createObjectURL(e.target.files[0]),
    // });
    var reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = function () {
      setadd({ ...add, modimg: reader.result });
    };
    reader.onerror = function (error) {
      console.log("Error: ", error);
    };
  };
  const handeluval = async () => {
    const validcat = add.validcat;
    if (
      !validcat ||
      typeof validcat !== "string" ||
      ![
        "Hatchback",
        "Sedan",
        "Muv",
        "Suv",
        "Prime Hatchback",
        "Prime Sedan",
        "Prime Muv",
        "Prime Suv",
      ].some((itm) => itm === validcat)
    ) {
      return;
    }
    let upvalid = add.upvalid;
    if (upvalid.some((itm) => itm === validcat)) {
      return;
    }
    upvalid.push(validcat);
    setadd({ ...add, upvalid, validcat: "" });
  };
  const delvc = async (todel) => {
    let upvalid = add.upvalid;
    upvalid = upvalid.filter((itm) => itm !== todel);
    setadd({ ...add, upvalid });
  };
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Cab Models - RevaCabs </title>
        <meta name="description" content="Manage Cab Model" />
        <link rel="canonical" href="http://partner.revacabs.com/" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      {prcs ? (
        <Dataload />
      ) : dtl.display ? (
        <Cabmodtl dtl={dtl} setdtl={setdtl} cabmodlstr={cabmodlstr} />
      ) : (
        <div className="comp-con">
          <div className="fltr-con">
            <div className="sub-fltr">
              <div className="sub-fltrprtn">
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="name"
                    className="fltr-input"
                    placeholder="Model name"
                    autoComplete="off"
                    value={filter.name}
                    onChange={handelfilter}
                  />
                </div>
              </div>
              <div className="sub-fltrprtn">
                <div className="input-wrapper">
                  <select
                    name="category"
                    className="fltr-input"
                    value={filter.category}
                    onChange={handelfilter}
                  >
                    <option value="">Select Category</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Muv">Muv</option>
                    <option value="Suv">Suv</option>
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
                  onClick={cabmodlstr}
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
                    <MdOutlineAddLocationAlt /> Add Cabmodel
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
                    <td>Model name</td>
                    <td>Category</td>
                    <td>Group id</td>
                    <td>#</td>
                  </tr>
                </thead>
                <tbody>
                  {lst.data.map((itm, i) => {
                    return (
                      <tr key={i}>
                        <td name="Cab Model">{itm.name}</td>
                        <td name="Category">{itm.category}</td>
                        <td name="Group Id">{itm.group_id}</td>
                        <td>
                          <button
                            className="ctl-btn"
                            onClick={() =>
                              setdtl({
                                display: true,
                                name: itm.name,
                                category: itm.category,
                              })
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
                onClick={cabmodlstr}
              >
                Previous
              </button>
              <div>{lst.pag}</div>
              <button
                onMouseDown={() => {
                  handellst(true);
                }}
                onClick={cabmodlstr}
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
                <div className="form-hdcon">Add Cab model</div>
                <table className="frm-table">
                  <tbody>
                    <tr>
                      <td>
                        Model name <span className="rd-txt">*</span>
                      </td>
                      <td>
                        <input
                          type="text"
                          name="name"
                          className="fltr-input"
                          placeholder="Model name"
                          onChange={handeladd}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Category<span className="rd-txt">*</span>
                      </td>
                      <td>
                        <select
                          name="category"
                          className="fltr-input"
                          onChange={handeladd}
                        >
                          <option value="">Select Category</option>
                          <option value="Hatchback">Hatchback</option>
                          <option value="Sedan">Sedan</option>
                          <option value="Muv">Muv</option>
                          <option value="Suv">Suv</option>
                          <option value="Prime Hatchback">
                            Prime Hatchback
                          </option>
                          <option value="Prime Sedan">Prime Sedan</option>
                          <option value="Prime Muv">Prime Muv</option>
                          <option value="Prime Suv">Prime Suv</option>
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Rider<span className="rd-txt">*</span>
                      </td>
                      <td>
                        <select
                          name="rdr"
                          className="fltr-input"
                          onChange={handeladd}
                        >
                          <option value="">Select Rider count</option>
                          <option value="3">Three</option>
                          <option value="4">Four</option>
                          <option value="5">Five</option>
                          <option value="6">Six</option>
                          <option value="7">Seven</option>
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Valid category<span className="rd-txt">*</span>
                      </td>
                      <td>
                        <select
                          name="validcat"
                          className="fltr-input"
                          onChange={handeladd}
                          value={add.validcat}
                        >
                          <option value="">Select Category</option>
                          <option value="Hatchback">Hatchback</option>
                          <option value="Sedan">Sedan</option>
                          <option value="Muv">Muv</option>
                          <option value="Suv">Suv</option>
                          <option value="Prime Hatchback">
                            Prime Hatchback
                          </option>
                          <option value="Prime Sedan">Prime Sedan</option>
                          <option value="Prime Muv">Prime Muv</option>
                          <option value="Prime Suv">Prime Suv</option>
                        </select>
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
                    onClick={handeluval}
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
                        validcat: "",
                      });
                    }}
                  >
                    <AiOutlineClear style={{ color: "white" }} />
                  </div>
                </div>
                <table className="cstm-tbl">
                  <thead>
                    <tr>
                      <td>Sr.no</td>
                      <td>Category</td>
                      <td>#</td>
                    </tr>
                  </thead>
                  <tbody>
                    {add.upvalid.map((itm, i) => {
                      return (
                        <tr>
                          <td name="City">{i + 1}</td>
                          <td name="State">{itm}</td>
                          <td style={{ display: "flex" }}>
                            <div
                              className="icn-btnn"
                              style={{
                                background: "red",
                                borderRadius: "5px",
                                margin: "auto",
                                display: "flex",
                              }}
                            >
                              <MdDelete
                                style={{ color: "white", margin: "auto" }}
                                onClick={() => {
                                  delvc(itm);
                                }}
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
                      <td>
                        Oneway (KM) Charge<span className="rd-txt">*</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          name="oneway"
                          className="fltr-input"
                          onChange={handeladd}
                          placeholder="Per KM Charge"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Roundtrip (KM) Charge<span className="rd-txt">*</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          name="roundtrip"
                          className="fltr-input"
                          placeholder="Per KM Charge"
                          onChange={handeladd}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Night Charge <span className="rd-txt">*</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          name="night"
                          className="fltr-input"
                          placeholder="Night Charge"
                          onChange={handeladd}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Extra Hour<span className="rd-txt">*</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          name="extrahr"
                          className="fltr-input"
                          placeholder="Extra Hour Charge"
                          onChange={handeladd}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Driver Aid<span className="rd-txt">*</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          name="driveraid"
                          className="fltr-input"
                          placeholder="Driver Aid"
                          onChange={handeladd}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Model image (.png)<span className="rd-txt">*</span>
                      </td>
                      <td>
                        <input
                          type="file"
                          name="modimg"
                          accept="image/png"
                          onChange={handelimage}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                {add.modimg ? (
                  <div
                    className={
                      Zoom ? "img-prvwcon img-prvconzmd" : "img-prvwcon"
                    }
                  >
                    <div className={Zoom ? "img-prv img-prvzmd" : "img-prv"}>
                      <img
                        src={add.modimg}
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
                    onClick={addcabmodel}
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

export default Cabmodel;
