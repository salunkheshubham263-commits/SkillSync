const config = require("../config/config");

const Pool = require("pg").Pool;
const pool = new Pool ({
    user: "postgres",
    password: config.db,
    host: "localhost",
    port: 5432,
    database: "skillsync"
})

module.exports = pool;