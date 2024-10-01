import React from "react";
import { Modal, Box, TextField, Button, Grid } from "@mui/material";
import PropTypes from "prop-types";

function UserFormModal({ open, onClose, onSubmit, userData, isEditing }) {
  const [username, setUsername] = React.useState(userData?.username || "");
  const [password, setPassword] = React.useState("");
  const [roles, setRoles] = React.useState(userData?.roles.join(", ") || "");

  React.useEffect(() => {
    if (userData) {
      setUsername(userData.username);
      setRoles(userData.roles.join(", "));
    }
  }, [userData]);

  const handleSubmit = () => {
    onSubmit({ username, password, roles: roles.split(", ") });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ padding: 3, backgroundColor: "white", margin: "100px auto", maxWidth: "500px" }}>
        <h2>{isEditing ? "Edit User" : "Add User"}</h2>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isEditing} // Disable username field when editing
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Roles (comma-separated)"
              value={roles}
              onChange={(e) => setRoles(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>
              {isEditing ? "Update" : "Add"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
}

UserFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  userData: PropTypes.object,
  isEditing: PropTypes.bool,
};

export default UserFormModal;
