import { createSlice } from "@reduxjs/toolkit";

export const appSlice = createSlice({
  name: "app",
  initialState: {
    channelId: null,
    channelName: null,
    messageId: null,
    channelLink: null,
  },
  reducers: {
    setChannelInfo: (state, action) => {
      state.channelId = action.payload.channelId;
      state.channelName = action.payload.channelName;
    },

    setMessageInfo: (state, action) => {
      state.messageId = action.payload.messageId;
    },

    setChannelLink: (state, action) => {
      state.channelLink = action.payload.channelLink;
    },
  },
});

export const { setChannelInfo, setMessageInfo, setChannelLink } =
  appSlice.actions;

export const selectChannelId = (state) => state.app.channelId;
export const selectChannelName = (state) => state.app.channelName;
export const selectChannelLink = (state) => state.app.channelLink;

export default appSlice.reducer;
