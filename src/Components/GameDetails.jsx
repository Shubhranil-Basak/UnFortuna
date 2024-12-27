import React from "react";
import { useParams } from "react-router-dom";
import CoinFlip from "./Gambles/CoinFlip";  // Import the game component
import RPS from "./Gambles/RPS";  // Import the game component
import _7UD from "./Gambles/7UD";
import SlotMachine from "./Gambles/SlotMachine";
import Mines from "./Gambles/Mines";
import _3Cards from "./Gambles/3Cards";
import  HiLoGame from "./Gambles/HiLo";
import Scratch from "./Gambles/Scratch";
import Wheel_ from "./Gambles/Wheel";

const GameDetails = () => {
  const { gameName } = useParams(); // Get the dynamic game name from the URL

  return (
    <div style={{color: "white"}}>
      <h1 style={{justifyContent: "center", display: "flex"}}>Playing {gameName.replace(/-/g, " ")}</h1>
      {/* Render the CoinFlip component if the gameName is 'coin-flip' */}
      {gameName === "coin-flip" && <CoinFlip />}
      {gameName === "rock-paper-scissors" && <RPS />}
      {gameName === "7-up-7-down" && <_7UD/>}
      {gameName === "slot-machine" && <SlotMachine />}
      {gameName === "mines" && <Mines />}
      {gameName === "3-cards" && <_3Cards />}
      {gameName === "hi-lo" && <HiLoGame />}
      {gameName === "scratch" && <Scratch />}
      {gameName === "wheel-of-fortune" && <Wheel_ />}
      {/* You can add more game components as needed */}
    </div>
  );
};

export default GameDetails;
