let db;
const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

if (process.env.NODE_ENV === "production") {
  db = new Client({
    host: "/var/run/postgresql/",
    database: getDatabaseUri(),
    ssl: {
      rejectUnauthorized: false,
    },
    // connectionString: getDatabaseUri(),
    // ssl: {
    //   rejectUnauthorized: false
    // }
  });
} else {
  db = new Client({
    host: "/var/run/postgresql/",
    database: getDatabaseUri(),
    // connectionString: getDatabaseUri()
  });
}

db.connect();

module.exports = db;
