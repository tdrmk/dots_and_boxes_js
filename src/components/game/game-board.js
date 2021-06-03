import React from "react";
import { Box, Paper, makeStyles } from "@material-ui/core";
import { sendOutgoingMessage } from "../../websocket/websocket-provider";
import { useSelector, useDispatch } from "react-redux";
import * as DB from "../../game";
import { updateOnlyGame } from "../../reducers/game";
import { useDebouncedCallback } from "use-debounce";

export default function GameUI() {
  const { game } = useSelector((state) => state.game);
  const { grid } = game;
  return (
    <Box
      display="flex"
      flexDirection="column"
      width="fit-content"
      margin="10px"
    >
      {[...new Array(2 * grid.rows + 1)].map((_, i) => (
        <Box display="flex" width="fit-content">
          {[...new Array(2 * grid.rows + 1)].map((_, j) =>
            i % 2 === 0 ? (
              // Horizontal Row
              j % 2 === 0 ? (
                <DotUI dot={new DB.Dot(i / 2, j / 2)} />
              ) : (
                <EdgeUI
                  edge={DB.Edge.Horizontal(new DB.Dot(i / 2, (j - 1) / 2))}
                />
              )
            ) : // Vertical row
            j % 2 === 0 ? (
              <EdgeUI edge={DB.Edge.Vertical(new DB.Dot((i - 1) / 2, j / 2))} />
            ) : (
              <BoxUI box={new DB.Box(new DB.Dot((i - 1) / 2, (j - 1) / 2))} />
            )
          )}
        </Box>
      ))}
    </Box>
  );
}

const useDotStyles = makeStyles((theme) => ({
  dot: {
    width: theme.spacing(2),
    height: theme.spacing(2),
    background: theme.palette.grey["800"],
  },
}));

function DotUI({ dot }) {
  const classes = useDotStyles();
  return <Paper className={classes.dot} square />;
}

const useEdgeStyles = makeStyles((theme) => ({
  edge: (props) => ({
    width: props.edge.vertical ? theme.spacing(2) : theme.spacing(8),
    height: props.edge.vertical ? theme.spacing(8) : theme.spacing(2),
    background: props.pending
      ? theme.palette.grey["200"]
      : props.playerIndex === 0
      ? theme.palette.primary.main
      : theme.palette.secondary.main,
    transition: theme.transitions.create(),
    "&:hover": props.pending
      ? {
          background: theme.palette.grey["800"],
        }
      : {
          background:
            props.playerIndex === 0
              ? theme.palette.primary.main
              : theme.palette.secondary.main,
        },
  }),
}));

function EdgeUI({ edge }) {
  const { gameID, game } = useSelector((state) => state.game);
  const { username, sessionID } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const pending = game.isPendingEdge(edge);
  const playerIndex = game.chosenPlayerIndex(edge);
  const classes = useEdgeStyles({ pending, playerIndex, edge });
  const clickHandler = useDebouncedCallback(() => {
    // Make move only on your turn
    if (pending && username === game.currentPlayer.username) {
      const newGame = game.makeMove(game.currentPlayer, edge);
      dispatch(updateOnlyGame({ game: newGame }));
      sendOutgoingMessage({
        type: "MAKE_MOVE",
        edge_data: edge,
        game_id: gameID,
        session_id: sessionID,
      });
    }
  }, 500);
  return (
    <Paper
      className={classes.edge}
      square
      onClick={clickHandler}
      elevation={0}
    />
  );
}

const useBoxStyles = makeStyles((theme) => ({
  box: {
    width: theme.spacing(8),
    height: theme.spacing(8),
    background: (props) =>
      !props.won
        ? theme.palette.common.white
        : props.playerIndex === 0
        ? theme.palette.primary.light
        : theme.palette.secondary.light,
    transition: theme.transitions.create(),
  },
}));

function BoxUI({ box }) {
  const { game } = useSelector((state) => state.game);
  const won = game.isBoxWon(box);
  const playerIndex = game.wonPlayerIndex(box);
  const classes = useBoxStyles({ won, playerIndex });
  return <Paper className={classes.box} square />;
}
