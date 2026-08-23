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

getUpcomingEvents = async (req, res) => {
  try {
    console.log("User ID:", req.user.id);

    const result = await pool.query(
      "SELECT city FROM profiles WHERE user_id = $1",
      [req.user.id]
    );

    console.log("Profile result:", result.rows);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Profile not found"
      });
    }

    const city = result.rows[0].city.toLowerCase();

    if (!city) {
      return res.status(400).json({
        message: "City not found in profile"
      });
    }

    console.log("City:", city);

    const response = await fetch(
      `https://brabble.ai/api/listings?hub=hackathons&city=${encodeURIComponent(city)}&limit=20`,
      {
        headers: {
          Authorization: `Bearer ${config.brabble_api_key}`,
        },
      }
    );

    console.log("Brabble status:", response.status);

    const data = await response.json();

    console.log("Brabble response:", data);

    if (!response.ok) {
      return res.status(502).json({
        message: "Hackathon API failed",
        status: response.status,
        data
      });
    }

    if (!Array.isArray(data.listings)) {
      return res.status(502).json({
        message: "Invalid response from hackathon API"
      });
    }

    const now = new Date();

    const events = data.listings
      .filter(event => {
        return (
          event.deadline &&
          new Date(event.deadline) > now
        );
      })
      .sort((a, b) => {
        return new Date(a.deadline) - new Date(b.deadline);
      })
      .slice(0, 10)
      .map(event => ({
        title: event.title,
        mode: event.mode,
        deadline: event.deadline,
        url: event.url
      }));

    console.log("Final events:", events);

    res.status(200).json(events);

  } catch (err) {
    console.error("Upcoming events ERROR:", err);

    res.status(500).json({
      message: "Failed to fetch upcoming events",
      error: err.message
    });
  }
};

module.exports = { getTrendingSkills, getUpcomingEvents };
