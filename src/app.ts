import "reflect-metadata";
import createError from "http-errors";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
dotenv.config();

import indexRouter from "./routes/index";
import friendRouter from "./routes/friends";
import hostRouter from "./routes/groupHost";
import spotifyRouter from "./routes/spotify";
import { AppDataSource } from "./config/data-source";

const app = express();
const port = process.env.PORT || "4000";
app.set("port", port);
export const server = http.createServer(app);

server.listen(port);
console.log("App is Listening at Port:", port);

//check
AppDataSource.initialize()
  .then(() => console.log("DB CONNECTED 🚀"))
  .catch((error) => console.log(error));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors()); //TODO: only allows access from app

app.use("/", indexRouter);
app.use("/groupHost", hostRouter);
app.use("/friends", friendRouter);
app.use("/spotify", spotifyRouter);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

// error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  console.error(err);
  res.status(err.status || 500);
  res.json({ error: err.message });
});

export default app;
