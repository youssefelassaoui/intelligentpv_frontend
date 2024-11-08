import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch"; // For the "Remember me" switch
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import AuthContext from "../../../AuthContext"; // Ensure correct path

// Import logo
const logo = `${process.env.PUBLIC_URL}/intelligentpv-logo.png`;

function Basic() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext); // Access login function from AuthContext
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await login(username, password); // Call login function
      navigate("/dashboard"); // Redirect on successful login
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="white" // Set background to white
    >
      <Card sx={{ padding: "20px", maxWidth: "400px", width: "100%" }}>
        {/* Logo at the top of the box */}
        <MDBox display="flex" justifyContent="center" mb={4}>
          <img src={logo} alt="Green Energy Park Logo" style={{ width: "150px" }} />
        </MDBox>

        {/* Sign In Title */}
        {/* <MDBox textAlign="center" mb={2}>
          <MDTypography variant="h4" fontWeight="medium" color="dark">
            Sign In
          </MDTypography>
        </MDBox> */}

        {/* Error Message */}
        {error && (
          <MDTypography variant="caption" color="error" display="block" mb={2}>
            {error}
          </MDTypography>
        )}

        {/* Sign In Form */}
        <MDBox component="form" role="form">
          <MDBox mb={2}>
            <MDInput
              type="text"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
            />
          </MDBox>
          <MDBox mb={2}>
            <MDInput
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />
          </MDBox>

          {/* Remember Me Toggle */}
          <MDBox display="flex" alignItems="center" ml={-1}>
            <Switch checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
            <MDTypography
              variant="button"
              fontWeight="regular"
              color="text"
              onClick={() => setRememberMe(!rememberMe)}
              sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
            >
              &nbsp;&nbsp;Remember me
            </MDTypography>
          </MDBox>

          {/* Sign In Button */}
          <MDBox mt={3} mb={1}>
            <MDButton variant="gradient" color="info" fullWidth onClick={handleLogin}>
              Sign In
            </MDButton>
          </MDBox>
        </MDBox>
      </Card>
    </MDBox>
  );
}

export default Basic;
