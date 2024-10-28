import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip"; // Import MUI Chip
import Cookies from "js-cookie";
import MDTypography from "components/MDTypography";
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";
import { useMaterialUIController, setTransparentNavbar, setMiniSidenav } from "context";

const logo = `${process.env.PUBLIC_URL}/greenenergyparklogo.png`;

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState();
  const [openMenu, setOpenMenu] = useState(false);
  const [user, setUser] = useState(null); // User state
  const location = useLocation();
  const route = location.pathname.split("/")[1];

  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, darkMode } = controller;

  useEffect(() => {
    setNavbarType(fixedNavbar ? "sticky" : "static");
    setTransparentNavbar(dispatch, false);

    // Retrieve user info from cookies on component load
    const username = Cookies.get("username");
    const roles = Cookies.get("roles") ? JSON.parse(Cookies.get("roles")) : [];
    if (username) {
      setUser({ username, roles });
    }
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(false);

  const handleLogout = () => {
    Cookies.remove("authToken");
    Cookies.remove("username");
    Cookies.remove("roles");
    setUser(null);
    window.location.href = "/authentication/sign-in"; // Redirect to login page after logout
  };

  const renderUnderline = (active) =>
    active && (
      <span
        style={{
          position: "absolute",
          bottom: "-16px",
          left: "-14px",
          width: "130%",
          height: "2px",
          backgroundColor: "#12372A",
        }}
      />
    );

  const renderLink = (to, icon, label) => (
    <Link
      to={to === "/tables" ? "/tables/GSBP" : to} // Provide a default plant (e.g., GSBP) for the "Plants Details"
      style={{
        display: "flex",
        alignItems: "center",
        textDecoration: "none",
        paddingBottom: "10px",
        fontFamily: '"Gill Sans", sans-serif',
        fontWeight: "normal",
        color: route === to.slice(1) ? "#387F39" : "#87A922",
        position: "relative",
      }}
    >
      <Icon fontSize="large" sx={{ mr: 1, color: "#508D4E" }}>
        {icon}
      </Icon>
      {label}
      {renderUnderline(route === to.slice(1))}
    </Link>
  );

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <MDBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
          <img src={logo} alt="Green Energy Park Logo" style={{ height: "50px" }} />
        </MDBox>

        <Grid container alignItems="center" justifyContent="center" sx={{ flexGrow: 1 }}>
          <Stack direction="row" spacing={5} sx={{ position: "relative" }}>
            {renderLink("/dashboard", "dashboard", "Overview")}
            {renderLink("/tables", "table_view", "Plants Details")}
          </Stack>
        </Grid>

        <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
          <IconButton
            size="small"
            disableRipple
            color="inherit"
            sx={navbarMobileMenu}
            onClick={handleMiniSidenav}
          >
            <Icon sx={{ color: "inherit" }} fontSize="medium">
              {miniSidenav ? "menu_open" : "menu"}
            </Icon>
          </IconButton>

          {user ? (
            <>
              {/* User Profile Chip */}
              <Chip
                icon={
                  <Icon sx={{ fontSize: "1.4rem !important", color: "#272932 !important" }}>
                    account_circle
                  </Icon>
                }
                label={
                  <MDTypography
                    variant="body2"
                    sx={{
                      fontSize: "2 rem !important", // Smaller font size
                      fontFamily: '"Gill Sans", sans-serif',
                      color: "#140303",
                    }}
                  >
                    {user.username}
                  </MDTypography>
                }
                deleteIcon={
                  <Icon sx={{ fontSize: "1.5rem !important", color: "#140303" }}>
                    arrow_drop_down
                  </Icon>
                }
                onDelete={handleOpenMenu} // Arrow acts as a dropdown trigger
                sx={{
                  backgroundColor: "transparent", // No background color to keep it soft
                  color: "#508D4E",
                  pl: 1.5,
                  pr: 1.5,
                  borderRadius: "16px",
                  height: "40px",
                  position: "absolute", // To position it absolutely
                  right: "10px", // Adjust as per layout
                  top: "10px", // Adjust as per layout
                }}
              />

              {/* User Menu */}
              <Menu
                anchorEl={openMenu}
                open={Boolean(openMenu)}
                onClose={handleCloseMenu}
                sx={{ mt: 2 }}
              >
                {user.roles.includes("ADMIN") && (
                  <MenuItem onClick={() => (window.location.href = "/manage-users")}>
                    <Icon sx={{ mr: 1 }}>manage_accounts</Icon>
                    Manage Users
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>
                  <Icon sx={{ mr: 1 }}>logout</Icon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <IconButton
              size="small"
              disableRipple
              color="inherit"
              sx={navbarIconButton}
              aria-controls="notification-menu"
              aria-haspopup="true"
              variant="contained"
              onClick={() => (window.location.href = "/authentication/sign-in")}
            >
              <Icon sx={{ color: "inherit" }}>login</Icon> {/* Login Icon if not logged in */}
            </IconButton>
          )}
        </MDBox>
      </Toolbar>
    </AppBar>
  );
}

DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
