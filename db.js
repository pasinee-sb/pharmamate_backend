const { Client } = require("pg");
const { getDatabaseUri } = require("./config");
let db;

//* uncomment below when in development environment */

// if (process.env.NODE_ENV === "production") {
//   db = new Client({
//     host: "/var/run/postgresql/",
//     database: getDatabaseUri(),
//     ssl: {
//       rejectUnauthorized: false,
//     },
//   });
// } else {
//   db = new Client({
//     host: "/var/run/postgresql/",
//     database: getDatabaseUri(),
//   });
// }
//* uncomment below when in production environment */

if (process.env.NODE_ENV === "production") {
  db = new Client({
    connectionString: getDatabaseUri(),
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  db = new Client({
    connectionString: getDatabaseUri(),
  });
}

db.connect();

module.exports = db;
