import { configureStore } from "@reduxjs/toolkit";
import authCustomerSlice from "../features/customerAuthSlice";

export const store = configureStore({
  reducer: {
    customerAuth: authCustomerSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
