import React, { useEffect, useState } from "react";
import "./css/Home.css";
import Footer from "../templates/footer/Footer";
import Bookingform from "../templates/Form/bookingform";
//  importing images
import Partner from "../images/Home/partner.jpg";
import { NavLink } from "react-router-dom";
import Loading from "../templates/loading/Loading";
import { GoLocation } from "react-icons/go";
import Slider from "react-slick";
import Enquiry from "../templates/tour/Enquiry";
import { Helmet } from "react-helmet";
import { MdSupportAgent } from "react-icons/md";
import { AiOutlineCar } from "react-icons/ai";
import { FaHandsHelping } from "react-icons/fa";

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
const Home = () => {
  const [trdata, settrdata] = useState([]);
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: trdata.length >= 3 ? 3 : trdata.length,
    slidesToScroll: 1,
    arrow: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    dots: true,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: trdata.length >= 3 ? 3 : trdata.length,
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
          slidesToShow: trdata.length >= 2 ? 2 : trdata.length,
          slidesToScroll: 1,
          initialSlide: 1,
          dots: true,
        },
      },
      {
        breakpoint: 650,
        settings: {
          slidesToShow: trdata.length >= 1 ? 1 : trdata.length,
          slidesToScroll: 1,
          initialSlide: 1,
          dots: true,
        },
      },
    ],
  };
  const [loading, setloading] = useState(true);
  const [Enqu, setEnqu] = useState({ display: false, data: {} });
  const reqdata = async () => {
    const res = await fetch("/api/hmdata", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await res.json();
    settrdata(data);
    setloading(false);
  };

  useEffect(() => {
    reqdata();
    // eslint-disable-next-line
  }, []);
  // === === === string genrator === === === //

  const genratestr = (data) => {
    let str = "";
    data.map((dt, i) => {
      if (i + 1 === data.length) {
        return (str = str.concat(dt.cityname.split(",")[0]));
      } else {
        return (str = str.concat(`${dt.cityname.split(",")[0]} / `));
      }
    });
    if (str.length > 20) {
      str = str.slice(0, 30).concat("...");
    }

    return { str };
  };
  return (
    <>
      <Helmet>
      <meta http-equiv="Content-Security-Policy" content="script-src https://checkout.razorpay.com/v1/checkout.js *.revacabs.com;"/>
        <meta charSet="utf-8" />
        <title>
          Book Outstation Cabs, Local Cabs For Tour's & Transfer's Inside The
          City - REVACABS One Of The India's Leading Car Rental .
        </title>
        <meta
          name="Keywords"
          content="Car Rental , Car Hire, Taxi Service, Cab Service, Cab Hire, Taxi Hire ,Cab Rental, Taxi Booking, Rent A Car, Car Rental India, Online Cab Booking, Taxi Cab , Car Rental Service, Online Taxi Booking, Local Taxi Service, Cheap Car Rental, Cab , Taxi , Car Rental, Car Hire Services , Car Rentals India, Taxi Booking India, Cab Booking India Car For Hire,  Taxi Services, Online Car Rentals , Book A Taxi  , Book A Cab, Car Rentals Agency India, Rental Cars In India, Car Hire India, India Car Hire, Car Hire In India, India Car Rentals, Car Rent In India, India Rental Cars, India Cabs, Rent Car In India, Car Rental India, India Car Rental, Rent A Car India, Car Rental In India, Rent A Car In India, India Car Rental Company, Corporate Car Rental India, City Cabs India, Car Rental Company In India"
        ></meta>
        <meta
          name="description"
          content="India's One of the Largest Intercity Car Rentals | Hire Outstation and Local AC cabs with Attractive Rates, Clean Cars, Courteous Drivers & Transparent Billing"
        />
        <link rel="canonical" href="https://revacabs.com/" />
      </Helmet>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="fl-con">
            <section className="top_banner">
              <div className="top-banner-container">
                <div className="top-middle">
                  <Bookingform />
                </div>
              </div>
            </section>
            <div className="partner-container">
              <div className="partner-card">
                <div className="partner-aside">
                  <img id="partnerimg" src={Partner} alt="" />
                </div>
                <div className="partner-middle">
                  <p className="partner-head">Join Our partner's Group</p>
                  <span className="content">
                    Become a Travel agent or a Taxi operator and start earning
                  </span>
                </div>
                <div className="partner-aside">
                  <a
                    className="btn-grad"
                    href="https://partners.revacabs.com/register"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Register
                  </a>
                </div>
              </div>
            </div>
            <div className="tr-con">
              <div className="tr-hdcon">Tour Package</div>
              {trdata.length <= 0 ? (
                ""
              ) : (
                <Slider {...settings}>
                  {trdata.map((itm) => {
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
                              <GoLocation /> {genratestr(itm.citys).str}
                            </p>
                            <h4>{itm.name}</h4>
                            <span className="rtng">⭐⭐⭐⭐⭐</span>
                            <div>
                              <NavLink
                                to={"/tourpackages/details/".concat(itm.url)}
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
              )}
            </div>
            <div className="tr-con">
              <div className="tr-hdcon">Why choose us ?</div>
              <div className="ch-con">
                <div className="ch-crd">
                  <div className="ch-icn">
                    <MdSupportAgent />
                  </div>
                  <div className="ch-txt">
                    <h4>24/7 Customer Support</h4>
                    <p>
                      A dedicated 24x7 customer support team always at your
                      service to help solve any problem
                    </p>
                  </div>
                </div>
                <div className="ch-crd">
                  <div className="ch-icn">
                    <FaHandsHelping />
                  </div>
                  <div className="ch-txt">
                    <h4>Top Rated Driver-Partners</h4>
                    <p>
                      All our driver-partners are background verified and
                      trained to deliver only the best experience
                    </p>
                  </div>
                </div>
                <div className="ch-crd">
                  <div className="ch-icn">
                    <AiOutlineCar />
                  </div>
                  <div className="ch-txt">
                    <h4>Well maintained cabs</h4>
                    <p>
                      We have clean and well maintained cabs and taxi. Our
                      mission is to make your journey full of fun with total
                      security. Since last many years
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Footer />
          </div>
        </>
      )}
      {Enqu.display ? <Enquiry Enqu={Enqu} setEnqu={setEnqu} /> : ""}
    </>
  );
};

export default Home;
