import React, { useState } from "react";
import "./verification.css";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import validator from "validator";
import DatePicker from "react-datepicker";
import { MdOutlineVerifiedUser } from "react-icons/md";
const Verification = (recived) => {
  const { faultin, prefill, setvrftn } = recived;
  if (!faultin || !prefill) {
    setvrftn(false);
  }
  if (
    !prefill.firstName ||
    !prefill.lastName ||
    !prefill.email ||
    !prefill.phone
  ) {
    setvrftn(false);
  }
  if (!faultin.aadh) {
    if (!prefill.aadhaarNumber) {
      setvrftn(false);
    }
  }
  if (!faultin.dl) {
    if (!prefill.dlNumber || !prefill.dlValidity) {
      setvrftn(false);
    }
  }
  if (!faultin.basc) {
    if (!prefill.city || !prefill.birthDate || !prefill.aPhone) {
      setvrftn(false);
    }
  }
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
  const [prcs, setprcs] = useState(false);
  const [frmdata, setfrmdata] = useState({
    firstName: prefill.firstName,
    lastName: prefill.lastName,
    email: prefill.email,
    phone: prefill.phone,
    aPhone: prefill.aPhone ? prefill.aPhone : "",
    birthDate: prefill.birthDate ? prefill.birthDate : "",
    city: prefill.city ? prefill.city : "",
    aadhaarNumber: prefill.aadhaarNumber ? prefill.aadhaarNumber : "",
    dlNumber: prefill.dlNumber ? prefill.dlNumber : "",
    dlValidity: prefill.dlValidity ? prefill.dlValidity : "",
    terms: "",
  });
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
    aPhone: { display: false, message: "" },
    birthDate: { display: false, message: "" },
    city: { display: false, message: "" },
    aadhaarNumber: { display: false, message: "" },
    dlNumber: { display: false, message: "" },
    dlValidity: { display: false, message: "" },
    terms: { display: false, message: "" },
  };
  const [errs, seterrs] = useState(der);
  const isphone = () => {
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
          message: "First Name can not be blank",
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
        matchs++;
      });
    }
    if (matchs !== 5) {
      seterrs({
        ...errs,
        dlNumber: {
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
    } else if (!isphone()) {
      error = true;
    } else if (!isaadhaarNumber()) {
      error = true;
    } else if (!isdl()) {
      error = true;
    }
    return error;
  };
  const postver = async (e) => {
    e.preventDefault();
    const {
      firstName,
      lastName,
      email,
      phone,
      aPhone,
      birthDate,
      city,
      aadhaarNumber,
      dlNumber,
      dlValidity,
    } = frmdata;
    if (isvalid()) {
      return;
    }
    let datas = { email, phone };
    if (faultin.basc) {
      if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !aPhone ||
        !city ||
        !birthDate
      ) {
        return alert("please fill all the fields");
      }
      datas.firstName = firstName;
      datas.lastName = lastName;
      datas.aPhone = aPhone;
      datas.city = city;
      datas.birthDate = new Date(birthDate).getTime();
    }
    if (faultin.prfl) {
      if (!profile.processed) {
        return alert("please fill all the fields");
      }
      datas.profileimg = profile.processed;
    }
    if (faultin.aadh) {
      if (!aadhaarNumber || !aadhaar.processed) {
        return alert("please fill all the fields");
      }
      datas.aadhaarNumber = aadhaarNumber;
      datas.aadhaarimg = aadhaar.processed;
    }
    if (faultin.dl) {
      if (!dlNumber || !dlValidity || !dl.processed) {
        return alert("please fill all the fields");
      }
      datas.dlNumber = dlNumber;
      datas.dlValidity = new Date(dlValidity).getTime();
      datas.dlimg = dl.processed;
    }
    setprcs(true);
    const res = await fetch("/partner/partnerverification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datas),
    });
    const data = await res.json();
    if (res.status === 201) {
      alert(data);
      setvrftn(false);
    } else {
      alert(data);
    }
    setprcs(false);
  };
  return (
    <div className="form-container">
      <div className={prcs ? "form-box ovrly-ad" : "form-box"}>
        <div className="form-lgocon">
          <img src="/icons/logo.png" alt="" srcSet="" />
        </div>
        <div className="form-hdcon">Verify Profile</div>
        <div className="form-subcon">
          <table className="frm-table">
            <tbody>
              <tr>
                <td>
                  First Name<span className="rd-txt">*</span>
                </td>
                <td>
                  {faultin.basc ? (
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
                    <div className="al-div">{prefill.firstName}</div>
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
                  {faultin.basc ? (
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
                    <div className="al-div">{prefill.lastName}</div>
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
                  <div className="al-div">{frmdata.email}</div>
                </td>
              </tr>
              <tr>
                <td>
                  Phone<span className="rd-txt">*</span>
                </td>
                <td>
                  <div className="al-div">{frmdata.phone}</div>
                </td>
              </tr>
              <tr>
                <td>
                  Alternate Phone<span className="rd-txt">*</span>
                </td>
                <td>
                  {faultin.basc ? (
                    <input
                      type="tel"
                      name="aPhone"
                      placeholder="Alternate Phone"
                      className="frm-tableinp"
                      value={frmdata.aPhone}
                      onChange={handelfrm}
                      onBlur={isphone}
                      onFocus={() => {
                        seterrs({
                          ...errs,
                          // eslint-disable-next-line
                          ["aPhone"]: { display: false, message: "" },
                        });
                      }}
                    />
                  ) : (
                    <div className="al-div">{prefill.aPhone}</div>
                  )}
                  {errs.aPhone.display ? (
                    <span className="input-err">{errs.aPhone.message}</span>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
              <tr>
                <td>
                  Birth Date<span className="rd-txt">*</span>
                </td>
                <td>
                  {faultin.basc ? (
                    <DatePicker
                      className="frm-tableinp"
                      name="birthDate"
                      onChange={(value) => {
                        // eslint-disable-next-line
                        setfrmdata({ ...frmdata, ["birthDate"]: value });
                      }}
                      placeholderText="DD/MM/YYYY"
                      selected={frmdata.birthDate}
                      dateFormat="dd/MM/yyyy"
                      maxDate={
                        new Date(
                          new Date().setFullYear(new Date().getFullYear() - 18)
                        )
                      }
                    />
                  ) : (
                    <div className="al-div">
                      {new Date(prefill.birthDate).toLocaleDateString("en-IN")}
                    </div>
                  )}
                </td>
              </tr>
              <tr>
                <td>
                  City<span className="rd-txt">*</span>
                </td>
                <td>
                  {faultin.basc ? (
                    <input
                      type="text"
                      name="city"
                      placeholder="eg: Mathura"
                      className="frm-tableinp"
                      value={frmdata.city}
                      onChange={handelfrm}
                    />
                  ) : (
                    <div className="al-div">{prefill.city}</div>
                  )}
                  {errs.city.display ? (
                    <span className="input-err">{errs.city.message}</span>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
              {faultin.prfl ? (
                ""
              ) : (
                <tr>
                  <td>Your image</td>
                  <td>
                    <span className="vrfd-span">
                      <MdOutlineVerifiedUser /> Uploaded
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className={faultin.prfl ? "fil-selcon" : "fil-selcon hide"}>
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
                src={
                  profile.processed ? profile.processed : "/partner/profilepic"
                }
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
                  {faultin.aadh ? (
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
                    <div className="al-div">{prefill.aadhaarNumber}</div>
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
              {faultin.aadh ? (
                ""
              ) : (
                <tr>
                  <td>Aadhaar image</td>
                  <td>
                    <span className="vrfd-span">
                      <MdOutlineVerifiedUser /> Uploaded
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className={faultin.aadh ? "fil-selcon" : "fil-selcon hide"}>
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
                  {faultin.dl ? (
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
                    <div className="al-div">{prefill.dlNumber}</div>
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
                  {faultin.dl ? (
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
                      {new Date(prefill.dlValidity).toLocaleDateString("en-IN")}
                    </div>
                  )}
                  {errs.dlValidity.display ? (
                    <span className="input-err">{errs.dlValidity.message}</span>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
              {faultin.dl ? (
                ""
              ) : (
                <tr>
                  <td>Dl image</td>
                  <td>
                    <span className="vrfd-span">
                      <MdOutlineVerifiedUser /> Uploaded
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className={faultin.dl ? "fil-selcon" : "fil-selcon hide"}>
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
          <div className="term-con">
            By submitting this form, you confirm that you have read and agree{" "}
            <span className="blu-txt">Terms of Service</span> and{" "}
            <span className="blu-txt">Privacy and Policy</span>.
          </div>
          <div className={prcs ? "form-btmcon ovrly-ad" : "form-btmcon"}>
            <button
              className={prcs ? "frm-sbmtbtn ldng-btn" : "frm-sbmtbtn"}
              onClick={postver}
            >
              <span>Submit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verification;
