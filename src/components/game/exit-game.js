import React from "react";
import { Box, Fab } from "@material-ui/core";
import { sendOutgoingMessage } from "../../websocket/websocket-provider";
import { useSelector } from "react-redux";
import { MeetingRoom as MeetingRoomIcon } from "@material-ui/icons";

export default function ExitGame() {
  const { gameID } = useSelector((state) => state.game);
  const { sessionID } = useSelector((state) => state.user);
  if (!gameID) return <> </>;
  return (
    <Box
      display="flex"
      justifyContent="flex-end"
      marginRight="10px"
      marginBottom="30px"
    >
      <Fab
        color="default"
        variant="extended"
        onClick={() => {
          sendOutgoingMessage({
            type: "EXIT_GAME",
            game_id: gameID,
            session_id: sessionID,
          });
        }}
      >
        <MeetingRoomIcon />
        EXIT
      </Fab>
    </Box>
  );
}
