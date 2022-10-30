import React, { useEffect, useState } from "react";
import "./css/Driver.css";
import { CgArrowRight, CgArrowsExchange } from "react-icons/cg";
import Adcar from "../template/cars/Adcar";
import Loading from "../template/loading/Loading";
import Transloading from "../template/loading/transloading";
import { Helmet } from "react-helmet";
const Cars = () => {
  const [hgt, sethgt] = useState();
  const resizer = () => {
    const height = window.innerHeight - 110;
    sethgt(height);
  };
  window.addEventListener("resize", resizer);
  useEffect(() => {
    resizer();
    reqcar();
    // eslint-disable-next-line
  }, []);
  const [cars, setcars] = useState([]);
  const [ldng, setldng] = useState(true);
  const reqcar = async () => {
    const res = await fetch("/partner/car", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await res.json();
    if (res.status === 200) {
      setcars(data);
    } else {
      alert(data);
    }
    setldng(false);
  };
  const [vwstate, setvwstate] = useState({
    nw: true,
    adopton: false,
    data: {},
  });

  const carhistory = async (cabid) => {
    if (!cabid || typeof cabid !== "string") {
      return alert("Invalid request");
    }
    const res = await fetch("/partner/car/history", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ cabid }),
    });
    const data = await res.json();
    if (res.status !== 200) {
      return alert(data);
    } else {
      sethystry({ display: true, data });
    }
    setdataload(false);
  };

  const [hystry, sethystry] = useState({ display: false, data: [] });
  const [dataload, setdataload] = useState(false);
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>RevaCabs | Manage Cars</title>

        <meta
          name="description"
          content="Page to add, manage and update the cars"
        />
        <link rel="canonical" href="http://partner.revacabs.com/" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      {dataload ? <Transloading /> : ""}
      <div className="multicon-hd">
        <span className="h-t1">Cars</span>
        <button
          className="ad-drvr"
          onClick={() => {
            setvwstate({ nw: true, adopton: true, data: {} });
          }}
        >
          Add Cars
        </button>
      </div>
      {ldng ? (
        <Loading />
      ) : (
        <section className="multi-con" style={{ height: `${hgt}px` }}>
          {cars.length <= 0 ? (
            <div className="nrc-con">
              <img src="/icons/nrec.png" alt="" />
              <p className="nrc-txt">Please add some cars</p>
            </div>
          ) : (
            cars.map((itm, i) => {
              return (
                <div className="bkng-crd" key={i}>
                  <div
                    className="bkng-crd-hd crd-txtflx"
                    style={{ justifyContent: "left" }}
                  >
                    RC Number
                    <CgArrowRight /> {itm.carNumber}
                  </div>
                  <div className="sb-crd">
                    <div className="crd-prtn">
                      <div className="crd-cl">
                        <div className="crd-hd">Cab Model</div>
                        <div className="bold-txt crd-txtflx">{itm.name}</div>
                      </div>
                      <div className="crd-cl">
                        <div className="crd-hd">Cab type</div>
                        <div className="bold-txt crd-txtflx">
                          {itm.category}
                        </div>
                      </div>
                    </div>
                    <div className="crd-prtn">
                      <div className="crd-cl">
                        <div className="crd-hd">Policy Number</div>
                        <div className="bold-txt crd-txtflx">
                          {itm.policyNo}
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
                        carhistory(itm.cabid);
                        setdataload(true);
                      }}
                    >
                      History
                    </button>
                    <button
                      className="gv-btn"
                      style={{ backgroundColor: "lightgreen" }}
                      onClick={() => {
                        setvwstate({ adopton: true, nw: false, data: itm });
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>
      )}
      {vwstate.adopton ? (
        <Adcar setvwstate={setvwstate} vwstate={vwstate} reqcar={reqcar} />
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
            <div className="form-hdcon">Car History</div>
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
                          <td>{i}</td>
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
                  sethystry({ display: false, data: [] });
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

export default Cars;
