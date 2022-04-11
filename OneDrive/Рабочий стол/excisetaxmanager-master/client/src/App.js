import React, { Component, useState, useEffect } from 'react';
import logo from './logo.svg';
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";

import './App.css';
import Routes from './Routes'
import Dashboard from "./Content/Dashboard"
import { gethi } from "./services/user"
import PrivateRoute from "./Content/PrivateRoute"
import "@shopify/polaris/dist/styles.css";

export default function App(props) {
    const [loggedIn, setloggedIn] = useState(false);
    const [error, setError] = useState(false);
    const [user, setUser] = useState(null);

    //TODO notimplemented
    const isAuthenticated = true;
    useEffect(() => {
        gethi().then(data => setloggedIn(data)).catch(err => setError(err.toString()));
    }, []);

    return (
        <Router>
            <Switch>
                <PrivateRoute isAuthenticated={isAuthenticated} path="/dashboard">
                    <Dashboard />
                </PrivateRoute>

                <Redirect to="/dashboard" />
            </Switch>
        </Router>
    );
}