import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import Billing from "./components/pages/Billing";
import Dashboard from "./components/pages/Dashboard";
import Inquiry from "./components/pages/Inquiry";
import Login from "./components/pages/Login";
import Progress from "./components/pages/Progress";
import Security from "./components/pages/Security";
import Navbar from "./components/templates/navbar/Navbar";
import Coustumer from "./components/pages/Coustumer";
import Operator from "./components/pages/Operator";
import Driver from "./components/pages/Driver";
import Cars from "./components/pages/Cars";
import City from "./components/pages/City";
import Hourly from "./components/pages/Hrly";
import Cabmodel from "./components/pages/Cabmodel";
import Outstation from "./components/pages/outstation";
import Tourpackage from "./components/pages/Tourpackage";
import History from "./components/pages/History";
import Tourbkng from "./components/pages/Tourbkng";
import Payment from "./components/pages/Payment";
import Penalty from "./components/pages/Penalty";
const App = () => {
  return (
    <>
      <Switch>
        <Route path="/dashboard">
          <Navbar />
        </Route>
      </Switch>
      <Switch>
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>
        <Route exact path="/login">
          <Login />
        </Route>
        <Route exact path="/pin">
          <Security />
        </Route>
        <Route path="/dashboard"></Route>
        <Route path="*">
          <h1>404 Not Found</h1>
        </Route>
      </Switch>
      <Switch>
        <Route path="/dashboard">
          <div className="cntnt-con">
            <Route exact path="/dashboard">
              <Dashboard />
            </Route>
            <Route exact path="/dashboard/booking/inquiry">
              <Inquiry />
            </Route>
            <Route exact path="/dashboard/booking/progress">
              <Progress />
            </Route>
            <Route exact path="/dashboard/booking/billing">
              <Billing />
            </Route>
            <Route exact path="/dashboard/booking/history">
              <History />
            </Route>
            <Route exact path="/dashboard/booking/tour">
              <Tourbkng />
            </Route>
            <Route exact path="/dashboard/payment">
              <Payment />
            </Route>
            <Route exact path="/dashboard/penalty">
              <Penalty />
            </Route>
            <Route exact path="/dashboard/customer">
              <Coustumer />
            </Route>
            <Route exact path="/dashboard/operator">
              <Operator />
            </Route>
            <Route exact path="/dashboard/driver">
              <Driver />
            </Route>
            <Route exact path="/dashboard/car">
              <Cars />
            </Route>
            <Route exact path="/dashboard/city">
              <City />
            </Route>
            <Route exact path="/dashboard/hourlyrental">
              <Hourly />
            </Route>
            <Route exact path="/dashboard/cabmodel">
              <Cabmodel />
            </Route>
            <Route exact path="/dashboard/outstation">
              <Outstation />
            </Route>
            <Route exact path="/dashboard/tourpackage">
              <Tourpackage />
            </Route>
          </div>
        </Route>
      </Switch>
    </>
  );
};

export default App;
