import React, { useState, useEffect } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import DatePicker from "react-datepicker";
import { MdOutlineVerifiedUser } from "react-icons/md";
const Adcar = (recived) => {
  let setvwstate = recived.setvwstate;
  let vwstate = recived.vwstate;
  const reqcar = recived.reqcar;
  const nw = vwstate.nw;
  const [vehicle, setvehicle] = useState({
    src: null,
    image: null,
    processed: null,
  });
  const [rc, setrc] = useState({
    src: null,
    image: null,
    processed: null,
  });
  const [policy, setpolicy] = useState({
    src: null,
    image: null,
    processed: null,
  });
  const [permit, setpermit] = useState({
    src: null,
    image: null,
    processed: null,
  });
  const df = nw
    ? {
        carNumber: "",
        cab_id: "",
        regyear: "",
        policyNo: "",
        policyValidity: "",
        permitType: "",
        permitValidity: "",
        load:false
      }
    : vwstate.data.verification.isverified
    ? {
        carNumber: vwstate.data.carNumber,
        cab_id: vwstate.data.cab_id,
        regyear: vwstate.data.regyear,
        policyNo: vwstate.data.policyNo,
        policyValidity: vwstate.data.policyValidity,
        permitType: vwstate.data.permitType,
        permitValidity: vwstate.data.permitValidity,
        status: vwstate.data.status,
        load:false
      }
    : {
        carNumber: vwstate.data.carNumber,
        cab_id: vwstate.data.cab_id,
        regyear: vwstate.data.regyear,
        policyNo: vwstate.data.policyNo,
        policyValidity: vwstate.data.policyValidity,
        permitType: vwstate.data.permitType,
        permitValidity: vwstate.data.permitValidity,
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
    if (e.target.name === "vehicle") {
      setvehicle({
        ...vehicle,
        // eslint-disable-next-line
        ["src"]: URL.createObjectURL(e.target.files[0]),
      });
    } else if (e.target.name === "rc") {
      setrc({
        ...rc,
        // eslint-disable-next-line
        ["src"]: URL.createObjectURL(e.target.files[0]),
      });
    } else if (e.target.name === "policy") {
      setpolicy({
        ...policy,
        // eslint-disable-next-line
        ["src"]: URL.createObjectURL(e.target.files[0]),
      });
    } else if (e.target.name === "permit") {
      setpermit({
        ...permit,
        // eslint-disable-next-line
        ["src"]: URL.createObjectURL(e.target.files[0]),
      });
    }
  };
  const [model, setmodel] = useState([]);
  const getmodels = async () => {
    const res = await fetch("/partner/models", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await res.json();
    setmodel(data);
  };
  useEffect(() => {
    getmodels();
    ry();
    // eslint-disable-next-line
  }, []);
  // const [image, setimage] = useState(null);
  const [crop, setcrop] = useState({
    vehicle: null,
    rc: null,
    policy: null,
    permit: null,
  });
  function getCroppedImg(crop, image, type) {
    if (!image || !crop || !type) {
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
    if (type === "vehicle") {
      // eslint-disable-next-line
      setvehicle({ ...vehicle, ["processed"]: base64Image });
    } else if (type === "rc") {
      // eslint-disable-next-line
      setrc({ ...rc, ["processed"]: base64Image });
    } else if (type === "policy") {
      // eslint-disable-next-line
      setpolicy({ ...policy, ["processed"]: base64Image });
    } else if (type === "permit") {
      // eslint-disable-next-line
      setpermit({ ...permit, ["processed"]: base64Image });
    }
  }
  let name, value;
  const handelfrm = (e) => {
    name = e.target.name;
    value = e.target.value;
    setfrmdata({ ...frmdata, [name]: value });
  };

  const der = {
    carNumber: { display: false, message: "" },
    carModel: { display: false, message: "" },
    regyear: { display: false, message: "" },
    policyNo: { display: false, message: "" },
    policyValidity: { display: false, message: "" },
    permitType: { display: false, message: "" },
    permitValidity: { display: false, message: "" },
  };
  // eslint-disable-next-line
  const [errs, seterrs] = useState(der);
  // validation pending
  const postcar = async (e) => {
    e.preventDefault();
    const {
      carNumber,
      cab_id,
      regyear,
      policyNo,
      policyValidity,
      permitType,
      permitValidity,
    } = frmdata;
    if (
      !carNumber ||
      !cab_id ||
      !regyear ||
      !policyNo ||
      !policyValidity ||
      !permitType ||
      !permitValidity
    ) {
      return alert("please fill all the fields");
    }
    let vehicleimg = vehicle.processed;
    let rcimg = rc.processed;
    let policyimg = policy.processed;
    let permitimg = permit.processed;
    setfrmdata({...frmdata, load:true})
    const res = await fetch("/partner/adcar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        carNumber,
        cab_id,
        regyear,
        policyNo,
        policyValidity: new Date(frmdata.policyValidity).getTime(),
        permitType,
        permitValidity: new Date(frmdata.permitValidity).getTime(),
        vehicleimg,
        rcimg,
        policyimg,
        permitimg,
      }),
    });
    const data = await res.json();
    if (res.status === 201) {
      reqcar();
      alert(data);
      // eslint-disable-next-line
      setvwstate({ ...vwstate, ["adopton"]: false });
    } else {
      alert(data);
      setfrmdata({...frmdata, load:false})
    }
  };
  const [regy, setregy] = useState([]);
  const ry = () => {
    let year = new Date().getFullYear() - 10;
    let ar = [];
    for (year; year <= new Date().getFullYear(); year++) {
      ar.push(year);
    }
    setregy(ar);
  };
  const update = async (e) => {
    e.preventDefault();
    let status;
    let data = {};
    let cab = vwstate.data;
    if (cab.verification.isverified) {
      if (!frmdata.status || frmdata.status === cab.status) {
        return alert("please select status");
      }
      status = frmdata.status;
    } else {
      if (cab.faultin.rc) {
        if (!frmdata.regyear || !rc.processed) {
          return alert("please fill all the fields");
        }
        data.regyear = frmdata.regyear.toString();
        data.rcimg = rc.processed;
      }
      if (cab.faultin.car) {
        if (!frmdata.carNumber || !vehicle.processed || !frmdata.cab_id) {
          return alert("please fill all the fields");
        }
        data.carNumber = frmdata.carNumber;
        data.vehicleimg = vehicle.processed;
        data.cab_id = frmdata.cab_id.toString();
      }
      if (cab.faultin.policy) {
        if (!frmdata.policyNo || !frmdata.policyValidity || !policy.processed) {
          return alert("please fill all the fields");
        }
        data.policyNo = frmdata.policyNo;
        data.policyValidity = new Date(frmdata.policyValidity).getTime();
        data.policyimg = policy.processed;
      }
      if (cab.faultin.permit) {
        if (
          !frmdata.permitType ||
          !frmdata.permitValidity ||
          !permit.processed
        ) {
          return alert("please fill all the fields");
        }
        data.permitType = frmdata.permitType;
        data.permitValidity = new Date(frmdata.permitValidity).getTime();
        data.permitimg = permit.processed;
      }
    }
    setfrmdata({...frmdata, load:true})
    const res = await fetch("/partner/updatecar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        cabid: vwstate.data.cabid,
        status,
        data,
      }),
    });
    const result = await res.json();
    if (res.status === 201) {
      reqcar();
      // eslint-disable-next-line
      setvwstate({ ...vwstate, ["adopton"]: false });
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
        <div className="form-hdcon">{nw ? "Add Car" : "Edit Car"}</div>
        <div className="form-subcon">
          <table className="frm-table">
            <tbody>
              <tr>
                <td>
                  Car Number<span className="rd-txt">*</span>
                </td>
                <td>
                  {nw || vwstate.data.faultin.car ? (
                    <input
                      type="text"
                      name="carNumber"
                      className="frm-tableinp"
                      placeholder="Car Number"
                      value={frmdata.carNumber}
                      onChange={handelfrm}
                    />
                  ) : (
                    <div className="al-div">{frmdata.carNumber}</div>
                  )}
                  {errs.carNumber.display ? (
                    <span className="input-err">{errs.carNumber.message}</span>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
              <tr>
                <td>
                  Car Model<span className="rd-txt">*</span>
                </td>
                <td>
                  {nw || vwstate.data.faultin.car ? (
                    <select
                      name="cab_id"
                      placeholder=" Select Car"
                      className="frm-tableinp"
                      value={frmdata.cab_id}
                      onChange={handelfrm}
                    >
                      <option value="">Select Model</option>
                      {model.map((itm, i) => {
                        return (
                          <option value={itm.cab_id} key={i}>
                            {itm.name}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <div className="al-div">{vwstate.data.name}</div>
                  )}
                  {errs.carModel.display ? (
                    <span className="input-err">{errs.carModel.message}</span>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
              {nw || vwstate.data.faultin.car ? (
                ""
              ) : (
                <tr>
                  <td>Car image</td>
                  <td>
                    <span className="vrfd-span">
                      <MdOutlineVerifiedUser />{" "}
                      {vwstate.data.verification.isverified
                        ? "Verified"
                        : "Uploaded"}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div
            className={
              nw
                ? "fil-selcon"
                : vwstate.data.faultin.car
                ? "fil-selcon"
                : "fil-selcon hide"
            }
          >
            <div className="fil-row">
              Car front image<span className="rd-txt">*</span>:
              <input
                type="file"
                name="vehicle"
                accept="image/*"
                onChange={handelimage}
                className="frm-tableinp"
              />
            </div>
            <div className="croper-con">
              {vehicle.src ? (
                <>
                  <ReactCrop
                    src={vehicle.src}
                    crop={crop.vehicle}
                    onChange={(cropdata) => {
                      // eslint-disable-next-line
                      setcrop({ ...crop, ["vehicle"]: cropdata });
                    }}
                    onImageLoaded={(image) => {
                      setvehicle({
                        ...vehicle,
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
                src={vehicle.processed}
                alt=""
                srcSet=""
                className="cropped-img"
              />
            </div>
            <button
              onClick={() => {
                getCroppedImg(crop.vehicle, vehicle.image, "vehicle");
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
                  Registration Year<span className="rd-txt">*</span>
                </td>
                <td>
                  {nw || vwstate.data.faultin.rc ? (
                    <select
                      name="regyear"
                      placeholder=" Select Year"
                      className="frm-tableinp"
                      value={frmdata.regyear}
                      onChange={handelfrm}
                    >
                      <option value="">Select Year</option>
                      {regy.map((itm, i) => {
                        return (
                          <option value={itm} key={i}>
                            {itm}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <div className="al-div">{frmdata.regyear}</div>
                  )}
                  {errs.carModel.display ? (
                    <span className="input-err">{errs.carModel.message}</span>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
              {nw || vwstate.data.faultin.rc ? (
                ""
              ) : (
                <tr>
                  <td>Rc image</td>
                  <td>
                    <span className="vrfd-span">
                      <MdOutlineVerifiedUser />{" "}
                      {vwstate.data.verification.isverified
                        ? "Verified"
                        : "Uploaded"}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div
            className={
              nw
                ? "fil-selcon"
                : vwstate.data.faultin.rc
                ? "fil-selcon"
                : "fil-selcon hide"
            }
          >
            <div className="fil-row">
              Vehicle rc<span className="rd-txt">*</span>:
              <input
                type="file"
                name="rc"
                accept="image/*"
                onChange={handelimage}
                className="frm-tableinp"
              />
            </div>
            <div className="croper-con">
              {rc.src ? (
                <>
                  <ReactCrop
                    src={rc.src}
                    crop={crop.rc}
                    onChange={(cropdata) => {
                      // eslint-disable-next-line
                      setcrop({ ...crop, ["rc"]: cropdata });
                    }}
                    onImageLoaded={(image) => {
                      setrc({
                        ...rc,
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
                src={rc.processed}
                alt=""
                srcSet=""
                className="cropped-img"
              />
            </div>
            <button
              onClick={() => {
                getCroppedImg(crop.rc, rc.image, "rc");
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
                  Policy No<span className="rd-txt">*</span>
                </td>
                <td>
                  {nw || vwstate.data.faultin.policy ? (
                    <input
                      type="number"
                      name="policyNo"
                      className="frm-tableinp"
                      placeholder="xxxx-xxxx-xxxx"
                      value={frmdata.policyNo}
                      onChange={handelfrm}
                    />
                  ) : (
                    <div className="al-div">{frmdata.policyNo}</div>
                  )}
                  {errs.policyNo.display ? (
                    <span className="input-err">{errs.policyNo.message}</span>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
              <tr>
                <td>
                  Policy Validity<span className="rd-txt">*</span>
                </td>
                <td>
                  {nw || vwstate.data.faultin.policy ? (
                    <DatePicker
                      className="frm-tableinp"
                      name="policyValidity"
                      onChange={(value) => {
                        // eslint-disable-next-line
                        setfrmdata({ ...frmdata, ["policyValidity"]: value });
                      }}
                      placeholderText="DD/MM/YYYY"
                      selected={frmdata.policyValidity}
                      dateFormat="dd/MM/yyyy"
                      minDate={
                        new Date(new Date().setDate(new Date().getDate() + 7))
                      }
                    />
                  ) : (
                    <div className="al-div">
                      {new Date(frmdata.permitValidity).toLocaleDateString(
                        "en-IN"
                      )}
                    </div>
                  )}
                  {errs.policyValidity.display ? (
                    <span className="input-err">
                      {errs.policyValidity.message}
                    </span>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
              {nw || vwstate.data.faultin.policy ? (
                ""
              ) : (
                <tr>
                  <td>Policy image</td>
                  <td>
                    <span className="vrfd-span">
                      <MdOutlineVerifiedUser />{" "}
                      {vwstate.data.verification.isverified
                        ? "Verified"
                        : "Uploaded"}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div
            className={
              nw
                ? "fil-selcon"
                : vwstate.data.faultin.policy
                ? "fil-selcon"
                : "fil-selcon hide"
            }
          >
            <div className="fil-row">
              Policy Image<span className="rd-txt">*</span>:
              <input
                type="file"
                name="policy"
                accept="image/*"
                onChange={handelimage}
                className="frm-tableinp"
              />
            </div>
            <div className="croper-con">
              {policy.src ? (
                <>
                  <ReactCrop
                    src={policy.src}
                    crop={crop.policy}
                    onChange={(cropdata) => {
                      // eslint-disable-next-line
                      setcrop({ ...crop, ["policy"]: cropdata });
                    }}
                    onImageLoaded={(image) => {
                      setpolicy({
                        ...policy,
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
                src={policy.processed}
                alt=""
                srcSet=""
                className="cropped-img"
              />
            </div>
            <button
              onClick={() => {
                getCroppedImg(crop.policy, policy.image, "policy");
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
                  Permit Type<span className="rd-txt">*</span>
                </td>
                <td>
                  {nw || vwstate.data.faultin.permit ? (
                    <select
                      name="permitType"
                      id=""
                      onChange={handelfrm}
                      value={frmdata.permitType}
                      className="frm-tableinp"
                    >
                      <option value="">Selet Permit type</option>
                      <option value="State">State</option>
                      <option value="National">National</option>
                    </select>
                  ) : (
                    <div className="al-div">{frmdata.permitType}</div>
                  )}
                  {errs.permitType.display ? (
                    <span className="input-err">{errs.permitNo.message}</span>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
              <tr>
                <td>
                  Permit Validity<span className="rd-txt">*</span>
                </td>
                <td>
                  {nw || vwstate.data.faultin.permit ? (
                    <DatePicker
                      className="frm-tableinp"
                      name="permitValidity"
                      onChange={(value) => {
                        // eslint-disable-next-line
                        setfrmdata({ ...frmdata, ["permitValidity"]: value });
                      }}
                      placeholderText="DD/MM/YYYY"
                      selected={frmdata.permitValidity}
                      dateFormat="dd/MM/yyyy"
                      minDate={
                        new Date(new Date().setMonth(new Date().getMonth() + 1))
                      }
                    />
                  ) : (
                    <div className="al-div">
                      {new Date(frmdata.permitValidity).toLocaleDateString(
                        "en-IN"
                      )}
                    </div>
                  )}
                  {errs.permitValidity.display ? (
                    <span className="input-err">
                      {errs.permitValidity.message}
                    </span>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
              {nw || vwstate.data.faultin.permit ? (
                ""
              ) : (
                <tr>
                  <td>Permit image</td>
                  <td>
                    <span className="vrfd-span">
                      <MdOutlineVerifiedUser />{" "}
                      {vwstate.data.verification.isverified
                        ? "Verified"
                        : "Uploaded"}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div
            className={
              nw
                ? "fil-selcon"
                : vwstate.data.faultin.permit
                ? "fil-selcon"
                : "fil-selcon hide"
            }
          >
            <div className="fil-row">
              Select Permit image<span className="rd-txt">*</span>:
              <input
                type="file"
                name="permit"
                accept="image/*"
                onChange={handelimage}
                className="frm-tableinp"
              />
            </div>
            <div className="croper-con">
              {permit.src ? (
                <>
                  <ReactCrop
                    src={permit.src}
                    crop={crop.permit}
                    onChange={(cropdata) => {
                      // eslint-disable-next-line
                      setcrop({ ...crop, ["permit"]: cropdata });
                    }}
                    onImageLoaded={(image) => {
                      setpermit({
                        ...permit,
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
                src={permit.processed}
                alt=""
                srcSet=""
                className="cropped-img"
              />
            </div>
            <button
              onClick={() => {
                getCroppedImg(crop.permit, permit.image, "permit");
              }}
              className="crop-btn"
            >
              Crop and Save
            </button>
          </div>
          <table className="frm-table">
            <tbody>
              {!nw && vwstate.data.verification.isverified ? (
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
                setvwstate({ ...vwstate, ["adopton"]: false, ["data"]: {} });
              }}
            >
              Close
            </button>
            <button className={frmdata.load?"frm-sbmtbtn load-btn":"frm-sbmtbtn"} onClick={nw ? postcar : update}>
              <span>
              {nw ? "Add Car" : "Submit"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Adcar;
