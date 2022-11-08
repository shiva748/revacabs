import React, { useState, useEffect } from "react";
import Dataload from "../Loading/Dataload";
import { FiRefreshCw } from "react-icons/fi";
import { TiArrowBackOutline } from "react-icons/ti";
import { MdFullscreen } from "react-icons/md";
import { FaTimes } from "react-icons/fa";

const Citydtl = (recived) => {
  const setdtl = recived.setdtl;
  const dtl = recived.dtl;
  const [Zoom, setZoom] = useState(false);
  const [itm, setitm] = useState();
  const [prcs, setprcs] = useState(true);
  const [optn, setoptn] = useState({ tdl: "prvw" });
  const { name, category } = dtl;
  const [updtd, setupdtd] = useState();
  const lstcabmod = recived.cabmodlstr;
  const cabmodlstr = async (bypass) => {
    setprcs(true);
    const result = await fetch("/oceannodes/service/cabmodel", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        entry: "1",
        pag: "1",
        name,
        category,
        typ: "dtl",
      }),
    });
    const data = await result.json();
    if (result.status === 200) {
      setitm(data[0]);
      setupdtd({
        oneway: data[0].charge.oneway,
        roundtrip: data[0].charge.roundtrip,
        night: data[0].charge.night,
        extrahr: data[0].charge.extrahour,
        driveraid: data[0].charge.driveraid,
      });
    } else {
      setdtl({ display: false, cityname: "", citycode: "" });
    }
    setprcs(false);
  };
  useEffect(() => {
    cabmodlstr();
    // eslint-disable-next-line
  }, []);

  const handelupdtd = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    setupdtd({ ...updtd, [name]: value });
  };

  const update = async () => {
    let { oneway, roundtrip, extrahr, night, driveraid, modimg } = updtd;
    let updt = {};
    if (oneway !== itm.charge.oneway) {
      if (typeof oneway !== "string" || isNaN(oneway)) {
        return alert("Please enter a valid oneway charge");
      }
      updt = { ...updt, oneway };
    }
    if (extrahr !== itm.charge.extrahour) {
      if (typeof extrahr !== "string" || isNaN(extrahr)) {
        return alert("Please enter a valid Wating charge");
      }
      updt = { ...updt, extrahr };
    }
    if (roundtrip !== itm.charge.roundtrip) {
      if (typeof roundtrip !== "string" || isNaN(roundtrip)) {
        return alert("Please enter a valid roundtrip charge");
      }
      updt = { ...updt, roundtrip };
    }
    if (night !== itm.charge.night) {
      if (typeof night !== "string" || isNaN(night)) {
        return alert("Please enter a valid night charge");
      }
      updt = { ...updt, night };
    }
    if (driveraid !== itm.charge.driveraid) {
      if (typeof driveraid !== "string" || isNaN(driveraid)) {
        return alert("Please enter a valid Driver aid charge");
      }
      updt = { ...updt, driveraid };
    }
    if (modimg) {
      if (typeof modimg !== "string") {
        return alert("Please select a valid image");
      }
      updt = { ...updt, modimg };
    }
    updt = { ...updt, name: itm.name, category: itm.category };
    setprcs(true);
    const result = await fetch("/oceannodes/service/cabmodel/update", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(updt),
    });
    const data = await result.json();
    if (result.status === 201) {
      alert("update successfull");
      setdtl({ display: false, name: "", category: "" });
      lstcabmod(true);
    } else {
      alert(data);
    }
    setprcs(false)
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
      setupdtd({ ...updtd, modimg: reader.result });
    };
    reader.onerror = function (error) {
      console.log("Error: ", error);
    };
  };
  return (
    <>
      {prcs ? (
        <Dataload />
      ) : (
        <div className="dlt-con">
          <div className="dtl-hd">
            Cab Model
            <div>
              <button
                className="dtl-clsr"
                style={{ backgroundColor: "lightgreen", margin: "0px 5px" }}
                onClick={cabmodlstr}
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
                  <td>Model name</td>
                  <td>{itm.name}</td>
                </tr>
                <tr>
                  <td>Category</td>
                  <td>{itm.category}</td>
                </tr>
                <tr>
                  <td>Rider</td>
                  <td>{itm.rdr}</td>
                </tr>
                <tr>
                  <td>Oneway Charge</td>
                  <td>₹{itm.charge.oneway}/ KM</td>
                </tr>
                <tr>
                  <td>Roundtrip Charge</td>
                  <td>₹{itm.charge.roundtrip}/ KM</td>
                </tr>
                <tr>
                  <td>Extra Hour</td>
                  <td>₹{itm.charge.extrahour}/ Hr</td>
                </tr>
                <tr>
                  <td>Driveraid</td>
                  <td>₹{itm.charge.driveraid}</td>
                </tr>
                <tr>
                  <td>Night Charge</td>
                  <td>₹{itm.charge.night}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bkng-optn">
            <div
              className={
                optn.tdl === "prvw"
                  ? "optn-itm optn-actv ovrly-ad"
                  : "optn-itm ovrly-ad"
              }
              onClick={() => {
                setoptn({ tdl: "prvw" });
              }}
            >
              Preview
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
          {optn.tdl === "updt" ? (
            <div className="bkngedt-con">
              <div className="bkng-edthd">Update</div>
              <table className="frm-tbl">
                <tbody>
                  <tr>
                    <td>Oneway (KM) Charge</td>
                    <td>
                      <input
                        type="text"
                        name="oneway"
                        value={updtd.oneway}
                        className="frm-tblinp"
                        onChange={handelupdtd}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Roundtrip (KM) Charge</td>
                    <td>
                      <input
                        type="text"
                        name="roundtrip"
                        className="frm-tblinp"
                        value={updtd.roundtrip}
                        onChange={handelupdtd}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Extra hour</td>
                    <td>
                      <input
                        type="text"
                        name="extrahr"
                        className="frm-tblinp"
                        value={updtd.extrahr}
                        onChange={handelupdtd}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Night</td>
                    <td>
                      <input
                        type="text"
                        name="night"
                        className="frm-tblinp"
                        value={updtd.night}
                        onChange={handelupdtd}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Driveraid</td>
                    <td>
                      <input
                        type="text"
                        name="driveraid"
                        className="frm-tblinp"
                        value={updtd.driveraid}
                        onChange={handelupdtd}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Model image (.png)</td>
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
              {updtd.modimg ? (
                <div
                  className={Zoom ? "img-prvwcon img-prvconzmd" : "img-prvwcon"}
                  style={{ margin: Zoom ? "" : "15px 0px" }}
                >
                  <div className={Zoom ? "img-prv img-prvzmd" : "img-prv"}>
                    <img
                      src={updtd.modimg}
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
          {optn.tdl === "prvw" ? (
            <div
              className={Zoom ? "img-prvwcon img-prvconzmd" : "img-prvwcon"}
              style={{ margin: Zoom ? "" : "15px 0px" }}
            >
              <div className={Zoom ? "img-prv img-prvzmd" : "img-prv"}>
                <img
                  src={`/car/${itm.cab_id}/${itm.name}.png`}
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
        </div>
      )}
    </>
  );
};

export default Citydtl;
