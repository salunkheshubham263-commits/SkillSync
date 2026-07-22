import { useEffect, useRef, useState } from "react";
import axios from "axios";

const Complete_Profile = ({ setActiveForm }) => {
    const [preview, setPreview] = useState("");

    const fileInputRef = useRef(null);

    const handleImagePreview = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        // Remove old preview from memory
        if (preview) {
            URL.revokeObjectURL(preview);
        }

        const imageURL = URL.createObjectURL(file);

        setPreview(imageURL);
        setImage(file);
    };

    const clearImage = () => {
        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setPreview("");
        setImage(null);

        // Clear file input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const [skills, setSkills] = useState([]);
    const [search, setSearch] = useState("");
    const [selectSkills, setSelectSkills] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(false);
    const dropdownRef = useRef(null);
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await axios.get("http://192.168.0.104:5000/api/profile/skills");

                setSkills(response.data);
            } catch (err) {
                console.error("Error fetching skills: ", err);
                console.log(err.stack);
            }
        };

        fetchSkills();
    }, []);

    const filteredSkills = skills.filter(skill => skill.skill_name.toLowerCase().includes(search.toLowerCase()) && !selectSkills.includes(skill.skill_name));
    const addSkill = (skill) => {
        if (selectSkills.includes(skill)) return;

        setSelectSkills((prev) => [...prev, skill]);
        setSearch("");
        setOpenDropdown(false);
    };
    const removeSkills = (skill) => {
        setSelectSkills(prev =>
            prev.filter(item => item.skill_id !== skill.skill_id)
        );
    }

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpenDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const [image, setImage] = useState(null);
    const [college, setCollege] = useState("");
    const [course, setCourse] = useState("");
    const [courseYear, setCourseYear] = useState("");
    const [city, setCity] = useState("");
    const [bio, setBio] = useState("");
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append("profileImage", image);
        formData.append("college", college);
        formData.append("course", course);
        formData.append("courseYear", courseYear);
        formData.append("city", city);
        formData.append("bio", bio);
        formData.append("selectedSkills", JSON.stringify(selectSkills.map(skill => skill.skill_id)));

        try {
            console.log(localStorage.getItem("token"));
            const response = await axios.post("http://192.168.0.104:5000/api/profile/complete-profile", formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }
            });
            
            console.log(response.data);
        } catch (err) {
            console.log(err.response);
            console.log(err);
        }
    };

    return (
        <div className="sign-box" id="complete-profile" style={{ overflowY: "hidden" }}>
            <form method="post" onSubmit={handleSubmit}>
                <h1 className="form-h1" style={{ fontSize: "3vw" }}>
                    Complete Your Profile
                </h1>

                <div className="image-container">
                    <img className="image" src={preview || "profile_picture.png"} alt="Profile" />
                    {preview && (
                        <button type="button" className="remove-image" onClick={clearImage} >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}

                    <label htmlFor="upload">Upload Image</label>

                    <input ref={fileInputRef} type="file" id="upload" accept="image/jpeg,image/png,image/jpg,image/webp" onChange={handleImagePreview} />
                </div>

                <input className="inputes" type="text" placeholder="Enter college name" value={college} onChange={(e) => setCollege(e.target.value)} />
                <input className="inputes" type="text" placeholder="Enter your course" value={course} onChange={(e) => setCourse(e.target.value)} />
                <input className="inputes" type="text" placeholder="Enter your course year ex. 1st year" value={courseYear} onChange={(e) => setCourseYear(e.target.value)} />
                <input className="inputes" type="text" placeholder="Enter your city" value={city} onChange={(e) => setCity(e.target.value)} />
                <textarea className="inputes" placeholder="Enter a Bio optional" maxLength={60} value={bio} onChange={(e) => setBio(e.target.value)} />
                <div className="skills-dropdown" ref={dropdownRef}>
                    <input
                        className="skill-input"
                        type="text"
                        placeholder="Search skills..."
                        value={search}
                        onFocus={() => setOpenDropdown(true)}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {openDropdown && filteredSkills.length > 0 && (
                        <div className="skills-menu">
                            {filteredSkills.map((skill) => (
                                <button
                                    key={skill.skill_id}
                                    type="button"
                                    className="skill-option"
                                    onClick={() => addSkill(skill)}
                                >
                                    {skill.skill_name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="selected-skills">
                    {selectSkills.map((skill) => (
                        <button
                            key={skill.skill_id}
                            type="button"
                            className="skill-chip"
                            onClick={() => removeSkills(skill)}
                        >
                            {skill.skill_name} ✕
                        </button>
                    ))}
                </div>
                <div style={{ display: "flex", gap: "20px", width: "100%", justifyContent: "center", }} >
                    <button type="submit" className="login-btn">
                        Submit
                    </button>
                    <button type="button" onClick={() => setActiveForm("login")} className="login-btn" > Back </button>
                </div>
            </form>
        </div>
    );
};

export default Complete_Profile;