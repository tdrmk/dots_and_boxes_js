import React from "react";
import {
  Box,
  Backdrop,
  Typography,
  LinearProgress,
  makeStyles,
} from "@material-ui/core";
import { useSelector } from "react-redux";
import NewGameModal from "./new-game-modal";
import GameUI from "./game-board";
import ScoreBoard from "./score-board";
import GameOverModal from "./game-over-modal";

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
  gameBox: {
    display: "flex",
    flexDirection: "column",
    marginLeft: "auto",
    marginRight: "auto",
    width: "fit-content",
  },
}));

export default function Game() {
  const classes = useStyles();
  const { gameID, loading, game } = useSelector((state) => state.game);
  if (!gameID) {
    return (
      <Box className={classes.gameBox}>
        {loading ? (
          <Backdrop open={true} className={classes.backdrop}>
            <Box>
              <Box>
                <Typography variant="h5">
                  Waiting for players to connect
                </Typography>
              </Box>
              <Box>
                <LinearProgress color="primary" />
              </Box>
            </Box>
          </Backdrop>
        ) : (
          <NewGameModal open />
        )}
        <GameUI />
      </Box>
    );
  }

  return (
    <Box className={classes.gameBox}>
      <GameUI />
      <ScoreBoard />
      <GameOverModal open={game.gameOver} />
    </Box>
  );
}
