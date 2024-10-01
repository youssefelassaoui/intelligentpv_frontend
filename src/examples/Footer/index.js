// @mui material components
import Link from "@mui/material/Link";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React base styles
import typography from "assets/theme/base/typography";

function Footer() {
  const { size } = typography;

  return (
    <MDBox
      width="100%"
      display="flex"
      flexDirection={{ xs: "column", lg: "row" }}
      justifyContent="center"
      alignItems="center"
      px={1.5}
      py={2}
      sx={{
        backgroundColor: "#45474B !important", // Black background
        color: "white", // White text
      }}
    >
      <MDBox
        display="flex"
        justifyContent="center"
        alignItems="center"
        color="white" // Ensure text is white
        fontSize={size.sm}
        px={1.5}
      >
        &copy; {new Date().getFullYear()},
        <MDTypography variant="button" fontWeight="medium" sx={{ color: "white !important" }}>
          &nbsp;Green Energy Park&nbsp;
        </MDTypography>
        - All rights reserved. Visit us at
        <Link
          href="https://www.greenenergypark.ma"
          target="_blank"
          sx={{ color: "#4CAF50 !important" }}
        >
          &nbsp;greenenergypark.ma
        </Link>
      </MDBox>
    </MDBox>
  );
}

export default Footer;
