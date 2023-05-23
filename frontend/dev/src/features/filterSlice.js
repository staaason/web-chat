import { createSlice } from "@reduxjs/toolkit";

export const filterSlice = createSlice({
  name: "filter",
  initialState: {
    uid: null,
    filter: null,
    closeStatus: null,
  },
  reducers: {
    setUid: (state, action) => {
      state.uid = action.payload?.uid;
    },

    setFilter: (state, action) => {
      state.filter = action.payload?.filter;
    },

    setCloseStatus: (state, action) => {
      state.closeStatus = action.payload?.closeStatus;
    },
  },
});

export const { setUid, setFilter, setCloseStatus } = filterSlice.actions;

export const selectUid = (state) => state.filter?.uid;
export const selectFilter = (state) => state.filter?.filter;
export const selectCloseStatus = (state) => state.filter?.closeStatus;

export default filterSlice.reducer;
