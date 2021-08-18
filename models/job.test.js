"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create a job", function () {
  const newJob = {
    title: "newJob",
    salary: 99999,
    equity: 0.009,
    company_handle: "c1",
  };

  test("works", async function () {
    const job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      ...newJob,
      equity: "0.009",
    });
    const result = await db.query(
      `SELECT id, title,salary,equity,company_handle
        FROM jobs
        WHERE title = 'newJob'`
    );
    expect(result.rows[0]).toEqual({
      id: expect.any(Number),
      title: "newJob",
      salary: 99999,
      equity: "0.009",
      company_handle: "c1",
    });
  });
  test("bad request with invalid company_handle", async function () {
    try {
      await Job.create({ ...newJob, company_handle: "invalidC" });
    } catch (e) {
      expect(e instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("work: no filter", async function () {
    const jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: 1,
        title: "j1",
        salary: 1,
        equity: "0.001",
        company_handle: "c1",
      },
      {
        id: 2,
        title: "j2",
        salary: 2,
        equity: "0.002",
        company_handle: "c2",
      },
      {
        id: 3,
        title: "j3",
        salary: 3,
        equity: "0.003",
        company_handle: "c3",
      },
    ]);
  });
  test("work: with filter", async function () {
    const title = "j"
    const minSalary = 2
    const jobs = await Job.findAll(title, minSalary);
    expect(jobs).toEqual([
      {
        id: 2,
        title: "j2",
        salary: 2,
        equity: "0.002",
        company_handle: "c2",
      },
      {
        id: 3,
        title: "j3",
        salary: 3,
        equity: "0.003",
        company_handle: "c3",
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    const job = await Job.get(1);
    expect(job).toEqual({
      id: 1,
      title: "j1",
      salary: 1,
      equity: "0.001",
      company_handle: "c1",
    });
  });
  test("not found error if invalid id", async function () {
    try{
        await Job.get(0);
    }catch(e){
        expect(e instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function(){
    const updateData = {
        title: "newJob",
        salary: 100,
        equity: 0
    }
    test("works", async function(){
        const job = await Job.update(1,updateData);
        expect(job).toEqual(
            {
                id: 1, 
                ...updateData,
                equity: "0",
                company_handle: "c1"
            }
        )
    });
    test("works: partial update", async function(){
        const job = await Job.update(1,{title:"newJob"});
        expect(job).toEqual(
            {
                id: 1, 
                title: "newJob",
                salary: 1,
                equity: "0.001",
                company_handle: "c1"
            }
        )
    });
    test("NotFoundError with invalid id", async function(){
        try{
            await Job.update(0,updateData);
        }catch(e){
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
    test("BadRequestError with no data", async function(){
        try{
            await Job.update(0,{});
        }catch(e){
            expect(e instanceof BadRequestError).toBeTruthy();
        }
    });
})

/************************************** remove */

describe("remove", function(){
    test("works", async function(){
        await Job.remove(1);
        const result = await db.query(
            `SELECT id FROM jobs WHERE id = 1`
        );
        expect(result.rows.length).toBe(0);
    });
    test("NotFoundError with invalid id", async function(){
        try{
            await Job.remove(0);
        }catch(e){
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
})