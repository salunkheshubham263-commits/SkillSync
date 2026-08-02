const pool = require("../config/db");

const completeProfile = async (req, res) => {
  try {
    const { college, course, courseYear, city, bio } = req.body;
    const imageName = req.file ? req.file.filename : null;

    let selectedSkills = [];
    if (req.body.selectedSkills) {
      try {
        selectedSkills = JSON.parse(req.body.selectedSkills);
      } catch (parseError) {
        return res.status(400).json({
          message: "Invalid skills payload. Please select skills again.",
        });
      }
    }

    if (!Array.isArray(selectedSkills)) {
      return res.status(400).json({
        message: "Selected skills must be an array.",
      });
    }

    const parsedCourseYear = courseYear
      ? parseInt(String(courseYear).trim(), 10)
      : null;

    if (courseYear && Number.isNaN(parsedCourseYear)) {
      return res.status(400).json({
        message: "Invalid course year. Please provide a numeric year.",
      });
    }

    console.log(req.body);
    console.log(req.file);
    console.log(req.user);
    console.log(selectedSkills);

    await pool.query("BEGIN");

    try {
      // insert profile
      await pool.query(
        "insert into profiles (user_id,profile_image, college, courses, courses_year, city, bio) values($1,$2,$3,$4,$5,$6,$7)",
        [req.user.id, imageName, college, course, parsedCourseYear, city, bio],
      );
      // insert skills
      for (const skillId of selectedSkills) {
        await pool.query(
          "insert into user_skills (user_id, skill_id) values($1,$2)",
          [req.user.id, skillId],
        );
      }
      // update users
      await pool.query(
        "update users set complete_profile=true where user_id=$1",
        [req.user.id],
      );

      await pool.query("COMMIT");

      return res.status(200).json({
        message: "Profile completed successfully",
      });
    } catch (err) {
      await pool.query("ROLLBACK");

      console.log("===============");
      console.log(err);
      console.log(err.message);
      console.log(err.detail);
      console.log(err.code);
      console.log(err.constraint);
      console.log(err.stack);
      console.log("===============");

      if (err.code === "23505" && err.constraint === "profiles_user_id_key") {
        return res.status(409).json({
          error: "Profile already completed for this user.",
        });
      }

      return res.status(500).json({
        error: err.message,
      });
    }
  } catch (err) {
    console.error("Error: ", err);
    console.log(err.stack);
  }
};

const getSkills = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT skill_id, skill_name FROM skills ORDER BY skill_name ASC",
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error: ", err);
    console.log(err.stack);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  completeProfile,
  getSkills,
};
