import React, { useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import validator from "validator";
import DatePicker from "react-datepicker";
import { MdOutlineVerifiedUser } from "react-icons/md";
const Addriver = (recived) => {
  let setvwstate = recived.setvwstate;
  let vwstate = recived.vwstate;
  let reqdriver = recived.reqdriver;
  const nw = vwstate.nw;
  const driver = vwstate.data;
  const [aadhaar, setaadhaar] = useState({
    src: null,
    image: null,
    processed: null,
  });
  const [profile, setprofile] = useState({
    src: null,
    image: null,
    processed: null,
  });
  const [dl, setdl] = useState({
    src: null,
    image: null,
    processed: null,
  });
  const df = nw
    ? {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        aPhone: "",
        aadhaarNumber: "",
        dlNumber: "",
        dlValidity: "",
        load:false
      }
    : {
        firstName: driver.firstName,
        lastName: driver.lastName,
        email: driver.email,
        phone: driver.phone,
        aPhone: driver.aPhone,
        aadhaarNumber: driver.Doc.Aadhaar.Number,
        dlNumber: driver.Doc.Drivinglicense.Number,
        dlValidity: driver.Doc.Drivinglicense.Validity,
        status: driver.status,
        load:false
      };
  const [frmdata, setfrmdata] = useState(df);
  const handelimage = (e) => {
    if (!e.target.files[0]) {
      console.log("file do not exist");
      return;
    } else {
      console.log("file do exists");
    }
    if (e.target.name === "aadhaar") {
      setaadhaar({
        ...aadhaar,
        // eslint-disable-next-line
        ["src"]: URL.createObjectURL(e.target.files[0]),
      });
    } else if (e.target.name === "profile") {
      setprofile({
        ...profile,
        // eslint-disable-next-line
        ["src"]: URL.createObjectURL(e.target.files[0]),
      });
    } else if (e.target.name === "dl") {
      setdl({
        ...dl,
        // eslint-disable-next-line
        ["src"]: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  // const [image, setimage] = useState(null);
  const [crop, setcrop] = useState({ aadhaar: null, profile: null, dl: null });
  function getCroppedImg(crop, image, type) {
    if (!image || !crop || !dl) {
      return;
    }
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    // New lines to be added
    const pixelRatio =
      window.devicePixelRatio < 2 ? 2 : window.devicePixelRatio;
    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    const base64Image = canvas.toDataURL("image/jpeg");
    if (type === "aadhaar") {
      // eslint-disable-next-line
      setaadhaar({ ...aadhaar, ["processed"]: base64Image });
    } else if (type === "profile") {
      // eslint-disable-next-line
      setprofile({ ...profile, ["processed"]: base64Image });
    } else if (type === "dl") {
      // eslint-disable-next-line
      setdl({ ...dl, ["processed"]: base64Image });
    }
  }
  let name, value;
  const handelfrm = (e) => {
    name = e.target.name;
    value = e.target.value;
    setfrmdata({ ...frmdata, [name]: value });
  };

  const der = {
    firstName: { display: false, message: "" },
    lastName: { display: false, message: "" },
    email: { display: false, message: "" },
    phone: { display: false, message: "" },
    aPhone: { display: false, message: "" },
    aadhaarNumber: { display: false, message: "" },
    dlNumber: { display: false, message: "" },
    dlValidity: { display: false, message: "" },
    terms: { display: false, message: "" },
  };
  const [errs, seterrs] = useState(der);
  const isphone = () => {
    if (!validator.isMobilePhone(frmdata.phone, "en-IN")) {
      seterrs({
        ...errs,
        // eslint-disable-next-line
        ["phone"]: {
          display: true,
          message: "Please enter valid mobile number.",
        },
      });
      return false;
    } else {
      return true;
    }
  };
  const isaPhone = () => {
    if (!validator.isMobilePhone(frmdata.aPhone, "en-IN")) {
      seterrs({
        ...errs,
        // eslint-disable-next-line
        ["aPhone"]: {
          display: true,
          message: "Please enter valid mobile number.",
        },
      });
      return false;
    } else {
      return true;
    }
  };
  const isaadhaarNumber = () => {
    if (frmdata.aadhaarNumber.length !== 12) {
      seterrs({
        ...errs,
        // eslint-disable-next-line
        ["aadhaarNumber"]: {
          display: true,
          message: "Please enter valid Aadhaar Number.",
        },
      });
      return false;
    } else if (frmdata.aadhaarNumber < 100000000000) {
      seterrs({
        ...errs,
        // eslint-disable-next-line
        ["aadhaarNumber"]: {
          display: true,
          message: "Please enter valid Aadhaar Number.",
        },
      });
      return false;
    } else {
      return true;
    }
  };
  const isfirstName = () => {
    if (frmdata.firstName == null || frmdata.firstName === "") {
      seterrs({
        ...errs,
        // eslint-disable-next-line
        ["firstName"]: {
          display: true,
          message: "Please enter first name",
        },
      });
      return false;
    } else if (frmdata.firstName.length < 3) {
      seterrs({
        ...errs,
        // eslint-disable-next-line
        ["firstName"]: {
          display: true,
          message: "First Name must be at least 3 characters long",
        },
      });
      return false;
    } else if (frmdata.firstName.length > 50) {
      seterrs({
        ...errs,
        // eslint-disable-next-line
        ["firstName"]: {
          display: true,
          message: "First Name must be at less then 50 characters",
        },
      });
      return false;
    } else {
      return true;
    }
  };
  const islastName = () => {
    if (frmdata.lastName == null || frmdata.lastName === "") {
      seterrs({
        ...errs,
        // eslint-disable-next-line
        ["lastName"]: {
          display: true,
          message: "Please enter last name",
        },
      });
      return false;
    } else if (frmdata.lastName.length < 3) {
      seterrs({
        ...errs,
        // eslint-disable-next-line
        ["lastName"]: {
          display: true,
          message: "Last Name must be at least 3 characters long",
        },
      });
      return false;
    } else if (frmdata.lastName.length > 50) {
      seterrs({
        ...errs,
        // eslint-disable-next-line
        ["lastName"]: {
          display: true,
          message: "Last Name must be at less then 50 characters",
        },
      });
      return false;
    } else {
      return true;
    }
  };
  const isemail = () => {
    if (!validator.isEmail(frmdata.email)) {
      seterrs({
        ...errs,
        // eslint-disable-next-line
        ["email"]: { display: true, message: "Please enter a valid email" },
      });
      return false;
    } else {
      return true;
    }
  };
  const isdl = () => {
    const regex = /^([A-Z]{2})(\d{2}|\d{3})[a-zA-Z]{0,1}(\d{4})(\d{7})$/gm;
    const str = frmdata.dlNumber;
    let m;
    let matchs = 0;
    while ((m = regex.exec(str)) !== null) {
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      // eslint-disable-next-line
      m.forEach((match, groupIndex) => {
        // console.log(`Found match, group ${groupIndex}: ${match}`);
        matchs++;
      });
    }
    if (matchs !== 5) {
      seterrs({
        ...errs,
        // eslint-disable-next-line
        ["dlNumber"]: {
          display: true,
          message: "Please enter a valid DL Number",
        },
      });
      return false;
    } else {
      return true;
    }
  };
  const isvalid = () => {
    let error = false;
    if (!isfirstName()) {
      error = true;
    } else if (!islastName()) {
      error = true;
    } else if (!isemail()) {
      error = true;
    } else if (!isphone()) {
      error = true;
    } else if (!isaPhone()) {
      error = true;
    } else if (!isaadhaarNumber()) {
      error = true;
    } else if (!isdl()) {
      error = true;
    }
    return error;
  };
  const postdrvr = async (e) => {
    e.preventDefault();
    const {
      firstName,
      lastName,
      email,
      phone,
      aPhone,
      aadhaarNumber,
      dlNumber,
      dlValidity,
    } = frmdata;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !aPhone ||
      !aadhaarNumber ||
      !dlNumber ||
      !dlValidity
    ) {
      return alert("please fill all the fields");
    }
    if (isvalid()) {
      return;
    }
    let aadhaarimg = aadhaar.processed;
    let profileimg = profile.processed;
    let dlimg = dl.processed;
    setfrmdata({...frmdata, load:true})
    const res = await fetch("/partner/addriver", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phone,
        aPhone,
        aadhaarNumber,
        dlNumber,
        dlValidity: new Date(dlValidity).getTime(),
        aadhaarimg,
        profileimg,
        dlimg,
      }),
    });
    const data = await res.json();
    if (res.status === 201) {
      reqdriver();
      alert(data);
      // eslint-disable-next-line
      setvwstate({ ...vwstate, ["adopton"]: false });
    } else {
      alert(data);
      setfrmdata({...frmdata, load:false})
    }
  };

  const update = async (e) => {
    e.preventDefault();
    let status;
    let data = {};
    if (driver.verification.isverified) {
      if (!frmdata.status || frmdata.status === driver.status) {
        return alert("please select status");
      }
      status = frmdata.status;
    } else {
      if (driver.faultin.basc) {
        if (
          !frmdata.firstName ||
          !frmdata.lastName ||
          !frmdata.email ||
          !frmdata.phone ||
          !frmdata.aPhone
        ) {
          return alert("please fill all the fields");
        }
        data.firstName = frmdata.firstName;
        data.lastName = frmdata.lastName;
        data.email = frmdata.email;
        data.phone = frmdata.phone;
        data.aPhone = frmdata.aPhone;
      }
      if (driver.faultin.aadh) {
        if (!frmdata.aadhaarNumber || !aadhaar.processed) {
          return alert("please fill all the fields");
        }
        data.aadhaarNumber = frmdata.aadhaarNumber.toString();
        data.aadhaarimg = aadhaar.processed;
      }
      if (driver.faultin.prfl) {
        if (!profile.processed) {
          return alert("please fill all the fields");
        }
        data.profileimg = profile.processed;
      }
      if (driver.faultin.dl) {
        if (!frmdata.dlNumber || !frmdata.dlValidity || !dl.processed) {
          return alert("please fill all the fields");
        }
        data.dlimg = dl.processed;
        data.dlNumber = frmdata.dlNumber;
        data.dlValidity = frmdata.dlValidity;
      }
    }
    setfrmdata({...frmdata, load:true})
    const res = await fetch("/partner/updatedriver", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        driverid: driver.driverid,
        status,
        data,
      }),
    });
    const result = await res.json();
    if (res.status === 201) {
      reqdriver();
      // eslint-disable-next-line
      setvwstate({ adopton: false, data: {}, nw: true });
    } else {
      alert(result);
      setfrmdata({...frmdata, load:false})
    }
  };
  return (
    <div className="form-container">
      <div className={frmdata.load?"form-box ovrly-ad":"form-box"}>
        <div className="form-lgocon">
          <img src="/icons/logo.png" alt="" srcSet="" />
        </div>
        <div className="form-hdcon">{nw ? "Add Driver" : "Edit Driver"}</div>
        <div className="form-subcon">
          <table className="frm-table">
            <tbody>
              <tr>
                <td>
                  First Name<span className="rd-txt">*</span>
                </td>
                <td>
                  {nw || driver.faultin.basc ? (
                    <input
                      type="text"
                      name="firstName"
                      className="frm-tableinp"
                      placeholder="First Name"
                      value={frmdata.firstName}
                      onChange={handelfrm}
                      onBlur={isfirstName}
                      onFocus={() => {
                        seterrs({
                          ...errs,
                          // eslint-disable-next-line
                          ["firstName"]: { display: false, message: "" },
                        });
                      }}
                    />
                  ) : (
                    <div className="al-div">{driver.firstName}</div>
                  )}
                  {errs.firstName.display ? (
                    <span className="input-err">{errs.firstName.message}</span>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
              <tr>
                <td>
                  Last Name<span className="rd-txt">*</span>
                </td>
                <td>
                  {nw || driver.faultin.basc ? (
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      className="frm-tableinp"
                      value={frmdata.lastName}
                      onChange={handelfrm}
                      onBlur={islastName}
                      onFocus={() => {
                        seterrs({
                          ...errs,
                          // eslint-disable-next-line
                          ["lastName"]: { display: false, message: "" },
                        });
                      }}
                    />
                  ) : (
                    <div className="al-div">{driver.lastName}</div>
                  )}
                  {errs.lastName.display ? (
                    <span className="input-err">{errs.lastName.message}</span>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
              <tr>
                <td>
                  Email<span className="rd-txt">*</span>
                </td>
                <td>
                  {nw || driver.faultin.basc ? (
                    <input
                      type="text"
                      name="email"
                      placeholder="Email"
                      className="frm-tableinp"
                      value={frmdata.email}
                      onChange={handelfrm}
                      onBlur={isemail}
                      onFocus={() => {
                        seterrs({
                          ...errs,
                          // eslint-disable-next-line
                          ["email"]: { display: false, message: "" },
                        });
                      }}
                    />
                  ) : (
                    <div className="al-div">{driver.email}</div>
                  )}
                  {errs.email.display ? (
                    <span className="input-err">{errs.email.message}</span>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
              <tr>
                <td>
                  Phone<span className="rd-txt">*</span>
                </td>
                <td>
                  {nw || driver.faultin.basc ? (
                    <input
                      type="text"
                      name="phone"
                      placeholder="Phone"
                      className="frm-tableinp"
                      value={frmdata.phone}
                      onChange={handelfrm}
                      onBlur={isphone}
                      onFocus={() => {
                        seterrs({
                          ...errs,
                          // eslint-disable-next-line
                          ["phone"]: { display: false, message: "" },
                        });
                      }}
                    />
                  ) : (
                    <div className="al-div">{driver.phone}</div>
                  )}
                  {errs.phone.display ? (
                    <span className="input-err">{errs.phone.message}</span>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
              <tr>
                <td>
                  Alternate Phone<span className="rd-txt">*</span>
                </td>
                <td>
                  {nw || driver.faultin.basc ? (
                    <input
                      type="tel"
                      name="aPhone"
                      placeholder="Alternate Phone"
                      className="frm-tableinp"
                      value={frmdata.aPhone}
                      onChange={handelfrm}
                      onBlur={isaPhone}
                      onFocus={() => {
                        seterrs({
                          ...errs,
                          // eslint-disable-next-line
                          ["aPhone"]: { display: false, message: "" },
                        });
                      }}
                    />
                  ) : (
                    <div className="al-div">{driver.aPhone}</div>
                  )}
                  {errs.aPhone.display ? (
                    <span className="input-err">{errs.aPhone.message}</span>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
              {nw || driver.faultin.prfl ? (
                ""
              ) : (
                <tr>
                  <td>Driver image</td>
                  <td>
                    <span className="vrfd-span">
                      <MdOutlineVerifiedUser />{" "}
                      {driver.verification.isverified ? "Verified" : "Uploaded"}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div
            className={
              nw || driver.faultin.prfl ? "fil-selcon" : "fil-selcon hide"
            }
          >
            <div className="fil-row">
              Select Your Image<span className="rd-txt">*</span>:
              <input
                type="file"
                name="profile"
                accept="image/*"
                onChange={handelimage}
                className="frm-tableinp"
              />
            </div>
            <div className="croper-con">
              {profile.src ? (
                <>
                  <ReactCrop
                    src={profile.src}
                    crop={crop.profile}
                    onChange={(cropdata) => {
                      // eslint-disable-next-line
                      setcrop({ ...crop, ["profile"]: cropdata });
                    }}
                    onImageLoaded={(image) => {
                      setprofile({
                        ...profile,
                        // eslint-disable-next-line
                        ["image"]: image,
                      });
                    }}
                  />
                </>
              ) : (
                "No image Selected"
              )}
            </div>
            <div className="cropped-con">
              <p className="bold-txt">Preview Image</p>
              <img
                src={profile.processed}
                alt=""
                srcSet=""
                className="cropped-img"
              />
            </div>
            <button
              onClick={() => {
                getCroppedImg(crop.profile, profile.image, "profile");
              }}
              className="crop-btn"
            >
              Crop and Save
            </button>
          </div>
          <table className="frm-table">
            <tbody>
              <tr>
                <td>
                  Aadhaar Number<span className="rd-txt">*</span>
                </td>
                <td>
                  {nw || driver.faultin.aadh ? (
                    <input
                      type="number"
                      name="aadhaarNumber"
                      className="frm-tableinp"
                      placeholder="xxxx-xxxx-xxxx"
                      value={frmdata.aadhaarNumber}
                      onChange={handelfrm}
                      onBlur={isaadhaarNumber}
                      onFocus={() => {
                        seterrs({
                          ...errs,
                          // eslint-disable-next-line
                          ["aadhaarNumber"]: { display: false, message: "" },
                        });
                      }}
                    />
                  ) : (
                    <div className="al-div">{driver.Doc.Aadhaar.Number}</div>
                  )}
                  {errs.aadhaarNumber.display ? (
                    <span className="input-err">
                      {errs.aadhaarNumber.message}
                    </span>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
              {nw || driver.faultin.aadh ? (
                ""
              ) : (
                <tr>
                  <td>Aadhaar image</td>
                  <td>
                    <span className="vrfd-span">
                      <MdOutlineVerifiedUser />{" "}
                      {driver.verification.isverified ? "Verified" : "Uploaded"}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div
            className={
              nw || driver.faultin.aadh ? "fil-selcon" : "fil-selcon hide"
            }
          >
            <div className="fil-row">
              Select Aadhaar image<span className="rd-txt">*</span>:
              <input
                type="file"
                name="aadhaar"
                accept="image/*"
                onChange={handelimage}
                className="frm-tableinp"
              />
            </div>
            <div className="croper-con">
              {aadhaar.src ? (
                <>
                  <ReactCrop
                    src={aadhaar.src}
                    crop={crop.aadhaar}
                    onChange={(cropdata) => {
                      // eslint-disable-next-line
                      setcrop({ ...crop, ["aadhaar"]: cropdata });
                    }}
                    onImageLoaded={(image) => {
                      setaadhaar({
                        ...aadhaar,
                        // eslint-disable-next-line
                        ["image"]: image,
                      });
                    }}
                  />
                </>
              ) : (
                "No image Selected"
              )}
            </div>
            <div className="cropped-con">
              <p className="bold-txt">Preview Image</p>
              <img
                src={aadhaar.processed}
                alt=""
                srcSet=""
                className="cropped-img"
              />
            </div>
            <button
              onClick={() => {
                getCroppedImg(crop.aadhaar, aadhaar.image, "aadhaar");
              }}
              className="crop-btn"
            >
              Crop and Save
            </button>
          </div>
          <table className="frm-table">
            <tbody>
              <tr>
                <td>
                  DL Number<span className="rd-txt">*</span>
                </td>
                <td>
                  {nw || driver.faultin.dl ? (
                    <input
                      type="text"
                      name="dlNumber"
                      placeholder="Dl Number"
                      className="frm-tableinp"
                      value={frmdata.dlNumber}
                      onChange={handelfrm}
                      maxLength="15"
                      onBlur={isdl}
                      onFocus={() => {
                        seterrs({
                          ...errs,
                          // eslint-disable-next-line
                          ["dlNumber"]: { display: false, message: "" },
                        });
                      }}
                    />
                  ) : (
                    <div className="al-div">
                      {driver.Doc.Drivinglicense.Number}
                    </div>
                  )}
                  {errs.dlNumber.display ? (
                    <span className="input-err">{errs.dlNumber.message}</span>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
              <tr>
                <td>
                  DL Validity<span className="rd-txt">*</span>
                </td>
                <td>
                  {nw || driver.faultin.dl ? (
                    <DatePicker
                      className="frm-tableinp"
                      name="birthDate"
                      onChange={(value) => {
                        // eslint-disable-next-line
                        setfrmdata({ ...frmdata, ["dlValidity"]: value });
                      }}
                      placeholderText="DD/MM/YYYY"
                      selected={frmdata.dlValidity}
                      dateFormat="dd/MM/yyyy"
                      minDate={
                        new Date(new Date().setMonth(new Date().getMonth() + 1))
                      }
                    />
                  ) : (
                    <div className="al-div">
                      {new Date(
                        driver.Doc.Drivinglicense.Validity
                      ).toLocaleDateString("en-IN")}
                    </div>
                  )}
                  {errs.dlValidity.display ? (
                    <span className="input-err">{errs.dlValidity.message}</span>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
              {nw || driver.faultin.dl ? (
                ""
              ) : (
                <tr>
                  <td>Dl image</td>
                  <td>
                    <span className="vrfd-span">
                      <MdOutlineVerifiedUser />{" "}
                      {driver.verification.isverified ? "Verified" : "Uploaded"}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div
            className={
              nw || driver.faultin.dl ? "fil-selcon" : "fil-selcon hide"
            }
          >
            <div className="fil-row">
              Select DL image<span className="rd-txt">*</span>:
              <input
                type="file"
                name="dl"
                accept="image/*"
                onChange={handelimage}
                className="frm-tableinp"
              />
            </div>
            <div className="croper-con">
              {dl.src ? (
                <>
                  <ReactCrop
                    src={dl.src}
                    crop={crop.dl}
                    onChange={(cropdata) => {
                      // eslint-disable-next-line
                      setcrop({ ...crop, ["dl"]: cropdata });
                    }}
                    onImageLoaded={(image) => {
                      setdl({
                        ...dl,
                        // eslint-disable-next-line
                        ["image"]: image,
                      });
                    }}
                  />
                </>
              ) : (
                "No image Selected"
              )}
            </div>
            <div className="cropped-con">
              <p className="bold-txt">Preview Image</p>
              <img
                src={dl.processed}
                alt=""
                srcSet=""
                className="cropped-img"
              />
            </div>
            <button
              onClick={() => {
                getCroppedImg(crop.dl, dl.image, "dl");
              }}
              className="crop-btn"
            >
              Crop and Save
            </button>
          </div>
          <table className="frm-table">
            <tbody>
              {!nw && driver.verification.isverified ? (
                <tr>
                  <td>
                    Status<span className="rd-txt">*</span>
                  </td>
                  <td>
                    <select
                      name="status"
                      id=""
                      onChange={handelfrm}
                      className="frm-tableinp"
                      value={frmdata.status}
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Inactive">In Active</option>
                      <option value="Dispute">Dispute</option>
                      <option value="OnDuty">On Duty</option>
                    </select>
                  </td>
                </tr>
              ) : (
                ""
              )}
            </tbody>
          </table>
          <div className="form-btmcon">
            <button
              className="frm-sbmtbtn"
              style={{ backgroundColor: "red" }}
              onClick={() => {
                // eslint-disable-next-line
                setvwstate({ ...vwstate, ["adopton"]: false });
              }}
            >
              Close
            </button>
            <button className={frmdata.load?"frm-sbmtbtn load-btn":"frm-sbmtbtn"} onClick={nw ? postdrvr : update}>
              <span>
              {nw ? "Add Driver" : "Edit Driver"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Addriver;
