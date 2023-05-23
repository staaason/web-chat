import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/userSlice"
import appReducer from "./features/appSlice"
import filterReducer from './features/filterSlice';
import recoverReducer from './features/recoverSlice';
import newsReducer from './features/newsSlice';

 export const store = configureStore({
    reducer: {
        user : userReducer, 
        app : appReducer,
        filter: filterReducer,
        recover: recoverReducer,
        news: newsReducer

    }
})