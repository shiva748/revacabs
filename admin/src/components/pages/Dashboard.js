import React, { useState, useEffect } from "react";
import Dataload from "../templates/Loading/Dataload";
import "./css/Dashboard.css";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { FaCarSide, FaUserSecret } from "react-icons/fa";
import { ImUserTie } from "react-icons/im";
import { HiUserGroup } from "react-icons/hi";
ChartJS.register(ArcElement, Tooltip, Legend);
const Dashboard = () => {
  const [prcs, setprcs] = useState(false);
  const [data, setdata] = useState({
    labels: ["Inquiry", "Pending", "Completed", "Cancelled"],
    datasets: [
      {
        label: "# of Votes",
        data: [0, 0, 0, 0],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  });
  const [stt, setstt] = useState({
    car: { count: "loading..." },
    driver: { count: "loading..." },
    coustumer: { count: "loading..." },
    partner: { count: "loading..." },
  });
  const stts = async () => {
    const res = await fetch("/oceannodes/stats", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const dataa = await res.json();
    if (res.status === 200) {
      setstt(dataa);
      setdata({
        labels: ["Inquiry", "Pending", "Completed", "Cancelled"],
        datasets: [
          {
            label: "# of Votes",
            data: [
              dataa.booking.inquiry,
              dataa.booking.pending,
              dataa.booking.completed,
              dataa.booking.cancelled,
            ],
            backgroundColor: [
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(255, 99, 132, 0.2)",
            ],
            borderColor: [
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(255, 99, 132, 1)",
            ],
            borderWidth: 1,
          },
        ],
      });
      // eslint-disable-next-line
      setprcs(false);
    } else {
      alert(data);
    }
  };
  useEffect(() => {
    stts();
    // eslint-disable-next-line
  }, []);
  return (
    <>
      {prcs ? (
        <Dataload />
      ) : (
        <div className="comp-con">
          <div className="bkng-stts">
            <div className="bkng-sttshd">Bookings</div>
            <div className="chrt-con">
              <Pie data={data} />
            </div>
          </div>
          <div className="stt-row rw-center">
            <div className="stt-cl center">
              <div
                className="cl-hd center"
                style={{ backgroundColor: "#028aff" }}
              >
                <HiUserGroup />
              </div>
              <div className="count center">{stt.coustumer.count}</div>
              <div className="count center">Client</div>
            </div>
            <div className="stt-cl center">
              <div
                className="cl-hd center"
                style={{ backgroundColor: "#028aff" }}
              >
                <FaUserSecret />
              </div>
              <div className="count center">{stt.partner.count}</div>
              <div className="count center">
                Partner
              </div>
            </div>
            <div className="stt-cl center">
              <div
                className="cl-hd center"
                style={{ backgroundColor: "#028aff" }}
              >
                <ImUserTie />
              </div>
              <div className="count center">{stt.driver.count}</div>
              <div className="count center">
                Driver
              </div>
            </div>
            <div className="stt-cl center">
              <div
                className="cl-hd center"
                style={{ backgroundColor: "#028aff" }}
              >
                <FaCarSide />
              </div>
              <div className="count center">{stt.car.count}</div>
              <div className="count center">
                Car
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
