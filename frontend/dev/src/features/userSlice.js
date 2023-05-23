import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    token: null,
  },
  reducers: {
    login: (state, action) => {
      state.token = action.payload;
    },
    getUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { login, logout, getUser } = userSlice.actions;

export const selectUser = (state) => state.user.user;

export const selectToken = (state) => state.user.token;

export default userSlice.reducer;
