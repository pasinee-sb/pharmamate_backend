const { Client } = require("pg");
const { getDatabaseUri } = require("./config");
let db;

if (process.env.NODE_ENV === "production") {
  db = new Client({
    //* uncomment below when in development environment */

    // host: "/var/run/postgresql/",
    // database: getDatabaseUri(),
    // ssl: {
    //   rejectUnauthorized: false,
    // },

    //* uncomment below when in production environment */

    connectionString: getDatabaseUri(),
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  db = new Client({
    //* uncomment below when in development environment */

    host: "/var/run/postgresql/",
    database: getDatabaseUri(),

    //* uncomment below when in production environment */
    // connectionString: getDatabaseUri(),
  });
}

db.connect();

module.exports = db;
