import React, { useState, useEffect } from "react";
import "./index.css";
import head from "../../assets/head.png";
import tail from "../../assets/tail.png";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../config/firebase"; // Adjust the import according to your project structure

const CoinFlip = () => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result_, setResult] = useState("");
  const [balance, setBalance] = useState(0);
  const [betAmount, setBetAmount] = useState(10);
  const [betChoice, setBetChoice] = useState(null);
  const [pool, setPoll] = useState(null);

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

        const gameRef = doc(db, "games", "coin-flip");
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

  const flipCoin = async () => {
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

    const isHeads = Math.random() < 0.5; // true for heads, false for tails
    const result = isHeads ? "heads" : "tails"; // Convert boolean to "heads" or "tails"
    setIsFlipping(true);

    // Get the coin element
    const coinElement = document.querySelector(".coin");

    // Reset the coin's animation before applying a new one
    coinElement.style.animation = "none";

    // Allow the DOM to process the style change
    setTimeout(() => {
      if (isHeads) {
        coinElement.style.animation = "spin-heads 3s forwards";
      } else {
        coinElement.style.animation = "spin-tails 3s forwards";
      }
    }, 50); // Small delay to ensure animation resets

    let newBalance = balance;
    const gameRef = doc(db, "games", "coin-flip");

    setTimeout(async () => {
      setIsFlipping(false);

      // Update the result state
      setResult(result);

      // Compare betChoice and result (both are strings now)
      if (betChoice === result) {
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
      await setDoc(userRef, { balance: newBalance }, { merge: true });

      // Update the state with the new balance
      setBalance(newBalance);

      const gameDoc = await getDoc(gameRef);
      setPoll(gameDoc.data().pool);

      console.log("Result:", result, "Bet Choice:", betChoice);
    }, 3000);
  };

  return (
    <div className="container">
      <p>Your Balance: ${balance}</p>

      <div className="coin">
        <div className="heads">
          <img src={head} alt="Heads" />
        </div>
        <div className="tails">
          <img src={tail} alt="Tails" />
        </div>
      </div>

      <div style={{ justifyContent: "center", display: "flex" }}>
        <button
          style={{
            backgroundColor: betChoice === "heads" ? "green" : "#ffffff",
            color: betChoice === "heads" ? "#ffffff" : "#000000",
            border: "1px solid #ccc",
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "5px",
          }}
          onClick={() => setBetChoice("heads")}
        >
          Heads
        </button>
        <button
          style={{
            backgroundColor: betChoice === "tails" ? "green" : "#ffffff",
            color: betChoice === "tails" ? "#ffffff" : "#000000",
            border: "1px solid #ccc",
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "5px",
          }}
          onClick={() => setBetChoice("tails")}
        >
          Tails
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

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "150px",
          marginTop: "50px",
          gap: "30px",
        }}
      >
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(Number(e.target.value))}
          placeholder="Enter your bet amount"
          min={10}
        />

        <button
          className="buttons"
          id="play-button"
          onClick={flipCoin}
          disabled={
            isFlipping ||
            betAmount < 10 ||
            betChoice == null ||
            Math.floor(betAmount) != betAmount
          }
        >
          Flip Coin
        </button>
      </div>
    </div>
  );
};

export default CoinFlip;
