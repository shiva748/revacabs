import React from "react";
import "./css/Home.css";
import { NavLink } from "react-router-dom";
import {Helmet} from "react-helmet"

const Home = () => {
  return (
    <>
        <Helmet>
        <meta charSet="utf-8" />
        <title>Partners - Revacabs</title>
        <meta
          name="description"
          content="Revacabs Partners Page"
        />
         <meta name="keywords" content={"Partners Reva Cabs, Reva Partners, Partners"}/>
        <link rel="canonical" href="http://revacabs.com/" />
      </Helmet>
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
