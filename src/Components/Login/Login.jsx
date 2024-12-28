import React, { useState, useEffect } from "react";
import { Form, Button, Container } from "react-bootstrap";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase"; // Import Firebase auth object
import { useAuth } from "../../AuthContext";

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!"); // Replace with navigation or better feedback
      navigate("/home");
    } catch (error) {
      setError("Error: Invalid Credentials");
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ height: "87vh" }}
    >
      <div className="login-box p-4 shadow rounded bg-light">
        <h3 className="text-center mb-4">Login</h3>
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label style={{color: "black"}}>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label style={{color: "black"}}>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          {error && <p className="text-danger">{error}</p>}
          <Button variant="primary" type="submit" className="w-100">
            Login
          </Button>
          {/* Signup Link */}
          <div className="text-center mt-3">
            <p>
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary">
                Sign Up
              </Link>
            </p>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default Login;
