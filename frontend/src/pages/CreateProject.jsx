import { useState } from "react";

import {
    useNavigate
} from "react-router-dom";

import api from "../services/api";


const CreateProject = () => {

    const navigate = useNavigate();


    const [name, setName] = useState("");

    const [description, setDescription] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");


        if (!name || !description) {

            setError(
                "Project name and description are required"
            );

            return;

        }


        try {

            setLoading(true);


            const response =
                await api.post(
                    "/projects",
                    {
                        name,
                        description
                    }
                );


            navigate(
                `/projects/${response.data.projectId}`
            );


        } catch (error) {

            console.error(
                "CREATE PROJECT ERROR:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Failed to create project"
            );


        } finally {

            setLoading(false);

        }

    };


    return (

        <div>

            <h1>Create Project</h1>


            <form
                onSubmit={handleSubmit}
                className="project-form"
            >

                <label>
                    Project Name
                </label>

                <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                        setName(e.target.value)
                    }
                    placeholder="Enter project name"
                />


                <label>
                    Project Description
                </label>

                <textarea
                    value={description}
                    onChange={(e) =>
                        setDescription(
                            e.target.value
                        )
                    }
                    placeholder="Describe your project idea..."
                    rows="8"
                />


                {error && (
                    <p>{error}</p>
                )}


                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Creating..."
                        : "Create Project"}
                </button>

            </form>

        </div>

    );
};


export default CreateProject;