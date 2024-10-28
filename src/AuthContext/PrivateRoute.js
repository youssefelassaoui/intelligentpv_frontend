// src/AuthContext/PrivateRoute.js

import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import AuthContext from "AuthContext"; // Make sure this import path is correct

const PrivateRoute = ({ children, requiredRole }) => {
  const { user } = useContext(AuthContext); // Access the user from AuthContext

  if (!user) {
    return <Navigate to="/authentication/sign-in" />;
  }

  if (requiredRole && !user.roles.includes(requiredRole)) {
    return <Navigate to="/authentication/sign-in" />;
  }

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string,
};

export default PrivateRoute;
