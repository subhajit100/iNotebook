import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = (props) => {
  const host = "http://localhost:5000";
  // useNavigate hook is used from react-router-dom for routing to different url's.
  let navigate = useNavigate();
  const [userCreds, setUserCreds] = useState({
    email: "",
    password: "",
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Api call for user login
    const url = `${host}/api/auth/login`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userCreds.email,
        password: userCreds.password,
      }),
    });
    const json = await response.json();
    setUserCreds({ email: "", password: "" });
    console.log(json);
    if (json.success) {
      // Save the auth token and navigate
      // saving part to localstorage
      localStorage.setItem("token", json.authToken);
      props.showAlert("Logged In Successfully", "success");
      // navigate to home route
      navigate("/");
    } else {
      props.showAlert("invalid credentials", "danger");
    }
  };

  const handleChange = (event) => {
    setUserCreds({ ...userCreds, [event.target.name]: event.target.value });
  };

  return (
    <div className="container my-3">
    <h2>Login to continue using iNotebook</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            aria-describedby="emailHelp"
            onChange={handleChange}
            value={userCreds.email}
          />
          <div id="emailHelp" className="form-text">
            We'll never share your email with anyone else.
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            onChange={handleChange}
            value={userCreds.password}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Login;
