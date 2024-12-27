import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../config/firebase";

const Mines = () => {
  const [grid, setGrid] = useState([]);
  const [revealedTiles, setRevealedTiles] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [safeRevealed, setSafeRevealed] = useState(0);
  const [betMultiplier, setBetMultiplier] = useState(1); // Starts with 1x
  const [betAmount, setBetAmount] = useState(10); // Input bet amount
  const [balance, setBalance] = useState(0); // Balance will be fetched from Firestore
  const [pool, setPoll] = useState(0);
  const [winnings, setWinnings] = useState(0); // Stores the winnings after cash out
  const [gameInit, setGameInit] = useState(false); // Track if the game has started
  const totalMines = 10;
  const totalSafeTiles = 25 - totalMines; // Total tiles - mines

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

        const gameRef = doc(db, "games", "mines");
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

  // Initialize the game
  const initializeGame = () => {
    if (betAmount > balance) {
      alert("You don't have enough balance!");
      return;
    }

    if (pool <= balance / 2.5) {
      alert("The pool is too small!");
      return;
    }

    const newGrid = Array(5)
      .fill(null)
      .map(() => Array(5).fill("safe"));
    const minePositions = new Set();

    // Place mines randomly
    while (minePositions.size < totalMines) {
      const position = Math.floor(Math.random() * 25); // Random index from 0 to 24
      minePositions.add(position);
    }

    // Map mine positions to the grid
    for (const pos of minePositions) {
      const row = Math.floor(pos / 5);
      const col = pos % 5;
      newGrid[row][col] = "mine";
    }

    setGameInit(true);
    setGrid(newGrid);
    setRevealedTiles([]);
    setGameOver(false);
    setSafeRevealed(0);
    setBetMultiplier(1);
    setWinnings(0); // Reset winnings for a new game
  };

  // Handle tile click
  const handleTileClick = async (row, col) => {
    if (
      gameOver ||
      revealedTiles.some((tile) => tile.row === row && tile.col === col)
    ) {
      return; // Do nothing if game is over or tile is already revealed
    }

    let newBalance = balance;
    const gameRef = doc(db, "games", "mines");

    const newRevealedTiles = [...revealedTiles, { row, col }];
    setRevealedTiles(newRevealedTiles);

    if (grid[row][col] === "mine") {
      setGameOver(true);
      newBalance -= betAmount;
      await updateDoc(gameRef, { pool: increment(betAmount) });
      alert("You hit a mine! Game over. You lost your bet.");
      setGameInit(false);
    } else {
      const newSafeRevealed = safeRevealed + 1;
      setSafeRevealed(newSafeRevealed);

      // Update multiplier (example: 1.5x for each safe tile revealed)
      const newMultiplier = 1 + newSafeRevealed * 0.1;
      setBetMultiplier(newMultiplier);

      if (newSafeRevealed === totalSafeTiles) {
        setGameOver(true);
        handleCashOut();
        alert(`You win! You found all safe tiles.`);
      }
    }

    // Update the balance in Firestore
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { balance: newBalance }, { merge: true }); // Merge to preserve other fields

    setBalance(newBalance);

    const gameDoc = await getDoc(gameRef);
    setPoll(gameDoc.data().pool);
  };

  // Handle bet amount input
  const handleBetAmountChange = (event) => {
    setBetAmount(Number(event.target.value));
  };

  // Cash Out winnings
  const handleCashOut = async () => {
    if (!gameOver) {
      const calculatedWinnings = betAmount * betMultiplier;
      const newBalance = balance - betAmount + calculatedWinnings;

      const gameRef = doc(db, "games", "mines");

      await updateDoc(gameRef, {
        pool: increment(betAmount - calculatedWinnings),
      });

      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { balance: newBalance }, { merge: true });

      setBalance(newBalance);
      setWinnings(calculatedWinnings);
      setGameOver(true);

      const gameDoc = await getDoc(gameRef);
      setPoll(gameDoc.data().pool);

      alert(
        `You cashed out! Your winnings are: ${calculatedWinnings.toFixed(2)}`
      );
      setGameInit(false);
    }
  };

  // Render the grid
  const renderGrid = () => {
    return grid.map((row, rowIndex) => (
      <div key={rowIndex} style={{ display: "flex", justifyContent: "center" }}>
        {row.map((tile, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            onClick={() => handleTileClick(rowIndex, colIndex)}
            style={{
              width: "50px",
              height: "50px",
              border: "1px solid black",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: revealedTiles.some(
                (tile) => tile.row === rowIndex && tile.col === colIndex
              )
                ? grid[rowIndex][colIndex] === "mine"
                  ? "red"
                  : "lightgreen"
                : "white",
              cursor: gameOver ? "not-allowed" : "pointer",
            }}
          >
            {revealedTiles.some(
              (tile) => tile.row === rowIndex && tile.col === colIndex
            )
              ? grid[rowIndex][colIndex] === "mine"
                ? "💣"
                : "💎"
              : ""}
          </div>
        ))}
      </div>
    ));
  };

  return (
    <div>
      <p>Balance: ${balance}</p>
      <div style={{ justifyContent: "center", display: "flex" }}>
        <label>
          Enter Bet Amount:{" "}
          <input
            type="number"
            value={betAmount}
            onChange={handleBetAmountChange}
            disabled={gameInit} // Prevent changes mid-game
          />
        </label>
      </div>
      <div style={{ justifyContent: "center", display: "flex" }}>
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
        <button onClick={initializeGame} disabled={betAmount < 10} id="play-button">Start New Game</button>
      </div>
      <div style={{ marginTop: "20px" }}>{renderGrid()}</div>
      <p style={{ justifyContent: "center", display: "flex", marginTop: "10px"}}>Bet Multiplier: {betMultiplier.toFixed(2)}x</p>
      <div
        style={{
          justifyContent: "center",
          display: "flex",
          margin: "10px 10px",
        }}
      >
        <button
          onClick={handleCashOut}
          disabled={gameOver || revealedTiles.length === 0}
          id="cash-out-button"
          style={{ marginBottom: "10px" }}
        >
          Cash Out
        </button>
      </div>
    </div>
  );
};

export default Mines;
