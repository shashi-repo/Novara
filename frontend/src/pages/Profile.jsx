import { useEffect, useState } from "react";

import api from "../services/api";


const Profile = () => {

    const [user, setUser] = useState(null);

    const [name, setName] = useState("");

    const [loading, setLoading] = useState(true);

    const [message, setMessage] = useState("");


    useEffect(() => {

        const fetchProfile = async () => {

            try {

                const response =
                    await api.get("/user/profile");

                setUser(response.data.user);

                setName(response.data.user.name);

            } catch (error) {

                console.error(
                    "PROFILE ERROR:",
                    error
                );

            } finally {

                setLoading(false);

            }

        };


        fetchProfile();

    }, []);


    const handleUpdate = async (e) => {

        e.preventDefault();

        setMessage("");


        try {

            const response =
                await api.put(
                    "/user/profile",
                    { name }
                );


            setMessage(
                response.data.message
            );


            setUser({
                ...user,
                name
            });


            const storedUser =
                JSON.parse(
                    localStorage.getItem("user")
                );


            localStorage.setItem(
                "user",
                JSON.stringify({
                    ...storedUser,
                    name
                })
            );


        } catch (error) {

            console.error(
                "UPDATE PROFILE ERROR:",
                error
            );


            setMessage(
                error.response?.data?.message ||
                "Failed to update profile"
            );

        }

    };


    if (loading) {

        return <p>Loading profile...</p>;

    }


    return (

        <div>

            <h1>My Profile</h1>


            <form
                onSubmit={handleUpdate}
                className="profile-form"
            >

                <label>
                    Name
                </label>

                <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                        setName(e.target.value)
                    }
                />


                <label>
                    Email
                </label>

                <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                />


                <label>
                    Role
                </label>

                <input
                    type="text"
                    value={user?.role || ""}
                    disabled
                />


                <button type="submit">
                    Save Changes
                </button>


                {message && (
                    <p>{message}</p>
                )}

            </form>

        </div>

    );
};


export default Profile;