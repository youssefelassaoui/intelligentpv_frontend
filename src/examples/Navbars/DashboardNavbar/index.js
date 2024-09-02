import { useState, useEffect } from "react";
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
  const location = useLocation();
  const route = location.pathname.split("/")[1];

  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, darkMode } = controller;

  useEffect(() => {
    setNavbarType(fixedNavbar ? "sticky" : "static");
    setTransparentNavbar(dispatch, false);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(false);

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
      to={to}
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
            {renderLink("/tables", "table_view", "Centrales Details")}
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

          <IconButton
            size="small"
            disableRipple
            color="inherit"
            sx={navbarIconButton}
            aria-controls="notification-menu"
            aria-haspopup="true"
            variant="contained"
            onClick={handleOpenMenu}
          >
            <Icon sx={{ color: "inherit" }}>login</Icon>
          </IconButton>
        </MDBox>

        <Menu
          anchorEl={openMenu}
          anchorReference={null}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          open={Boolean(openMenu)}
          onClose={handleCloseMenu}
          sx={{ mt: 2 }}
        >
          {/* Notifications can be added here */}
        </Menu>
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
