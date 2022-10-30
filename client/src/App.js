import React from "react";
import Home from "./Components/Pages/Home";
import Contact from "./Components/Pages/Contactus";
import Tourpackage from "./Components/Pages/package";
import Packagedetails from "./Components/Pages/packagedetail";
import Error from "./Components/Pages/Error";
import Navbar from "./Components/templates/navbar/Navbar";
import Bookings from "./Components/Pages/Ongoing";
import Ongoing from "./Components/Pages/Ongoing";
import Completed from "./Components/Pages/Completed";
import Cancelled from "./Components/Pages/Cancelled";
import Selectcar from "./Components/Pages/Selectcar";
import Cbooking from "./Components/Pages/Cbooking";
import Account from "./Components/Pages/Account";
import Terms from "./Components/Pages/Terms";
import Pripol from "./Components/Pages/Pripol";
import Confirmation from "./Components/Pages/Confirmation";
import { Route, Switch } from "react-router-dom";

const App = () => {
  return (
    <>
      <Navbar />
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route exact path="/terms-conditions">
          <Terms />
        </Route>
        <Route exact path="/privacy-policy">
          <Pripol />
        </Route>
        <Route exact path="/contactus">
          <Contact />
        </Route>
        <Route exact path="/tourpackages/list">
          <Tourpackage />
        </Route>
        <Route exact path="/tourpackages/list/:city">
          <Tourpackage />
        </Route>
        <Route exact path="/tourpackages/details/:url">
          <Packagedetails />
        </Route>
        <Route exact path="/bookings">
          <Bookings />
        </Route>
        <Route exact path="/booking/ongoing">
          <Ongoing />
        </Route>
        <Route exact path="/booking/completed">
          <Completed />
        </Route>
        <Route exact path="/booking/cancelled">
          <Cancelled />
        </Route>
        <Route exact path="/booking/selectcar">
          <Selectcar />
        </Route>
        <Route exact path="/booking/details">
          <Cbooking />
        </Route>
        <Route exact path="/account">
          <Account />
        </Route>
        <Route exact path="/booking/confirmation">
          <Confirmation />
        </Route>
        <Route>
          <Error />
        </Route>
      </Switch>
    </>
  );
};

export default App;
