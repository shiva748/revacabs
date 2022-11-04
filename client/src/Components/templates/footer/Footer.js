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
                href="https://partners.revacabs.com/"
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
            <a href="https://goo.gl/maps/SEnQHEP6heRbxrj97" target="_blank" className="ftr-link">
              <FaLocationArrow />Natwar Nagar, Dholi Pyau, Mathura, Uttar Pradesh 281001
            </a>
            <a href="tel:+91 9456878882" className="ftr-link">
              <FaPhoneAlt /> 9456878882
            </a>
            <a href="mailto:info@revacabs.com" className="ftr-link">
              <HiMail /> info@revacabs.com
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
          <p>© Copyright Revacabs.</p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
