import React, { useState } from "react";
import DatePicker from "react-datepicker";
import validator from "validator";
import "./Enquiry.css";
const Enquiry = (recived) => {
  const Enqu = recived.Enqu;
  const setEnqu = recived.setEnqu;
  const den = {
    name: "",
    phone: "",
    email: "",
    date: new Date(new Date().getTime() + 86400000).getTime(),
    person: "",
    tour: Enqu.data.id,
  };
  const [endata, setendata] = useState(den);

  let name, value;
  const handeldata = (e) => {
    name = e.target.name;
    value = e.target.value;
    setendata({ ...endata, [name]: value });
  };
  const postinquiry = async (e) => {
    e.preventDefault();
    const { name, phone, email, tour, date, person } = endata;
    if (
      !name ||
      !phone ||
      !email ||
      !date ||
      !person ||
      !tour ||
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof date !== "number" ||
      typeof person !== "string" ||
      typeof tour !== "string" ||
      name.length > 100
    ) {
      return alert("invalid request");
    }
    if (!validator.isMobilePhone(phone, "en-IN")) {
      return alert("Invalid phone");
    }
    if (!validator.isEmail(email)) {
      return alert("Invalid email");
    }
    if (person * 1 > 100 || person * 1 <= 0) {
      return alert("Invalid  member count");
    }
    if (new Date().getTime() + 86400000 > date * 1) {
      return alert("Invalid date selected");
    }
    let tourdata = {
      name,
      phone,
      email,
      date,
      person,
    };
    if (tour === "other") {
      tourdata = { ...tourdata, tour: "other" };
    } else {
      tourdata = { ...tourdata, tour };
    }
    const res = await fetch(`/api/tourpackages/inquiry`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(tourdata),
    });
    const data = await res.json();
    if (res.status === 201) {
      alert("inquiry created successfully");
      setendata(den);
      setEnqu({ display: false, data: {} });
      document.body.classList.remove("no-scrol");
    } else {
      alert(data);
    }
  };
  return (
    <div className="form-container">
      <div
        className="frm-clsr"
        onClick={() => {
          setEnqu({ ...Enqu, display: false, data: {} });
          document.body.classList.remove("no-scrol");
        }}
      ></div>
      <div className="enqu-bx">
        <div className="enqu-hd">Enquiry</div>
        <div className="enqu-row">
          <div className="enqu-rowhd">Full Name</div>
          <input
            type="text"
            name="name"
            id=""
            className="enqu-inpt"
            placeholder="Full Name"
            onChange={handeldata}
            value={endata.name}
          />
        </div>
        <div className="enqu-row">
          <div className="enqu-rowhd">Phone number</div>
          <input
            type="tel"
            name="phone"
            className="enqu-inpt"
            placeholder="Phone"
            onChange={handeldata}
            value={endata.phone}
          />
        </div>
        <div className="enqu-row">
          <div className="enqu-rowhd">Email</div>
          <input
            type="email"
            name="email"
            className="enqu-inpt"
            placeholder="Email"
            onChange={handeldata}
            value={endata.email}
          />
        </div>
        <div className="enqu-row">
          <div className="enqu-rowhd">No of Person</div>
          <input
            type="number"
            name="person"
            className="enqu-inpt"
            placeholder="Person"
            onChange={handeldata}
            value={endata.person}
          />
        </div>
        <div className="enqu-row">
          <div className="enqu-rowhd">Date of Arrvial</div>
          <DatePicker
            className="enqu-inpt"
            placeholderText="Start Date"
            dateFormat="dd/MM/yyy"
            selected={endata.date}
            onChange={(value) => {
              setendata({ ...endata, date: value.getTime() });
            }}
            minDate={
              new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                new Date().getDate(),
                0,
                0,
                0,
                0
              )
            }
            maxDate={
              new Date(
                new Date().getFullYear() + 1,
                new Date().getMonth(),
                new Date().getDate(),
                0,
                0,
                0,
                0
              )
            }
          />
        </div>
        <div className="enqu-row">
          <button type="submit" className="enqu-btn" onClick={postinquiry}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Enquiry;
