import React from "react";
import "./css/Home.css";
import { NavLink } from "react-router-dom";

const Home = () => {
  return (
    <>
      <div className="temp-hd">
        <img src="/icons/logo.png" alt="" class="logo" />
      </div>
      <section className="partner-log">
        <div className="log-container">
          <div className="rdctor-hd">I AM A</div>
          <div className="rdctor-con">
            <NavLink to="/login" className="opt-btn">
              <span>Operator</span>
            </NavLink>
            <div>OR</div>
            <NavLink to="/driver/login" className="opt-btn">
              <span> Driver </span>
            </NavLink>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
