import React from "react";
import "./css/Error.css";
import { NavLink } from "react-router-dom";

const Error = () => {
  return (
    <>
      <section className="page_404">
        <div className="container">
          <div className="row">
            <div className="col-sm-12 ">
              <div className="col-sm-10 col-sm-offset-1  text-center">
                <div className="four_zero_four_bg">
                  <h1 className="text-center ">404</h1>
                </div>
                <div className="error-content-box">
                  <span className="h-t3">Look like you are lost</span>
                  <span className="error-page-text">
                    can not proceed your request
                  </span>
                  <NavLink to="/" className="error-page-btn">
                    Home
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Error;
