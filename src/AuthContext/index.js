import React, { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import Cookies from "js-cookie";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Check for token and user details in cookies and set user on app load
  useEffect(() => {
    const token = Cookies.get("authToken"); // Get JWT token from cookies
    const username = Cookies.get("username"); // Get username from cookies
    const roles = Cookies.get("roles") ? JSON.parse(Cookies.get("roles")) : null; // Get roles from cookies

    if (token && username && roles) {
      // Set Authorization header with token
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Set user data from cookies (you can also validate the token with an API call if needed)
      setUser({ username, roles });
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post("http://localhost:8080/api/auth/signin", {
        username,
        password,
      });

      const { token, roles } = response.data; // Get token and roles from the response

      if (token && roles) {
        // Store token, username, and roles in cookies
        Cookies.set("authToken", token, { expires: 7, secure: true, sameSite: "Lax", path: "/" });
        Cookies.set("username", username, { expires: 7, secure: true, sameSite: "Lax", path: "/" });
        Cookies.set("roles", JSON.stringify(roles), {
          expires: 7,
          secure: true,
          sameSite: "Lax",
          path: "/",
        });

        // Set Authorization header for future requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Set user in state
        setUser({ username, roles });
      } else {
        throw new Error("Invalid login response");
      }
    } catch (error) {
      console.error("Login failed", error);
      throw new Error("Login failed");
    }
  };

  const logout = () => {
    // Remove token, username, and roles from cookies and clear user state
    Cookies.remove("authToken", { path: "/" });
    Cookies.remove("username", { path: "/" });
    Cookies.remove("roles", { path: "/" });
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;
