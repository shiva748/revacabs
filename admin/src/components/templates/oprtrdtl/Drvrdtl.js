import React, { useState, useEffect } from "react";
import Dataload from "../Loading/Dataload";
import { FaTimes } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { TiArrowBackOutline } from "react-icons/ti";
import "./Oprtrdtl.css";
import { MdFullscreen } from "react-icons/md";
import validator from "validator";
const Drvrdtl = (recived) => {
  const setdtl = recived.setdtl;
  const dtl = recived.dtl;
  const [itm, setitm] = useState({});
  const [prcs, setprcs] = useState(true);
  const [optn, setoptn] = useState({ tdl: "docs" });
  const { oprtrid, drvrid, email } = dtl;
  const [Zoom, setZoom] = useState({ aadh: false, dl: false, prfl: false });
  const [flt, setflt] = useState({});
  const [tme, settme] = useState();
  const driver = async () => {
    if (oprtrid) {
      if (typeof oprtrid !== "string") {
        return alert("Invalid operator id");
      }
    }
    if (drvrid) {
      if (typeof drvrid !== "string") {
        return alert("invalid driver id");
      }
    }
    if (!email || !validator.isEmail(email)) {
      alert("invalid request");
      setdtl({ display: false });
      return;
    }
    setprcs(true);
    const result = await fetch("/oceannodes/operator/driver", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        entry: 10,
        pag: 1,
        oprtrid,
        drvrid,
        email,
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
        alog: data[0].approved,
      });
    } else {
      alert(data);
      setdtl({ display: false });
    }
    setprcs(false);
  };
  const update = async () => {
    const { basc, prfl, aadh, dl, alog, reqdoc, verified } = flt;
    if (
      typeof basc !== "boolean" ||
      typeof aadh !== "boolean" ||
      typeof prfl !== "boolean" ||
      typeof dl !== "boolean" ||
      typeof reqdoc !== "boolean" ||
      typeof verified !== "boolean"
    ) {
      return alert("invalid request");
    }
    let updt = {};
    if (itm.faultin.aadh !== aadh) {
      updt = { ...updt, aadh: aadh.toString() };
    }
    if (itm.faultin.prfl !== prfl) {
      updt = { ...updt, prfl: prfl.toString() };
    }
    if (itm.faultin.basc !== basc) {
      updt = { ...updt, basc: basc.toString() };
    }
    if (itm.faultin.dl !== dl) {
      updt = { ...updt, dl: dl.toString() };
    }
    if (itm.verification.reqdoc !== reqdoc) {
      updt = { ...updt, reqdoc: reqdoc.toString() };
    }
    if (itm.verification.isverified !== verified) {
      updt = { ...updt, verified: verified.toString() };
    }
    if (itm.approved !== alog) {
      updt = { ...updt, alog: alog.toString() };
    }
    updt = { ...updt, email: itm.email, drvrid, oprtrid, phone: itm.phone };
    setprcs(true);
    const result = await fetch("/oceannodes/operator/driver/update", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(updt),
    });
    const data = await result.json();
    if (result.status === 201) {
      driver();
    } else {
      alert(data);
      setdtl({ display: false });
    }
  };

  // === === === approve login === === === //

  const approvelogin = async () => {
    const { alog } = flt;
    if (typeof alog !== "boolean") {
      return alert("invalid request");
    }
    setprcs(true);
    const result = await fetch("/oceannodes/operator/driver/approve", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        alog: alog.toString(),
        email: itm.email,
        drvrid,
        oprtrid,
        phone: itm.phone,
      }),
    });
    const data = await result.json();
    if (result.status === 201) {
      driver();
    } else {
      alert(data);
      setdtl({ display: false });
    }
  };

  useEffect(() => {
    driver();
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
            {itm.driverid}
            <div>
              <button
                className="dtl-clsr"
                style={{ backgroundColor: "lightgreen", margin: "0px 5px" }}
                onClick={driver}
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
                  <td>Name</td>
                  <td>
                    {itm.firstName.charAt(0).toUpperCase() +
                      itm.firstName.slice(1) +
                      " " +
                      itm.lastName}
                  </td>
                </tr>
                <tr>
                  <td>Phone</td>
                  <td>
                    <a href={"tel:+91".concat(itm.phone)} className="blu-links">
                      {itm.phone}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>Sec Phone</td>
                  <td>
                    {itm.aPhone ? (
                      <a
                        href={"tel:+91".concat(itm.aPhone)}
                        className="blu-links"
                      >
                        {itm.aPhone}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>
                </tr>
                <tr>
                  <td>City</td>
                  <td>{itm.city ? itm.city : "N/A"}</td>
                </tr>
                <tr>
                  <td>Email</td>
                  <td>
                    <a href={"mailto:".concat(itm.email)} className="blu-links">
                      {itm.email}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>Login approved</td>
                  <td>{itm.approved ? "Yes" : "No"}</td>
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
            <div
              className={
                optn.tdl === "alog"
                  ? "optn-itm optn-actv ovrly-ad"
                  : "optn-itm ovrly-ad"
              }
              onClick={() => {
                setoptn({ tdl: "alog" });
              }}
            >
              Login
            </div>
          </div>
          {optn.tdl === "docs" ? (
            <div className="bkngedt-con">
              <div className="bkng-edthd">Documents</div>
              {itm.Doc ? (
                <>
                  <div
                    className={
                      Zoom.prfl ? "img-prvwcon img-prvconzmd" : "img-prvwcon"
                    }
                  >
                    <div
                      className={Zoom.prfl ? "img-prv img-prvzmd" : "img-prv"}
                    >
                      <img
                        src={`/oceannodes/partner/resources/images/driver/${itm.driverid}/`.concat(
                          itm.Profile + "?" + tme
                        )}
                        alt=""
                        className={Zoom.prfl ? "zmd-img" : "zmbl-img"}
                      />
                      {Zoom.prfl ? (
                        <div
                          className="cls-prv"
                          onClick={() => {
                            setZoom({ ...Zoom, prfl: false });
                          }}
                        >
                          <FaTimes />
                        </div>
                      ) : (
                        <div className="img-ovrly">
                          <span
                            onClick={() => {
                              setZoom({ ...Zoom, prfl: true });
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
                        <td>Any fault</td>
                        <td>
                          <select
                            name="prfl"
                            className="frm-tblinp"
                            value={flt.prfl ? "true" : "false"}
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
                      Zoom.aadh ? "img-prvwcon img-prvconzmd" : "img-prvwcon"
                    }
                  >
                    <div
                      className={Zoom.aadh ? "img-prv img-prvzmd" : "img-prv"}
                    >
                      <img
                        src={`/oceannodes/partner/resources/images/driver/${itm.driverid}/`.concat(
                          itm.Doc.Aadhaar.Link + "?" + tme
                        )}
                        alt=""
                        className={Zoom.aadh ? "zmd-img" : "zmbl-img"}
                      />
                      {Zoom.aadh ? (
                        <div
                          className="cls-prv"
                          onClick={() => {
                            setZoom({ ...Zoom, aadh: false });
                          }}
                        >
                          <FaTimes />
                        </div>
                      ) : (
                        <div className="img-ovrly">
                          <span
                            onClick={() => {
                              setZoom({ ...Zoom, aadh: true });
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
                        <td>Aadhaar Number</td>
                        <td>{itm.Doc.Aadhaar.Number}</td>
                      </tr>
                      <tr>
                        <td>Any fault</td>
                        <td>
                          <select
                            name="aadh"
                            className="frm-tblinp"
                            value={flt.aadh ? "true" : "false"}
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
                      Zoom.dl ? "img-prvwcon img-prvconzmd" : "img-prvwcon"
                    }
                  >
                    <div className={Zoom.dl ? "img-prv img-prvzmd" : "img-prv"}>
                      <img
                        src={`/oceannodes/partner/resources/images/driver/${itm.driverid}/`.concat(
                          itm.Doc.Drivinglicense.Link + "?" + tme
                        )}
                        alt=""
                        className={Zoom.dl ? "zmd-img" : "zmbl-img"}
                      />
                      {Zoom.dl ? (
                        <div
                          className="cls-prv"
                          onClick={() => {
                            setZoom({ ...Zoom, dl: false });
                          }}
                        >
                          <FaTimes />
                        </div>
                      ) : (
                        <div className="img-ovrly">
                          <span
                            onClick={() => {
                              setZoom({ ...Zoom, dl: true });
                            }}
                          >
                            <MdFullscreen />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                ""
              )}
              <table className="frm-tbl">
                <tbody>
                  {itm.Doc ? (
                    <>
                      <tr>
                        <td>DL Number</td>
                        <td>{itm.Doc.Drivinglicense.Number}</td>
                      </tr>
                      <tr>
                        <td>DL Validity</td>
                        <td>
                          {new Date(
                            itm.Doc.Drivinglicense.Validity
                          ).toLocaleDateString("en-IN")}
                        </td>
                      </tr>
                      <tr>
                        <td>Any fault</td>
                        <td>
                          <select
                            name="dl"
                            className="frm-tblinp"
                            value={flt.dl ? "true" : "false"}
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
                    </>
                  ) : (
                    ""
                  )}
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
          {optn.tdl === "alog" ? (
            <div className="bkngedt-con">
              <div className="bkng-edthd">Login</div>
              <table className="frm-tbl">
                <tbody>
                  <tr>
                    <td>Allow to login</td>
                    <td>
                      <select
                        name="alog"
                        className="frm-tblinp"
                        value={flt.alog ? "true" : "false"}
                        onChange={handelflt}
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td>Credentials</td>
                    <td>{itm.Credentials ? "Created" : "Not Created"}</td>
                  </tr>
                </tbody>
              </table>
              <div className="inpt-row">
                <button
                  className="ctl-btn"
                  style={{ margin: "auto" }}
                  onClick={approvelogin}
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

export default Drvrdtl;
