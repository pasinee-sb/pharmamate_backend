"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for MedicationHistory. */

class HealthJournals {
  /** Create a health_journal (from data), update db, return new health_journal data.
   *
   * data should be { username, journal }
   *
   * Returns {username, journal }
   **/

  static async create(data) {
    const result = await db.query(
      `INSERT INTO health_journals (username,
       journal)
           VALUES ($1, $2)
           RETURNING username,journal`,
      [data.username, data.journal]
    );
    let health_journal = result.rows[0];

    return health_journal;
  }

  /** Given a username, return data about the user's journal.
   *
   * Returns { username, journal }

   *
   * Throws NotFoundError if not found.
   **/

  static async get(user) {
    const healthRes = await db.query(
      `SELECT *
           FROM health_journals
           WHERE username = $1`,
      [user]
    );

    const health_journal = healthRes.rows[0];

    if (!health_journal)
      throw new NotFoundError(`No health journal found: ${user}'s journal`);

    return health_journal;
  }

  /** Update journal data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include: { journal}
   *
   * Returns {username,journal}
   *
   * Throws NotFoundError if not found.
   */

  static async update(user, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});

    const querySql = `UPDATE health_journals
                        SET ${setCols}
                        WHERE username = $${values.length + 1}
                        RETURNING username,
                                  journal`;
    const result = await db.query(querySql, [...values, user]);
    const health_journal = result.rows[0];

    if (!health_journal)
      throw new NotFoundError(`No medication_history: ${user}`);

    return health_journal;
  }

  /** Delete given health_journal from database; returns undefined.
   *
   * Throws NotFoundError if health_journal not found.
   **/

  static async remove(username) {
    const result = await db.query(
      `DELETE
           FROM health_journals
           WHERE username = $1
           RETURNING username`,
      [username]
    );
    const health_journal = result.rows[0];

    if (!health_journal)
      throw new NotFoundError(`No health_journal: ${username}`);
  }
}

module.exports = HealthJournals;
