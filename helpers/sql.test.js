const { sqlForPartialUpdate } = require("./sql");

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
    const trimmed = '"first_name"=$1, "is_admin"=$2'
    expect(result).toEqual({
        setCols: trimmed,
        values: ["John", true]
    })
  });
});
