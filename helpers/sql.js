const { BadRequestError } = require("../expressError");

/** Function to construct the part of the sql query call
 *
 * Example:
 * dataToUpdate = { firstName: "John", isAdmin: true }
 * Returns {setCols: "first_name=$1,is_admin=$2", values: ["John", true]}
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  console.log("This is data to update", dataToUpdate);
  console.log("jsToSql: ", jsToSql);
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
