import React, { useEffect, useState } from "react";
import "./css/profile.css";
import { useHistory } from "react-router-dom";
import { MdVerified, MdEmail, MdPhone, MdLocationPin } from "react-icons/md";
import { FaUser, FaChartLine } from "react-icons/fa";
import Loading from "../template/loading/Loading";
import { FcClock, FcDocument } from "react-icons/fc";
import { Helmet } from "react-helmet";
const Profile = () => {
  const history = useHistory();
  const [hgt, sethgt] = useState();
  const [vwst, setvwst] = useState("abt");
  const resizer = () => {
    const height = window.innerHeight - 110;
    sethgt(height);
  };
  window.addEventListener("resize", resizer);

  const [Userdata, setUserdata] = useState({});
  const [ldng, setldng] = useState(true);
  const reqprofile = async () => {
    const res = await fetch("/partner/profile", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await res.json();
    if (res.status === 200) {
      setUserdata(data);
      setldng(false);
    } else {
      history.push("/");
    }
  };
  useEffect(() => {
    resizer();
    reqprofile();
    // eslint-disable-next-line
  }, []);
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>RevaCabs | Profile </title>

        <meta
          name="description"
          content="Page to add, manage and update the cars"
        />
        <link rel="canonical" href="http://partner.revacabs.com/" />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="multicon-hd">
        <span className="h-t1">Account</span>
      </div>
      {ldng ? (
        <Loading />
      ) : (
        <div className="multi-con" style={{ height: `${hgt}px` }}>
          <div className="usr-prfl">
            <div className="prfl-img">
              <img src="/partner/profilepic" alt="" />
            </div>
            <div className="prfl-aside">
              <div className="prfl-row">
                <span className="prfl-nmtxt">{Userdata.firstName}</span>
                {Userdata.status === "verified" ? (
                  <MdVerified
                    style={{ color: "lightgreen", marginLeft: "5px" }}
                  />
                ) : Userdata.status === "pending" ? (
                  <FcClock style={{ marginLeft: "5px" }} />
                ) : Userdata.status === "document" ? (
                  <FcDocument style={{ marginLeft: "5px" }} />
                ) : (
                  ""
                )}
              </div>
              <div className="prfl-row">
                <span className="blu-txt">Operator</span>
              </div>
              <div className="prfl-row">
                <MdEmail style={{ marginRight: "10px" }} />
                <span>{Userdata.email}</span>
              </div>
              <div className="prfl-row">
                <MdPhone style={{ marginRight: "10px" }} />
                <span>{Userdata.phone}</span>
              </div>
              <div className="prfl-row">
                <MdLocationPin style={{ marginRight: "10px" }} />
                <span>{Userdata.city}</span>
              </div>
            </div>
            <div className="tgl-cntnt">
              <div
                className={vwst === "abt" ? "tgl-itm tgl-itmo" : "tgl-itm"}
                onClick={() => {
                  setvwst("abt");
                }}
              >
                <FaUser style={{ marginRight: "5px" }} />
                About
              </div>
              <div
                className={vwst === "sts" ? "tgl-itm tgl-itmo" : "tgl-itm"}
                onClick={() => {
                  setvwst("sts");
                }}
              >
                <FaChartLine style={{ marginRight: "5px" }} />
                Stats
              </div>
            </div>
          </div>
          <div className="dtld-cntnt">
            {vwst === "abt" ? (
              <table className="dtl-tbl">
                <tbody>
                  <tr>
                    <td>Name</td>
                    <td>{`${Userdata.firstName} ${Userdata.lastName}`}</td>
                  </tr>
                  <tr>
                    <td>Email</td>
                    <td className="blu-txt">{Userdata.email}</td>
                  </tr>
                  <tr>
                    <td>Phone</td>
                    <td className="blu-txt">{Userdata.phone}</td>
                  </tr>
                  <tr>
                    <td>Alternate Phone</td>
                    <td className="blu-txt">{Userdata.aPhone}</td>
                  </tr>
                  <tr>
                    <td>Registered on</td>
                    <td>{new Date(Userdata.Date * 1).toLocaleDateString()}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <table className="dtl-tbl">
                <tbody>
                  <tr>
                    <td>Vehicle count</td>
                    <td>{Userdata.vehicles}</td>
                  </tr>
                  <tr>
                    <td>Driver Count</td>
                    <td>{Userdata.drivers}</td>
                  </tr>
                  <tr>
                    <td>Trips executed</td>
                    <td>{Userdata.trips}</td>
                  </tr>
                  <tr>
                    <td>Earnings</td>
                    <td>₹{Userdata.earnings}</td>
                  </tr>
                  <tr>
                    <td>Penalties</td>
                    <td>₹{Userdata.penalties}</td>
                  </tr>
                  <tr>
                    <td>Bookings posted</td>
                    <td>{Userdata.bookingposted}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
