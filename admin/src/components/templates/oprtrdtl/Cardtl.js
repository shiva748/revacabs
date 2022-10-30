import React, { useState, useEffect } from "react";
import Dataload from "../Loading/Dataload";
import { FaTimes } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { TiArrowBackOutline } from "react-icons/ti";
import { MdFullscreen } from "react-icons/md";
const Cardtl = (recived) => {
  const setdtl = recived.setdtl;
  const dtl = recived.dtl;
  const [itm, setitm] = useState({});
  const [prcs, setprcs] = useState(true);
  const [optn, setoptn] = useState({ tdl: "docs" });
  const { oprtrid, rcnum } = dtl;
  const [Zoom, setZoom] = useState({ carimg: false, rc: false, plcy: false });
  const [flt, setflt] = useState({});
  const [tme, settme] = useState();
  const card = async () => {
    if (oprtrid) {
      if (typeof oprtrid !== "string") {
        return alert("Invalid operator id");
      }
    }
    if (rcnum) {
      if (typeof rcnum !== "string") {
        return alert("invalid Rc number");
      }
    }
    setprcs(true);
    const result = await fetch("/oceannodes/operator/car", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        entry: 10,
        pag: 1,
        oprtrid,
        rcnum,
        typ: "dtl",
      }),
    });
    const data = await result.json();
    if (result.status === 200) {
      settme(new Date().getTime());
      setitm(data[0]);
      setflt({
        ...data[0].faultin,
        reqdoc: data[0].verification.request,
        verified: data[0].verification.isverified,
      });
    } else {
      alert(data);
      setdtl({ display: false });
    }
    setprcs(false);
  };
  const update = async () => {
    const { rc, car, policy, permit, reqdoc, verified } = flt;
    if (
      typeof rc !== "boolean" ||
      typeof car !== "boolean" ||
      typeof policy !== "boolean" ||
      typeof permit !== "boolean" ||
      typeof reqdoc !== "boolean" ||
      typeof verified !== "boolean"
    ) {
      return alert("invalid request");
    }
    let updt = {};
    if (itm.faultin.rc !== rc) {
      updt = { ...updt, rc: rc.toString() };
    }
    if (itm.faultin.car !== car) {
      updt = { ...updt, car: car.toString() };
    }
    if (itm.faultin.policy !== policy) {
      updt = { ...updt, policy: policy.toString() };
    }
    if (itm.faultin.permit !== permit) {
      updt = { ...updt, permit: permit.toString() };
    }
    if (itm.verification.reqdoc !== reqdoc) {
      updt = { ...updt, reqdoc: reqdoc.toString() };
    }
    if (itm.verification.isverified !== verified) {
      updt = { ...updt, verified: verified.toString() };
    }
    updt = { ...updt, rcnum, oprtrid };
    setprcs(true);
    const result = await fetch("/oceannodes/operator/car/update", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(updt),
    });
    const data = await result.json();
    if (result.status === 201) {
      card();
    } else {
      alert(data);
      setdtl({ display: false });
    }
  };
  useEffect(() => {
    card();
    // eslint-disable-next-line
  }, []);
  let name, value;
  const handelflt = (e) => {
    name = e.target.name;
    if (e.target.value === "true") {
      value = true;
    } else {
      value = false;
    }
    setflt({ ...flt, [name]: value });
  };
  return (
    <>
      {prcs ? (
        <Dataload />
      ) : (
        <div className="dlt-con">
          <div className="dtl-hd">
            {itm.cabid}
            <div>
              <button
                className="dtl-clsr"
                style={{ backgroundColor: "lightgreen", margin: "0px 5px" }}
                onClick={card}
              >
                <FiRefreshCw />
              </button>
              <button
                className="dtl-clsr"
                onClick={() => {
                  setdtl({ display: false, oprtrid: "", phone: "" });
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
                  <td>Model</td>
                  <td>{itm.name}</td>
                </tr>
                <tr>
                  <td>Rc Number</td>
                  <td>{itm.carNumber}</td>
                </tr>
                <tr>
                  <td>Category</td>
                  <td>{itm.category}</td>
                </tr>
                <tr>
                  <td>Reg Year</td>
                  <td>{itm.regyear}</td>
                </tr>
                <tr>
                  <td>Operated by</td>
                  <td>{itm.operatedby}</td>
                </tr>
                <tr>
                  <td>Vefication</td>
                  <td>
                    {itm.verification.isverified
                      ? "Verified"
                      : itm.verification.request
                      ? "Document required"
                      : "Pending"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bkng-optn">
            <div
              className={
                optn.tdl === "docs"
                  ? "optn-itm optn-actv ovrly-ad"
                  : "optn-itm ovrly-ad"
              }
              onClick={() => {
                setoptn({ tdl: "docs" });
              }}
            >
              Document
            </div>
          </div>
          {optn.tdl === "docs" ? (
            <div className="bkngedt-con">
              <div className="bkng-edthd">Documents</div>

              <div
                className={
                  Zoom.carimg ? "img-prvwcon img-prvconzmd" : "img-prvwcon"
                }
              >
                <div className={Zoom.carimg ? "img-prv img-prvzmd" : "img-prv"}>
                  <img
                    src={`/oceannodes/partner/resources/images/car/${itm.cabid}/`.concat(
                      itm.carLink + "?" + tme
                    )}
                    alt=""
                    className={Zoom.carimg ? "zmd-img" : "zmbl-img"}
                  />
                  {Zoom.carimg ? (
                    <div
                      className="cls-prv"
                      onClick={() => {
                        setZoom({ ...Zoom, carimg: false });
                      }}
                    >
                      <FaTimes />
                    </div>
                  ) : (
                    <div className="img-ovrly">
                      <span
                        onClick={() => {
                          setZoom({ ...Zoom, carimg: true });
                        }}
                      >
                        <MdFullscreen />
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <table className="frm-tbl">
                <tbody>
                  <tr>
                    <td>Model</td>
                    <td>{itm.name}</td>
                  </tr>
                  <tr>
                    <td>Category</td>
                    <td>{itm.category}</td>
                  </tr>
                  <tr>
                    <td>Any fault</td>
                    <td>
                      <select
                        name="car"
                        className="frm-tblinp"
                        value={flt.car ? "true" : "false"}
                        onChange={handelflt}
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div
                className={
                  Zoom.rc ? "img-prvwcon img-prvconzmd" : "img-prvwcon"
                }
              >
                <div className={Zoom.rc ? "img-prv img-prvzmd" : "img-prv"}>
                  <img
                    src={`/oceannodes/partner/resources/images/car/${itm.cabid}/`.concat(
                      itm.rcLink + "?" + tme
                    )}
                    alt=""
                    className={Zoom.rc ? "zmd-img" : "zmbl-img"}
                  />
                  {Zoom.rc ? (
                    <div
                      className="cls-prv"
                      onClick={() => {
                        setZoom({ ...Zoom, rc: false });
                      }}
                    >
                      <FaTimes />
                    </div>
                  ) : (
                    <div className="img-ovrly">
                      <span
                        onClick={() => {
                          setZoom({ ...Zoom, rc: true });
                        }}
                      >
                        <MdFullscreen />
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <table className="frm-tbl">
                <tbody>
                  <tr>
                    <td>Rc Number</td>
                    <td>{itm.carNumber}</td>
                  </tr>
                  <tr>
                    <td>Any fault</td>
                    <td>
                      <select
                        name="rc"
                        className="frm-tblinp"
                        value={flt.rc ? "true" : "false"}
                        onChange={handelflt}
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div
                className={
                  Zoom.prmt ? "img-prvwcon img-prvconzmd" : "img-prvwcon"
                }
              >
                <div className={Zoom.prmt ? "img-prv img-prvzmd" : "img-prv"}>
                  <img
                    src={`/oceannodes/partner/resources/images/car/${itm.cabid}/`.concat(
                      itm.permitLink + "?" + tme
                    )}
                    alt=""
                    className={Zoom.prmt ? "zmd-img" : "zmbl-img"}
                  />
                  {Zoom.prmt ? (
                    <div
                      className="cls-prv"
                      onClick={() => {
                        setZoom({ ...Zoom, prmt: false });
                      }}
                    >
                      <FaTimes />
                    </div>
                  ) : (
                    <div className="img-ovrly">
                      <span
                        onClick={() => {
                          setZoom({ ...Zoom, prmt: true });
                        }}
                      >
                        <MdFullscreen />
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <table className="frm-tbl">
                <tbody>
                  <tr>
                    <td>Permit type</td>
                    <td>{itm.permitType}</td>
                  </tr>
                  <tr>
                    <td>Permit validity</td>
                    <td>
                      {new Date(itm.permitValidity).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                  <tr>
                    <td>Any fault</td>
                    <td>
                      <select
                        name="permit"
                        className="frm-tblinp"
                        value={flt.permit ? "true" : "false"}
                        onChange={handelflt}
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div
                className={
                  Zoom.plcy ? "img-prvwcon img-prvconzmd" : "img-prvwcon"
                }
              >
                <div className={Zoom.plcy ? "img-prv img-prvzmd" : "img-prv"}>
                  <img
                    src={`/oceannodes/partner/resources/images/car/${itm.cabid}/`.concat(
                      itm.policyLink + "?" + tme
                    )}
                    alt=""
                    className={Zoom.plcy ? "zmd-img" : "zmbl-img"}
                  />
                  {Zoom.plcy ? (
                    <div
                      className="cls-prv"
                      onClick={() => {
                        setZoom({ ...Zoom, plcy: false });
                      }}
                    >
                      <FaTimes />
                    </div>
                  ) : (
                    <div className="img-ovrly">
                      <span
                        onClick={() => {
                          setZoom({ ...Zoom, plcy: true });
                        }}
                      >
                        <MdFullscreen />
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <table className="frm-tbl">
                <tbody>
                  <tr>
                    <td>Policy No</td>
                    <td>{itm.policyNo}</td>
                  </tr>
                  <tr>
                    <td>Policy Validity</td>
                    <td>
                      {new Date(itm.policyValidity).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                  <tr>
                    <td>Any fault</td>
                    <td>
                      <select
                        name="policy"
                        className="frm-tblinp"
                        value={flt.policy ? "true" : "false"}
                        onChange={handelflt}
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td>Request document</td>
                    <td>
                      <select
                        name="reqdoc"
                        className="frm-tblinp"
                        value={flt.reqdoc ? "true" : "false"}
                        onChange={handelflt}
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td>Verified</td>
                    <td>
                      <select
                        name="verified"
                        className="frm-tblinp"
                        value={flt.verified ? "true" : "false"}
                        onChange={handelflt}
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
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
        </div>
      )}
    </>
  );
};

export default Cardtl;
