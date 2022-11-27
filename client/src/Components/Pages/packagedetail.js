import React, { useEffect, useState } from "react";
import Loading from "../templates/loading/Loading";
import Error from "./Error";
import Plnacc from "../templates/tour/Plnacc";
import { NavLink } from "react-router-dom";
import validator from "validator";
import {
  FaTimes,
  FaCheck,
  FaRegUser,
  FaPhoneAlt,
  FaUsers,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { GiRoad } from "react-icons/gi";
import { GoLocation } from "react-icons/go";
import DatePicker from "react-datepicker";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Footer from "../templates/footer/Footer";
import { useHistory } from "react-router-dom";
import Enquiry from "../templates/tour/Enquiry";
import { Helmet } from "react-helmet";
function NextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} sld-btn`}
      style={{ ...style, display: "block", color: "black" }}
      onClick={onClick}
    />
  );
}

function PrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} sld-btn`}
      style={{ ...style, display: "block", color: "black" }}
      onClick={onClick}
    />
  );
}

const Packagedetail = () => {
  const txtsettings = {
    infinite: true,
    speed: 2000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: false,
  };
  const [settings, setsettings] = useState({
    infinite: true,
    speed: 2000,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrow: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    dots: true,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
          arrow: true,
          nextArrow: <NextArrow />,
          prevArrow: <PrevArrow />,
        },
      },
      {
        breakpoint: 957,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 1,
          dots: true,
        },
      },
      {
        breakpoint: 650,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1,
          dots: true,
        },
      },
    ],
  });

  // === === === Inquiry form === === === //
  const den = {
    display: false,
    name: "",
    phone: "",
    email: "",
    date: new Date(new Date().getTime() + 86400000).getTime(),
    person: "",
    tour: "",
    message: "",
    load: false,
  };
  const [endata, setendata] = useState(den);

  let name, value;
  const handeldata = (e) => {
    name = e.target.name;
    value = e.target.value;
    setendata({ ...endata, [name]: value });
  };
  const [Enqu, setEnqu] = useState({ display: false, data: {} });
  // === === === detecting === === === //
  const [locationKeys, setLocationKeys] = useState([]);
  const history = useHistory();

  useEffect(() => {
    return history.listen((location) => {
      if (history.action === "PUSH") {
        setLocationKeys([location.key]);
      }

      if (history.action === "POP") {
        if (locationKeys[1] === location.key) {
          setLocationKeys(([_, ...keys]) => keys);
          calldtl();
        } else {
          setLocationKeys((keys) => [location.key, ...keys]);
          calldtl();
        }
      }
    });
    // eslint-disable-next-line
  }, [locationKeys]);
  // === === === detecting end === === === //
  const [pkgdata, setpkgdata] = useState();
  const [sugg, setsugg] = useState({ rel: [], tr: [], load: true });
  const calldtl = async (dat) => {
    setloading(true);
    let url;
    if (!dat) {
      url = window.location.pathname;
    } else {
      url = dat;
    }
    const res = await fetch(`/api${url}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await res.json();
    if (res.status === 200) {
      setmt(data.meta);
      setpkgdata(data);
      setloading(false);
      sugrel(data.citys, data.id);
    } else {
      seterr(true);
    }
  };
  const [mt, setmt] = useState({ title: "", description: "", keywords:"" });
  const sugrel = async (citys, id) => {
    if (
      citys.some((itm) => !itm.cityname || typeof itm.cityname !== "string") ||
      !id ||
      typeof id !== "string"
    ) {
      return alert("invalid request");
    }
    let temcitys = [];
    citys.map((itm) => {
      return (temcitys = [...temcitys, itm.cityname]);
    });
    const res = await fetch(`/api/tourpackages`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        cts: temcitys,
        actn: "sugg",
        id,
      }),
    });
    const data = await res.json();
    if (res.status === 200) {
      setsugg({ ...data, load: false });
      if (data.rel.length < 3) {
        setsettings({
          ...settings,
          slidesToShow: data.rel.length,
          responsive: [
            {
              breakpoint: 1024,
              settings: {
                slidesToShow: data.rel.length,
                slidesToScroll: 1,
                infinite: true,
                dots: true,
                arrow: true,
                nextArrow: <NextArrow />,
                prevArrow: <PrevArrow />,
              },
            },
            {
              breakpoint: 957,
              settings: {
                slidesToShow: data.rel.length,
                slidesToScroll: 1,
                initialSlide: 1,
                dots: true,
              },
            },
            {
              breakpoint: 650,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                initialSlide: 1,
                dots: true,
              },
            },
          ],
        });
      }
      setloading(false);
    } else {
      seterr(true);
    }
  };

  // === === === post tour inquiry === === === //

  const postinquiry = async (e) => {
    e.preventDefault();
    const { name, phone, email, tour, date, person, message } = endata;
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
    if (tour !== "other") {
      tourdata = { ...tourdata, tour };
    } else {
      if (!message || typeof message !== "string" || message.length > 1000) {
        return alert("Invalid request");
      }
      tourdata = { ...tourdata, tour, message };
    }
    setendata({ ...endata, load: true });
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
    } else {
      alert(data);
      setendata({...endata, load:false})
    }
  };

  // === === === === === === === === === === === //
  useEffect(() => {
    calldtl();
    // eslint-disable-next-line
  }, []);
  const [err, seterr] = useState(false);
  const [loading, setloading] = useState(true);
  return (
    <>
      <Helmet>
      <meta http-equiv="Content-Security-Policy" content="script-src https://checkout.razorpay.com/v1/checkout.js 'self';"/>
        <meta charSet="utf-8" />
        <title>{mt.title ? mt.title : ""}</title>
        <meta
          name="description"
          content={mt.description ? mt.description : ""}
        />
         <meta name="keywords" content={mt.keywords?mt.keywords:""}/>
        <link rel="canonical" href="http://revacabs.com/" />
      </Helmet>
      {err ? (
        <Error />
      ) : loading ? (
        <Loading />
      ) : (
        <>
          <section className="trdtl-sec">
            <div className="tr-tpdv">
              <div className="tr-tp1">
                <div className="title-con">
                  <h1 className="tr-title">{pkgdata.name}</h1>
                  <div>
                    <span className="drtn-hd" style={{ color: "#ffc107" }}>
                      {pkgdata.id
                        .charAt(0)
                        .toUpperCase()
                        .concat(pkgdata.id.slice(1))}
                    </span>
                  </div>
                  <div>
                    <span className="drtn-hd">Duration</span>{" "}
                    <span>
                      {pkgdata.nights === 0
                        ? ""
                        : pkgdata.nights > 1
                        ? `${pkgdata.nights} Nights `
                        : `${pkgdata.nights} Night `}
                      {pkgdata.nights === 0 ? "" : "/"}

                      {pkgdata.days > 1
                        ? ` ${pkgdata.days} Days `
                        : ` ${pkgdata.days} Day `}
                    </span>
                    <span>⭐⭐⭐⭐⭐</span>
                  </div>
                </div>
                <div className="bnr-con">
                  <img src={`/tour/${pkgdata.id}/${pkgdata.bnrimg}`} alt="" />
                </div>
                <div className="itnry-con">
                  <h2>
                    <span className="itnry-ttl">Itinerary </span>
                    <span className="itnry-cntnt">{pkgdata.name}</span>
                  </h2>
                </div>
                <div className="pln-con">
                  {pkgdata.plan.map((itm) => {
                    return <Plnacc data={itm} />;
                  })}
                </div>
                <div className="inex-con">
                  <div className="sub-inex">
                    <p className="inex-hd">Include</p>
                    <ul className="inexlst">
                      <li>
                        <FaCheck /> Driver Day Allowance
                      </li>
                      <li>
                        <FaCheck /> Toll Taxes
                      </li>
                      <li>
                        <FaCheck /> Complete Local Sightseeing by Cab
                      </li>
                      <li>
                        <FaCheck />
                        Gst Charges
                      </li>
                    </ul>
                  </div>
                  <div className="sub-inex">
                    <p className="inex-hd">Exclude</p>
                    <ul className="inexlst">
                      <li>
                        <FaTimes /> Driver Night Allowance
                      </li>
                      <li>
                        <FaTimes /> Any Train / Plane / Bus Ticket.
                      </li>
                      <li>
                        <FaTimes /> Any Cab / Auto / Bike Charges to reach
                        pickup point.
                      </li>
                      <li>
                        <FaTimes /> Any Personal nature expenses.
                      </li>
                    </ul>
                  </div>
                </div>
                <div style={{ fontWeight: "bold" }}>Note*</div>
                <div className="pln-dtlex">
                  During festivals like (Holy, Diwali, Dussehra, etc) the
                  charges may increase and you will be informed by our customer
                  support center. charges may also get affected by a change in
                  fuel price and the charges may vary for National and
                  International Customers.
                  <br /> If there are any changes were made by customers in the
                  Tour plan the charges may get increased and if customers had
                  left some places due less time or any other factor for which
                  our driver was not responsible then there will be no relief in
                  charges.
                </div>
              </div>
              <div className={endata.load?"tr-tp2 ovrly-ad":"tr-tp2"}>
                <div className="eq-formcon">
                  <div className="eq-hd">
                    <span
                      style={{
                        borderBottom: "solid 4px #26a69a",
                        paddingBottom: "4px",
                      }}
                    >
                      Enquiry Now
                    </span>
                  </div>
                  <form>
                    <div className="inpt-row">
                      <p className="inpt-hd">
                        Full Name <span className="bld-rd">*</span>
                      </p>
                      <div className="inpt-bx">
                        <div className="inp-icn">
                          <FaRegUser />
                        </div>{" "}
                        <input
                          type="text"
                          name="name"
                          placeholder="Full Name"
                          value={endata.name}
                          onChange={handeldata}
                        />
                      </div>
                    </div>
                    <div className="inpt-row">
                      <p className="inpt-hd">
                        Mobile No <span className="bld-rd">*</span>
                      </p>
                      <div className="inpt-bx">
                        <div className="inp-icn">
                          <FaPhoneAlt />
                        </div>{" "}
                        <input
                          type="number"
                          name="phone"
                          placeholder="Mobile Number"
                          value={endata.phone}
                          onChange={handeldata}
                        />
                      </div>
                    </div>
                    <div className="inpt-row">
                      <p className="inpt-hd">
                        Email <span className="bld-rd">*</span>
                      </p>
                      <div className="inpt-bx">
                        <div className="inp-icn">
                          <MdEmail />
                        </div>{" "}
                        <input
                          type="email"
                          name="email"
                          placeholder="Email"
                          value={endata.email}
                          onChange={handeldata}
                        />
                      </div>
                    </div>
                    <div className="inpt-row">
                      <p className="inpt-hd">
                        Start Date <span className="bld-rd">*</span>
                      </p>
                      <div className="inpt-bx">
                        <div className="inp-icn">
                          <MdEmail />
                        </div>{" "}
                        <DatePicker
                          placeholder="Select date"
                          required={true}
                          autoComplete="off"
                          placeholderText="Start Date"
                          selected={endata.date}
                          onChange={(value) => {
                            setendata({ ...endata, date: value.getTime() });
                          }}
                          dateFormat="dd/MM/yyyy"
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
                              new Date().getFullYear(),
                              new Date().getMonth() + 1,
                              new Date().getDate(),
                              0,
                              0,
                              0,
                              0
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="inpt-row">
                      <p className="inpt-hd">
                        Persons <span className="bld-rd">*</span>
                      </p>
                      <div className="inpt-bx">
                        <div className="inp-icn">
                          <FaUsers />
                        </div>
                        <input
                          type="number"
                          name="person"
                          placeholder="Members"
                          value={endata.person}
                          onChange={handeldata}
                          min="1"
                          max="100"
                        />
                      </div>
                    </div>
                    <div className="inpt-row">
                      <p className="inpt-hd">
                        Package <span className="bld-rd">*</span>
                      </p>
                      <div className="inpt-bx">
                        <div className="inp-icn">
                          <GiRoad />
                        </div>
                        <select
                          name="tour"
                          onChange={handeldata}
                          value={endata.tour}
                        >
                          <option value="">Select Package</option>
                          <option value={pkgdata.id}>
                            {pkgdata.id
                              .charAt(0)
                              .toUpperCase()
                              .concat(pkgdata.id.slice(1))}{" "}
                            (Same)
                          </option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    {endata.package === "other" ? (
                      <div className="inpt-row">
                        <p className="inpt-hd">
                          Message <span className="bld-rd">*</span>
                        </p>
                        <div className="inpt-bx">
                          <textarea
                            name="message"
                            placeholder="Your customized tour package request"
                            value={endata.message}
                            onChange={handeldata}
                          ></textarea>
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                    <div className="inpt-row">
                      <button
                        type="submit"
                        className={endata.load ? "qry-btn load-btn" : "qry-btn"}
                        onClick={postinquiry}
                      >
                        <span>Submit Inquiry</span>
                      </button>
                    </div>
                  </form>
                </div>
                {sugg.tr.length > 0 ? (
                  <>
                    <hr className="sprtr" />
                    <div className="sgst-con">
                      <div className="sgsthd-con">
                        <h1 className="sgst-hd">Top Rated Tour Packages</h1>
                      </div>
                      {sugg.tr.map((itm) => {
                        return (
                          <div className="sgst-crd">
                            <div className="qbcon">Quick Book</div>
                            <img
                              src={`/tour/${itm.id}/${itm.bnrimg}`}
                              alt=""
                              srcset=""
                            />
                            <div className="sgst-dtl">
                              <div>{`${itm.days} Days Tour ⭐⭐⭐⭐⭐`}</div>
                              <Slider {...txtsettings}>
                                {itm.citys.map((itm) => {
                                  return (
                                    <div>
                                      <p className="rd-w">
                                        {itm.cityname.split(",")[0]}
                                      </p>
                                    </div>
                                  );
                                })}
                              </Slider>
                              <div>
                                <NavLink
                                  className="sgst-btn"
                                  to={`/tourpackages/details/${itm.url}`}
                                  onClick={() => {
                                    calldtl(`/tourpackages/details/${itm.url}`);
                                  }}
                                >
                                  View More
                                </NavLink>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  ""
                )}
                <hr className="sprtr" />
                <div className="contact-bx">
                  <div>Contact Us</div>
                  <div>
                    <a href="tel:+919997548384">
                      <FaPhoneAlt /> Call us
                    </a>
                  </div>
                  <div>
                    <a href="mailto:info@mathuracab.com">
                      <MdEmail /> Mail us
                    </a>
                  </div>
                </div>
              </div>
            </div>
            {sugg.rel.length > 0 ? (
              <div className="rltd-con">
                <div className="rltd-hd">
                  <p style={{ textAlign: "center" }}>
                    <span className="itnry-ttl" style={{ fontStyle: "italic" }}>
                      Related{" "}
                      <span
                        style={{
                          color: "#80deea",
                          padding: "4px",
                        }}
                      >
                        Tour
                      </span>{" "}
                      Package
                    </span>
                  </p>
                </div>
                <Slider {...settings}>
                  {sugg.rel.map((itm) => {
                    return (
                      <div style={{ display: "flex" }}>
                        <div className="tr-crd" style={{ width: "360px" }}>
                          <div className="tr-imgcon">
                            <img src={`/tour/${itm.id}/${itm.bnrimg}`} alt="" />
                            <p className="tr-drtn">
                              <span>Duration</span>{" "}
                              {itm.nights < 10 ? `0${itm.nights}` : itm.nights}{" "}
                              Night /{" "}
                              {itm.days < 10 ? `0${itm.days}` : itm.days} Days
                            </p>
                          </div>
                          <div className="tr-dtlcon">
                            <p>
                              <GoLocation />{" "}
                              {itm.citys.map((dt, i) =>
                                i + 1 === itm.citys.length
                                  ? dt.cityname.split(",")[0]
                                  : `${dt.cityname.split(",")[0]} / `
                              )}
                            </p>
                            <h4>{itm.name}</h4>
                            <span className="rtng">⭐⭐⭐⭐⭐</span>
                            <div>
                              <NavLink
                                to={"/tourpackages/details/".concat(itm.url)}
                                onClick={() => {
                                  calldtl(`/tourpackages/details/${itm.url}`);
                                }}
                              >
                                View Details
                              </NavLink>
                              <button
                                className="inqu-btn"
                                onClick={() => {
                                  setEnqu({
                                    ...Enqu,
                                    display: true,
                                    data: { id: itm.id },
                                  });
                                  document.body.classList.add("no-scrol");
                                }}
                              >
                                Enquiry Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </Slider>
              </div>
            ) : (
              ""
            )}
          </section>
          <Footer />
        </>
      )}
      {Enqu.display ? <Enquiry Enqu={Enqu} setEnqu={setEnqu} /> : ""}
    </>
  );
};

export default Packagedetail;
