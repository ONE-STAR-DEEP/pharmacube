"use client";

import { createContext, useContext } from "react";

type Role = "warehouse" | "checker" | "reviewer" | "admin" | "rider" | "";

const RoleContext = createContext<Role>("");

export const RoleProvider = ({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) => {
  return (
    <RoleContext.Provider value={role}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  return useContext(RoleContext);
};