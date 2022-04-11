import React from "react"
import { BrowserRouter as Router, Route, Redirect, useParams, Switch } from "react-router-dom"
import TemplateDetails from "../TemplateDetails"

import GeneratePDF from './pdf/generatePDF'
import downloadReport from './sdd/downloadReport'

import Dashboard from "./Dashboard"
import Products from "./Products/Index"
import Validate from "./Products/Validate"
import SetInventoryWarnings from "./Products/SetInventoryWarnings"

import TaxRates from "./TaxRates/Index"
import Sales from "./Sales/Index"
import Settings from "./Settings/Index"
import { useRouteMatch } from 'react-router-dom'

export default function Routes() {
  const match = useRouteMatch()

  return <Switch>
    <Route exact path={`${match.path}/`} component={Dashboard} />
    <Route exact path={`${match.path}/Sales`} component={Sales} />
    <Route exact path={`${match.path}/Settings`} component={Settings} />
    <Route exact path={`${match.path}/TaxRates`} component={TaxRates} />
    <Route exact path={`${match.path}/Inventory`} component={TaxRates} />
    
    <Route exact path={`${match.path}/TaxRates/pdf`} component={GeneratePDF} />
    <Route exact path={`${match.path}/TaxRates/sdd`} component={downloadReport} />
    <Route exact path={`${match.path}/Products/Validate/:id`} component={Validate} />
    <Route exact path={`${match.path}/Products/UpdateInventoryWarnings/:id`} component={SetInventoryWarnings} />
    <Route path={`${match.path}/Products/:tab?`} component={Products} />
  </Switch>
}