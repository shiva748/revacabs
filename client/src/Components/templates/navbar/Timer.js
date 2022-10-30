import React, { useState, useEffect } from "react";

const Timer = (recived) => {
  const { setover, sec, over } = recived;
  const [count, setcount] = useState(sec);
  function timer() {
    setover(false);
    let time = sec;
    let timer1 = setInterval(() => {
      if (time <= 1) {
        clearInterval(timer1);
        setover({ ...over, frgt: true, regi: true });
      } else {
        time--;
        setcount(time);
      }
    }, 1000);
  }
  useEffect(() => {
    timer();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="Resend-div">
      <span>Resend Otp in </span>
      <span>{count} sec ?</span>
    </div>
  );
};

export default Timer;
