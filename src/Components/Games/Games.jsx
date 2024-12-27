import React from "react";
import GamesCard from "./GamesCard";
import { Container, Row, Col } from "react-bootstrap";
import coin from "../../assets/coin.png";
import rps from "../../assets/rps.png";
import _7ud from "../../assets/7ud.png";
import mines from "../../assets/mines.png";
import cards from "../../assets/cards.png";
import slot_machine from "../../assets/slot-machine.png";
import HiLo from "../../assets/HiLo.png";
import scratch from "../../assets/scratch.png";
const Games = () => {
  return (
    <>
      <Container fluid className="game-section">
        <Container>
          <h1 className="game-heading">
            <strong>Games</strong>
          </h1>
          <Row className="justify-content-center" style={{ paddingBottom: "10px" }}>
            <Col xs={12} sm={6} md={4} lg={3} className="game-card">
              <GamesCard imgPath={coin} title="Coin Flip" />
            </Col>
            <Col xs={12} sm={6} md={4} lg={3} className="game-card">
              <GamesCard imgPath={rps} title="Rock Paper Scissors" />
            </Col>
            <Col xs={12} sm={6} md={4} lg={3} className="game-card">
              <GamesCard imgPath={_7ud} title="7 Up 7 Down" />
            </Col>
            <Col xs={12} sm={6} md={4} lg={3} className="game-card">
              <GamesCard imgPath={mines} title="mines" />
            </Col>
            <Col xs={12} sm={6} md={4} lg={3} className="game-card">
              <GamesCard imgPath={cards} title="3 cards" />
            </Col>
            <Col xs={12} sm={6} md={4} lg={3} className="game-card">
              <GamesCard imgPath={slot_machine} title="Wheel of Fortune" />
            </Col>
            <Col xs={12} sm={6} md={4} lg={3} className="game-card">
              <GamesCard imgPath={HiLo} title="Hi Lo" />
            </Col>
            <Col xs={12} sm={6} md={4} lg={3} className="game-card">
              <GamesCard imgPath={scratch} title="scratch" />
            </Col>
          </Row>
        </Container>
      </Container>
    </>
  );
  
};

export default Games;
