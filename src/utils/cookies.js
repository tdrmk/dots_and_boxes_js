import Cookies from "js-cookie";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { game as updateGame } from "../reducers/game";
import { sendOutgoingMessage } from "../websocket/websocket-provider";

export default function CookieProvider({ children }) {
  const dispatch = useDispatch();
  // Get the initial game
  const { game } = useSelector((state) => state.game);
  const { sessionID } = useSelector((state) => state.user);

  // Only run on initial render
  useEffect(() => {
    if (sessionID) {
      // In case of existing session, don't send login message.
      // This is to fix the ACTIVE_CONNECTION UNAUTHENTICATED
      // response from server
      return;
    }
    // Cookie states
    const gameID = Cookies.get("game_id");
    const username = Cookies.get("username");
    const password = Cookies.get("password");
    const userID = Cookies.get("user_id");

    if (username && password && userID) {
      if (gameID) {
        // Try using that game if it works, after login
        // if login fails, then it clears the game
        // If no such game, `unauthorized` clears the game
        dispatch(updateGame({ game, gameID }));
      }
      // Try loggin in using values from cookie
      sendOutgoingMessage({
        type: "LOGIN",
        username,
        password,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <> {children} </>;
}
