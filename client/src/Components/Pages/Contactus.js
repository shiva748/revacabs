import React, { useState } from "react";
import {
  FaTimesCircle,
  FaTimes,
  FaLocationArrow,
  FaPhoneAlt,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { IoLogoWhatsapp } from "react-icons/io";
import { FcApproval } from "react-icons/fc";
import Footer from "../templates/footer/Footer";
import "./css/Contactus.css";
import {Helmet} from "react-helmet";
const Contact = () => {
  const [alert, setalert] = useState({
    display: false,
    title: "",
    message: "",
    type: "",
  });
  const [contact, setcontact] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    reason: "",
  });
  let name, value;
  const handelcontact = (e) => {
    name = e.target.name;
    value = e.target.value;
    setcontact({ ...contact, [name]: value });
  };

  return (
    <>
    {/* <Helmet>
        <meta charSet="utf-8" />
        <title>Contact Revacabs</title>
        <meta
          name="description"
          content="If you are facing any issue/ or for feedback, write to us at info@revacabs.com or Pick up the phone and call us 24*7: 9456878882 "
        />
         <meta name="keywords" content={"Reva Cabs, Reva Cabs Contact, Contact"}/>
        <link rel="canonical" href="http://revacabs.com/" />
      </Helmet> */}
      <section className="contact">
        <section className="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d884.9641725596742!2d77.67616882919195!3d27.473720598930583!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39737135f92c0297%3A0x2e8a0e02bcc964d7!2sRajaram%20Patti%2C%20Natwar%20Nagar%2C%20Dholi%20Pyau%2C%20Mathura%2C%20Uttar%20Pradesh%20281001!5e0!3m2!1sen!2sin!4v1667582684219!5m2!1sen!2sin"
            className="map-frame"
            frameBorder="0"
            style={{ border: 0 }}
            title="map"
            allowFullScreen=""
            aria-hidden="false"
            tabIndex="0"
          ></iframe>
        </section>
        <div className="flx-con">
          <div className="con-hd">Contact Us</div>
          <div className="adr-bx">
            <div className="adr-row">
              <div className="adr-rowhd">
                <span className="hd-icn">
                  <FaLocationArrow />
                </span>
                <span className="hd-txt">Address :</span>
              </div>
              <div className="adr-txt">
                <a
                  href="https://goo.gl/maps/SEnQHEP6heRbxrj97"
                  className="blu-lnk"
                >
                  Natwar Nagar, Dholi Pyau, Mathura, Uttar Pradesh 281001
                </a>
              </div>
            </div>
            <div className="adr-row">
              <div className="adr-rowhd">
                <span className="hd-icn">
                  <FaPhoneAlt />
                </span>
                <span className="hd-txt">Tel :</span>
              </div>
              <div className="adr-txt">
                <a href="tel:+919456878882" className="blu-lnk">
                  9456878882
                </a>
              </div>
            </div>
            <div className="adr-row">
              <div className="adr-rowhd">
                <span className="hd-icn">
                  <IoLogoWhatsapp style={{ color: "#49c95a" }} />
                </span>
                <span className="hd-txt">Whats app :</span>
              </div>
              <div className="adr-txt">
                <a
                  href="https://api.whatsapp.com/send/?phone=9456878882&text=Hi+RevaCabs%2C+Whatsup&type=phone_number&app_absent=0"
                  className="blu-lnk"
                >
                  9456878882
                </a>
              </div>
            </div>
            <div className="adr-row">
              <div className="adr-rowhd">
                <span className="hd-icn">
                  <MdEmail />
                </span>
                <span className="hd-txt">Email :</span>
              </div>
              <div className="adr-txt">
                <a href="mailto:info@revacabs.com" className="blu-lnk">
                  info@revacabs.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {alert.display ? (
        alert.type === "danger" ? (
          <div className="danger-alert">
            <span>
              <FaTimesCircle className="dismiss-alert" />
              {alert.title ? `${alert.title}:` : ""} {alert.message}
            </span>
            <FaTimes
              className="dismiss-alert"
              onClick={() => {
                // eslint-disable-next-line
                setalert({ ...alert, ["display"]: false });
              }}
            />
          </div>
        ) : (
          <div className="green-alert">
            <span>
              <FcApproval className="dismiss-alert" />
              {alert.title ? `${alert.title} :` : ""} {alert.message}
            </span>
            <FaTimes
              className="dismiss-alert"
              onClick={() => {
                // eslint-disable-next-line
                setalert({ ...alert, ["display"]: false });
              }}
            />
          </div>
        )
      ) : (
        ""
      )}
      <Footer />
    </>
  );
};

export default Contact;
