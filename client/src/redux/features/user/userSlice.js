import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authAPI, userAPI } from "../../../services/api";

// Async thunks
export const loginUser = createAsyncThunk("user/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await authAPI.login(credentials);
    localStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Login failed");
  }
});

export const signupUser = createAsyncThunk("user/signup", async (userData, { rejectWithValue }) => {
  try {
    const response = await authAPI.signup(userData);
    localStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Signup failed");
  }
});

export const initAuth = createAsyncThunk("user/initAuth", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const response = await userAPI.getProfile();
    return response.data;
  } catch (error) {
    localStorage.removeItem("token");
    return rejectWithValue(error.response?.data?.message || "Auth initialization failed");
  }
});

export const forgotPassword = createAsyncThunk("user/forgotPassword", async (email, { rejectWithValue }) => {
  try {
    const response = await authAPI.forgotPassword(email);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to send reset email");
  }
});

export const resetPassword = createAsyncThunk("user/resetPassword", async (resetData, { rejectWithValue }) => {
  try {
    const response = await authAPI.resetPassword(resetData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to reset password");
  }
});

export const fetchProfile = createAsyncThunk("user/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const res = await userAPI.getProfile();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch profile");
  }
});

export const updateProfile = createAsyncThunk("user/updateProfile", async (profileData, { dispatch, rejectWithValue }) => {
  try {
    const res = await userAPI.updateProfile(profileData);
    await dispatch(initAuth()); // fresh data le aane ke liye
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to update profile");
  }
});

export const changePassword = createAsyncThunk("user/changePassword", async (passwordData, { rejectWithValue }) => {
  try {
    const res = await userAPI.changePassword(passwordData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to change password");
  }
});

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    authLoading: false, // login/signup ke liye
    passwordLoading: false, // forgot/reset ke liye
    error: null,
    isAuthenticated: null, // Initially null to indicate "not yet checked"
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      state.user = null;
      state.isAuthenticated = false; // Set to false, not null, when explicitly logged out
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
     setUser: (state, action) => {  // 🔹 NEW
      state.user = action.payload;
      state.isAuthenticated = !!action.payload; // agar null to false, otherwise true
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.authLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Signup
      .addCase(signupUser.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.authLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Init Auth
      .addCase(initAuth.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(initAuth.fulfilled, (state, action) => {
        state.authLoading = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        } else {
          state.isAuthenticated = false; // Explicitly set to false when checked and not authenticated
        }
      })
      .addCase(initAuth.rejected, (state) => {
        state.authLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.passwordLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.passwordLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.passwordLoading = false;
        state.error = action.payload;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.passwordLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.passwordLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.passwordLoading = false;
        state.error = action.payload;
      })

      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.authLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload;
      })

      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.authLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.authLoading = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload;
      })

      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.passwordLoading = true;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.passwordLoading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError ,setUser } = userSlice.actions;
export default userSlice.reducer;
