import { createSlice } from "@reduxjs/toolkit";

export const recoverSlice = createSlice({
  name: "recover",
  initialState: {
    email: null,
  },
  reducers: {
    setEmail: (state, action) => {
      state.email = action.payload?.email;
    },
  },
});

export const { setEmail } = recoverSlice.actions;

export const selectEmail = (state) => state.recover?.email;

export default recoverSlice.reducer;
