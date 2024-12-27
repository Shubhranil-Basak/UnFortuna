import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../config/firebase";
import "./ScratchCard.css";

const ScratchCard = () => {
  const [grid, setGrid] = useState([]);
  const [flippedTiles, setFlippedTiles] = useState([]);
  const [balance, setBalance] = useState(0);
  const [pool, setPoll] = useState(0);
  const [cardBought, setCardBought] = useState(false);
  const CARD_PRICE = 50; // Set the price for buying a card

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

        const gameRef = doc(db, "games", "scratch-card");
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

  const generateGrid = () => {
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
    const cardSet = new Set();

    while (cardSet.size < 25) {
      const randomSuit = suits[Math.floor(Math.random() * suits.length)];
      const randomValue = values[Math.floor(Math.random() * values.length)];
      cardSet.add(`${randomValue}${randomSuit}`);
    }

    const uniqueCards = Array.from(cardSet).map((card) => {
      const value = card.slice(0, -1); // Everything except the last character
      const suit = card.slice(-1); // Last character
      return { value, suit };
    });

    const newGrid = [];
    for (let i = 0; i < 5; i++) {
      newGrid.push(uniqueCards.slice(i * 5, i * 5 + 5));
    }

    setGrid(newGrid);
    setFlippedTiles([]);
  };

  const handleFlip = (row, col) => {
    if (flippedTiles.length >= 4) return; // Allow only 4 flips
    if (!cardBought) {
      alert("You need to buy a card first!");
      return;
    }

    const alreadyFlipped = flippedTiles.some(
      (tile) => tile.row === row && tile.col === col
    );
    if (alreadyFlipped) return;

    setFlippedTiles((prev) => [...prev, { row, col }]);
  };

  const handleBuyCard = async () => {
    if (balance < CARD_PRICE) {
      alert("Insufficient balance to buy a card!");
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const poolRef = doc(db, "games", "scratch-card");

    // Deduct the card price from balance and add it to the pool
    await updateDoc(userRef, { balance: increment(-CARD_PRICE) });
    await updateDoc(poolRef, { pool: increment(CARD_PRICE) });

    // Update local state
    setBalance((prev) => prev - CARD_PRICE);
    setPoll((prev) => prev + CARD_PRICE);
    setCardBought(true);
    generateGrid();
  };

  const handleBuyAgain = () => {
    setCardBought(false);
    setFlippedTiles([]);
  };

  return (
    <div>
      <p>
        Balance: ${balance} Coins
      </p>
      <p>
        Game Pool: ${pool} Coins
      </p>
      {!cardBought ? (
        <button onClick={handleBuyCard} className="btn btn-primary">
          Buy Card for ${CARD_PRICE} 
        </button>
      ) : (
        <div>
          <div className="scratch-card-grid">
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="scratch-card-row">
                {row.map((card, colIndex) => (
                  <div
                    key={colIndex}
                    className={`scratch-card-tile ${
                      flippedTiles.some(
                        (tile) => tile.row === rowIndex && tile.col === colIndex
                      )
                        ? "flipped"
                        : ""
                    }`}
                    onClick={() => handleFlip(rowIndex, colIndex)}
                  >
                    {flippedTiles.some(
                      (tile) => tile.row === rowIndex && tile.col === colIndex
                    ) ? (
                      <span
                        className={
                          card.suit === "♥" || card.suit === "♦" ? "red" : ""
                        }
                      >
                        {card.value} {card.suit}
                      </span>
                    ) : (
                      <span className="tile-back">?</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <button onClick={handleBuyAgain} className="btn btn-secondary">
            Buy Another Card
          </button>
        </div>
      )}
    </div>
  );
};

export default ScratchCard;
