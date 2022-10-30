import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { CgArrowsExchange, CgArrowRight } from "react-icons/cg";
const Startrip = (recived) => {
  const start = recived.start;
  const setstart = recived.setstart;
  const data = start.bkng;
  const triplog = recived.triplog;
  const [starts, setstarts] = useState({
    Startkm: "",
    actn: "nw",
    prgrs: false,
  });
  const [otp, setotp] = useState({ display: false, code: "" });
  let name, value;
  const handelinput = (e) => {
    name = e.target.name;
    value = e.target.value;
    setstarts({ ...starts, [name]: value });
  };
  const handelotp = (e) => {
    name = e.target.name;
    value = e.target.value;
    if (value.length <= 6) {
      setotp({ ...otp, [name]: value });
    }
  };
  const submitkm = async () => {
    let { Startkm, actn } = starts;
    if (
      !actn ||
      typeof Startkm !== "string" ||
      !["nw", "rsnd"].some((itm) => actn === itm)
    ) {
      return alert("Invalid request");
    }
    if (actn === "nw") {
      if (!Startkm || typeof Startkm !== "string") {
        return alert("Invalid request");
      }
    } else {
      if (!over) {
        return;
      }
    }
    setstarts({ ...starts, prgrs: true });
    const res = await fetch("/driver/trip/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Startkm: Startkm.toString(),
        bookingid: data.bookingid,
        email: data.email,
        actn,
      }),
    });
    const result = await res.json();
    if (res.status === 201) {
      alert("an otp has been sent to customer");
      setotp({ display: true, code: "" });
      setstarts({ Startkm: "", prgrs: false, actn: "rsnd" });
      setcount(30);
      timer();
    } else {
      alert(result);
      setstarts({ ...starts, prgrs: false });
    }
  };

  // === === === verify and start === === === //

  const verifyotp = async () => {
    let { code } = otp;
    if (!code || typeof code !== "string" || isNaN(code)) {
      return alert("Invalid request");
    }
    if (code.length !== 6) {
      return;
    }
    setstarts({ ...starts, prgrs: true });
    const res = await fetch("/driver/trip/verifyotp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: code,
        bookingid: data.bookingid,
        email: data.email,
      }),
    });
    const result = await res.json();
    if (res.status === 200) {
      alert(result);
      triplog("upcmng");
      setstart({ display: false, bkng: "" });
    } else {
      alert(result);
      setstarts({ ...starts, prgrs: false });
    }
  };

  const [count, setcount] = useState(30);
  const [over, setover] = useState(false);
  function timer() {
    setover(false);
    let time = 30;
    let timer1 = setInterval(() => {
      if (time <= 1) {
        clearInterval(timer1);
        setover(true);
      } else {
        time--;
        setcount(time);
      }
    }, 1000);
  }
  return (
    <div className="form-container">
      <div
        className={starts.prgrs ? "form-box ovrly-ad" : "form-box"}
        style={{ height: "fit-content", margin: "auto" }}
      >
        <div className="bkngdtl-hd">
          Start Trip
          <div
            className="clsr-con"
            onClick={() => {
              setstart({ display: false, bkng: "" });
            }}
          >
            <FaTimes />
          </div>
        </div>
        <div className="bkng-dtlcon">
          <table className="bkngdtl-tbl">
            <tbody>
              <tr>
                <td>Booking type</td>
                <td>{data.bookingtype}</td>
              </tr>
              <tr>
                <td>
                  {data.bookingtype === "Outstation"
                    ? "Outstation Type"
                    : "Rental Package"}
                </td>
                <td>
                  {data.bookingtype === "Outstation"
                    ? `${data.outstation} (${data.tripinfo.distance} KM)`
                    : `(${data.tripinfo.hour} Hour ||${data.tripinfo.distance} KM)`}
                </td>
              </tr>
              <tr>
                <td>{data.bookingtype === "Local" ? "City" : "Route"}</td>
                <td>
                  {data.sourcecity.from.split(",")[0]}

                  {data.bookingtype === "Local" ? (
                    ""
                  ) : data.outstation === "Roundtrip" ? (
                    <>
                      <CgArrowsExchange />
                      {data.endcity.to.split(",")[0]}
                    </>
                  ) : (
                    <>
                      <CgArrowRight />
                      {data.endcity.to.split(",")[0]}
                    </>
                  )}
                </td>
              </tr>
              <tr>
                <td>Cab</td>
                <td>
                  {data.tripinfo.equivalent.isequi
                    ? `${data.tripinfo.name} or equi`
                    : data.tripinfo.name}
                </td>
              </tr>
              <tr>
                <td>Pickup Date</td>
                <td>{new Date(data.pickupdate).toLocaleDateString("en-IN")}</td>
              </tr>
              <tr>
                <td>Pickup Time</td>
                <td>{new Date(data.pickupat).toLocaleTimeString("en-IN")}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {otp.display ? (
          <table className="frm-table" style={{ marginTop: "10px" }}>
            <tbody>
              <tr>
                <td style={{ paddingLeft: "5%" }}>
                  Otp<span className="rd-txt">*</span>
                </td>
                <td>
                  <input
                    type="number"
                    name="code"
                    placeholder="Enter OTP"
                    className="frm-tableinp"
                    value={otp.code}
                    onChange={handelotp}
                    style={{ maxWidth: "100%" }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <table className="frm-table" style={{ marginTop: "10px" }}>
            <tbody>
              <tr>
                <td style={{ paddingLeft: "5%" }}>
                  Start Km<span className="rd-txt">*</span>
                </td>
                <td>
                  <input
                    type="number"
                    name="Startkm"
                    placeholder="Enter Start km"
                    className="frm-tableinp"
                    value={starts.startkm}
                    onChange={handelinput}
                    style={{ maxWidth: "100%" }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        )}
        <div className="form-btmcon">
          <button
            className={starts.prgrs ? "frm-sbmtbtn ldng-btn" : "frm-sbmtbtn"}
            onClick={otp.display ? verifyotp : submitkm}
          >
            <span>{otp.display ? "Verify OTP" : "Submit"}</span>
          </button>
        </div>
        {otp.display ? (
          <div style={{ padding: "7px", display: "flex" }}>
            <span
              href="#"
              onClick={submitkm}
              style={{
                cursor: "pointer",
                margin: "auto",
                color: count >= 1 ? "#74a8bd" : "skyblue",
                fontFamily: "sans-serif",
              }}
            >
              Resend OTP {over ? "" : `in ${count} Sec`}
            </span>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default Startrip;
