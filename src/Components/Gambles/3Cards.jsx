import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../config/firebase";

const _3Cards = () => {
  const suits = ["♠", "♥", "♦", "♣"];
  const values = [
    "A",
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
  ];

  const [result, setResult] = useState([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [gameResult, setGameResult] = useState(""); // "Win", "Lose", or "Draw"
  const [cardsRevealed, setCardsRevealed] = useState(false);
  const [balance, setBalance] = useState(0);
  const [pool, setPoll] = useState(0);
  const [betAmount, setBetAmount] = useState(10);
  const [gameInit, setGameInit] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

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

        const gameRef = doc(db, "games", "3cards");
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

  const select = () => {
    setGameInit(true);
    if (betAmount > balance) {
      alert("You don't have enough balance!");
      return;
    }

    if (pool <= balance / 2.5) {
      alert("The pool is too small!");
      return;
    }

    const cardSet = new Set();

    while (cardSet.size < 3) {
      const randomSuit = suits[Math.floor(Math.random() * suits.length)];
      const randomValue = values[Math.floor(Math.random() * values.length)];
      const card = `${randomValue}${randomSuit}`;
      cardSet.add(card);
    }

    const uniqueCards = Array.from(cardSet).map((card) => {
      const cardValue = card.slice(0, -1); // Everything except the last character is the value
      const cardSuit = card.slice(-1); // The last character is the suit
      return { value: cardValue, suit: cardSuit };
    });

    setResult(uniqueCards);
    setSelectedCardIndex(null);
    setGameResult("");
    setCardsRevealed(false);
  };

  const handleCardClick = async (index) => {
    if (cardsRevealed) return; // Prevent multiple clicks after revealing
    setSelectedCardIndex(index);
    setCardsRevealed(true);

    // Determine the card with the highest value
    const getCardValueRank = (value) => {
      return values.indexOf(value);
    };

    let newBalance = balance;
    const gameRef = doc(db, "games", "3cards");

    const maxRank = Math.max(
      ...result.map((card) => getCardValueRank(card.value))
    );

    const selectedCardRank = getCardValueRank(result[index].value);

    // Check win, draw, or lose conditions
    const isDraw =
      result.filter((card) => getCardValueRank(card.value) === maxRank).length >
        1 && selectedCardRank === maxRank;

    if (selectedCardRank === maxRank) {
      if (isDraw) {
        setGameResult("Draw");
        newBalance -= betAmount / 2;
        await updateDoc(gameRef, { pool: increment(betAmount / 2) });
      } else {
        setGameResult("Win");
        newBalance += betAmount;
        await updateDoc(gameRef, { pool: increment(-betAmount) });
      }
    } else {
      setGameResult("Lose");
      newBalance -= betAmount;
      await updateDoc(gameRef, { pool: increment(betAmount) });
    }

    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { balance: newBalance }, { merge: true }); // Merge to preserve other fields

    setBalance(newBalance);

    const gameDoc = await getDoc(gameRef);
    setPoll(gameDoc.data().pool);
  };

  return (
    <div>
      <p>Balance: ${balance}</p>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <label>
          Enter Bet Amount:{" "}
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            min={10}
            disabled={gameInit}
          />
        </label>
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <button onClick={(e) => setBetAmount(Number(10))} disabled={gameInit}>
          10
        </button>
        <button onClick={(e) => setBetAmount(Number(50))} disabled={gameInit}>
          50
        </button>
        <button onClick={(e) => setBetAmount(Number(100))} disabled={gameInit}>
          100
        </button>

        <button
          onClick={(e) => setBetAmount(betAmount * 0.5)}
          disabled={gameInit}
        >
          x0.5
        </button>
        <button
          onClick={(e) => setBetAmount(betAmount * 2)}
          disabled={gameInit}
        >
          x2
        </button>
        <button
          onClick={(e) => setBetAmount(betAmount * 10)}
          disabled={gameInit}
        >
          x10
        </button>
      </div>

      <div style={{ justifyContent: "center", display: "flex" }}>
        <button onClick={select} style={{ marginBottom: "20px" }} id="play-button">
          Start Game
        </button>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        {result.map((card, index) => (
          <div
            key={index}
            onClick={() => handleCardClick(index)}
            style={{
              width: "100px",
              height: "150px",
              border: "2px solid black",
              borderRadius: "5px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: cardsRevealed ? "#f9f9f9" : "#ccc", // Show back or front of card
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
              cursor: cardsRevealed ? "default" : "pointer",
            }}
          >
            {cardsRevealed ? (
              <>
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color:
                      card.suit === "♥" || card.suit === "♦" ? "red" : "black",
                  }}
                >
                  {card.value}
                </p>
                <p
                  style={{
                    fontSize: "24px",
                    color:
                      card.suit === "♥" || card.suit === "♦" ? "red" : "black",
                  }}
                >
                  {card.suit}
                </p>
              </>
            ) : (
              <p style={{ fontSize: "18px", fontWeight: "bold" }}>?</p> // Placeholder for card back
            )}
          </div>
        ))}
      </div>
      {
        <div style={{ marginTop: "20px", marginBottom: "20px"}}>
          <h3 style={{display: "flex", justifyContent: "center"}}>
            {gameResult === "Win"
              ? "You Win!"
              : gameResult === "Draw"
              ? "It's a Draw!"
              : gameResult === "Lose"
              ? "You Lose!"
              : "You haven't chosen a card yet."}
          </h3>
          <br></br>
          <p style={{display: "flex", justifyContent: "center", marginBottom: "50px"}}>
            {gameResult === "Win"
              ? "You chose the card with the highest value!"
              : gameResult === "Draw"
              ? "Two cards had the same highest value!"
              : gameResult === "Lose"
              ? "You didn't choose the card withe the highest value"
              : "Choose a card to play."}
          </p>
        </div>
      }
    </div>
  );
};

export default _3Cards;
