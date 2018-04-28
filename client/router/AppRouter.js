import * as React from "react";
import { BrowserRouter, Route, Switch, Link, NavLink } from "react-router-dom";
import Home from "../components/Home";
import Header from "../components/Header";
import Receiver from "../components/Receiver";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <div>
        <Header />
        <Switch>
          <Route path="/" exact={true} render={props => <Home {...props} />} />
          <Route path="/receive" render={props => <Receiver {...props} />} />
        </Switch>
      </div>
    </BrowserRouter>
  );
};

export default AppRouter;
