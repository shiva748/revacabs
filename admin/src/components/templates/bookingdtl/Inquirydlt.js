import React, { useState, useEffect } from "react";
import { TiArrowBackOutline } from "react-icons/ti";
import { CgArrowsExchange, CgArrowRight } from "react-icons/cg";
import { FiRefreshCw } from "react-icons/fi";
import Dataload from "../Loading/Dataload";
const Inquirydlt = (recived) => {
  const { dtl, setdtl, inqu } = recived;
  const id = dtl.id;
  const [itm, setitm] = useState({});
  const [prcs, setprcs] = useState(true);
  const [rmv, setrmv] = useState({ rsn: "", rsndes: "" });
  // === === === get details === === === //

  const inquiry = async () => {
    setprcs(true);
    const res = await fetch("/oceannodes/booking/inquiry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bkngid: id,
        inqutyp: "dtl",
      }),
    });
    const data = await res.json();
    if (res.status !== 200 || data.length <= 0) {
      inqu();
      setdtl({ display: false, id: "" });
    } else {
      setitm(data[0]);
      setprcs(false);
    }
  };
  useEffect(() => {
    inquiry();
    // eslint-disable-next-line
  }, []);

  // === === === remove inquiry === === === //

  const remove = async (e) => {
    e.preventDefault();
    const { rsn, rsndes } = rmv;
    setprcs(true);
    const res = await fetch("/oceannodes/booking/inquiry/remove", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rsn,
        rsndes,
        bookingid: id,
      }),
    });
    const data = await res.json();
    if (res.status === 201) {
      inqu();
      alert("Inquiry removed successfully");
      setdtl({ display: false, id: "" });
    } else {
      alert(data);
    }
    setprcs(false);
  };

  const handelrmv = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    if ((name === "rsn" && value !== "Other") || rmv.rsn !== "Other") {
      setrmv({ [name]: value, rsndes: "" });
    } else {
      setrmv({ ...rmv, [name]: value });
    }
  };
  return (
    <>
      {prcs ? (
        <Dataload />
      ) : (
        <div className="dlt-con">
          <div className="dtl-hd">
            {itm.bookingid}
            <div>
              <button
                className="dtl-clsr"
                onClick={inquiry}
                style={{ backgroundColor: "lightgreen", margin: "0px 5px" }}
              >
                <FiRefreshCw />
              </button>
              <button
                className="dtl-clsr"
                onClick={() => {
                  setdtl({ display: false, id: "" });
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
                  <td>{itm.bookingtype === "Local" ? "City" : "Route"}</td>
                  <td>
                    {itm.sourcecity.from.split(",")[0]}
                    {itm.bookingtype === "Local" ? (
                      ""
                    ) : itm.outstation === "Roundtrip" ? (
                      <>
                        <CgArrowsExchange />
                        {itm.endcity.to.split(",")[0]}
                      </>
                    ) : (
                      <>
                        <CgArrowRight />
                        {itm.endcity.to.split(",")[0]}
                      </>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>
                    {itm.bookingtype === "Local"
                      ? "Rental type"
                      : "Outstation type "}
                  </td>
                  <td>
                    {itm.bookingtype === "Local"
                      ? `${itm.tripinfo.hour}hr || ${itm.tripinfo.distance}km`
                      : `${itm.outstation} (${itm.tripinfo.distance}km)`}
                  </td>
                </tr>
                <tr>
                  <td>Pickup date</td>
                  <td>{new Date(itm.pickupat).toLocaleDateString("gu-IN")}</td>
                </tr>
                <tr>
                  <td>Pickup time</td>
                  <td>{new Date(itm.pickupat).toLocaleTimeString("en-IN")}</td>
                </tr>
                <tr>
                  <td>Rate</td>
                  <td>₹{itm.payable}</td>
                </tr>
                {itm.bookingtype === "Local" ? (
                  ""
                ) : (
                  <tr>
                    <td>State tax & tolls</td>
                    <td>
                      {itm.tripinfo.othercharges.Tolltaxes.isinclude
                        ? "Included"
                        : "Extra"}
                    </td>
                  </tr>
                )}
                <tr>
                  <td>Email</td>
                  <td>{itm.email}</td>
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
                  <td>Inquiry date</td>
                  <td>
                    {new Date(itm.bookingdate).toLocaleDateString("en-IN")}
                  </td>
                </tr>
                <tr>
                  <td>Inquiry time</td>
                  <td>
                    {new Date(itm.bookingdate).toLocaleTimeString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="bkng-optn">
              <div className="optn-itm optn-actv ovrly-ad">Remove</div>
            </div>
            <div className="bkngedt-con">
              <div className="bkng-edthd">Remove inquiry</div>
              <form>
                <div className="inpt-row">
                  <span className="edt-span">Reason</span>
                  <select
                    className="edt-inpt"
                    value={rmv.rsn}
                    name="rsn"
                    onChange={handelrmv}
                  >
                    <option value="">Select reason</option>
                    <option value="Advance problem">Advance problem</option>
                    <option value="High price">High price</option>
                    <option value="Cab model">Cab model</option>
                    <option value="State tax & tolls">State tax & tolls</option>
                    <option value="Night charges">Night charges</option>
                    <option value="Fake Inquiry">Fake Inquiry</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {rmv.rsn === "Other" ? (
                  <div className="inpt-row">
                    <span className="edt-span">Describe</span>
                    <input
                      type="text"
                      className="edt-inpt"
                      placeholder="Cancel reason"
                      value={rmv.rsndes}
                      name="rsndes"
                      onChange={handelrmv}
                    />
                  </div>
                ) : (
                  ""
                )}
                <div className="inpt-row" style={{ marginTop: "15px" }}>
                  <button type="submit" className="ad-btn" onClick={remove}>
                    Remove
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Inquirydlt;
