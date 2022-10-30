import React from "react";
import "./loading.css";

const Loading = () => {
  return (
    <>
      <div className={"loading"}>
        <div id="loading-wrapper">
          <div id="loading-text">LOADING</div>
          <div id="loading-content"></div>
        </div>
      </div>
    </>
  );
};

export default Loading;
