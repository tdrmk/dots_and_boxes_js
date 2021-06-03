import React from "react";
import { useSelector } from "react-redux";
import { Redirect, useLocation } from "react-router-dom";

export default function RedirectRoutes() {
  // Just redirects the user to the right page if not already
  const location = useLocation();
  const user = useSelector((state) => state.user);

  if (!user.userID && location.pathname !== "/signup")
    return <Redirect to="/signup" />;
  else if (user.userID && location.pathname !== "/game")
    return <Redirect to="/game" />;

  return <> </>;
}
