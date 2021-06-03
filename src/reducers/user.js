import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    username: null,
    password: null,
    userID: null,
    sessionID: null,
    error: null,
  },
  reducers: {
    credentials: (state, action) => {
      state.username = action.payload.username;
      state.password = action.payload.password;
      state.userID = null;
      state.sessionID = null;
    },
    authenticated: (state, action) => {
      state.userID = action.payload.userID;
      state.sessionID = action.payload.sessionID;
      state.error = null;
    },
    unauthenticated: (state, action) => {
      state.userID = null;
      state.sessionID = null;
      state.error = action.payload.error;
    },
    sessionExpired: (state, action) => {
      if (state.sessionID === action.payload.sessionID) {
        state.sessionID = null;
        state.error = null;
      }
    },
  },
});

export const { credentials, authenticated, unauthenticated, sessionExpired } =
  userSlice.actions;
export default userSlice.reducer;
