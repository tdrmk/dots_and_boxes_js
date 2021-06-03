import React from "react";
import { Box, Paper, Typography, makeStyles } from "@material-ui/core";
import {
  CheckCircle as CheckCircleIcon,
  RemoveCircle as RemoveCircleIcon,
} from "@material-ui/icons";
import { useSelector } from "react-redux";

const useStyles = makeStyles((theme) => ({
  scoreBoard: (props) => ({
    width: theme.spacing(16),
    padding: theme.spacing(1.5),
    transition: theme.transitions.create(),
    background:
      props.playerIndex === 0
        ? theme.palette.primary.light
        : theme.palette.secondary.light,
  }),
}));

export default function ScoreBoard() {
  const { game, gameID } = useSelector((state) => state.game);
  const { username } = useSelector((state) => state.user);
  if (!gameID) return <> </>;
  const turn = game.turn;
  return (
    <Box>
      <Box>
        <Typography
          align="center"
          variant="h6"
          color={turn === 0 ? "primary" : "secondary"}
        >
          {username === game.currentPlayer.username
            ? `your turn to make a move`
            : `wait for your turn, its ${game.currentPlayer.username} move`}
        </Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" margin="10px">
        <PlayerScore playerIndex={0} />
        <PlayerScore playerIndex={1} />
      </Box>
    </Box>
  );
}

function PlayerScore({ playerIndex }) {
  const { game, playerStatus } = useSelector((state) => state.game);
  console.log(playerStatus);
  const player = game.players[playerIndex];
  const turn = game.turn;

  const classes = useStyles({ playerIndex, turn });

  return (
    <Paper
      className={classes.scoreBoard}
      elevation={turn === playerIndex ? 10 : 1}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        {playerStatus?.[playerIndex] === "SESSION_ACTIVE" ? (
          <CheckCircleIcon color="primary" />
        ) : (
          <RemoveCircleIcon color="secondary" />
        )}
        <Typography variant="subtitle1">{player.username}</Typography>
        <Typography variant="h6">{game.score(player)}</Typography>
      </Box>
    </Paper>
  );
}
