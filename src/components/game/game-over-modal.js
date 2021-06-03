import React from "react";
import { Box, Dialog, Typography, Button, makeStyles } from "@material-ui/core";
import { Add as AddIcon, Replay as ReplayIcon } from "@material-ui/icons";
import { sendOutgoingMessage } from "../../websocket/websocket-provider";
import { useSelector } from "react-redux";

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

export default function GameOverModal(props) {
  const classes = useStyles();
  const { game, gameID } = useSelector((state) => state.game);
  const { sessionID } = useSelector((state) => state.user);

  if (!gameID) return <> </>;

  const winners = game.winners;
  const isDraw = winners.length > 1;
  const winner = winners[0].username;
  return (
    <Dialog maxWidth="xs" {...props}>
      <Box className={classes.container}>
        <Typography align="center" variant="h3">
          GAME OVER
        </Typography>
        <Typography align="center" variant="h5" className={classes.result}>
          {isDraw ? "IT'S A TIE" : `${winner} WON`}
        </Typography>
        <Button
          className={classes.button}
          onClick={() => {
            sendOutgoingMessage({
              type: "RESET_GAME",
              game_id: gameID,
              session_id: sessionID,
            });
          }}
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          startIcon={<ReplayIcon />}
        >
          REMATCH
        </Button>

        <Button
          className={classes.button}
          onClick={() => {
            sendOutgoingMessage({
              type: "EXIT_GAME",
              game_id: gameID,
              session_id: sessionID,
            });
            sendOutgoingMessage({
              type: "JOIN_GAME",
              session_id: sessionID,
            });
          }}
          variant="contained"
          size="large"
          fullWidth
          color="secondary"
          startIcon={<AddIcon />}
        >
          NEW GAME
        </Button>
      </Box>
    </Dialog>
  );
}
