import express from "express";
import dotenv from "dotenv";

import sequelize from "./config/postgres.js";
import connectMongo from "./config/mongo.js";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("IsWorking API funcionando");
});

const startServer = async () => {
  try {

    await sequelize.authenticate();
    console.log("PostgreSQL conectado");

    await connectMongo();

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Servidor en puerto ${process.env.PORT || 3000}`);
    });

  } catch (error) {
    console.error(error);
  }
};

startServer();