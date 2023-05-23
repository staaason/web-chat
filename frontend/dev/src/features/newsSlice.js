import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  newsState: true,
};

const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {
    showNews: (state) => {
      state.newsState = true;
    },
    closeNews: (state) => {
      state.newsState = false;
    },
  },
});

export const { showNews, closeNews } = newsSlice.actions;

export const selectNewsState = (state) => state.news.newsState;

export default newsSlice.reducer;
