// components/common/AuthInitializer.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomer } from "@/features/customerAuthSlice";
import { RootState, AppDispatch } from "@/app/store";

export const AuthInitializer = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((state: RootState) => state.customerAuth);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token && !user) {
        try {
          await dispatch(fetchCustomer()).unwrap();
        } catch (error) {
          console.error("Failed to restore authentication:", error);
        }
      }
      setIsInitialized(true);
    };

    // Add a small delay to ensure localStorage is read
    const timer = setTimeout(initializeAuth, 100);
    return () => clearTimeout(timer);
  }, [token, user, dispatch]);

  // Don't render anything until auth is initialized
  if (!isInitialized) {
    return null;
  }

  return null;
};
