import React, { useState, useEffect } from "react";
import Dataload from "../Loading/Dataload";
import { FaTimes } from "react-icons/fa";
import "./Cstmrdtl.css";
const Cstmrdtl = (recived) => {
  const dtl = recived.dtl;
  const setdtl = recived.setdtl;
  const email = dtl.email;
  const phone = dtl.phone;
  const [prcs, setprcs] = useState(true);
  const [itm, setitm] = useState({});
  const client = async () => {
    setprcs(true);
    const result = await fetch("/oceannodes/client", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        entry: 1,
        pag: 1,
        email,
        phone,
      }),
    });
    const data = await result.json();
    if (result.status === 200) {
      setitm(data[0]);
      setstatus(data[0].isverified);
    } else {
      setdtl({ display: false, email: "", phone: "" });
    }
    setprcs(false);
  };
  const update = async (req, res) => {
    if(typeof email !== "string" || typeof phone !== "string" || typeof status !== "string"){
      return alert("Invalid request")
    }
    setprcs(true);
    const result = await fetch("/oceannodes/client/status", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email,
        phone,
        status,
      }),
    });
    const data = await result.json();
    if (result.status === 201) {
      client();
      setprcs(true);
      return alert("update successfull");
    } else {
      setprcs(true);
      alert(data);
    }
  };
  useEffect(() => {
    client();
    // eslint-disable-next-line
  }, []);
  const [status, setstatus] = useState("");
  return (
    <div className="sml-dtl">
      {prcs ? (
        <Dataload style={{ height: "100%" }} />
      ) : (
        <div className="sml-dtlbx">
          <div className="dtl-hd">
            {itm.id}{" "}
            <div
              className="clsr"
              onClick={() => {
                setdtl({ display: false, email: "", phone: "" });
              }}
            >
              <FaTimes />
            </div>
          </div>
          <table className="dtl-tbl">
            <tbody>
              <tr>
                <td>Name</td>
                <td>{itm.firstName + " " + itm.lastName}</td>
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
                <td>Phone</td>
                <td>
                  <a href={"tel:+91".concat(itm.phone)} className="blu-links">
                    {itm.phone}
                  </a>
                </td>
              </tr>
              {itm.aPhone ? (
                <tr>
                  <td>Sec. Phone</td>
                  <td>
                    <a
                      href={"tel:+91".concat(itm.aPhone)}
                      className="blu-links"
                    >
                      {itm.aPhone}
                    </a>
                  </td>
                </tr>
              ) : (
                ""
              )}
              <tr>
                <td>Status</td>
                <td>
                  {itm.isverified.charAt(0).toUpperCase() +
                    itm.isverified.slice(1)}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="inpt-row">
            <span className="edt-span">Change status</span>
            <select
              className="edt-inpt"
              name="rsn"
              value={status}
              onChange={(e) => {
                setstatus(e.target.value);
              }}
            >
              <option value="blocked">Blocked</option>
              <option value="authorised">Authorised</option>
              <option value="unauthorised">Unauthorised</option>
            </select>
          </div>
          {status !== itm.isverified ? (
            <div className="inpt-row">
              <button
                type="submit"
                className="ctl-btn"
                style={{ margin: "auto" }}
                onClick={update}
              >
                Submit
              </button>
            </div>
          ) : (
            ""
          )}
        </div>
      )}
    </div>
  );
};

export default Cstmrdtl;
