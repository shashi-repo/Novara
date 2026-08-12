import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import api from "../services/api";


const Projects = () => {

    const [projects, setProjects] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        const fetchProjects = async () => {

            try {

                const response =
                    await api.get("/projects");

                setProjects(
                    response.data.projects
                );

            } catch (error) {

                console.error(
                    "PROJECTS ERROR:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load projects"
                );

            } finally {

                setLoading(false);

            }

        };


        fetchProjects();

    }, []);


    if (loading) {

        return <p>Loading projects...</p>;

    }


    return (

        <div>

            <div className="page-header">

                <div>

                    <h1>My Projects</h1>

                    <p>
                        Manage your Novara projects.
                    </p>

                </div>


                <Link
                    to="/projects/create"
                    className="primary-button"
                >
                    + New Project
                </Link>

            </div>


            {error && (
                <p>{error}</p>
            )}


            {projects.length === 0 ? (

                <div className="empty-state">

                    <h2>No projects yet</h2>

                    <p>
                        Create your first project
                        to begin your innovation journey.
                    </p>


                    <Link
                        to="/projects/create"
                        className="primary-button"
                    >
                        Create Project
                    </Link>

                </div>

            ) : (

                <div className="project-grid">

                    {projects.map((project) => (

                        <div
                            className="project-card"
                            key={project.id}
                        >

                            <h2>
                                {project.name}
                            </h2>


                            <p>
                                {project.description}
                            </p>


                            <span>
                                {project.status}
                            </span>


                            <Link
                                to={`/projects/${project.id}`}
                            >
                                View Project →
                            </Link>

                        </div>

                    ))}

                </div>

            )}

        </div>

    );
};


export default Projects;