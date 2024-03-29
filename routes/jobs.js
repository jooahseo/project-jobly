"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();

/** GET /  =>
 *   { jobs: [ { id, title, salary, equity, company_handle }, ...] }
 *
 * Can filter on provided search filters via query:
 * - title (will find case-insensitive, partial matches)
 * - minSalary
 * - hasEquity: true -> jobs with a non-zero amount of equity
 *              false -> jobs without an equity
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    const { title, minSalary, hasEquity, company } = req.query;
    const jobs = await Job.findAll(title, minSalary, hasEquity, company);
    return res.json({ jobs });
  } catch (e) {
    return next(e);
  }
});

/** GET /:id =>
 *  { id, title, salary, equity, company_handle }
 *
 *  Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    const id = req.params.id;
    const job = await Job.get(id);
    return res.json(job);
  } catch (e) {
    return next(e);
  }
});

/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, company_handle }
 *
 * Returns { id, titie, salary, equity, company_handle }
 *
 * Authorization required: admin
 */

router.post("/", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.message);
      throw new BadRequestError(errs);
    }
    const job = await Job.create(req.body);
    return res.status(201).json(job);
  } catch (e) {
    return next(e);
  }
});

/** PATCH /:id { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, company_handle }
 *
 * Authorization required: admin
 */

router.patch("/:id", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.id, req.body);
    return res.json(job);
  } catch (err) {
    return next(err);
  }
});

/** DELETE /:id  =>  { deleted: id }
 *
 * Authorization: admin
 */

router.delete("/:id", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {
    await Job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
