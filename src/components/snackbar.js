import Snackbar from "@material-ui/core/Snackbar";
import { useDispatch, useSelector } from "react-redux";
import { closeSnackbar } from "../reducers/snackbar";
import Alert from "@material-ui/lab/Alert";

export function SnackbarSuccess(props) {
  const { successSnackbarOpen, successSnackbarMessage } = useSelector(
    (state) => state.snackbar
  );
  const dispatch = useDispatch();
  const handleClose = () => {
    dispatch(closeSnackbar());
  };

  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      open={successSnackbarOpen}
      autoHideDuration={4000}
      onClose={handleClose}
    >
      <Alert onClose={handleClose} severity="success">
        {successSnackbarMessage}
      </Alert>
    </Snackbar>
  );
}

export function SnackbarFailure(props) {
  const { failureSnackbarOpen, failureSnackbarMessage } = useSelector(
    (state) => state.snackbar
  );
  const dispatch = useDispatch();
  const handleClose = () => {
    dispatch(closeSnackbar());
  };

  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      open={failureSnackbarOpen}
      autoHideDuration={4000}
      onClose={handleClose}
    >
      <Alert onClose={handleClose} severity="error">
        {failureSnackbarMessage}
      </Alert>
    </Snackbar>
  );
}
