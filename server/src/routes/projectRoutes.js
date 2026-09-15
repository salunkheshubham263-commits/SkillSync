const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/projectUploadMiddleware");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getGithubRepositories
} = require("../controllers/projectController");

router.post("/", auth, upload.fields([ { name: "coverImage", maxCount: 1 }, { name: "projectFile", maxCount: 1 }, ]), createProject );
router.get("/", auth, getProjects);
router.get("/github/repos", auth, getGithubRepositories);
router.get("/:project_id", auth, getProjectById);
router.put("/:project_id", auth, upload.fields([ { name: "coverImage", maxCount: 1 }, { name: "projectFile", maxCount: 1 }, ]), updateProject );
router.delete("/:project_id", auth, deleteProject);

module.exports = router;
