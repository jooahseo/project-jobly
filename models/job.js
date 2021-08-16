"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be {title, salary, equity, company_handle}
   * returns {id, titie, salary, equity, company_handle}
   *
   * Throw BadRequestError if invalid company_handle
   */

  static async create({ title, salary, equity, company_handle }) {
    const handleCheck = await db.query(
      `SELECT handle FROM companies WHERE handle = $1`,
      [company_handle]
    );
    if (handleCheck.rows.length === 0) {
      throw new BadRequestError(`company: ${company_handle} not found`);
    }
    const result = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, salary, equity, company_handle`,
      [title, salary, equity, company_handle]
    );
    const job = result.rows[0];
    return job;
  }

  /** Find all jobs
   *
   *  Can filter on title, minSalary, hasEquity
   *
   *  Returns [{ id, title, salary, equity, company_handle }, ... ]
   */

  static async findAll() {
    const jobs = await db.query(
      `SELECT id, title, salary, equity, company_handle 
       FROM jobs
       ORDER BY title`
    );
    return jobs.rows;
  }

  /** Given an id, return data about the job.
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * Throws NotFoundError if not found.
   */

  static async get(id) {
    const jobRes = await db.query(
      `SELECT id, title, salary, equity, company_handle 
       FROM jobs 
       WHERE id = $1`,
      [id]
    );
    const job = jobRes.rows[0];
    if (!job) throw new NotFoundError(`No job with an id: ${id}`);

    return job;
  }

  /** Update a job with data.
   *
   * This is a "partial update" -- It's okay if data doesn't contain
   * all the fields; only update provided ones;
   *
   * Data can include: { title, salary, equity }
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data);
    const idIdx = "$" + (values.length + 1);
    const querySql = `UPDATE jobs
                          SET ${setCols}
                          WHERE id = ${idIdx}
                          RETURNING id, title, salary, equity, company_handle`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];
    if (!job) throw new NotFoundError(`No job with an id: ${id}`);

    return job;
  }

  /** Delete a job with given id.
   *
   * Throws NotFoundError if not found.
   */

  static async remove(id) {
    const result = await db.query(
      `DELETE FROM jobs WHERE id = $1 RETURNING id`,
      [id]
    );
    const job = result.rows[0];
    if (!job) throw new NotFoundError(`No job with an id: ${id}`);
  }
}

module.exports = Job;
