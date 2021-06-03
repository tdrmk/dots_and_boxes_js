import React, { createContext, useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { replacer, reviver } from "../game/utils";
import { snackbarFailure } from "../reducers/snackbar";
import {
  authenticated,
  sessionExpired,
  unauthenticated,
} from "../reducers/user";
import {
  game as updateGame,
  playerStatus as updatePlayerStatus,
  gameExpired,
  unauthorized,
} from "../reducers/game";
import WebsocketConnecting from "./websocket-connecting";

const WebsocketContext = createContext();

const URI = "wss://enigmatic-cove-96694.herokuapp.com/";
// const URI = "ws://localhost:8080";

const HEALTH_URI = "https://enigmatic-cove-96694.herokuapp.com/health";
const WEBSOCKET_SENDEVENT = "ws:send:message";

export default function WebsocketProvider({ children }) {
  // Main state
  const [websocket, setWebsocket] = useState();
  const dispatch = useDispatch();
  // Maintain references to latest values of user and game state
  // https://medium.com/geographit/accessing-react-state-in-event-listeners-with-usestate-and-useref-hooks-8cceee73c559
  const userRef = useRef();
  const gameRef = useRef();
  const game = useSelector((state) => state.game);
  const user = useSelector((state) => state.user);
  useEffect(() => {
    userRef.current = {
      username: user.username,
      password: user.password,
      userID: user.userID,
      sessionID: user.sessionID,
    };
    gameRef.current = {
      gameID: game.gameID,
      loading: game.loading,
    };
    return () => {};
  }, [
    // Maintain list of values which need to be kept up to date
    user.username,
    user.password,
    user.userID,
    user.sessionID,
    game.gameID,
    game.loading,
  ]);

  const createWebSocket = () => {
    // New WebSocket
    const websocket = new WebSocket(URI);
    // WebSocket related event handlers
    const openHandler = () => {
      setWebsocket(websocket);
    };
    const messageHandler = (event) => {
      // Process message
      const message = JSON.parse(event.data, reviver);
      processIncomingMessages(message, dispatch, userRef, gameRef);
    };
    const sendMessageHandler = (event) => {
      // Send message to server
      const message = event.detail;
      websocket.send(JSON.stringify(message, replacer));
    };
    // Periodically ping the server to keep it alive (Heroku Idling)
    const intervalID = setInterval(() => {
      fetch(HEALTH_URI).then((resp) =>
        console.log(`Server health: ${resp.status} ${resp.statusText}`)
      );
    }, 600000);
    const closeHandler = () => {
      // Unset the websocket state
      setWebsocket();
      websocket.removeEventListener("open", openHandler);
      websocket.removeEventListener("message", messageHandler);
      websocket.removeEventListener("close", closeHandler);
      window.removeEventListener(WEBSOCKET_SENDEVENT, sendMessageHandler);
      clearInterval(intervalID);
    };
    // Register event handlers
    websocket.addEventListener("open", openHandler);
    websocket.addEventListener("message", messageHandler);
    websocket.addEventListener("close", closeHandler);
    window.addEventListener(WEBSOCKET_SENDEVENT, sendMessageHandler);
    return websocket;
  };

  useEffect(() => {
    if (!websocket) {
      // Create a websocket when not available
      // Note: Reconnects if existing websocket is closed
      console.log("[use effect] Creating a new websocket...");
      createWebSocket();
      return;
    }
    console.log("[use effect] Websocket updated!");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websocket]);

  return (
    <WebsocketContext.Provider value={websocket}>
      {/* Render children only when active websocket connection */}
      {websocket ? children : <WebsocketConnecting />}
    </WebsocketContext.Provider>
  );
}

function processIncomingMessages(message, dispatch, userRef, gameRef) {
  console.log("Got message from server:", message);
  switch (message.type) {
    case "AUTHENTICATED":
      {
        const sessionID = message.session_id;
        const userID = message.user_id;
        // Update user state with latest information
        dispatch(authenticated({ userID, sessionID }));
        if (gameRef.current.gameID) {
          // Reconnect back to existing game
          sendOutgoingMessage({
            type: "GET_GAME",
            session_id: sessionID,
            game_id: gameRef.current.gameID,
          });
        }
      }
      break;
    case "UNAUTHENTICATED":
      {
        const error = message.error;
        // TODO: Handle it gracefully, if triggered post initial login
        dispatch(unauthenticated({ error }));
        dispatch(snackbarFailure(error));
      }
      break;
    case "SESSION_EXPIRED":
      {
        const sessionID = message.session_id;
        dispatch(sessionExpired({ sessionID }));
        // re-establish back session
        sendOutgoingMessage({
          type: "LOGIN",
          username: userRef.current.username,
          password: userRef.current.password,
        });
      }
      break;

    case "GAME":
      {
        const gameID = message.game_id;
        const game = message.game_data;
        const playerStatus = message.player_status;
        dispatch(updateGame({ gameID, game, playerStatus }));
      }
      break;
    case "GAME_EXPIRED":
      {
        const gameID = message.game_id;
        if (gameRef.current.gameID === gameID) {
          dispatch(snackbarFailure("Game expired!"));
        }
        dispatch(gameExpired({ gameID }));
      }
      break;
    case "PLAYER_STATUS":
      {
        const gameID = message.game_id;
        const playerStatus = message.player_status;
        dispatch(updatePlayerStatus({ gameID, playerStatus }));
      }
      break;
    case "UNAUTHORIZED":
      {
        const error = message.error;
        dispatch(unauthorized({ error }));
        dispatch(snackbarFailure(error));
      }
      break;
    default:
      console.log("WARNING: Unknown message!");
      break;
  }
}

export function sendOutgoingMessage(message) {
  console.log("Dispatching custom event", message);
  window.dispatchEvent(
    new CustomEvent(WEBSOCKET_SENDEVENT, { detail: message })
  );
}
