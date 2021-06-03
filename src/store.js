import { configureStore } from "@reduxjs/toolkit";
import snackbarReducer from "./reducers/snackbar";
import userReducer from "./reducers/user";
import gameReducer from "./reducers/game";

export default configureStore({
  reducer: {
    snackbar: snackbarReducer,
    user: userReducer,
    game: gameReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
