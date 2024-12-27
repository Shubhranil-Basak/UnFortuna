import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../config/firebase"; // Adjust the import according to your project structure
import scissor from "../../assets/scrissor.png";
import rock from "../../assets/rock.png";
import paper from "../../assets/paper.png";

const RPS = () => {
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

        const gameRef = doc(db, "games", "rock-paper-scissors");
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

  const options = ["Rock", "Paper", "Scissors"];

  const playGame = async () => {
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

    const randomChoice = options[Math.floor(Math.random() * options.length)];
    setResult(randomChoice);

    let newBalance = balance;

    const gameRef = doc(db, "games", "rock-paper-scissors");

    if (betChoice === randomChoice) {
      // Draw
      newBalance -= betAmount / 2;
      await updateDoc(gameRef, { pool: increment(betAmount / 2) });

      alert(`It's a draw! Your new balance is ${newBalance}`);
    } else if (
      (betChoice === "Rock" && randomChoice === "Scissors") ||
      (betChoice === "Paper" && randomChoice === "Rock") ||
      (betChoice === "Scissors" && randomChoice === "Paper")
    ) {
      // Win
      newBalance += betAmount;
      await updateDoc(gameRef, { pool: increment(-betAmount) });
      alert(`You win! Your new balance is ${newBalance}`);
    } else {
      // Lose
      newBalance -= betAmount;
      await updateDoc(gameRef, { pool: increment(betAmount) });
      alert(`You lose! Your new balance is ${newBalance}`);
    }

    // Update the balance in Firestore
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { balance: newBalance }, { merge: true }); // Merge to preserve other fields

    // Update the state with the new balance
    setBalance(newBalance);

    const gameDoc = await getDoc(gameRef);
    setPoll(gameDoc.data().pool);
  };

  return (
    <div>
      <p>Your balance: ${balance}</p>
      <p style={{ display: "flex", justifyContent: "center" }}>
        Device Choice{" "}
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            margin: "10px 0",
            textAlign: "center",
            width: "200px",
            height: "200px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            objectFit: "cover",
            backgroundColor: "#f2f2f2",
            
          }}
        >
          {result && (
            <img
              src={
                result === "Rock" ? rock : result === "Paper" ? paper : scissor
              }
              alt={result}
              style={{ width: "100px", height: "100px" }}
            />
          )}
          {!result && <p style={{color: "black"}}>No choice yet</p>}
        </div>
      </div>

      {/* Buttons for Heads and Tails */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          style={{
            backgroundColor: betChoice === "Rock" ? "green" : "#ffffff",
            color: betChoice === "Rock" ? "#ffffff" : "#000000",
            border: "1px solid #ccc",
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "5px",
          }}
          onClick={() => setBetChoice("Rock")}
        >
          Rock
        </button>
        <button
          style={{
            backgroundColor: betChoice === "Paper" ? "green" : "#ffffff",
            color: betChoice === "Paper" ? "#ffffff" : "#000000",
            border: "1px solid #ccc",
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "5px",
          }}
          onClick={() => setBetChoice("Paper")}
        >
          Paper
        </button>
        <button
          style={{
            backgroundColor: betChoice === "Scissors" ? "green" : "#ffffff",
            color: betChoice === "Scissors" ? "#ffffff" : "#000000",
            border: "1px solid #ccc",
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "5px",
          }}
          onClick={() => setBetChoice("Scissors")}
        >
          Scissors
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
        style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}
      >
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(Number(e.target.value))}
          placeholder="Enter your bet amount"
          min={10}
        />
      </div>

      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}
      >
        <button onClick={(e) => setBetAmount(Number(10))}>10</button>
        <button onClick={(e) => setBetAmount(Number(50))}>50</button>
        <button onClick={(e) => setBetAmount(Number(100))}>100</button>

        <button onClick={(e) => setBetAmount(betAmount * 0.5)}>x0.5</button>
        <button onClick={(e) => setBetAmount(betAmount * 2)}>x2</button>
        <button onClick={(e) => setBetAmount(betAmount * 10)}>x10</button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "50px" }}>
        {/* Display the result of the coin flip */}
        <button
          onClick={playGame}
          id="play-button"
          disabled={
            betAmount < 10 ||
            betChoice == null ||
            Math.floor(betAmount) != betAmount
          }
        >
          Play the hand
        </button>
      </div>
    </div>
  );
};

export default RPS;
