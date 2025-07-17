// components/common/AuthInitializer.tsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomer } from "@/features/customerAuthSlice";
import { RootState, AppDispatch } from "@/app/store";

export const AuthInitializer = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((state: RootState) => state.customerAuth);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchCustomer());
    }
  }, [token, user, dispatch]);

  return null;
};
