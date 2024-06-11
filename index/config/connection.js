require('dotenv').config();
import mysql from "mysql";

let connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "cointab_database"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Database connected!");
});

module.exports = connection;
