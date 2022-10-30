import React, { useEffect, useState } from "react";
import "./css/Driver.css";
import { CgArrowRight, CgArrowsExchange } from "react-icons/cg";
import Addriver from "../template/driver/Addiver";
import Transloading from "../template/loading/transloading";
import Loading from "../template/loading/Loading";
import { Helmet } from "react-helmet";
const Driver = () => {
  const [hgt, sethgt] = useState();
  const resizer = () => {
    const height = window.innerHeight - 110;
    sethgt(height);
  };
  window.addEventListener("resize", resizer);
  useEffect(() => {
    resizer();
    reqdriver();
    // eslint-disable-next-line
  }, []);
  const [drivers, setdrivers] = useState([]);
  const [ldng, setldng] = useState(true);
  const reqdriver = async () => {
    const res = await fetch("/partner/driver", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await res.json();
    if (res.status === 200) {
      setdrivers(data);
      setldng(false);
    } else {
      alert(data);
    }
  };
  const [vwstate, setvwstate] = useState({
    nw: true,
    adopton: false,
    data: {},
  });
  const driverhistory = async (driverid) => {
    if (!driverid || typeof driverid !== "string") {
      return alert("Invalid request");
    }
    const res = await fetch("/partner/driver/history", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ driverid }),
    });
    const data = await res.json();
    if (res.status !== 200) {
      alert(data);
    } else {
      sethystry({ display: true, data });
    }
    setdataload(false);
  };
  const [hystry, sethystry] = useState({ display: false, data: [1, 2] });
  const [dataload, setdataload] = useState(false);
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>RevaCabs | Manage Drivers</title>

        <meta
          name="description"
          content="Page to add, manage and update the Driver"
        />
        <link rel="canonical" href="http://partner.revacabs.com/" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {dataload ? <Transloading /> : ""}
      <div className="multicon-hd">
        <span className="h-t1">Drivers</span>
        <button
          className="ad-drvr"
          onClick={() => {
            // eslint-disable-next-line
            setvwstate({ nw: true, data: {}, adopton: true });
          }}
        >
          Add Driver
        </button>
      </div>
      {ldng ? (
        <Loading />
      ) : (
        <section className="multi-con" style={{ height: `${hgt}px` }}>
          <div className="drvr-con">
            {drivers.length <= 0 ? (
              <div className="nrc-con">
                <img src="/icons/nrec.png" alt="" />
                <p className="nrc-txt">Please add some drivers</p>
              </div>
            ) : (
              drivers.map((itm, i) => {
                return (
                  <div className="bkng-crd" key={i}>
                    <div
                      className="bkng-crd-hd crd-txtflx"
                      style={{ justifyContent: "left" }}
                    >
                      Name <CgArrowRight /> {itm.firstName} {itm.lastName}
                    </div>
                    <div className="sb-crd">
                      <div className="crd-prtn">
                        <div className="crd-cl">
                          <div className="crd-hd">Phone Number</div>
                          <div className="bold-txt crd-txtflx">{itm.phone}</div>
                        </div>
                        <div className="crd-cl">
                          <div className="crd-hd">Dl Number</div>
                          <div className="bold-txt crd-txtflx">
                            {itm.Doc.Drivinglicense.Number}
                          </div>
                        </div>
                      </div>
                      <div className="crd-prtn">
                        <div className="crd-cl">
                          <div className="crd-hd">Dl Validity</div>
                          <div className="bold-txt crd-txtflx">
                            {new Date(
                              itm.Doc.Drivinglicense.Validity
                            ).toLocaleDateString("en-In")}
                          </div>
                        </div>
                        <div className="crd-cl">
                          <div className="crd-hd">Status</div>
                          <div className="bold-txt crd-txtflx">
                            {itm.verification.isverified
                              ? itm.status
                              : itm.verification.request
                              ? "Document fault"
                              : "Verification pending"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="gv-con">
                      <button
                        className="gv-btn"
                        onClick={() => {
                          driverhistory(itm.driverid);
                          setdataload(true);
                        }}
                      >
                        History
                      </button>
                      <button
                        className="gv-btn"
                        style={{ backgroundColor: "lightgreen" }}
                        onClick={() => {
                          setvwstate({ nw: false, data: itm, adopton: true });
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}
      {vwstate.adopton ? (
        <Addriver
          setvwstate={setvwstate}
          vwstate={vwstate}
          reqdriver={reqdriver}
        />
      ) : (
        ""
      )}
      {hystry.display ? (
        <div className="form-container">
          <div
            className="form-box"
            style={{ height: "fit-content", margin: "auto" }}
          >
            <div className="form-lgocon">
              <img src="/icons/logo.png" alt="" />
            </div>
            <div className="form-hdcon">Driver History</div>
            <div className="tabel-con">
              {hystry.data.length <= 0 ? (
                <div className="nrc-con">
                  <img src="/icons/nrec.png" alt="" />
                  <p className="nrc-txt">No Record Found</p>
                </div>
              ) : (
                <table className="hstry-tbl">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Booking Id</th>
                      <th>Date</th>
                      <th>Route/City</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hystry.data.map((itm, i) => {
                      return (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{itm.bookingid}</td>
                          <td>
                            {new Date(itm.pickupdate).toLocaleDateString(
                              "en-IN"
                            )}
                          </td>
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
                          <td>
                            {itm.bookingstatus === "cancelled"
                              ? itm.oprtramt
                              : itm.billing.oprtramt}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div className="form-btmcon">
              <button
                className="frm-sbmtbtn"
                style={{ backgroundColor: "red" }}
                onClick={() => {
                  sethystry({
                    display: false,
                    data: [],
                  });
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default Driver;
