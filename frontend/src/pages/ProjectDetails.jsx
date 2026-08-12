import { useEffect, useState } from "react";

import {
    Link,
    useParams
} from "react-router-dom";

import api from "../services/api";


const ProjectDetails = () => {

    const { id } = useParams();


    const [project, setProject] =
        useState(null);

    const [versions, setVersions] =
        useState([]);

    const [loading, setLoading] =
        useState(true);


    useEffect(() => {

        const loadProject = async () => {

            try {

                const projectResponse =
                    await api.get(
                        `/projects/${id}`
                    );


                const versionsResponse =
                    await api.get(
                        `/projects/${id}/versions`
                    );


                setProject(
                    projectResponse.data.project
                );


                setVersions(
                    versionsResponse.data.versions
                );


            } catch (error) {

                console.error(
                    "PROJECT DETAILS ERROR:",
                    error
                );

            } finally {

                setLoading(false);

            }

        };


        loadProject();

    }, [id]);


    if (loading) {

        return <p>Loading project...</p>;

    }


    if (!project) {

        return <p>Project not found.</p>;

    }


    return (

        <div>

            <Link to="/projects">
                ← Back to Projects
            </Link>


            <h1>
                {project.name}
            </h1>


            <p>
                {project.description}
            </p>


            <p>
                Status: {project.status}
            </p>


            <hr />


            <h2>
                Version History
            </h2>


            {versions.length === 0 ? (

                <p>
                    No versions available.
                </p>

            ) : (

                <div>

                    {versions.map((version) => (

                        <div
                            className="version-card"
                            key={version.id}
                        >

                            <h3>
                                Version {version.version_number}
                            </h3>


                            <h3>
                                {version.title}
                            </h3>


                            <p>
                                {version.idea_description}
                            </p>


                            {version.change_summary && (

                                <p>
                                    <strong>
                                        Changes:
                                    </strong>{" "}
                                    {version.change_summary}
                                </p>

                            )}


                            <small>
                                Created:{" "}
                                {new Date(
                                    version.created_at
                                ).toLocaleString()}
                            </small>

                        </div>

                    ))}

                </div>

            )}

        </div>

    );
};


export default ProjectDetails;