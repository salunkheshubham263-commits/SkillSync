const pool = require("../config/db");
const config = require("../config/config");

getTrendingSkills = async (req, res) => {
  try {
    const result =
      await pool.query(`select s.skill_id, s.skill_name,count(us.user_id) as user_count 
        from user_skills us
        join skills s
        on s.skill_id = us.skill_id
        WHERE us.created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
        GROUP BY s.skill_id,s.skill_name
        ORDER BY user_count DESC
        LIMIT 5`);
    const skills = result.rows.map(row => row.skill_name);
    res.status(200).json(skills);

  } catch (err) {
    console.error("Trending skills error:", err);

    res.status(500).json({
      message: "Failed to fetch trending skills"
    });
  }
};

module.exports = { getTrendingSkills };
