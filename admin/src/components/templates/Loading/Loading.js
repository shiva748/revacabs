import React from "react";
import "./Loading.css";

const Loading = () => {
  return (
    <div className="loader-div flsz-con">
      <span className="loader">
        <span></span>
        <span></span>
      </span>
      <span className="Loader-txt">Loading...</span>
    </div>
  );
};

export default Loading;
