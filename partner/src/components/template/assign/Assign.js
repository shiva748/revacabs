import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { CgArrowsExchange, CgArrowRight } from "react-icons/cg";
const Assign = (recived) => {
  const assign = recived.assign;
  const setassign = recived.setassign;
  const data = assign.bkng;
  const triplog = recived.triplog;
  const [inventory, setinventory] = useState({ cars: [], drivers: [] });
  const getdc = async () => {
    let res = await fetch("/partner/inventory", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await res.json();
    if (res.status === 200) {
      setinventory({ cars: data.cars, drivers: data.drivers });
    } else {
      window.alert("failed to fetch your Cars and Drivers");
    }
  };
  useEffect(() => {
    getdc();
  }, []);
  const [assdc, setassdc] = useState({
    car: data.cabinfo ? data.cabinfo.cabid : "",
    driver: data.driverinfo ? data.driverinfo.driverid : "",
  });
  const assigndc = async () => {
    const { car, driver } = assdc;
    if (!car || !driver) {
      return window.alert("please fill all the fields");
    }
    if (data.driverinfo && data.cabinfo) {
      if (data.cabinfo.cabid === car && data.driverinfo.driverid === driver) {
        return window.alert("please make change's to update booking");
      }
    }
    if (
      !inventory.cars.some((itm) => itm.cabid === car) ||
      !inventory.drivers.some((itm) => itm.driverid === driver)
    ) {
      return window.alert("please select valid car & driver");
    }
    const [selectedcar] = inventory.cars.filter((itm) => itm.cabid === car);
    if (data.tripinfo.equivalent.isequi) {
      if (selectedcar.group_id < data.tripinfo.group_id) {
        return window.alert("please selct an equivalent or upper segment car");
      }
    } else {
      if (selectedcar.cab_id !== data.tripinfo.cab_id) {
        if (selectedcar.group_id < data.tripinfo.group_id) {
          return window.alert(
            `please select ${data.tripinfo.name} or upper segment car`
          );
        }
      }
    }
    if (selectedcar.status !== "Active") {
      return window.alert("please change the car status to (Active)");
    }
    const [selecteddriver] = inventory.drivers.filter(
      (itm) => itm.driverid === driver
    );
    if (selecteddriver.status !== "Active") {
      return window.alert("please change the driver status to (Active)");
    }
    const res = await fetch("/partner/assign", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingid: data.bookingid,
        car,
        driver,
      }),
    });
    const dataa = await res.json();
    if (res.status === 201) {
      window.alert(dataa);
      triplog("upcmng");
      setassign({ display: false, bkng: {} });
    } else {
    }
  };
  let name, value;
  const handelinput = (e) => {
    name = e.target.name;
    value = e.target.value;
    setassdc({ ...assdc, [name]: value });
  };
  return (
    <div className="form-container">
      <div
        className="form-box"
        style={{ height: "fit-content", margin: "auto" }}
      >
        <div className="bkngdtl-hd">
          {data.cabinfo && data.driverinfo ? "Re-assign" : "Assign"} Car &
          Driver
          <div
            className="clsr-con"
            onClick={() => {
              setassign({ display: false, bkng: "" });
            }}
          >
            <FaTimes />
          </div>
        </div>
        <div className="bkng-dtlcon">
          <table className="bkngdtl-tbl">
            <tbody>
              <tr>
                <td>Booking type</td>
                <td>{data.bookingtype}</td>
              </tr>
              <tr>
                <td>
                  {data.bookingtype === "Outstation"
                    ? "Outstation Type"
                    : "Rental Package"}
                </td>
                <td>
                  {data.bookingtype === "Outstation"
                    ? `${data.outstation} (${data.tripinfo.distance} KM)`
                    : `(${data.tripinfo.hour} Hour ||${data.tripinfo.distance} KM)`}
                </td>
              </tr>
              <tr>
                <td>{data.bookingtype === "Local" ? "City" : "Route"}</td>
                <td>
                  {data.sourcecity.from.split(",")[0]}

                  {data.bookingtype === "Local" ? (
                    ""
                  ) : data.outstation === "Roundtrip" ? (
                    <>
                      <CgArrowsExchange />
                      {data.endcity.to.split(",")[0]}
                    </>
                  ) : (
                    <>
                      <CgArrowRight />
                      {data.endcity.to.split(",")[0]}
                    </>
                  )}
                </td>
              </tr>
              <tr>
                <td>Cab</td>
                <td>
                  {data.tripinfo.equivalent.isequi
                    ? `${data.tripinfo.name} or equi`
                    : data.tripinfo.name}
                </td>
              </tr>
              <tr>
                <td>Pickup Date</td>
                <td>{new Date(data.pickupdate).toLocaleDateString("en-IN")}</td>
              </tr>
              <tr>
                <td>Pickup Time</td>
                <td>{new Date(data.pickupat).toLocaleTimeString("en-IN")}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <table className="frm-table" style={{ marginTop: "10px" }}>
          <tbody>
            <tr>
              <td>
                Select Car<span className="rd-txt">*</span>
              </td>
              <td>
                <select
                  name="car"
                  placeholder=" Select Car"
                  className="frm-tableinp"
                  value={assdc.car}
                  onChange={handelinput}
                >
                  <option value="">Select Car</option>
                  {inventory.cars.map((itm, i) => {
                    return (
                      <option value={itm.cabid}>
                        {itm.name} ({itm.carNumber})
                      </option>
                    );
                  })}
                </select>
              </td>
            </tr>
            <tr>
              <td>
                Select Driver<span className="rd-txt">*</span>
              </td>
              <td>
                <select
                  name="driver"
                  placeholder=" Select Driver"
                  className="frm-tableinp"
                  value={assdc.driver}
                  onChange={handelinput}
                >
                  <option value="">Select Driver</option>
                  {inventory.drivers.map((itm, i) => {
                    return (
                      <option value={itm.driverid}>
                        {itm.firstName + " " + itm.lastName}
                      </option>
                    );
                  })}
                </select>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="form-btmcon">
          <button className="frm-sbmtbtn" onClick={assigndc}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Assign;
