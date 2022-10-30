import React, { useState, useEffect } from "react";
import Dataload from "../Loading/Dataload";
import { FaTimes } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { TiArrowBackOutline } from "react-icons/ti";
import validator from "validator";
import "./Oprtrdtl.css";
import { MdFullscreen } from "react-icons/md";

const Oprtrdtl = (recived) => {
  const setdtl = recived.setdtl;
  const dtl = recived.dtl;
  const [itm, setitm] = useState({});
  const [prcs, setprcs] = useState(true);
  const [optn, setoptn] = useState({ tdl: "docs" });
  const { phone, oprtrid, email } = dtl;
  const [Zoom, setZoom] = useState({ aadh: false, dl: false, prfl: false });
  const [flt, setflt] = useState({});
  const [tme, settme] = useState();
  const operator = async () => {
    if (oprtrid) {
      if (typeof phone !== "string") {
        return alert("Invalid operator id");
      }
    }
    if (phone) {
      if (
        typeof phone !== "string" ||
        !validator.isMobilePhone(phone, "en-IN")
      ) {
        return alert("Invalid phone");
      }
    }
    if (email) {
      if (typeof email !== "string" || !validator.isEmail(email)) {
        return alert("Invalid email");
      }
    } else {
      setdtl({ display: false });
      alert("invalid request");
      return;
    }
    setprcs(true);
    const result = await fetch("/oceannodes/operator", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        entry: 10,
        pag: 1,
        oprtrid,
        phone,
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
      drivers(data.operatorid);
      cars(data.operatorid);
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
    updt = { ...updt, email: itm.email, phone: phone.toString(), oprtrid };
    setprcs(true);
    const result = await fetch("/oceannodes/operator/update", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(updt),
    });
    const data = await result.json();
    if (result.status === 201) {
      operator();
    } else {
      alert(data);
      setdtl({ display: false });
    }
  };
  useEffect(() => {
    operator();
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

  // === === === load drivers  === === === //
  const [drvrlst, setdrvrlst] = useState([]);
  const drivers = async (oprtrid) => {
    if (oprtrid) {
      if (typeof oprtrid !== "string") {
        return alert("Invalid operator id");
      }
    }
    const result = await fetch("/oceannodes/operator/driver", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        entry: 200,
        pag: 1,
        oprtrid,
        typ: "lst",
      }),
    });
    const data = await result.json();
    if (result.status === 200) {
      setdrvrlst(data);
    } else {
      alert(data);
    }
  };

  // === === === list cars === === === //
  const [carslst, setcarslst] = useState([]);
  const cars = async (oprtrid) => {
    if (oprtrid) {
      if (typeof oprtrid !== "string") {
        return alert("Invalid operator id");
      }
    }

    const result = await fetch("/oceannodes/operator/car", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        entry: 200,
        pag: 1,
        oprtrid,
        typ: "lst",
      }),
    });
    const data = await result.json();
    if (result.status === 200) {
      setcarslst(data);
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
            {itm.operatorid}
            <div>
              <button
                className="dtl-clsr"
                style={{ backgroundColor: "lightgreen", margin: "0px 5px" }}
                onClick={operator}
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
                      : itm.approved
                      ? "Pending"
                      : "New Request"}
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
                optn.tdl === "drvrs"
                  ? "optn-itm optn-actv ovrly-ad"
                  : "optn-itm ovrly-ad"
              }
              onClick={() => {
                setoptn({ tdl: "drvrs" });
              }}
            >
              Drivers
            </div>
            <div
              className={
                optn.tdl === "cbs"
                  ? "optn-itm optn-actv ovrly-ad"
                  : "optn-itm ovrly-ad"
              }
              onClick={() => {
                setoptn({ tdl: "cbs" });
              }}
            >
              Cabs
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
                        src={`/oceannodes/partner/resources/images/operator/${itm.operatorid}/`.concat(
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
                        src={`/oceannodes/partner/resources/images/operator/${itm.operatorid}/`.concat(
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
                        src={`/oceannodes/partner/resources/images/operator/${itm.operatorid}/`.concat(
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
          {optn.tdl === "drvrs" ? (
            <>
              <div class="bkng-edthd">Drivers</div>
              {drvrlst.length <= 0 ? (
                <div className="nrc-con">
                  <img src="/icons/nrec.png" alt="" />
                  <p className="nrc-txt">No Operator found</p>
                </div>
              ) : (
                <table className="cstm-tbl">
                  <thead>
                    <tr>
                      <td>Driver id</td>
                      <td>Name</td>
                      <td>Phone no</td>
                      <td>#</td>
                    </tr>
                  </thead>
                  <tbody>
                    {drvrlst.map((itm, i) => {
                      return (
                        <tr key={i}>
                          <td name="Driver id">{itm.driverid}</td>
                          <td name="Name">
                            {itm.firstName
                              .charAt(0)
                              .toUpperCase()
                              .concat(
                                itm.firstName.slice(1) + ` ${itm.lastName}`
                              )}
                          </td>
                          <td name="Phone no">
                            <a
                              href={"tel:+91 ".concat(itm.phone)}
                              className="blu-links"
                            >
                              {itm.phone}
                            </a>
                          </td>
                          <td name="Email">
                            <a
                              href={"mailto:".concat(itm.email)}
                              className="blu-links"
                            >
                              {itm.email}
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </>
          ) : (
            ""
          )}
          {optn.tdl === "cbs" ? (
            <>
              <div class="bkng-edthd">Cabs</div>
              {carslst.length <= 0 ? (
                <div className="nrc-con">
                  <img src="/icons/nrec.png" alt="" />
                  <p className="nrc-txt">No Cars found</p>
                </div>
              ) : (
                <table className="cstm-tbl">
                  <thead>
                    <tr>
                      <td>Model</td>
                      <td>Number</td>
                      <td>Insurance till</td>
                      <td>Permit till</td>
                    </tr>
                  </thead>
                  <tbody>
                    {carslst.map((itm, i) => {
                      return (
                        <tr key={i}>
                          <td name="Model">{itm.name}</td>
                          <td name="Number">{itm.carNumber}</td>
                          <td name="Insurance till">
                            {new Date(itm.policyValidity).toLocaleDateString(
                              "en-IN"
                            )}
                          </td>
                          <td name="Permit till">
                            {new Date(itm.permitValidity).toLocaleDateString(
                              "en-IN"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </>
          ) : (
            ""
          )}
        </div>
      )}
    </>
  );
};

export default Oprtrdtl;
