import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../config/firebase"; // Adjust the import according to your project structure

const HiLoGame = () => {
  const suits = ["♠", "♥", "♦", "♣"];
  const values = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
  ]; // Card values in order of ranking

  const [currentCard, setCurrentCard] = useState(null); // Current base card
  const [nextCard, setNextCard] = useState(null); // The next card to reveal
  const [guess, setGuess] = useState(""); // Player's guess (High or Low)
  const [message, setMessage] = useState(""); // Message for result
  const [guesses, setGuesses] = useState(0); // Number of guesses made
  const [gameOver, setGameOver] = useState(false); // Game over state
  const [balance, setBalance] = useState(0); // Balance will be fetched from Firestore
  const [pool, setPoll] = useState(0);
  const [betAmount, setBetAmount] = useState(10);
  const [gameInit, setGameInit] = useState(false);

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

        const gameRef = doc(db, "games", "hi-lo");
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

  // Function to draw a random card
  const drawCard = () => {
    const randomSuit = suits[Math.floor(Math.random() * suits.length)];
    const randomValue = values[Math.floor(Math.random() * values.length)];
    return { suit: randomSuit, value: randomValue };
  };

  // Function to start the game
  const startGame = () => {
    if (betAmount > balance) {
      alert("You don't have enough balance!");
      return;
    }

    if (pool <= balance / 2.5) {
      alert(
        `The pool isn't enough to play this game! Please wait for the pool to be updated!`
      );
      return;
    }

    setGameInit(true);

    const firstCard = drawCard(); // Draw the initial card
    setCurrentCard(firstCard);
    setNextCard(null);
    setGuess("");
    setMessage("");
    setGuesses(0);
    setGameOver(false);
  };

  // Function to handle guesses
  const makeGuess = async (playerGuess) => {
    if (gameOver || guesses >= 16) return;

    const newCard = drawCard();
    setNextCard(newCard);
    setGuess(playerGuess);

    const currentValueIndex = values.indexOf(currentCard.value);
    const nextValueIndex = values.indexOf(newCard.value);

    let newBalance = balance;

    const gameRef = doc(db, "games", "hi-lo");

    if (
      (playerGuess === "higher" && nextValueIndex > currentValueIndex) ||
      (playerGuess === "lower" && nextValueIndex < currentValueIndex)
    ) {
      newBalance += betAmount;
      await updateDoc(gameRef, { pool: increment(-betAmount) });
      setMessage("You guessed correctly! 🎉");
    } else if (nextValueIndex === currentValueIndex) {
      newBalance -= betAmount / 2;
      await updateDoc(gameRef, { pool: increment(betAmount / 2) });
      setMessage("It's a draw! Both cards are the same.");
    } else {
      newBalance -= betAmount;
      await updateDoc(gameRef, { pool: increment(betAmount) });
      setMessage("You guessed wrong! 💔");
    }

    setCurrentCard(newCard); // Update the current card to the new card
    setGuesses((prev) => prev + 1); // Increment the guess counter

    if (guesses + 1 >= 16) {
      setGameOver(true); // End game if 16 guesses are made
      setMessage("Game Over! You've reached the maximum number of guesses.");
    }

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { balance: newBalance }, { merge: true });

    setBalance(newBalance);

    const gameDoc = await getDoc(gameRef);
    setPoll(gameDoc.data().pool);
  };

  // Function to handle ending the game manually
  const endGame = () => {
    setGameInit(false);
    setGameOver(true);
    setMessage("You ended the game! Thanks for playing.");
  };

  return (
    <div>
      <p>Your Balance: ${balance}</p>

      {/* Bet amount input */}
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(Number(e.target.value))}
          placeholder="Enter your bet amount"
          min={10}
          step={10}
        />
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <button onClick={(e) => setBetAmount(Number(10))}>10</button>
        <button onClick={(e) => setBetAmount(Number(50))}>50</button>
        <button onClick={(e) => setBetAmount(Number(100))}>100</button>

        <button onClick={(e) => setBetAmount(betAmount * 0.5)}>x0.5</button>
        <button onClick={(e) => setBetAmount(betAmount * 2)}>x2</button>
        <button onClick={(e) => setBetAmount(betAmount * 10)}>x10</button>
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
      {!currentCard && <button onClick={startGame}>Start Game</button>}
      </div>
      {currentCard && !gameOver && (
        <div>
          <div
            style={{
              width: "100px",
              height: "150px",
              border: "2px solid black",
              borderRadius: "5px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#f9f9f9",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
              margin: "20px auto",
            }}
          >
            <p
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                margin: 0,
                color:
                  currentCard.suit === "♥" || currentCard.suit === "♦"
                    ? "red"
                    : "black",
              }}
            >
              {currentCard.value}
            </p>
            <p
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                margin: 0,
                color:
                  currentCard.suit === "♥" || currentCard.suit === "♦"
                    ? "red"
                    : "black",
              }}
            >
              {currentCard.suit}
            </p>
          </div>
          <div
            style={{ display: "flex", gap: "10px", justifyContent: "center" }}
          >
            <button id="high-low" onClick={() => makeGuess("higher")}>Higher</button>
            <button id="high-low" onClick={() => makeGuess("lower")}>Lower</button>
          </div>
          <p style={{ display: "flex", gap: "10px", justifyContent: "center" }}>Guesses Made: {guesses} / 16</p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button id="end-game" onClick={endGame}>End Game</button>
          </div>
          <p>{message}</p>
        </div>
      )}

      {gameOver &&
        ((<p>Game Over!</p>),
        (
          <div
            style={{ display: "flex", gap: "10px", justifyContent: "center" }}
          >
            <button onClick={startGame}>Play Again</button>
          </div>
        ))}
    </div>
  );
};

export default HiLoGame;
