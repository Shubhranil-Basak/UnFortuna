import React from "react";
import { Card } from "react-bootstrap";
import "./GameCard.css"; // External CSS file for styling
import { useNavigate } from "react-router-dom";

const GameCard = (props) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/games/${props.title.replace(/\s+/g, "-").toLowerCase()}`); // Example: "Coin Flip" -> "coin-flip"
  };

  return (
    <div className="game-card-container" onClick={handleClick}>
      <Card className="game-card-view" >
        <Card.Img
          variant="top"
          src={props.imgPath}
          alt="card-img"
          style={{
            height: "100%",
            width: "100%",
            objectFit: "cover",
          }}
        />
        <div className="game-card-overlay">
          <div className="game-card-text">{props.title}</div>
        </div>
      </Card>
    </div>
  );
};

export default GameCard;
