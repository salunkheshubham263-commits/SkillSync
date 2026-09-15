import { useEffect, useState } from "react";

const ProjectForm = ({ onBack, onSuccess }) => {
  const [projectTitle, setProjectTitle] = useState("");
  const [description, setDescription] = useState("");
  const [liveDemoUrl, setLiveDemoUrl] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [visibility, setVisibility] = useState("public");
  const [source, setSource] = useState("");
  const [githubRepoUrl, setGithubRepoUrl] = useState("");
  const [githubRepoId, setGithubRepoId] = useState("");
  const [githubRepositories, setGithubRepositories] = useState([]);
  const [githubSearch, setGithubSearch] = useState("");
  const [githubLoading, setGithubLoading] = useState(false);
  const [selectedGithubRepo, setSelectedGithubRepo] = useState(null);
  const [projectFile, setProjectFile] = useState(null);

  const [underDevelopment, setUnderDevelopment] = useState("");
  const [wantContributors, setWantContributors] = useState("");
  const [contributionType, setContributionType] = useState("");
  const [paymentType, setPaymentType] = useState("");

  const [fixedTask, setFixedTask] = useState("");
  const [fixedPaymentAmount, setFixedPaymentAmount] = useState("");

  const [milestones, setMilestones] = useState([]);

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: "",
        task: "",
        amount: "",
      },
    ]);
  };

  const updateMilestone = (index, field, value) => {
    const updatedMilestones = [...milestones];

    updatedMilestones[index][field] = value;

    setMilestones(updatedMilestones);
  };

  const removeMilestone = (index) => {
    setMilestones(
      milestones.filter((_, i) => i !== index)
    );
  };

  const fetchGithubRepositories = async () => {
    try {
      setGithubLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first.");
        return;
      }

      const response = await fetch(
        "http://192.168.0.111:5000/api/projects/github/repos",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch GitHub repositories"
        );
      }

      setGithubRepositories(data.repositories || []);
    } catch (error) {
      console.error("GitHub repositories error:", error);
      alert(error.message || "Unable to fetch GitHub repositories");
    } finally {
      setGithubLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!source) {
      alert("Please select GitHub Repo or Local Zip");
      return;
    }

    if (source === "github" && !selectedGithubRepo) {
      alert("Please select a GitHub repository");
      return;
    }

    if (source === "local" && !projectFile) {
      alert("Please select a project ZIP file");
      return;
    }

    const formData = new FormData();

    formData.append("source", source);
    formData.append("title", projectTitle);
    formData.append("description", description);
    formData.append("liveDemoUrl", liveDemoUrl);
    formData.append("category", category);
    formData.append("visibility", visibility);
    formData.append("underDevelopment", underDevelopment === "yes");
    formData.append("wantContributors", wantContributors === "yes");

    if (coverImage) {
      formData.append("coverImage", coverImage);
    }

    if (source === "github") {
      formData.append("githubRepoId", githubRepoId);
      formData.append("githubRepoUrl", githubRepoUrl);
    }

    if (source === "local") {
      formData.append("projectFile", projectFile);
    }

    if (wantContributors === "yes") {
      formData.append("contributionType", contributionType);

      if (contributionType === "paid") {
        formData.append("paymentType", paymentType);

        if (paymentType === "fixed") {
          formData.append("fixedTask", fixedTask);
          formData.append("fixedPaymentAmount", fixedPaymentAmount);
        }

        if (paymentType === "milestone") {
          formData.append("milestones", JSON.stringify(milestones));
        }
      }

      if (contributionType === "unpaid") {
        formData.append("milestones", JSON.stringify(milestones));
      }
    }

    try {
      const response = await fetch("http://192.168.0.111:5000/api/projects", {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create project");
      }

      console.log("Project created:", data);
      alert("Project created successfully");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Create project error:", error);
      alert(error.message || "Something went wrong");
    }
  };

  return (
    <div className="project-form-page">

      <button
        onClick={onBack}
        className="backPro-btn"
        type="button"
      >
        Back
      </button>

      <h1>Create Project</h1>

      <p className="project-form-subtitle">
        Showcase your project on SkillSync.
      </p>

      <div className="buttons">

        <button
          type="button"
          className="gitrepo"
          onClick={() => {
            setSource("github");
            setProjectFile(null);
            fetchGithubRepositories();
          }}
        >
          Github Repo
        </button>

        <button
          type="button"
          className="localzip"
          onClick={() => {
            setSource("local");
            setGithubRepoUrl("");
          }}
        >
          Local Zip
        </button>

      </div>

      {source === "github" && (
        <div className="source-section">
          <label className="field-label">Select GitHub Repository</label>
          <p className="github-repository-description">
            Choose a repository from your connected GitHub account.
          </p>
          {githubLoading ? (
            <p>Loading your GitHub repositories...</p>
          ) : (
            <>
              <input
                className="inpute"
                type="text"
                placeholder="Search your repositories..."
                value={githubSearch}
                onChange={(e) => setGithubSearch(e.target.value)}
              />

              <div className="github-repository-list">
                {githubRepositories
                  .filter((repo) =>
                    repo.full_name
                      .toLowerCase()
                      .includes(githubSearch.toLowerCase())
                  )
                  .map((repo) => (
                    <button
                      type="button"
                      key={repo.github_repo_id}
                      className="github-repository-item"
                      onClick={() => {
                        setSelectedGithubRepo(repo);
                        setGithubRepoId(repo.github_repo_id);
                        setGithubRepoUrl(repo.html_url);
                      }}
                    >
                      <div>
                        <strong>{repo.full_name}</strong>

                        {repo.description && (
                          <p>{repo.description}</p>
                        )}

                        <span>
                          {repo.language || "Unknown language"}
                          {" • "}
                          {repo.private ? "Private" : "Public"}
                        </span>
                      </div>
                    </button>
                  ))}
              </div>
            </>
          )}

          {selectedGithubRepo && (
            <div className="selected-github-repository">
              <strong>Selected Repository</strong>

              <p>{selectedGithubRepo.full_name}</p>

              <span>
                {selectedGithubRepo.language || "Unknown language"}
                {" • "}
                {selectedGithubRepo.private ? "Private" : "Public"}
              </span>
            </div>
          )}
        </div>
      )}

      {source === "local" && (
        <div className="source-section">
          <label className="field-label">Project ZIP File</label>
          <input
            type="file"
            accept=".zip,application/zip"
            className="inpute file-input"
            onChange={(e) => setProjectFile(e.target.files[0])}
            required
          />
        </div>
      )}

      <form onSubmit={handleSubmit}>

        <input
          className="inpute"
          placeholder="Project Title"
          value={projectTitle}
          onChange={(e) =>
            setProjectTitle(e.target.value)
          }
          required
        />

        <textarea
          className="inpute textarea-input"
          placeholder="Description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          required
        />

        <input
          className="inpute"
          placeholder="Live demo URL"
          value={liveDemoUrl}
          onChange={(e) =>
            setLiveDemoUrl(e.target.value)
          }
        />

        <select
          className="inpute"
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
          required
        >
          <option value="">

            Select Project Category
          </option>
          <option value="web-development">
            Web Development
          </option>

          <option value="mobile-development">
            Mobile Development
          </option>

          <option value="game-development">
            Game Development
          </option>

          <option value="ai-ml">
            AI / ML
          </option>

          <option value="data-science">
            Data Science
          </option>

          <option value="cybersecurity">
            Cybersecurity
          </option>

          <option value="desktop-application">
            Desktop Application
          </option>

          <option value="iot">
            IoT
          </option>

          <option value="blockchain">
            Blockchain
          </option>

          <option value="cloud-devops">
            Cloud / DevOps
          </option>

          <option value="ui-ux">
            UI / UX
          </option>

          <option value="other">
            Other
          </option>

        </select>

        <div className="cover-image-field">

          <label className="field-label">
            Project Cover Image
          </label>

          <input
            type="file"
            accept="image/*"
            className="inpute file-input"
            onChange={(e) =>
              setCoverImage(e.target.files[0])
            }
          />

        </div>

        <div className="visibility-section">

          <p className="section-title">
            Visibility
          </p>

          <div className="radio-group">

            <label>
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={visibility === "public"}
                onChange={(e) =>
                  setVisibility(e.target.value)
                }
              />
              <span>Public</span>
            </label>

            <label>
              <input
                type="radio"
                name="visibility"
                value="connections"
                checked={visibility === "connections"}
                onChange={(e) =>
                  setVisibility(e.target.value)
                }
              />
              <span>Connections</span>
            </label>

            <label>
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={visibility === "private"}
                onChange={(e) =>
                  setVisibility(e.target.value)
                }
              />
              <span>Private</span>
            </label>

          </div>

        </div>

        <div className="development-section">

          <p className="section-title">
            Is this project currently under development?
          </p>

          <div className="radio-group">

            <label>
              <input
                type="radio"
                name="underDevelopment"
                value="yes"
                checked={underDevelopment === "yes"}
                onChange={(e) => {
                  setUnderDevelopment(e.target.value);
                  setWantContributors("");
                  setContributionType("");
                  setPaymentType("");
                  setFixedTask("");
                  setFixedPaymentAmount("");
                  setMilestones([]);
                }}
              />
              <span>Yes</span>
            </label>

            <label>
              <input
                type="radio"
                name="underDevelopment"
                value="no"
                checked={underDevelopment === "no"}
                onChange={(e) => {
                  setUnderDevelopment(e.target.value);
                  setWantContributors("");
                  setContributionType("");
                  setPaymentType("");
                  setFixedTask("");
                  setFixedPaymentAmount("");
                  setMilestones([]);
                }}
              />
              <span>No</span>
            </label>

          </div>

        </div>

        {underDevelopment === "yes" && (

          <div className="conditional-section">

            <p className="section-title">
              Are you looking for contributors?
            </p>

            <div className="radio-group">

              <label>
                <input
                  type="radio"
                  name="wantContributors"
                  value="yes"
                  checked={wantContributors === "yes"}
                  onChange={(e) => {
                    setWantContributors(e.target.value);
                    setContributionType("");
                    setPaymentType("");
                    setFixedTask("");
                    setFixedPaymentAmount("");
                    setMilestones([]);
                  }}
                />
                <span>Yes</span>
              </label>

              <label>
                <input
                  type="radio"
                  name="wantContributors"
                  value="no"
                  checked={wantContributors === "no"}
                  onChange={(e) => {
                    setWantContributors(e.target.value);
                    setContributionType("");
                    setPaymentType("");
                    setFixedTask("");
                    setFixedPaymentAmount("");
                    setMilestones([]);
                  }}
                />
                <span>No</span>
              </label>

            </div>

          </div>

        )}

        {underDevelopment === "yes" &&
          wantContributors === "yes" && (

            <div className="conditional-section">

              <p className="section-title">
                Contribution Type
              </p>

              <div className="radio-group">

                <label>
                  <input
                    type="radio"
                    name="contributionType"
                    value="unpaid"
                    checked={contributionType === "unpaid"}
                    onChange={(e) => {
                      setContributionType(e.target.value);
                      setPaymentType("");
                      setFixedTask("");
                      setFixedPaymentAmount("");
                      setMilestones([]);
                    }}
                  />
                  <span>Unpaid Contribution</span>
                </label>

                <label>
                  <input
                    type="radio"
                    name="contributionType"
                    value="paid"
                    checked={contributionType === "paid"}
                    onChange={(e) => {
                      setContributionType(e.target.value);
                      setPaymentType("");
                      setFixedTask("");
                      setFixedPaymentAmount("");
                      setMilestones([]);
                    }}
                  />
                  <span>Paid Contribution</span>
                </label>

              </div>

            </div>

          )}

        {underDevelopment === "yes" &&
          wantContributors === "yes" &&
          contributionType === "paid" && (

            <div className="conditional-section">

              <p className="section-title">
                Payment Type
              </p>

              <div className="radio-group">

                <label>
                  <input
                    type="radio"
                    name="paymentType"
                    value="fixed"
                    checked={paymentType === "fixed"}
                    onChange={(e) => {
                      setPaymentType(e.target.value);
                      setFixedTask("");
                      setFixedPaymentAmount("");
                      setMilestones([]);
                    }}
                  />
                  <span>Fixed Payment</span>
                </label>

                <label>
                  <input
                    type="radio"
                    name="paymentType"
                    value="milestone"
                    checked={paymentType === "milestone"}
                    onChange={(e) => {
                      setPaymentType(e.target.value);
                      setFixedTask("");
                      setFixedPaymentAmount("");
                      setMilestones([]);
                    }}
                  />
                  <span>Milestone Payment</span>
                </label>

              </div>

            </div>

          )}

        {underDevelopment === "yes" &&
          wantContributors === "yes" &&
          contributionType === "paid" &&
          paymentType === "fixed" && (

            <div className="conditional-section payment-section">

              <p className="section-title">
                Fixed Payment Details
              </p>

              <label className="field-label">
                Task / Work Required
              </label>

              <textarea
                className="inpute textarea-input"
                placeholder="Describe the task or work that the contributor needs to complete..."
                value={fixedTask}
                onChange={(e) =>
                  setFixedTask(e.target.value)
                }
                required
              />

              <label className="field-label">
                Fixed Payment Amount
              </label>

              <div className="amount-input-wrapper">

                <span className="currency-symbol">
                  ₹
                </span>

                <input
                  className="inpute amount-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter fixed payment amount"
                  value={fixedPaymentAmount}
                  onChange={(e) =>
                    setFixedPaymentAmount(e.target.value)
                  }
                  required
                />

              </div>

            </div>

          )}

        {underDevelopment === "yes" &&
          wantContributors === "yes" &&
          contributionType === "unpaid" && (

            <div className="conditional-section milestone-section">

              <p className="section-title">
                Project Milestones
              </p>

              <p className="section-description">
                Break the project work into clear milestones
                so contributors know what needs to be completed.
              </p>

              {milestones.map((milestone, index) => (

                <div
                  key={index}
                  className="milestone-card"
                >

                  <div className="milestone-header">

                    <h3>
                      Milestone {index + 1}
                    </h3>

                    <button
                      type="button"
                      className="remove-milestone"
                      onClick={() =>
                        removeMilestone(index)
                      }
                    >
                      Remove
                    </button>

                  </div>

                  <label className="field-label">
                    Milestone Title
                  </label>

                  <input
                    className="inpute"
                    placeholder="Example: Build Authentication"
                    value={milestone.title}
                    onChange={(e) =>
                      updateMilestone(
                        index,
                        "title",
                        e.target.value
                      )
                    }
                    required
                  />

                  <label className="field-label">
                    Task / Requirements
                  </label>

                  <textarea
                    className="inpute textarea-input"
                    placeholder="Describe what needs to be completed..."
                    value={milestone.task}
                    onChange={(e) =>
                      updateMilestone(
                        index,
                        "task",
                        e.target.value
                      )
                    }
                    required
                  />

                </div>

              ))}

              <button
                type="button"
                className="add-milestone"
                onClick={addMilestone}
              >
                + Add Milestone
              </button>

            </div>

          )}

        {underDevelopment === "yes" &&
          wantContributors === "yes" &&
          contributionType === "paid" &&
          paymentType === "milestone" && (

            <div className="conditional-section milestone-section">

              <p className="section-title">
                Paid Project Milestones
              </p>

              <p className="section-description">
                Create milestones with clear requirements
                and payment amounts.
              </p>

              {milestones.map((milestone, index) => (

                <div
                  key={index}
                  className="milestone-card"
                >

                  <div className="milestone-header">

                    <h3>
                      Milestone {index + 1}
                    </h3>

                    <button type="button" className="remove-milestone"
                      onClick={() =>
                        removeMilestone(index)
                      }
                    >
                      Remove
                    </button>
                  </div>

                  <label className="field-label">
                    Milestone Title
                  </label>

                  <input className="inpute" placeholder="Example: Build Authentication" value={milestone.title}
                    onChange={(e) =>
                      updateMilestone(
                        index,
                        "title",
                        e.target.value
                      )
                    }
                    required />

                  <label className="field-label">
                    Task / Requirements
                  </label>

                  <textarea className="inpute textarea-input" placeholder="Describe what needs to be completed..." value={milestone.task}
                    onChange={(e) =>
                      updateMilestone(
                        index,
                        "task",
                        e.target.value
                      )
                    }
                    required />

                  <label className="field-label">
                    Milestone Payment Amount
                  </label>

                  <div className="amount-input-wrapper">
                    <span className="currency-symbol"> ₹ </span>
                    <input className="inpute amount-input" type="number" min="0" step="0.01" placeholder="Enter milestone payment" value={milestone.amount}
                      onChange={(e) =>
                        updateMilestone(
                          index,
                          "amount",
                          e.target.value
                        )
                      } required />
                  </div>
                </div>
              ))}
              <button type="button" className="add-milestone" onClick={addMilestone}>+ Add Milestone
              </button>
            </div>
          )}
        <button className="submitpro" type="submit" >Submit</button>
      </form>
    </div>
  );
};

export default ProjectForm;