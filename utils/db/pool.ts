import sql, { config as SQLConfig } from "mssql";

export const config = {
  user: "sa",
  password: "Deependra@2001",
  server: "localhost",
  database: "EsData",
  options: {
    trustServerCertificate: true,
  },
};