import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { FaSearch, FaRupeeSign, FaTimes } from "react-icons/fa";
import Loading from "../template/loading/Loading";
import "./css/Earning.css";
import { Helmet } from "react-helmet";
const Earning = () => {
  const [hgt, sethgt] = useState();
  const resizer = () => {
    const height = window.innerHeight - 110;
    sethgt(height);
  };
  const [ldng, setldng] = useState(true);
  window.addEventListener("resize", resizer);
  const [erng, seterng] = useState({});
  useEffect(() => {
    resizer();
    // eslint-disable-next-line
    earnings();
    // eslint-disable-next-line
  }, []);
  const earnings = async () => {
    const { from, to } = fltr;
    if (to && !from) {
      return alert("please select From Date");
    }
    if (to && from) {
      if (new Date(from) > new Date(to)) {
        return alert("From Date can not be greate then to date");
      }
    }
    setldng(true);
    let res = await fetch("/partner/earning", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: from ? new Date(from).getTime() : "",
        to: to ? new Date(to).getTime() : "",
      }),
    });
    let data = await res.json();
    if (res.status === 200) {
      seterng(data);
      setldng(false);
    } else {
      window.location.reload();
    }
  };
  const df = { from: "", to: "" };
  const [fltr, setfltr] = useState(df);
  const [dtl, setdtl] = useState({ display: false, data: {} });

  const [shw, setshw] = useState(true);
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>RevaCabs | Earning's</title>

        <meta
          name="description"
          content="Page to add, manage and update the cars"
        />
        <link rel="canonical" href="http://partner.revacabs.com/" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="multicon-hd">
        <span className="h-t1">Earning</span>
      </div>
      {ldng ? (
        <Loading />
      ) : (
        <section className="multi-con" style={{ height: `${hgt}px` }}>
          <div className="fltr-con">
            <div className="sub-fltr">
              <DatePicker
                className="inpt-t1"
                name="from"
                placeholderText="From Date"
                autoComplete="off"
                dateFormat="dd/MM/yyyy"
                selected={fltr.from}
                onChange={(value) => {
                  setfltr({ ...fltr, from: value });
                }}
                minDate={new Date(2022, 0, 1, 0, 0, 0, 0)}
                maxDate={new Date()}
              />
            </div>
            <div className="sub-fltr">
              <DatePicker
                className="inpt-t1"
                placeholderText="To Date"
                autoComplete="off"
                dateFormat="dd/MM/yyyy"
                selected={fltr.to}
                onChange={(value) => {
                  setfltr({ ...fltr, to: value });
                }}
                minDate={
                  fltr.from ? fltr.from : new Date(2022, 0, 1, 0, 0, 0, 0)
                }
                maxDate={new Date()}
              />
            </div>
            <div
              className="sub-fltr"
              style={{ justifyContent: "space-around" }}
            >
              <button type="submit" className="fltr-btn" onClick={earnings}>
                <FaSearch /> Search
              </button>
              <button
                type="submit"
                className="fltr-btn"
                onClick={() => {
                  setfltr(df);
                }}
              >
                Clear filter
              </button>
            </div>
          </div>
          <div className="erning-con">
            <p className="erning-hd">
              Booking Summary{" "}
              {!erng.range.from && !erng.range.to
                ? "of this month"
                : erng.range.from && erng.range.to
                ? `from ${new Date(erng.range.from).toLocaleDateString(
                    "en-IN"
                  )} to ${new Date(erng.range.to).toLocaleDateString("en-IN")}`
                : erng.range.from
                ? `from ${new Date(erng.range.from).toLocaleDateString(
                    "en-IN"
                  )} till today`
                : ""}
            </p>
            <div className="tbl-con">
              <table className="tw-table">
                <tbody>
                  <tr>
                    <td>Total Bookings</td>
                    <td>{erng.bkng.total}</td>
                  </tr>
                  <tr>
                    <td>Billed</td>
                    <td>{erng.bkng.billed}</td>
                  </tr>
                  <tr>
                    <td>Unbilled</td>
                    <td>{erng.bkng.unbilled}</td>
                  </tr>
                  <tr>
                    <td>Total Earning</td>
                    <td>₹{erng.bkng.earning}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="tgl-cntnt">
              <div
                className={shw ? "tgl-itm tgl-itmo-g" : "tgl-itm"}
                onClick={() => {
                  setshw(true);
                }}
              >
                <FaRupeeSign style={{ marginRight: "5px" }} />
                Billed
              </div>
              <div
                className={shw ? "tgl-itm" : "tgl-itm tgl-itmo-y"}
                onClick={() => {
                  setshw(false);
                }}
              >
                <FaRupeeSign style={{ marginRight: "5px" }} />
                Unbilled
              </div>
            </div>
          </div>
          {erng.ary.filter((itm) => itm.billing.billed === shw).length <= 0 ? (
            <div className="nrc-con">
              <img src="/icons/nrec.png" alt="" />
              <p className="nrc-txt">No Record Found</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Date</th>
                  <th>Earning</th>
                  <th>#</th>
                </tr>
              </thead>
              <tbody>
                {erng.ary
                  .filter((itm) => itm.billing.billed === shw)
                  .map((itm, i) => {
                    return (
                      <tr key={i}>
                        <td lbl="Booking ID">{itm.bookingid}</td>
                        <td lbl="Date">
                          {new Date(itm.pickupdate).toLocaleDateString("en-IN")}
                        </td>
                        <td lbl="Amount">₹{itm.billing.oprtramt}</td>
                        <td lbl="">
                          <button
                            className="pmt-btn"
                            onClick={() => {
                              setdtl({ display: true, data: itm });
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
        </section>
      )}
      {dtl.display ? (
        <div className="form-container">
          <div
            className="form-box"
            style={{ height: "fit-content", margin: "auto" }}
          >
            <div className="bkngdtl-hd">
              {dtl.data.bookingid}
              <div
                className="clsr-con"
                onClick={() => {
                  setdtl({ display: false, data: {} });
                }}
              >
                <FaTimes />
              </div>
            </div>
            <div className="bkng-dtlcon">
              <table className="bkngdtl-tbl">
                <tbody>
                  <tr>
                    <td>Bill amount</td>
                    <td>₹{dtl.data.billing.billamount}</td>
                  </tr>
                  <tr>
                    <td>Advance paid</td>
                    <td>₹{dtl.data.advance}</td>
                  </tr>
                  <tr>
                    <td>Cash recived</td>
                    <td>₹{dtl.data.billing.cash}</td>
                  </tr>
                  <tr>
                    <td>Your earning</td>
                    <td>₹{dtl.data.billing.oprtramt}</td>
                  </tr>
                  <tr>
                    <td>
                      {dtl.data.billing.companybal
                        ? "Company Balance"
                        : "Your Balance"}
                    </td>
                    <td>
                      ₹
                      {dtl.data.billing.companybal
                        ? dtl.data.billing.companybal.amount
                        : dtl.data.billing.partnerbal.amount}
                    </td>
                  </tr>
                  {dtl.data.billing.billed ? (
                    <tr>
                      <td>
                        {dtl.data.billing.companybal
                          ? "Balance recived on"
                          : "Balance paid on"}
                      </td>
                      <td>
                        {dtl.data.billing.companybal
                          ? dtl.data.billing.companybal.date
                            ? new Date(
                                dtl.data.billing.companybal.date
                              ).toLocaleDateString("en-IN")
                            : "N/A"
                          : dtl.data.billing.partnerbal.date
                          ? new Date(
                              dtl.data.billing.partnerbal.date
                            ).toLocaleDateString("en-IN")
                          : "N/A"}
                      </td>
                    </tr>
                  ) : (
                    ""
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default Earning;
