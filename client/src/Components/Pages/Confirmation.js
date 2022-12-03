import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Loading from "../templates/loading/secloading";
import "./css/Confirmation.css";
import { Helmet } from "react-helmet";
const Confirmation = () => {
  const history = useHistory();
  const [hgt, sethgt] = useState();
  const resizer = () => {
    const height = window.innerHeight - 85;
    sethgt(height);
  };

  window.addEventListener("resize", resizer);
  useEffect(() => {
    resizer();
    render();
    // eslint-disable-next-line
  }, []);
  const [bkngdata, setbkngdata] = useState();
  const [rendered, setrendered] = useState(false);
  const confrmd = JSON.parse(sessionStorage.getItem("Confrmd"));
  const render = () => {
    if (confrmd) {
      setbkngdata(confrmd.data);
      setrendered(true);
    } else {
      history.push("/");
    }
  };
  return (
    <>
      {/* <Helmet>
        <meta charSet="utf-8" />
        <title>
          {`${
            bkngdata ? `${bkngdata.firstName} - ` : ""
          }Cab Booked successfully`}
        </title>
        <meta
          name="description"
          content={`${
            bkngdata ? `${bkngdata.firstName} - ` : ""
          }Cab Booked successfully`}
        />
      </Helmet> */}
      {rendered ? (
        <section className="cnfrmtion-sec" style={{ height: hgt }}>
          <div className="cnfrmtion-con">
            <div className="cnfrmtion-sub">
              <p className="cnfrmtion-head">
                Hi {bkngdata.firstName} your cab is booked.
              </p>
              <p
                className="content"
                style={{ marginTop: "5px", fontWeight: "400" }}
              >
                Your booking id is{" "}
                <span className="bold-txt">{bkngdata.bookingid}</span>. all
                details will be sent to{" "}
                <span className="bold-txt">{bkngdata.email}.</span>
              </p>
              <p className="sml-grey" style={{ marginTop: "5px" }}>
                Thank you for booking with us. Bon voyage! Give us feedback on
                your experience with us!
              </p>
            </div>
            <div className="cnfrmtion-sub">
              <p className="bold-txt">WE JUST BOOKED</p>
              <div className="bkng-detcon">
                <div>
                  <span className="sml-grey bold-txt">Booking type</span>
                  <p className="content bold-txt">
                    {bkngdata.bookingtype}{" "}
                    {bkngdata.outstation
                      ? `(${bkngdata.outstation})`
                      : `(${bkngdata.tripinfo.hour}hr || ${bkngdata.tripinfo.distance} km)`}
                  </p>
                  <span className="sml-grey bold-txt">Cab type</span>
                  <p className="content bold-txt">
                    {bkngdata.tripinfo.category}
                  </p>
                </div>
                <div>
                  <span className="sml-grey bold-txt">From</span>
                  <p className="content bold-txt">{bkngdata.sourcecity.from}</p>
                  {bkngdata.bookingtype === "Outstation" ? (
                    <>
                      <span className="sml-grey bold-txt">To</span>
                      <p className="content bold-txt">{bkngdata.endcity.to}</p>
                    </>
                  ) : (
                    ""
                  )}
                </div>
                <div>
                  <span className="sml-grey bold-txt">Pickup at</span>
                  <p className="content">
                    <span className="bold-txt">
                      {new Date(bkngdata.pickupat).toLocaleDateString()}
                    </span>{" "}
                    at{" "}
                    <span className="bold-txt">
                      {new Date(bkngdata.pickupat).toLocaleTimeString()}
                    </span>
                  </p>
                  {bkngdata.bookingtype === "Outstation" &&
                  bkngdata.outstation === "Roundtrip" ? (
                    <>
                      <span className="sml-grey bold-txt">Return on</span>
                      <p className="content">
                        <span className="bold-txt">
                          {new Date(bkngdata.returnat).toLocaleDateString()}
                        </span>
                      </p>
                    </>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
            <div className="cnfrmtion-sub">
              <p className="bold-txt" style={{ marginLeft: "" }}>
                PAYMENT DETAILS
              </p>
              <div className="bkng-detcon">
                <div>
                  <span className="sml-grey bold-txt">EST total</span>
                  <p className="content bold-txt">₹{bkngdata.payable}</p>
                </div>
                <div>
                  <span className="sml-grey bold-txt">Advance paid</span>
                  <p className="content bold-txt">₹{bkngdata.advance}</p>
                </div>
                <div>
                  <span className="sml-grey bold-txt">EST Remaning amount</span>
                  <p className="content bold-txt">₹{bkngdata.remaning}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="sml-footer">© Copyright Sarthi.</div>
        </section>
      ) : (
        <Loading />
      )}
    </>
  );
};

export default Confirmation;
