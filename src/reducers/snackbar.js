import { createSlice } from '@reduxjs/toolkit'

export const snackbarSlice = createSlice({
  name: 'counter',
  initialState: {
    successSnackbarOpen: false,
    failureSnackbarOpen: false,
    successSnackbarMessage: '',
    failureSnackbarMessage: '',
  },
  reducers: {
    snackbarSuccess: (state, action) => {
      state.successSnackbarMessage = action.payload
      state.successSnackbarOpen = true
    },
    snackbarFailure: (state, action) => {
      state.failureSnackbarMessage = action.payload
      state.failureSnackbarOpen = true
    },
    closeSnackbar: (state) => {
      state.successSnackbarOpen = false
      state.failureSnackbarOpen = false
    },
  },
})

export const { snackbarSuccess, snackbarFailure, closeSnackbar } = snackbarSlice.actions

export default snackbarSlice.reducer