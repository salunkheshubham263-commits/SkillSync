const pool = require("../config/db");

const createProject = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      source,
      title,
      description,
      liveDemoUrl,
      category,
      visibility,
      underDevelopment,
      wantContributors,
      contributionType,
      paymentType,
      fixedTask,
      fixedPaymentAmount,
      githubRepoUrl,
      milestones,
    } = req.body;

    const userId = req.user.id;

    if (!source || !["github", "local"].includes(source)) {
      return res.status(400).json({
        message: "Valid project source is required",
      });
    }

    if (!title || !description || !category || !visibility) {
      return res.status(400).json({
        message: "Title, description, category and visibility are required",
      });
    }

    if (!["public", "connections", "private"].includes(visibility)) {
      return res.status(400).json({
        message: "Invalid visibility",
      });
    }

    if (source === "github" && !githubRepoUrl) {
      return res.status(400).json({
        message: "GitHub repository URL is required",
      });
    }

    if (source === "local" && !req.files?.projectFile?.[0]) {
      return res.status(400).json({
        message: "Project ZIP file is required",
      });
    }

    if (underDevelopment === "true" && wantContributors === "true") {
      if (!contributionType || !["paid", "unpaid"].includes(contributionType)) {
        return res.status(400).json({
          message: "Valid contribution type is required",
        });
      }

      if (contributionType === "paid") {
        if (!paymentType || !["fixed", "milestone"].includes(paymentType)) {
          return res.status(400).json({
            message: "Valid payment type is required",
          });
        }

        if (paymentType === "fixed") {
          if (!fixedTask || fixedPaymentAmount === undefined || fixedPaymentAmount === "") {
            return res.status(400).json({
              message: "Fixed task and payment amount are required",
            });
          }

          if (Number(fixedPaymentAmount) < 0) {
            return res.status(400).json({
              message: "Payment amount cannot be negative",
            });
          }
        }
      }
    }

    let parsedMilestones = [];

    if (milestones) {
      try {
        parsedMilestones = JSON.parse(milestones);
      } catch (error) {
        return res.status(400).json({
          message: "Invalid milestones data",
        });
      }

      if (!Array.isArray(parsedMilestones)) {
        return res.status(400).json({
          message: "Milestones must be an array",
        });
      }
    }

    if (
      underDevelopment === "true" &&
      wantContributors === "true" &&
      contributionType === "unpaid"
    ) {
      if (parsedMilestones.length === 0) {
        return res.status(400).json({
          message: "At least one milestone is required",
        });
      }

      for (const milestone of parsedMilestones) {
        if (!milestone.title?.trim() || !milestone.task?.trim()) {
          return res.status(400).json({
            message: "Each milestone requires a title and task",
          });
        }
      }
    }

    if (
      underDevelopment === "true" &&
      wantContributors === "true" &&
      contributionType === "paid" &&
      paymentType === "milestone"
    ) {
      if (parsedMilestones.length === 0) {
        return res.status(400).json({
          message: "At least one paid milestone is required",
        });
      }

      for (const milestone of parsedMilestones) {
        if (!milestone.title?.trim() || !milestone.task?.trim()) {
          return res.status(400).json({
            message: "Each milestone requires a title and task",
          });
        }

        if (milestone.amount === undefined || milestone.amount === "") {
          return res.status(400).json({
            message: "Each paid milestone requires a payment amount",
          });
        }

        if (Number(milestone.amount) < 0) {
          return res.status(400).json({
            message: "Milestone payment amount cannot be negative",
          });
        }
      }
    }

    const coverImage = req.files?.coverImage?.[0]
      ? `/uploads/projects/images/${req.files.coverImage[0].filename}`
      : null;

    const projectFile = source === "local" && req.files?.projectFile?.[0]
      ? `/uploads/projects/files/${req.files.projectFile[0].filename}`
      : null;

    await client.query("BEGIN");

    const projectResult = await client.query(
      `INSERT INTO projects (
        user_id,
        title,
        description,
        source,
        github_repo_url,
        project_file,
        live_demo_url,
        category,
        visibility,
        cover_image,
        under_development,
        looking_for_contributors,
        contribution_type,
        payment_type,
        fixed_task,
        fixed_payment_amount,
        status
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15,
        $16,
        $17
      )
      RETURNING *`,
      [
        userId,
        title.trim(),
        description.trim(),
        source,
        source === "github" ? githubRepoUrl.trim() : null,
        projectFile,
        liveDemoUrl?.trim() || null,
        category,
        visibility,
        coverImage,
        underDevelopment === "true",
        wantContributors === "true",
        underDevelopment === "true" && wantContributors === "true"
          ? contributionType
          : null,
        underDevelopment === "true" &&
        wantContributors === "true" &&
        contributionType === "paid"
          ? paymentType
          : null,
        underDevelopment === "true" &&
        wantContributors === "true" &&
        contributionType === "paid" &&
        paymentType === "fixed"
          ? fixedTask.trim()
          : null,
        underDevelopment === "true" &&
        wantContributors === "true" &&
        contributionType === "paid" &&
        paymentType === "fixed"
          ? Number(fixedPaymentAmount)
          : null,
        underDevelopment === "true" ? "in_development" : "completed",
      ]
    );

    const project = projectResult.rows[0];

    for (const milestone of parsedMilestones) {
      await client.query(
        `INSERT INTO project_milestones (
          project_id,
          title,
          task,
          payment_amount,
          status,
          payment_status
        )
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          project.project_id,
          milestone.title.trim(),
          milestone.task.trim(),
          contributionType === "paid" ? Number(milestone.amount) : null,
          "draft",
          contributionType === "paid" ? "unpaid" : "unpaid",
        ]
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Project created successfully",
      project,
      milestones: parsedMilestones,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create project error:", error);

    return res.status(500).json({
      message: "Failed to create project",
    });
  } finally {
    client.release();
  }
};

const getProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
        p.*,
        COALESCE(
          json_agg(
            json_build_object(
              'milestone_id', pm.milestone_id,
              'title', pm.title,
              'task', pm.task,
              'payment_amount', pm.payment_amount,
              'status', pm.status,
              'payment_status', pm.payment_status
            )
          ) FILTER (WHERE pm.milestone_id IS NOT NULL),
          '[]'
        ) AS milestones
      FROM projects p
      LEFT JOIN project_milestones pm
        ON p.project_id = pm.project_id
      WHERE p.user_id = $1
      GROUP BY p.project_id
      ORDER BY p.created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      projects: result.rows,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    return res.status(500).json({
      message: "Failed to get projects",
    });
  }
};

const getProjectById = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = Number(req.params.project_id);

    if (!Number.isInteger(projectId)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const result = await pool.query(
      `SELECT
        p.*,
        COALESCE(
          json_agg(
            json_build_object(
              'milestone_id', pm.milestone_id,
              'title', pm.title,
              'task', pm.task,
              'payment_amount', pm.payment_amount,
              'status', pm.status,
              'payment_status', pm.payment_status
            )
          ) FILTER (WHERE pm.milestone_id IS NOT NULL),
          '[]'
        ) AS milestones
      FROM projects p
      LEFT JOIN project_milestones pm
        ON p.project_id = pm.project_id
      WHERE p.project_id = $1
        AND p.user_id = $2
      GROUP BY p.project_id`,
      [projectId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    return res.status(200).json({
      project: result.rows[0],
    });
  } catch (error) {
    console.error("Get project error:", error);

    return res.status(500).json({
      message: "Failed to get project",
    });
  }
};

const updateProject = async (req, res) => {
  return res.status(501).json({
    message: "Project update will be implemented next",
  });
};

const deleteProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = Number(req.params.project_id);

    if (!Number.isInteger(projectId)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const result = await pool.query(
      `DELETE FROM projects
       WHERE project_id = $1
       AND user_id = $2
       RETURNING project_id`,
      [projectId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    return res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    return res.status(500).json({
      message: "Failed to delete project",
    });
  }
};

const getGithubRepositories = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT access_token
       FROM github_accounts
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "GitHub account is not connected"
      });
    }

    const accessToken = result.rows[0].access_token;

    const response = await fetch(
      "https://api.github.com/user/repos?visibility=all&affiliation=owner&sort=updated&per_page=100",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28"
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      console.error("GitHub API error:", errorData);

      return res.status(response.status).json({
        message: errorData.message || "Failed to fetch GitHub repositories"
      });
    }

    const repositories = await response.json();

    const formattedRepositories = repositories.map((repo) => ({
      github_repo_id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      language: repo.language,
      private: repo.private,
      default_branch: repo.default_branch,
      updated_at: repo.updated_at,
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url
      }
    }));

    return res.status(200).json({
      repositories: formattedRepositories
    });
  } catch (error) {
    console.error("Get GitHub repositories error:", error);

    return res.status(500).json({
      message: "Failed to fetch GitHub repositories"
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getGithubRepositories
};