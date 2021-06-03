import { createSlice } from "@reduxjs/toolkit";
import { DotsAndBoxes } from "../game";

export const gameSlice = createSlice({
  name: "game",
  initialState: {
    gameID: null,
    game: DotsAndBoxes.New(), // Dummy game
    playerStatus: null,
    loading: false,
    error: null,
  },
  reducers: {
    joinGame: (state) => {
      state.loading = true;
      state.game = DotsAndBoxes.New();
      state.gameID = null;
      state.playerStatus = null;
      state.error = null;
    },
    game: (state, action) => {
      state.loading = false;
      state.error = null;
      state.gameID = action.payload.gameID ?? state.gameID;
      state.game = action.payload.game;
      state.playerStatus = action.payload.playerStatus ?? state.playerStatus;
    },
    updateOnlyGame: (state, action) => {
      state.game = action.payload.game;
    },
    playerStatus: (state, action) => {
      if (state.gameID === action.payload.gameID) {
        state.playerStatus = action.payload.playerStatus;
      }
    },
    gameExpired: (state, action) => {
      if (action.payload.gameID === state.gameID) {
        state.gameID = null;
        state.game = DotsAndBoxes.New();
        state.playerStatus = null;
        state.error = null;
        state.loading = false;
      }
    },
    unauthorized: (state, action) => {
      state.gameID = null;
      state.game = DotsAndBoxes.New();
      state.playerStatus = null;
      state.error = action.payload.error;
      state.loading = false;
    },
  },
});

export const {
  joinGame,
  game,
  updateOnlyGame,
  playerStatus,
  gameExpired,
  unauthorized,
} = gameSlice.actions;
export default gameSlice.reducer;
