import React from "react";
import { Box, Dialog, Typography, Button, makeStyles } from "@material-ui/core";
import { Add as AddIcon } from "@material-ui/icons";
import { sendOutgoingMessage } from "../../websocket/websocket-provider";
import { useSelector, useDispatch } from "react-redux";
import { joinGame } from "../../reducers/game";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(2),
    width: theme.spacing(35),
  },
  button: {
    marginTop: 20,
  },
  result: {
    color: theme.palette.primary.main,
    marginTop: 20,
    marginBottom: 40,
  },
}));

export default function NewGameModal(props) {
  const classes = useStyles();
  const { sessionID } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  return (
    <Dialog maxWidth="xs" {...props}>
      <Box className={classes.container}>
        <Typography align="center" variant="h3">
          Dots And Boxes
        </Typography>
        <Button
          onClick={() => {
            dispatch(joinGame());
            sendOutgoingMessage({ type: "JOIN_GAME", session_id: sessionID });
          }}
          className={classes.button}
          variant="contained"
          size="large"
          fullWidth
          color="primary"
          startIcon={<AddIcon />}
        >
          NEW GAME
        </Button>
      </Box>
    </Dialog>
  );
}
