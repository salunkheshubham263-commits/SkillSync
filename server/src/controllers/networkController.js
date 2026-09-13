const pool = require("../config/db");

const getSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;

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
        u.username,

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
      [userId]
    );

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

    if (!receiver_id || isNaN(receiver_id)) {
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
      SELECT
        connection_id,
        sender_id,
        receiver_id,
        status
      FROM connections
      WHERE
        (sender_id = $1 AND receiver_id = $2)
        OR
        (sender_id = $2 AND receiver_id = $1)
      ORDER BY updated_at DESC
      LIMIT 1
      `,
      [sender_id, receiver_id]
    );

    if (existingConnection.rows.length > 0) {
      const connection = existingConnection.rows[0];

      if (connection.status === "pending") {
        return res.status(409).json({
          message: "Connection request already pending",
          status: "pending",
        });
      }

      if (connection.status === "accepted") {
        return res.status(400).json({
          message: "You are already connected",
          status: "accepted",
        });
      }

      if (connection.status === "blocked") {
        return res.status(403).json({
          message: "Connection is blocked",
          status: "blocked",
        });
      }

      if (connection.status === "rejected") {
        const updated = await pool.query(
          `
          UPDATE connections
          SET
            sender_id = $1,
            receiver_id = $2,
            status = 'pending',
            updated_at = CURRENT_TIMESTAMP
          WHERE connection_id = $3
          RETURNING *
          `,
          [
            sender_id,
            receiver_id,
            connection.connection_id,
          ]
        );

        const updatedConnection = updated.rows[0];

        const notification = await pool.query(
          `
          INSERT INTO notifications
          (
            user_id,
            sender_id,
            connection_id,
            type,
            message
          )
          VALUES
          (
            $1,
            $2,
            $3,
            'connection_request',
            $4
          )
          RETURNING *
          `,
          [
            receiver_id,
            sender_id,
            updatedConnection.connection_id,
            "sent you a connection request",
          ]
        );

        const io = req.app.get("io");

        if (io) {
          io.to(`user:${receiver_id}`).emit(
            "connection_request",
            {
              connection_id:
                updatedConnection.connection_id,
              sender_id,
              receiver_id,
              status: "pending",
            }
          );
        }

        return res.status(200).json({
          message: "Connection request sent",
          connection: updatedConnection,
          notification: notification.rows[0],
        });
      }
    }

    const newConnection = await pool.query(
      `
      INSERT INTO connections
      (
        sender_id,
        receiver_id,
        status
      )
      VALUES
      (
        $1,
        $2,
        'pending'
      )
      RETURNING *
      `,
      [sender_id, receiver_id]
    );

    const connection = newConnection.rows[0];

    const notification = await pool.query(
      `
      INSERT INTO notifications
      (
        user_id,
        sender_id,
        connection_id,
        type,
        message
      )
      VALUES
      (
        $1,
        $2,
        $3,
        'connection_request',
        $4
      )
      RETURNING *
      `,
      [
        receiver_id,
        sender_id,
        connection.connection_id,
        "sent you a connection request",
      ]
    );

    const io = req.app.get("io");

    if (io) {
      io.to(`user:${receiver_id}`).emit(
        "connection_request",
        {
          connection_id: connection.connection_id,
          sender_id,
          receiver_id,
          status: "pending",
        }
      );
    }

    res.status(201).json({
      message: "Connection request sent",
      connection,
      notification: notification.rows[0],
    });
  } catch (err) {
    console.error("Error sending connection request:", err);

    res.status(500).json({
      message: "Failed to send connection request",
      error: err.message,
    });
  }
};

module.exports = {
  getSuggestions,
  sendConnectionRequest,
};