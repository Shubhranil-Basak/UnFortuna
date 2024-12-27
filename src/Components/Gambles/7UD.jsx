import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../config/firebase"; // Adjust the import according to your project structure

const _7UD = () => {
  const [result, setResult] = useState(null);
  const [betChoice, setBetChoice] = useState(null);
  const [betAmount, setBetAmount] = useState(10);
  const [balance, setBalance] = useState(0); // Balance will be fetched from Firestore
  const [pool, setPoll] = useState(0);

  const auth = getAuth();
  const user = auth.currentUser; // Get the currently logged-in user

  // Fetch the user's balance from Firestore when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid); // Firestore document for the user
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setBalance(userDoc.data().balance); // Assuming balance field is in the user's document
        } else {
          console.log("No such user document!");
        }

        const gameRef = doc(db, "games", "7UD");
        const gameDoc = await getDoc(gameRef);

        if (gameDoc.exists()) {
          setPoll(gameDoc.data().pool);
        } else {
          console.log("No such game document!");
        }
      }
    };

    fetchData();
  }, [user]);

  const rolldice = async () => {
    if (betAmount > balance) {
      alert("You don't have enough balance!");
      return;
    }

    if (pool < balance / 2) {
      alert(
        `The pool isn't enough to play this game! Please wait for the pool to be updated!`
      );
      return;
    }

    const outcome = Math.floor(Math.random() * 12 + 1);
    setResult(outcome);

    let newBalance = balance;

    const gameRef = doc(db, "games", "7UD");

    if (
      (betChoice === "Up" && outcome > 7) ||
      (betChoice === "Down" && outcome < 7)
    ) {
      // User won: double the bet amount and update balance
      newBalance += betAmount;
      await updateDoc(gameRef, { pool: increment(-betAmount) });
      alert(
        `You won! The result was ${outcome}. Your new balance is ${newBalance}`
      );
    } else if (betChoice === "Even" && outcome === 7) {
      // User won: triple the bet amount and update balance
      newBalance += betAmount * 2;
      await updateDoc(gameRef, { pool: increment(-betAmount * 2) });
      alert(
        `You won! The result was ${outcome}. Your new balance is ${newBalance}`
      );
    } else {
      // User lost: subtract the bet amount from balance
      newBalance -= betAmount;
      await updateDoc(gameRef, { pool: increment(betAmount) });
      alert(
        `You lost! The result was ${outcome}. Your new balance is ${newBalance}`
      );
    }

    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { balance: newBalance }, { merge: true }); // Merge to preserve other fields

    setBalance(newBalance);

    const gameDoc = await getDoc(gameRef);
    setPoll(gameDoc.data().pool);
  };

  return (
    <div>
      <p>Your balance: ${balance}</p>

      {/* Buttons for Heads and Tails */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          marginBottom: "50px",
        }}
      >
        <button
          style={{
            backgroundColor: betChoice === "Up" ? "green" : "#ffffff",
            color: betChoice === "Up" ? "#ffffff" : "#000000",
            border: "1px solid #ccc",
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "5px",
          }}
          onClick={() => setBetChoice("Up")}
        >
          Up
        </button>
        <button
          style={{
            backgroundColor: betChoice === "Down" ? "green" : "#ffffff",
            color: betChoice === "Down" ? "#ffffff" : "#000000",
            border: "1px solid #ccc",
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "5px",
          }}
          onClick={() => setBetChoice("Down")}
        >
          Down
        </button>
        <button
          style={{
            backgroundColor: betChoice === "Even" ? "green" : "#ffffff",
            color: betChoice === "Even" ? "#ffffff" : "#000000",
            border: "1px solid #ccc",
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "5px",
          }}
          onClick={() => setBetChoice("Even")}
        >
          Even
        </button>
        <button
          style={{
            backgroundColor: betChoice === null ? "gray" : "#ffffff",
            color: betChoice === null ? "#ffffff" : "#000000",
            border: "1px solid #ccc",
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "5px",
          }}
          onClick={() => setBetChoice(null)}
        >
          Reset
        </button>
      </div>

      {/* Bet amount input */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          marginTop: "10px",
          marginBottom: "30px",
        }}
      >
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(Number(e.target.value))}
          placeholder="Enter bet amount"
          min={10}
          step={10}
        />
      </div>
      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          marginTop: "10px",
          marginBottom: "30px",
        }}
      >
        <button onClick={(e) => setBetAmount(Number(10))}>10</button>
        <button onClick={(e) => setBetAmount(Number(50))}>50</button>
        <button onClick={(e) => setBetAmount(Number(100))}>100</button>

        <button onClick={(e) => setBetAmount(betAmount * 0.5)}>x0.5</button>
        <button onClick={(e) => setBetAmount(betAmount * 2)}>x2</button>
        <button onClick={(e) => setBetAmount(betAmount * 10)}>x10</button>
      </div>

      <div
        style={{
          justifyContent: "center",
          display: "flex",
          marginBottom: "20px",
        }}
      >
        <button
          id="play-button"
          onClick={rolldice}
          disabled={
            betAmount < 10 ||
            betChoice == null ||
            Math.floor(betAmount) != betAmount
          }
        >
          Roll the Dice
        </button>
      </div>
      {result && (
        <p
          style={{
            textAlign: "center",
            marginBottom: "50px",
            marginTop: "70px",
          }}
        >
          Value rolled: {result}
        </p>
      )}
    </div>
  );
};

export default _7UD;
