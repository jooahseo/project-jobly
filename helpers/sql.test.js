const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate, sqlFilterGetComp, sqlFilterGetJob } = require("./sql");

describe("Test sqlForPartialUpdate function", function () {
  test("Turn JSON data into proper set columns and values", function () {
    const data = {
        firstName: "John",
        isAdmin: true
    };
    const jsToSql = {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin",
    };
    const result = sqlForPartialUpdate(data,jsToSql);
    expect(result).toEqual({
        setCols: '"first_name"=$1, "is_admin"=$2',
        values: ["John", true]
    })
  });
});

describe("Test sqlFilterGetComp function --- company", function () {
  test("Use Parameters to construct the query and values for WHERE", function () {
    const name = "JOO";
    const minEmployees = 0;
    const maxEmployees = 100;

    const result = sqlFilterGetComp(name, minEmployees, maxEmployees);
    expect(result).toEqual({
        whereCol: `LOWER(name) LIKE LOWER($1) AND num_employees >= $2 AND num_employees <= $3`,
        values: ["%JOO%", 0, 100]
    })
  });
  test("Invalid minEmployees and maxEmployees", function () {
    const name = undefined;
    const minEmployees = 200;
    const maxEmployees = 100;

    expect(function(){ sqlFilterGetComp(name, minEmployees, maxEmployees)}).toThrow();
    // you must wrap the code in function, otherwise the error will not be caught.
  });
});

describe("Test sqlFilterGetJob function --- job ", function () {
  test("Use Parameters to construct the query hasEquity=true", function () {
    const title = "engineer";
    const minSalary = 100000;
    const hasEquity = "true";

    const result = sqlFilterGetJob(title, minSalary, hasEquity);
    expect(result).toEqual({
        whereCol: `LOWER(title) LIKE LOWER($1) AND salary >= $2 AND equity > 0`,
        values: ["%engineer%", 100000]
    })
  });
  test("Use Parameters to construct the query hasEquity=false", function () {
    const title = "engineer";
    const minSalary = undefined;
    const hasEquity = false;

    const result = sqlFilterGetJob(title, minSalary, hasEquity);
    expect(result).toEqual({
        whereCol: `LOWER(title) LIKE LOWER($1)`,
        values: ["%engineer%"]
    })
  });
});
