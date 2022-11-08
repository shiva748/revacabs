import React, { useState, useEffect } from "react";
import { TiArrowBackOutline } from "react-icons/ti";
import { CgArrowsExchange, CgArrowRight } from "react-icons/cg";
import { GoVerified } from "react-icons/go";
import { FiRefreshCw } from "react-icons/fi";
import { ImCross} from "react-icons/im";
import Dataload from "../Loading/Dataload";
import Datepicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const Blngdtl = (recived) => {
  const { dtl, setdtl } = recived;
  const mainbilling = recived.billing;
  const [prcs, setprcs] = useState(true);
  const id = dtl.id;
  const [itm, setitm] = useState({});
  const billing = async () => {
    setprcs(true);
    const res = await fetch("/oceannodes/booking/billing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bkngid: id,
        blngtyp: "dtl",
      }),
    });
    const data = await res.json();
    if (res.status !== 200) {
      mainbilling(true);
      alert("failed to load the Booking");
      setdtl({ display: false, id: "" });
    } else {
      setitm(data[0]);
      setprcs(false);
      if (data[0].bookingstatus === "completed") {
        if (data[0].billing.partnerbal) {
          setblng({
            ...blng,
            billed: data[0].billing.billed ? "true" : "false",
            paid: data[0].billing.partnerbal.status ? "true" : "false",
            paidon: data[0].billing.partnerbal.date,
          });
        } else {
          setblng({
            ...blng,
            billed: data[0].billing.billed ? "true" : "false",
          });
        }
      } else {
        if (data[0].billing.cancel.refundedon) {
          setblng({
            ...blng,
            billed: data[0].billing.billed ? "true" : "false",
            refundedon: data[0].billing.cancel.refundedon,
            refunded: data[0].billing.cancel.refunded ? "true" : "false",
          });
        } else {
          setblng({
            ...blng,
            billed: data[0].billing.billed ? "true" : "false",
            refunded: data[0].billing.cancel.refunded ? "true" : "false",
          });
        }
      }
    }
  };
  useEffect(() => {
    billing();
    // eslint-disable-next-line
  }, []);

  const [optn, setoptn] = useState({ tdl: "cstmbl" });

  // === === === update billing === === === //

  const [blng, setblng] = useState({
    billed: "",
    paid: "",
    paidon: "",
    refunded: "",
    refundedon: "",
  });
  let name, value;
  const handelblng = (e) => {
    name = e.target.name;
    value = e.target.value;
    setblng({ ...blng, [name]: value });
  };

  const updateblng = async () => {
    let { billed, paid, paidon, refunded, refundedon } = blng;
    let updt = {};
    if (billed) {
      if (
        typeof billed !== "string" ||
        !["true", "false"].some((itm) => itm === billed)
      ) {
        return alert("Invalid request");
      }
      if (toString(itm.billing.billed) === billed) {
        billed = "";
      } else {
        updt = { ...updt, billed };
      }
    }

    if (itm.bookingstatus === "completed") {
      if (itm.billing.partnerbal) {
        if (paid) {
          if (
            typeof paid !== "string" ||
            !["true", "false"].some((itm) => itm === paid)
          ) {
            return alert("Invalid request");
          }
        }
        if (toString(itm.billing.partnerbal.status) === paid) {
          paid = "";
        } else {
          updt = {
            ...updt,
            paid,
          };
        }
        if (paidon) {
          if (typeof paidon !== "number" || new Date().getTime() < paidon) {
            return alert("Invalid paid date selected");
          }
        }
        if (paidon === itm.billing.partnerbal.date) {
          paidon = "";
        } else {
          updt = { ...updt, paidon };
        }
        if (
          billed === "true" &&
          itm.billing.partnerbal.status !== true &&
          paid !== "true"
        ) {
          return alert(
            "Please mark the operator balance paid to close the booking"
          );
        }
        if (paid === "true" && !itm.billing.partnerbal.date && !paidon) {
          return alert("Please select the payment date");
        }
      } else {
        if (billed === "true" && !itm.billing.companybal.status) {
          return alert("Operator haven't paid the company balance yet");
        }
      }
    } else {
      if (itm.billing.cancel.refund >= 0) {
        if (refunded) {
          if (
            typeof refunded !== "string" ||
            !["true", "false"].some((itm) => itm === refunded)
          ) {
            return alert("Invalid request");
          }
        }
        if (toString(itm.billing.cancel.refunded) === refunded) {
          refunded = "";
        } else {
          updt = {
            ...updt,
            refunded,
          };
        }
        if (refundedon) {
          if (
            typeof refundedon !== "number" ||
            new Date().getTime() < refundedon
          ) {
            return alert("Invalid paid date selected");
          }
        }
        if (refundedon === itm.billing.cancel.refundedon) {
          refundedon = "";
        } else {
          updt = { ...updt, refundedon };
        }
        if (
          billed === "true" &&
          itm.billing.cancel.refunded !== true &&
          refunded !== "true"
        ) {
          return alert("Please mark the client processed to close the booking");
        }
        if (
          refunded === "true" &&
          !itm.billing.cancel.refundedon &&
          !refundedon
        ) {
          return alert("Please select the Refund processed date");
        }
      }
    }
    updt = { ...updt, bookingid: itm.bookingid, hstry: false };
    setprcs(true)
    const res = await fetch("/oceannodes/booking/billing/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updt),
    });
    
    const data = await res.json();
    if (res.status !== 201) {
      mainbilling(true);
      setdtl({ display: false, id: "" });
      setprcs(false)
      return alert("Failed to update billing");
    } else {
      alert(data);
      mainbilling(true);
      setprcs(false)
      setdtl({ display: false, id: "" });
    }

  };
  return (
    <>
      {prcs ? (
        <Dataload />
      ) : (
        <div className="dlt-con">
          <div className="dtl-hd">
            {itm.bookingid}{" "}
            <div>
              <button
                className="dtl-clsr"
                onClick={billing}
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
                {itm.bookingstatus === "cancelled" ? (
                  ""
                ) : (
                  <tr>
                    <td>Started on</td>
                    <td>
                      {new Date(
                        itm.billing.tripstats.startat
                      ).toLocaleTimeString("en-IN")}
                    </td>
                  </tr>
                )}
                <tr>
                  <td>{itm.status === "completed" ? "Bill amount" : "Rate"}</td>
                  <td>₹{itm.billing.billamount}</td>
                </tr>
                <tr>
                  <td>Advance</td>
                  <td>₹{itm.advance}</td>
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
                  <td>Status</td>
                  <td>
                    {itm.bookingstatus.charAt(0).toUpperCase() +
                      itm.bookingstatus.slice(1)}
                  </td>
                </tr>
                {itm.bookingstatus === "cancelled" ? (
                  ""
                ) : (
                  <tr>
                    <td>Running</td>
                    <td>
                      {itm.billing.tripstats.endkm -
                        itm.billing.tripstats.startkm}{" "}
                      km
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bkng-optn">
            <div
              className={
                optn.tdl === "cstmbl"
                  ? "optn-itm optn-actv ovrly-ad"
                  : "optn-itm ovrly-ad"
              }
              onClick={() => {
                setoptn({ tdl: "cstmbl" });
              }}
            >
              Coustumer
            </div>
            <div
              className={
                optn.tdl === "oprtrblng"
                  ? "optn-itm optn-actv ovrly-ad"
                  : "optn-itm ovrly-ad"
              }
              onClick={() => {
                setoptn({ tdl: "oprtrblng" });
              }}
            >
              Partner
            </div>
            <div
              className={
                optn.tdl === "pnlty"
                  ? "optn-itm optn-actv ovrly-ad"
                  : "optn-itm ovrly-ad"
              }
              onClick={() => {
                setoptn({ tdl: "pnlty" });
              }}
            >
              Penalty
            </div>
          </div>
          {optn.tdl === "cstmbl" ? (
            <div className="bkngedt-con">
              <div className="bkng-edthd">Coustumer billing</div>
              {itm.bookingstatus === "completed" ? (
                <>
                  <div className="inpt-row">
                    <span className="edt-span">Booking amount</span>
                    <span>₹ {itm.payable}</span>
                  </div>
                  <div className="inpt-row">
                    <span className="edt-span">Extra km</span>
                    <span>
                      ₹{" "}
                      {itm.billing.extrakm ? itm.billing.extrakm.company : "0"}
                    </span>
                  </div>
                  <div className="inpt-row">
                    <span className="edt-span">Extra hour</span>
                    <span>
                      ₹{" "}
                      {itm.billing.extrahour
                        ? itm.billing.extrahour.coustumer
                        : "0"}
                    </span>
                  </div>
                  <div className="inpt-row">
                    <span className="edt-span">Bill amount</span>
                    <span>₹ {itm.billing.billamount}</span>
                  </div>
                  <div className="inpt-row">
                    <span className="edt-span">Advance</span>
                    <span>₹ {itm.advance}</span>
                  </div>
                  <div className="inpt-row">
                    <span className="edt-span">Cash paid</span>
                    <span>₹ {itm.billing.cash}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="inpt-row">
                    <span className="edt-span">Cancelled on</span>
                    <span>
                      {new Date(itm.billing.cancel.cancelon).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                  <div className="inpt-row">
                    <span className="edt-span">Advance</span>
                    <span>₹ {itm.advance}</span>
                  </div>
                  <div className="inpt-row">
                    <span className="edt-span">Cancellation charges</span>
                    <span>₹ {itm.billing.cancel.cancelfee}</span>
                  </div>
                  <div className="inpt-row">
                    <span className="edt-span">Refundable amount</span>
                    <span>₹ {itm.billing.cancel.refund}</span>
                  </div>
                  <div className="inpt-row">
                    <span className="edt-span">Refund status</span>
                    <span>
                      <select
                        name="refunded"
                        className="frm-tblinp"
                        value={blng.refunded}
                        onChange={handelblng}
                      >
                        <option value="true">Processed</option>
                        <option value="false">Pending</option>
                      </select>
                    </span>
                  </div>
                  <div className="inpt-row">
                    <span className="edt-span">Processed on</span>
                    <span>
                      <Datepicker
                        selected={blng.refundedon}
                        className="frm-tblinp"
                        placeholderText="Date"
                        maxDate={new Date()}
                        onChange={(value) => {
                          setblng({
                            ...blng,
                            refundedon: value ? value.getTime() : "",
                          });
                        }}
                        dateFormat="dd/MM/yyyy"
                        minDate={
                          new Date(
                            new Date(itm.billing.cancel.cancelon).getFullYear(),
                            new Date(itm.billing.cancel.cancelon).getMonth(),
                            new Date(itm.billing.cancel.cancelon).getDate(),
                            0,
                            0,
                            0,
                            0
                          )
                        }
                      />
                    </span>
                  </div>
                  <div className="inpt-row">
                    <span className="edt-span">Billed</span>
                    <span>
                      <select
                        name="billed"
                        className="frm-tblinp"
                        value={blng.billed}
                        onChange={handelblng}
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </span>
                  </div>
                  <div class="inpt-row">
                    <button
                      class="ctl-btn"
                      style={{ margin: "auto" }}
                      onClick={updateblng}
                    >
                      <span>Update</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            ""
          )}
          {optn.tdl === "oprtrblng" ? (
            <div className="bkngedt-con">
              {itm.bookingstatus === "cancelled" ? (
                <>
                  <div className="bkng-edthd">Partner</div>
                  {itm.assignedto.assigned ? (
                    <>
                      <div className="inpt-row">
                        <span className="edt-span">Operator id</span>
                        <span className="blu-links">
                          {itm.assignedto.operatorid}
                        </span>
                      </div>
                      <div className="inpt-row">
                        <span className="edt-span">Amount</span>
                        <span>₹ {itm.assignedto.amount}</span>
                      </div>
                      <div className="inpt-row">
                        <span className="edt-span">Phone</span>
                        <span className="blu-links">
                          {" "}
                          {itm.assignedto.phone}
                        </span>
                      </div>
                      <div className="inpt-row">
                        <span className="edt-span">Sec Phone</span>
                        <span className="blu-links">
                          {itm.assignedto.aPhone}
                        </span>
                      </div>
                      {itm.driverinfo.assigned ? (
                        <>
                          <div className="inpt-row">
                            <span className="edt-span">Driver id</span>
                            <span className="blu-links">
                              {" "}
                              {itm.driverinfo.driverid}
                            </span>
                          </div>
                          <div className="inpt-row">
                            <span className="edt-span">Phone</span>
                            <span className="blu-links">
                              {itm.driverinfo.phone}
                            </span>
                          </div>
                          <div className="inpt-row">
                            <span className="edt-span">Alternate Phone</span>
                            <span className="blu-links">
                              {itm.driverinfo.aPhone}
                            </span>
                          </div>
                        </>
                      ) : (
                        ""
                      )}
                      {itm.cabinfo.assigned ? (
                        <div className="inpt-row">
                          <span className="edt-span">Driver id</span>
                          <span className="blu-links">{itm.cabinfo.cabid}</span>
                        </div>
                      ) : (
                        ""
                      )}
                    </>
                  ) : (
                    <div className="inpt-row">
                      <span className="edt-span">Operator id</span>
                      <span>N/A</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="bkng-edthd">Partner Billing</div>
                  <div className="inpt-row">
                    <span className="edt-span">Operator amount</span>
                    <span>₹ {itm.assignedto.amount}</span>
                  </div>
                  <div className="inpt-row">
                    <span className="edt-span">Extra km</span>
                    <span>
                      ₹{" "}
                      {itm.billing.extrakm ? itm.billing.extrakm.partner : "0"}
                    </span>
                  </div>
                  <div className="inpt-row">
                    <span className="edt-span">Extra hour</span>
                    <span>
                      ₹{" "}
                      {itm.billing.extrahour
                        ? itm.billing.extrahour.partner
                        : "0"}
                    </span>
                  </div>
                  <div className="inpt-row">
                    <span className="edt-span">Final amount</span>
                    <span>₹ {itm.billing.oprtramt}</span>
                  </div>
                  <div className="inpt-row">
                    <span className="edt-span">Cash recived</span>
                    <span>₹ {itm.billing.cash}</span>
                  </div>
                  {itm.billing.companybal ? (
                    <>
                      <div className="inpt-row">
                        <span className="edt-span">Company balance</span>
                        <span>₹ {itm.billing.companybal.amount}</span>
                      </div>
                      <div className="inpt-row">
                        <span className="edt-span">
                          {itm.billing.companybal.status
                            ? "Recived on"
                            : "Last attempt"}
                        </span>
                        <span>
                          {itm.billing.companybal.date
                            ? new Date(
                                itm.billing.companybal.date
                              ).toLocaleString("en-IN")
                            : "N/A"}
                        </span>
                      </div>
                      <div className="inpt-row">
                        <span className="edt-span">Status</span>
                        <span style={{ display: "flex", alignItems: "center" }}>
                          {itm.billing.companybal.status ? (
                            <>
                              <GoVerified
                                style={{
                                  color: "lightgreen",
                                  margin: "0px 5px",
                                }}
                              />
                              Recived
                            </>
                          ) : (
                            <>
                              <ImCross
                                style={{ color: "red", margin: "0px 5px" }}
                              />
                              Failed
                            </>
                          )}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="inpt-row">
                      <span className="edt-span">Partner balance</span>
                      <span>₹ {itm.billing.partnerbal.amount}</span>
                    </div>
                  )}
                  <table className="frm-tbl">
                    <tbody>
                      {itm.billing.companybal ? (
                        ""
                      ) : (
                        <>
                          <tr>
                            <td>Paid</td>
                            <td>
                              <select
                                name="paid"
                                className="frm-tblinp"
                                value={blng.paid}
                                onChange={handelblng}
                              >
                                <option value="true">Yes</option>
                                <option value="false">false</option>
                              </select>
                            </td>
                          </tr>
                          <tr>
                            <td>Paid on</td>
                            <td>
                              <Datepicker
                                selected={blng.paidon}
                                className="frm-tblinp"
                                placeholderText="Date"
                                maxDate={new Date()}
                                onChange={(value) => {
                                  setblng({ ...blng, paidon: value.getTime() });
                                }}
                                dateFormat="dd/MM/yyyy"
                                minDate={
                                  new Date(
                                    new Date(
                                      itm.billing.tripstats.endat
                                    ).getFullYear(),
                                    new Date(
                                      itm.billing.tripstats.endat
                                    ).getMonth(),
                                    new Date(
                                      itm.billing.tripstats.endat
                                    ).getDate(),
                                    0,
                                    0,
                                    0,
                                    0
                                  )
                                }
                              />
                            </td>
                          </tr>
                        </>
                      )}
                      <tr>
                        <td>Billed</td>
                        <td>
                          <select
                            name="billed"
                            className="frm-tblinp"
                            value={blng.billed}
                            onChange={handelblng}
                          >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div class="inpt-row">
                    <button
                      class="ctl-btn"
                      style={{ margin: "auto" }}
                      onClick={updateblng}
                    >
                      Update
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            ""
          )}
          {optn.tdl === "pnlty" ? (
            <div className="bkngedt-con" style={{ padding: "0px 5%" }}>
              <div className="bkng-edthd">Penalty</div>
              {itm.penalty.length <= 0 ? (
                <div className="nrc-con">
                  <img src="/icons/nrec.png" alt="" />
                  <p className="nrc-txt">No penalty</p>
                </div>
              ) : (
                <table className="bds-tbl">
                  <thead>
                    <tr>
                      <th>Id</th>
                      <th>Phone</th>
                      <th>Amount</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {itm.penalty.map((itm, i) => {
                      return (
                        <tr key={i}>
                          <td lbl="Id">
                            <span className="blu-links">{itm.operatorid}</span>
                          </td>
                          <td lbl="Phone">
                            <a
                              className="blu-links"
                              href={"tel:+91".concat(itm.phone)}
                            >
                              {itm.phone}
                            </a>
                          </td>
                          <td lbl="amount">₹{itm.amount}</td>
                          <td>
                            <button className="Asgn-btn">Details</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            ""
          )}
        </div>
      )}
    </>
  );
};
export default Blngdtl;
