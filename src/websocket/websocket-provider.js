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
  clearGame,
} from "../reducers/game";
import Cookies from "js-cookie";
import WebsocketConnecting from "./websocket-connecting";

const WebsocketContext = createContext();

const URI = "wss://enigmatic-cove-96694.herokuapp.com/";
// const URI = "ws://localhost:8080";

const HEALTH_URI = "https://enigmatic-cove-96694.herokuapp.com/health";
const WEBSOCKET_SENDEVENT = "ws:send:message";

export default function WebsocketProvider({ children }) {
  // Main state
  const [websocket, setWebsocket] = useState();
  // is set when connection is closed first time
  const [reconnect, setReconnect] = useState(false);

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

  const createWebSocket = (reconnect = false) => {
    // New WebSocket
    const websocket = new WebSocket(URI);
    // WebSocket related event handlers
    const openHandler = () => {
      setWebsocket(websocket);
      if (reconnect && userRef.current.userID) {
        // In case user was already logged in
        // attempt login again, in case if successful, and if game exists
        // it will attempt joining it back
        sendOutgoingMessage({
          type: "LOGIN",
          username: userRef.current.username,
          password: userRef.current.password,
        });
      }
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
      setReconnect(true); // Subsequent connections will be treated as reconnects ...
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
      console.log(
        `[use effect] Creating a new websocket (reconnect: ${reconnect})...`
      );
      createWebSocket(reconnect);
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
  updateCookiesOnIncomingMessages(message, userRef, gameRef);
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
        // Also clear any game if any on unauthenticated...
        dispatch(clearGame());
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
  updateCookiesOnOutgoingMessages(message);
  window.dispatchEvent(
    new CustomEvent(WEBSOCKET_SENDEVENT, { detail: message })
  );
}

function updateCookiesOnOutgoingMessages(message) {
  switch (message.type) {
    case "SIGN_UP":
    case "LOGIN":
      Cookies.set("username", message.username, { expires: 365 });
      Cookies.set("password", message.password, { expires: 365 });
      Cookies.remove("user_id");
      break;
    case "LOGOUT":
      Cookies.remove("user_id");
      break;
    case "JOIN_GAME":
    case "EXIT_GAME":
      Cookies.remove("game_id");
      break;
    case "RESET_GAME":
      Cookies.set("game_id", message.game_id, { expires: 1 / 144 });
      break;
    default:
      break;
  }
}

function updateCookiesOnIncomingMessages(message, userRef, gameRef) {
  switch (message.type) {
    case "AUTHENTICATED":
      Cookies.set("user_id", message.user_id, { expires: 365 });
      break;
    case "UNAUTHENTICATED":
      Cookies.remove("user_id");
      // Remove stale game id if any
      Cookies.remove("game_id");
      break;
    case "GAME":
      Cookies.set("game_id", message.game_id, { expires: 1 / 144 });
      break;
    case "GAME_EXPIRED":
      if (gameRef.current.gameID === message.game_id) {
        Cookies.remove("game_id");
      }
      break;
    case "UNAUTHORIZED":
      Cookies.remove("game_id");
      break;
    default:
      break;
  }
}
