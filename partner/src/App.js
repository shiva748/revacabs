import React from "react";
import Partnerlog from "./components/pages/Partnerlog";
import Partnersig from "./components/pages/Partnersig";
import Dashboard from "./components/pages/Dashboard";
import { Route, Switch, Redirect } from "react-router-dom";
import Navbar from "./components/template/Navbar/Navbar";
import Triplog from "./components/pages/Triplog";
import Driver from "./components/pages/Driver";
import Cars from "./components/pages/Cars";
import Profile from "./components/pages/Profile";
import Error from "./components/pages/Error";
import Earning from "./components/pages/Earning";
import Driverlog from "./components/pages/Driver/Driverlog";
import DrivNavbar from "./components/template/Navbar/DrivNavbar";
import Dritriplog from "./components/pages/Driver/Dritriplog";
import Driprofile from "./components/pages/Driver/Driprofile";
import Driverdashboard from "./components/pages/Driver/Driverdashboard";
import Forgotpass from "./components/pages/Forgotpass";
import Resetpass from "./components/pages/Resetpass";
import Driverforgotpass from "./components/pages/Driver/Driverforgotpass";
import DriResetpass from "./components/pages/Driver/DriResetpass";
import Home from "./components/pages/Home";
import Penalty from "./components/pages/Penalty";
import Terms from "./components/pages/Terms";
const App = () => {
  return (
    <>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route exact path="/terms-conditions">
          <Terms />
        </Route>
        <Route exact path="/login">
          <Partnerlog />
        </Route>
        <Route exact path="/forgotpassword">
          <Forgotpass />
        </Route>
        <Route exact path="/resetpassword">
          <Resetpass />
        </Route>
        <Route exact path="/register">
          <Partnersig />
        </Route>
        <Route exact path="/driver">
          <Redirect to="/driver/login" />
        </Route>
        <Route exact path="/driver/login">
          <Driverlog />
        </Route>
        <Route exact path="/driver/forgotpassword">
          <Driverforgotpass />
        </Route>
        <Route exact path="/driver/resetpassword">
          <DriResetpass />
        </Route>
        <Route path="/dashboard"> </Route>
        <Route path="/driver"></Route>
        <Route>
          <Error />
        </Route>
      </Switch>
      <Switch>
        <Route path="/dashboard">
          <Navbar />
        </Route>
      </Switch>
      <Switch>
        <Route exact path="/dashboard">
          <Dashboard />
        </Route>
        <Route exact path="/dashboard/triplog">
          <Triplog />
        </Route>
        <Route exact path="/dashboard/driver">
          <Driver />
        </Route>
        <Route exact path="/dashboard/cars">
          <Cars />
        </Route>
        <Route exact path="/dashboard/earning">
          <Earning />
        </Route>
        <Route exact path="/dashboard/penalty">
          <Penalty />
        </Route>
        <Route exact path="/dashboard/profile">
          <Profile />
        </Route>
      </Switch>
      <Switch>
        <Route path="/driver/dashboard">
          <DrivNavbar />
        </Route>
      </Switch>
      <Switch>
        <Route exact path="/driver/dashboard">
          <Driverdashboard />
        </Route>
        <Route exact path="/driver/dashboard/triplog">
          <Dritriplog />
        </Route>
        <Route exact path="/driver/dashboard/profile">
          <Driprofile />
        </Route>
      </Switch>
    </>
  );
};

export default App;
