import React from "react";
import {
  Backdrop,
  makeStyles,
  Box,
  Typography,
  LinearProgress,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },
  container: {
    width: theme.spacing(40),
  },
}));

export default function WebsocketConnecting() {
  const classes = useStyles();
  return (
    <Backdrop className={classes.backdrop} open>
      <Box className={classes.container}>
        <Typography variant="h6" color="primary">
          connecting to server ...
        </Typography>
        <Box>
          <LinearProgress color="primary" />
        </Box>
      </Box>
    </Backdrop>
  );
}
