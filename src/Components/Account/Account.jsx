import React from "react";
import { useAuth } from "../../AuthContext";
import { auth } from "../../config/firebase";
import { signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // Import for navigation

const Account = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const navigate = useNavigate(); // Hook to navigate between pages

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = doc(db, "users", user.uid);
        const docSnapshot = await getDoc(userDoc);

        if (docSnapshot.exists()) {
          setBalance(docSnapshot.data().balance);
        } else {
          console.log("No user data found!");
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    alert("You have been logged out.");
    window.location.href = "/login";
  };

  return (
    <div className="account-container" style={{color: "white"}}>
      <h2>Account Details</h2>
      {user ? (
        <div>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Balance:</strong> {balance} Coins
          </p>
          <button
            onClick={() => navigate("/add-funds")}
            className="btn btn-primary"
          >
            Add Funds
          </button>
          <button onClick={handleLogout} className="btn btn-danger">
            Log Out
          </button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Account;
