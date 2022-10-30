import React from "react";
import { NavLink } from "react-router-dom";
import "./footer.css";
import { FaLocationArrow, FaPhoneAlt } from "react-icons/fa";
import { HiMail } from "react-icons/hi";
const Footer = () => {
  return (
    <>
      <footer>
        <div className="tp-row">
          <div className="tp-rptn-l">
            <img src="/icons/logo.png" alt="" />
          </div>
          <div className="tp-rptn-m">
            <div className="sub-rptn">
              <div className="rptn-hd">
                <span className="rptn-hdtxt">Quick links</span>
              </div>
              <NavLink to="/" className="ftr-link">
                Home
              </NavLink>
              <NavLink to="/contactus" className="ftr-link">
                Contact us
              </NavLink>
              <NavLink to="/tourpackages/list" className="ftr-link">
                Tour Package
              </NavLink>
            </div>
            <div className="sub-rptn">
              <div className="rptn-hd">
                <span className="rptn-hdtxt">Other</span>
              </div>
              <a
                href="http://localhost:3000/"
                target="_blank"
                className="ftr-link"
                rel="noreferrer"
              >
                Partner
              </a>
              <NavLink to="/terms-conditions" className="ftr-link">
                Terms & Conditions
              </NavLink>
              <NavLink to="/privacy-policy" className="ftr-link">
              Privacy-Policy
              </NavLink>
              <NavLink to="/contactus" className="ftr-link">
                Sitemap
              </NavLink>
            </div>
          </div>
          <div className="tp-rptn">
            <div className="rptn-hd">
              <span className="rptn-hdtxt">Get in touch</span>
            </div>
            <a href="/" className="ftr-link">
              <FaLocationArrow /> 152, Hanuman Nagar, Dholi Pyau Mathura
            </a>
            <a href="tel:+91 9997548384" className="ftr-link">
              <FaPhoneAlt /> 9997548384
            </a>
            <a href="mailto:Shivagautam2002@gmail.com" className="ftr-link">
              <HiMail /> Shivagautam2002@gmail.com
            </a>
            <div className="slinks-con">
              <a href="/" className="s-btn">
                <img src="/icons/fb-icon.png" alt="" />
              </a>
              <a href="/" className="s-btn">
                <img src="/icons/wa-icon.png" alt="" />
              </a>
              <a href="/" className="s-btn">
                <img src="/icons/tw-icon.png" alt="" />
              </a>
            </div>
          </div>
        </div>
        <div className="btm-row">
          <p>© Copyright sarthi.</p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
