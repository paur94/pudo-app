import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import MainRoutes from "./Content/Dashboard/MainRoutes"


export default function Routes() {
  return <Switch>
    <MainRoutes isLoggedIn={false} />
  </Switch>
}
