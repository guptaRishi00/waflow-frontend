import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import api from "@/lib/api";

export const fetchCustomer = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage");
        return rejectWithValue("No Token Found");
      }

      const response = await api.get(
        `${import.meta.env.VITE_BASE_URL}/api/auth/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("user role from slice:", response.data.user?.role);

      return response.data.user;
    } catch (error) {
      console.error("Error fetching user:", error.response?.data || error);
      return rejectWithValue(error.response?.data || "Failed to fetch user");
    }
  }
);

const authCustomerSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("token") || null,
  },

  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      localStorage.setItem("token", action.payload.token);
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomer.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(fetchCustomer.rejected, (state, action) => {
        state.user = null;
      });
  },
});

export const { loginSuccess, logout } = authCustomerSlice.actions;
export default authCustomerSlice.reducer;
