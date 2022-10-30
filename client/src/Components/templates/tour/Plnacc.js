import React, { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
const Plnacc = (recived) => {
  const itm = recived.data;
  const [display, setdisplay] = useState(true);
  return (
    <>
      <div
        className="vw-tglr"
        onClick={() => {
          setdisplay(!display);
        }}
      >
        <div className="stts">
          {display ? <AiFillEye /> : <AiFillEyeInvisible />}
        </div>
        <span className="drtn-hd" style={{ marginRight: "10px" }}>
          Day {itm.day}{" "}
        </span>
        <span>{itm.title}</span>
      </div>
      <div className={display ? "pln-dtlex" : "pln-dtl"}>{itm.description}</div>
    </>
  );
};

export default Plnacc;
