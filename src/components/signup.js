import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

import {
  Container,
  Typography,
  Button,
  ButtonGroup,
  makeStyles,
  TextField,
} from "@material-ui/core";

import {
  PersonAdd as PersonAddIcon,
  ArrowForward as ArrowForwardIcon,
} from "@material-ui/icons";

import { snackbarFailure } from "../reducers/snackbar";
import { credentials } from "../reducers/user";
import { sendOutgoingMessage } from "../websocket/websocket-provider";

const USERNAME_REGEX = /^\w{4,9}$/;
const PASSWORD_REGEX = /^\w{4,9}$/;

const useStyles = makeStyles((theme) => ({
  container: {
    background: theme.palette.grey[800],
  },
  field: {
    marginTop: 20,
    marginBottom: 20,
    display: "block",
  },
  buttonGroup: {
    marginTop: 20,
  },
}));

export default function Signup(props) {
  const classes = useStyles();
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const dispatch = useDispatch();

  const handleClick = (type, event) => {
    event.preventDefault();
    if (!password) {
      dispatch(snackbarFailure("Please enter password"));
    } else if (passwordError) {
      dispatch(snackbarFailure("Invalid Password"));
    } else if (!username) {
      dispatch(snackbarFailure("Please enter username"));
    } else if (usernameError) {
      dispatch(snackbarFailure("Invalid Username"));
    } else if (type === "SIGN_UP" || type === "LOGIN") {
      sendOutgoingMessage({
        type,
        username,
        password,
      });
    }
  };

  useEffect(() => {
    dispatch(credentials({ username, password }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "username":
        setUsername(value);
        if (!USERNAME_REGEX.test(value)) {
          setUsernameError("username must have 4 to 9 alphanumeric characters");
        } else {
          setUsernameError("");
        }
        break;
      case "password":
        setPassword(value);
        if (!PASSWORD_REGEX.test(value)) {
          setPasswordError("password must have 4 to 9 alphanumeric characters");
        } else {
          setPasswordError("");
        }
        break;
      default:
        break;
    }
  };

  return (
    <Container maxWidth="xs">
      <form noValidate autoComplete="off">
        <TextField
          onChange={handleChange}
          className={classes.field}
          variant="outlined"
          label="Username"
          name="username"
          fullWidth
          required
          value={username}
          error={Boolean(usernameError)}
          helperText={usernameError}
        />
        <TextField
          onChange={handleChange}
          className={classes.field}
          variant="outlined"
          label="Password"
          name="password"
          type="password"
          fullWidth
          required
          value={password}
          error={Boolean(passwordError)}
          helperText={passwordError}
        />
        <Typography variant="subtitle1">
          Click <b>sign up</b> if you're a new user, else <b>login</b> to you
          existing account
        </Typography>
        <ButtonGroup
          className={classes.buttonGroup}
          variant="contained"
          size="large"
          fullWidth
        >
          <Button
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={handleClick.bind(null, "SIGN_UP")}
          >
            Sign Up
          </Button>
          <Button
            color="secondary"
            endIcon={<ArrowForwardIcon />}
            onClick={handleClick.bind(null, "LOGIN")}
          >
            Login
          </Button>
        </ButtonGroup>
      </form>
    </Container>
  );
}
