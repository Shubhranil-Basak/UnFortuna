import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../../config/firebase"; // Import Firebase auth object
import { doc, setDoc } from "firebase/firestore";

const Signup = () => {
  // State for form fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update the user's profile with the username
      await updateProfile(userCredential.user, { displayName: username });

      // Add user details to Firestore
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
        balance: 1000, // Starting balance for the user
      });

      alert("Account created successfully! You can now log in.");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ height: "87vh" }}
    >
      <Row>
        <Col>
          <div className="login-box p-4 shadow rounded bg-light">
            <h3 className="text-center mb-4">Sign Up</h3>
            <Form onSubmit={handleSignup}>
              {/* Username Field */}
              <Form.Group className="mb-3" controlId="username">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Form.Group>

              {/* Email Field */}
              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>

              {/* Password Field */}
              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>

              {/* Confirm Password Field */}
              <Form.Group className="mb-3" controlId="confirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Form.Group>

              {/* Error Message */}
              {error && <p className="text-danger">{error}</p>}

              {/* Submit Button */}
              <Button variant="primary" type="submit" className="w-100">
                Sign Up
              </Button>
            </Form>

            {/* Login Link */}
            <div className="text-center mt-3">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="text-primary">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Signup;
