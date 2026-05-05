"use client";

import { createContext, useContext } from "react";

type Role = "warehouse" | "checker" | "reviewer" | "admin" | "rider" | "delivery" | "";

type RoleContextType = {
  role: Role;
  isPlusUser?: boolean; 
};

const RoleContext = createContext<RoleContextType>({
  role: "",
  isPlusUser: false,
});

export const RoleProvider = ({
  role,
  isPlusUser,
  children,
}: {
  role: Role;
  isPlusUser?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <RoleContext.Provider value={{ role, isPlusUser }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  return useContext(RoleContext);
};