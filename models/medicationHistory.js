"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for MedicationHistory. */

class MedicationHistory {
  /** Create a medication (from data), update db, return new medication_history data.
   *
   * data should be { username, drug_name, status, start_date,stop_date }
   *
   * Returns { id, username,drugName, status, startDate,stopDate }
   **/

  static async create(data) {
    const result = await db.query(
      `INSERT INTO medication_history (username,
        drug_name,
        status,
        start_date,
        stop_date)
           VALUES ($1, $2, $3, $4,$5)
           RETURNING id, username,drug_name AS "drugName", status,start_date AS "startDate", stop_date AS "stopDate"`,
      [data.username, data.drugName, data.status, data.startDate, data.stopDate]
    );
    let medication_history = result.rows[0];

    return medication_history;
  }

  /** Find all medication history  related to username
   *

   * Returns[{id, username,drugName,status,  startDate,stopDate },...]

   * */

  static async findAll({ username }) {
    const result = await db.query(
      `SELECT * FROM medication_history 
      WHERE username = $1`,
      [username]
    );
    return result.rows;
  }

  /** Given a medication_history id, return data about medication history.
   *
   * Returns { id, username,drugName,status,  startDate,stopDate }

   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const medicationRes = await db.query(
      `SELECT *
           FROM medication_history
           WHERE id = $1`,
      [id]
    );
    console.log("I AM HERE");

    const medication_history = medicationRes.rows[0];

    if (!medication_history)
      throw new NotFoundError(`No medication history: ${id}`);

    return medication_history;
  }

  /** Update medication data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include: { status, startDate,stopDate}
   *
   * Returns { id, username,drugName,status,  startDate,stopDate}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE medication_history
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                username, 
                                drug_name AS "drugName", 
                                status,
                                start_date AS "startDate",
                                stop_date AS "stopDate"`;
    const result = await db.query(querySql, [...values, id]);
    const medication_history = result.rows[0];

    if (!medication_history)
      throw new NotFoundError(`No medication_history: ${id}`);

    return medication_history;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM medication_history
           WHERE id = $1
           RETURNING id`,
      [id]
    );
    const medication_history = result.rows[0];

    if (!medication_history)
      throw new NotFoundError(`No medication_history: ${id}`);
  }
}

module.exports = MedicationHistory;
