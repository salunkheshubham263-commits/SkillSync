const pool = require("../config/db");

const getSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("Logged-in User ID:", userId);

    const suggestions = await pool.query(
      `
      WITH my_profile AS (
        SELECT
          college,
          courses,
          courses_year,
          city
        FROM profiles
        WHERE user_id = $1
      ),

      my_skills AS (
        SELECT skill_id
        FROM user_skills
        WHERE user_id = $1
      ),

      skill_matches AS (
        SELECT
          us.user_id,
          COUNT(*) AS shared_skills
        FROM user_skills us
        INNER JOIN my_skills ms
          ON us.skill_id = ms.skill_id
        WHERE us.user_id != $1
        GROUP BY us.user_id
      )

      SELECT
        u.user_id,
        u.first_name,
        u.last_name,

        p.profile_image,
        p.college,
        p.courses,
        p.courses_year,
        p.city,

        COALESCE(sm.shared_skills, 0) AS shared_skills,

        CASE
          WHEN LOWER(p.college) = LOWER(mp.college)
          THEN true
          ELSE false
        END AS same_college,

        CASE
          WHEN LOWER(p.courses) = LOWER(mp.courses)
          THEN true
          ELSE false
        END AS same_course,

        CASE
          WHEN p.courses_year = mp.courses_year
          THEN true
          ELSE false
        END AS same_course_year,

        CASE
          WHEN LOWER(p.city) = LOWER(mp.city)
          THEN true
          ELSE false
        END AS same_city,

        (
          COALESCE(sm.shared_skills, 0) * 3

          + CASE
              WHEN LOWER(p.college) = LOWER(mp.college)
              THEN 2
              ELSE 0
            END

          + CASE
              WHEN LOWER(p.courses) = LOWER(mp.courses)
              THEN 2
              ELSE 0
            END

          + CASE
              WHEN p.courses_year = mp.courses_year
              THEN 1
              ELSE 0
            END

          + CASE
              WHEN LOWER(p.city) = LOWER(mp.city)
              THEN 2
              ELSE 0
            END
        ) AS match_score,

        connection.status AS connection_status

      FROM users u

      LEFT JOIN profiles p
        ON u.user_id = p.user_id

      CROSS JOIN my_profile mp

      LEFT JOIN skill_matches sm
        ON u.user_id = sm.user_id

      LEFT JOIN LATERAL (
        SELECT status
        FROM connections c
        WHERE
          (
            c.sender_id = $1
            AND c.receiver_id = u.user_id
          )
          OR
          (
            c.sender_id = u.user_id
            AND c.receiver_id = $1
          )
        ORDER BY c.updated_at DESC
        LIMIT 1
      ) connection
        ON true

      WHERE
        u.user_id != $1

        -- Don't show blocked users
        AND NOT EXISTS (
          SELECT 1
          FROM connections c
          WHERE
            c.status = 'blocked'
            AND (
              (c.sender_id = $1 AND c.receiver_id = u.user_id)
              OR
              (c.sender_id = u.user_id AND c.receiver_id = $1)
            )
        )

      ORDER BY
        match_score DESC,
        shared_skills DESC,
        same_college DESC,
        same_course DESC,
        same_course_year DESC,
        same_city DESC

      `,
      [userId],
    );

    console.log("Suggestions:", suggestions.rows);
    console.log("Number of Suggestions:", suggestions.rows.length);

    res.status(200).json(suggestions.rows);
  } catch (err) {
    console.error("Error getting suggestions:", err);

    res.status(500).json({
      message: "Failed to get suggestions",
      error: err.message,
    });
  }
};

const sendConnectionRequest = async (req, res) => {
  try {
    const sender_id = req.user.id;
    const receiver_id = parseInt(req.params.receiver_id);

    console.log("Sender ID: ", sender_id);
    console.log("Receiver ID: ", receiver_id);

    if (!receiver_id) {
      return res.status(400).json({
        message: "Receiver ID is required",
      });
    }
    if (sender_id === receiver_id) {
      return res.status(400).json({
        message: "You cannot connect with yourself",
      });
    }

    const existingConnection = await pool.query(
      `
            select connection_id, sender_id, receiver_id, status
            from connections
            where
            (sender_id = $1 and receiver_id = $2)
            or
            (sender_id = $2 and receiver_id = $1)
            limit 1
            `,
            [sender_id, receiver_id]
    );

    console.log("Existing connection:", existingConnection.rows);

    if(existingConnection.rows.length > 0) {
        const connection = existingConnection.rows[0];

        if(connection.status === "pending"){
            return res.status(409).json({
                message: "Connection request already pending",
                stauts: "pending"
            });
        }

        if(connection.status === "accepted") {
            return res.status(400).json({
                message: "You are already connected",
                status: "accepted"
            });
        }

        if(connection.status === "blocked"){
            return res.status(403).json({
                message: "Connection  is blocked",
                status: "blocked"
            });
        }

        if(connection.stauts === "rejcted"){
            const updated = await pool.query(`
                update connection
                set
                sender_id = $1,
                receiver_id = $1,
                status = "pending
                updated_at = current_timestamp"
                where connection_id = $3
                returning * 
                `,[sender_id, receiver_id, connection.connection_id]);

                return res.status(200).json({
                    message: "Connection request sent",
                    connection: updated.rows [0]
                });
        }

    }
    const newConnection = await pool.query(
      `
      INSERT INTO connections
        (sender_id, receiver_id, status)
      VALUES
        ($1, $2, 'pending')
      RETURNING *
      `,
      [senderId, receiverId]
    );

    console.log("New connection:", newConnection.rows[0]);

    res.status(201).json({
      message: "Connection request sent",
      connection: newConnection.rows[0]
    });

  } catch (err) {
    console.error("Error sending connection request:", err);

    res.status(500).json({
      message: "Failed to send connection request",
      error: err.message
    });
  }
};

module.exports = { getSuggestions, sendConnectionRequest };
