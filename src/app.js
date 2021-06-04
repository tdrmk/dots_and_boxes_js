import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import store from "./store";

import Signup from "./components/signup";
import { SnackbarFailure, SnackbarSuccess } from "./components/snackbar";
import Game from "./components/game";
import WebsocketProvider from "./websocket/websocket-provider";
import RedirectRoutes from "./components/redirect";
import { makeStyles, Container } from "@material-ui/core";
import CookieProvider from "./utils/cookies";

const useStyles = makeStyles({
  container: {
    display: "flex",
    alignItems: "center",
    height: "100%",
  },
});

function App() {
  const classes = useStyles();
  return (
    <Provider store={store}>
      <WebsocketProvider>
        <CookieProvider>
          <Router>
            <Container maxWidth="sm" className={classes.container}>
              <RedirectRoutes />
              <Switch>
                <Route exact path="/signup">
                  <Signup />
                </Route>
                <Route exact path="/game">
                  <Game />
                </Route>
              </Switch>
            </Container>
          </Router>
        </CookieProvider>

        <SnackbarSuccess />
        <SnackbarFailure />
      </WebsocketProvider>
    </Provider>
  );
}

export default App;
