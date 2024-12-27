import React, { useState, useEffect } from "react";
import { Wheel } from "react-custom-roulette";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../config/firebase"; // Adjust the import according to your project structure

const data = [
  { option: "0" },
  { option: "10" },
  { option: "125" },
  { option: "15" },
  { option: "better luck next time" },
  { option: "75" },
  { option: "45" },
  { option: "100" },
  { option: "0" },
  { option: "better luck next time" },
];

const Wheel_ = () => {
  const [mustSpin, setMustSpin] = useState(false); // Controls spinning
  const [prizeNumber, setPrizeNumber] = useState(0); // The selected prize index
  const [balance, setBalance] = useState(0); // Balance will be fetched from Firestore
  const [pool, setPoll] = useState(0);
  const [gameInit, setGameInit] = useState(false); // Track if the game has started

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

        const gameRef = doc(db, "games", "wheel");
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

  const handleSpinClick = () => {
    setGameInit(true); // Start spinning
    const newPrizeNumber = Math.floor(Math.random() * data.length); // Randomly select a prize
    setPrizeNumber(newPrizeNumber);

    if (50 > balance) {
      alert("You don't have enough balance!");
      return;
    }

    if (pool < balance / 2) {
      alert(
        `The pool isn't enough to play this game! Please wait for the pool to be updated!`
      );
      return;
    }

    setMustSpin(true); // Start spinning
  };

  const handleStop = async () => {
    let newBalance = balance;

    const gameRef = doc(db, "games", "wheel");

    if (data[prizeNumber].option === "better luck next time") {
      alert("Better luck next time!");
    } else {
      newBalance -= 50;
      newBalance += parseInt(data[prizeNumber].option);
      await updateDoc(gameRef, {
        pool: increment(50 - parseInt(data[prizeNumber].option)),
      });
      alert(
        `You won! The result was ${data[prizeNumber].option}. Your new balance is ${newBalance}`
      );
    }

    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { balance: newBalance }, { merge: true });

    setBalance(newBalance);

    const gameDoc = await getDoc(gameRef);
    setPoll(gameDoc.data().pool);

    setMustSpin(false); // Stop spinning
    setGameInit(false);
  };

  return (
    <>
      <p>Your balance: ${balance}</p>
      <div
        style={{
          textAlign: "center",
          marginTop: "10px",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={data}
          backgroundColors={["#3e3e3e", "#df3428"]}
          textColors={["#ffffff"]}
          onStopSpinning={handleStop} // Stop spinning after animation
          fontSize={10}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          onClick={handleSpinClick}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginBottom: "19px",
          }}
          disabled={gameInit}
        >
          Spin($50)
        </button>
      </div>
    </>
  );
};

export default Wheel_;
