const pool = require("../config/db");
const config = require("../config/config");

const getTrendingSkills = async (req, res) => {
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

const getUpcomingEvents = async (req, res) => {
  try {
    console.log("User ID:", req.user.id);

    // Get user's city
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

    const userCity = result.rows[0].city?.trim();

    if (!userCity) {
      return res.status(400).json({
        message: "City not found in profile"
      });
    }

    console.log("User City:", userCity);

    const fetchHackathons = async (city) => {
      try {
        console.log(`Fetching hackathons for: ${city}`);

        const response = await fetch(
          `https://brabble.ai/api/listings?hub=hackathons&city=${encodeURIComponent(city.toLowerCase())}&limit=20`,
          {
            headers: {
              Authorization: `Bearer ${config.brabble_api_key}`,
            },
          }
        );

        console.log(
          `Brabble status for ${city}:`,
          response.status
        );

        const data = await response.json();

        console.log(`Brabble response for ${city}:`, data);

        if (!response.ok) {
          return [];
        }

        if (!Array.isArray(data.listings)) {
          return [];
        }

        const now = new Date();

        return data.listings
          .filter((event) => {
            return (
              event.deadline &&
              new Date(event.deadline) > now
            );
          })
          .sort((a, b) => {
            return (
              new Date(a.deadline) -
              new Date(b.deadline)
            );
          })
          .slice(0, 10)
          .map((event) => ({
            title: event.title,
            mode: event.mode,
            deadline: event.deadline,
            url: event.url
          }));

      } catch (err) {
        console.error(
          `Error fetching hackathons for ${city}:`,
          err.message
        );

        return [];
      }
    };

    let events = await fetchHackathons(userCity);

    console.log(
      `Events found in ${userCity}:`,
      events.length
    );

    let source = "city";
    let message = "";

    if (events.length === 0) {

      if (userCity.toLowerCase() !== "mumbai") {

        console.log(
          `No hackathons found in ${userCity}. Trying Mumbai...`
        );

        events = await fetchHackathons("Mumbai");

        source = "fallback";

        if (events.length > 0) {
          message = `No hackathons found in ${userCity}. Showing hackathons from Mumbai.`;
        }

      } else {

        message = "No upcoming hackathons found in Mumbai.";
      }
    }

    if (events.length === 0) {

      if (userCity.toLowerCase() !== "mumbai") {
        message = `No upcoming hackathons found in ${userCity} or Mumbai.`;
      }

      source = "none";
    }

    console.log("Final events:", events);
    console.log("Source:", source);
    console.log("Message:", message);

    return res.status(200).json({
      userCity,
      source,
      message,
      events
    });

  } catch (err) {

    console.error(
      "Upcoming events ERROR:",
      err
    );

    return res.status(500).json({
      message: "Failed to fetch upcoming events",
      error: err.message
    });
  }
};

const searchStudents = async (req,res) =>{
  try {
    const userId = req.user.id;
    const search = req.query.q?.trim();

    if(!search){
      return res.status(200).json([]);
    }

    const result = await pool.query(`
      select distinct
      u.user_id,
      u.first_name,
      u.last_name,
      u.username,
      p.profile_image,
      p.college,
      p.courses,
      p.courses_year,
      p.city,
      coalesce(
      ARRAY_AGG(distinct s.skill_name)
      filter (where s.skill_name is not null),
      '{}'
      ) AS skills

      from users u

      left join profiles p on u.user_id = p.user_id
      left join user_skills us on u.user_id = us.user_id
      left join skills s on us.skill_id = s.skill_id

      where
      u.user_id != $1
      and (
      u.first_name ILIKE $2
      or u.last_name ILIKE $2
      or u.username ILIKE $2
      or p.college ILIKE $2
      or p.courses ILIKE $2
      or p.city ILIKE $2
      or s.skill_name ILIKE $2
      )

      group by
      u.user_id,
      u.first_name,
      u.last_name,
      u.username,
      p.profile_image,
      p.college,
      p.courses,
      p.courses_year,
      p.city

      order by
      u.first_name,
      u.last_name

      limit 10
      `, [userId, `%${search}%`]);

      res.status(200).json(result.rows);
  } catch (err) {
    console.error("Student search error: ", err);
    res.status(500).json({
      message: "Failed to search students",
      error: err.message
    });
  }
}

module.exports = { getTrendingSkills, getUpcomingEvents, searchStudents };