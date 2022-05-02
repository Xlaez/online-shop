import * as http from "http";
import server from "./server";
import cors from "cors";
import express, { Response, Request, NextFunction } from "express";

const PORT = process.env.PORT || process.env.APP_PORT;
const app = http.createServer(server.app);

server.routes();

server.app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to my app.");
});

app.listen(PORT, () => {
  console.log("======> Server connected at ", PORT);
});
