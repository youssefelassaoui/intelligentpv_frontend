import React, { useState, useEffect } from "react";
import { Grid, TextField, Button, IconButton, Box, Chip, Modal } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Add, Edit, Delete } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

const columns = [
  { field: "username", headerName: "Username", width: 200, flex: 1 },
  {
    field: "roles",
    headerName: "Roles",
    width: 200,
    flex: 1,
    renderCell: (params) => (
      <Box>
        {params.value.split(", ").map((role) => (
          <Chip
            key={role}
            label={role}
            size="small"
            color={role === "ADMIN" ? "info" : "default"}
            style={{ marginRight: "5px" }}
          />
        ))}
      </Box>
    ),
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 150,
    sortable: false,
    disableColumnMenu: true,
    renderCell: (params) => (
      <>
        <IconButton onClick={() => params.row.onEdit(params.row)} sx={{ color: "#117554" }}>
          <Edit />
        </IconButton>
        <IconButton sx={{ color: "#B8001F" }} onClick={() => params.row.onDelete(params.row.id)}>
          <Delete />
        </IconButton>
      </>
    ),
  },
];

function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = Cookies.get("authToken");
      const response = await axios.get("http://localhost:8080/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userRows = response.data.map((user) => ({
        id: user.id,
        username: user.username,
        roles: user.roles.join(", "),
        onEdit: handleEditUser,
        onDelete: deleteUser,
      }));

      setUsers(userRows);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleAddUser = () => {
    setUsername("");
    setPassword("");
    setIsEditing(false);
    setModalOpen(true); // Open modal for adding user
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUsername(user.username);
    setPassword("");
    setIsEditing(true);
    setModalOpen(true); // Open modal for editing
  };

  const addUser = async () => {
    try {
      const token = Cookies.get("authToken");
      await axios.post(
        "http://localhost:8080/api/admin/add-user",
        { username, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
      Swal.fire("Success!", "User added successfully!", "success");
      setModalOpen(false); // Close modal after success
    } catch (error) {
      console.error("Error adding user:", error);
      Swal.fire("Error!", "Failed to add user!", "error");
    }
  };

  const updateUser = async () => {
    try {
      const token = Cookies.get("authToken");
      await axios.put(
        `http://localhost:8080/api/admin/users/${selectedUser.id}`,
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
      Swal.fire("Updated!", "User updated successfully!", "success");
      setModalOpen(false); // Close modal after success
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire("Error!", "Failed to update user!", "error");
    }
  };

  const deleteUser = async (id) => {
    try {
      const token = Cookies.get("authToken");
      await axios.delete(`http://localhost:8080/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      Swal.fire("Deleted!", "User deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting user:", error);
      Swal.fire("Error!", "Failed to delete user!", "error");
    }
  };

  const handleSubmit = () => {
    isEditing ? updateUser() : addUser();
  };

  const handleCloseModal = () => {
    setModalOpen(false); // Close modal without submitting
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox
        mx={3}
        my={3}
        p={3}
        sx={{ backgroundColor: "#fff", boxShadow: 1, borderRadius: "12px" }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Manage Users</h2>

        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          sx={{ mb: 2, ml: "auto", display: "block" }} // Added ml: 'auto' to move the button to the right
          onClick={handleAddUser}
        >
          Add User
        </Button>

        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={users}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            components={{ Toolbar: GridToolbar }}
            componentsProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
          />
        </div>
      </MDBox>
      <Footer />

      {/* Modal for Add/Edit User */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            backgroundColor: "#fff",
            padding: 3,
            maxWidth: 500,
            margin: "100px auto",
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <h3>{isEditing ? "Edit User" : "Add User"}</h3>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isEditing} // Disable username editing when in edit mode
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
              <Button
                variant="contained"
                fullWidth
                color="primary"
                onClick={handleSubmit}
                sx={{ mt: 2 }}
              >
                {isEditing ? "Update" : "Add"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </DashboardLayout>
  );
}

export default ManageUsersPage;
