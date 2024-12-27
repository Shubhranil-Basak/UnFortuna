import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { AiFillInstagram, AiFillGithub, AiFillLinkedin } from "react-icons/ai";

const Footer = () => {
  return (
    <>
    <main style={{ paddingBottom: "60px" }}></main>
    <footer className="bg-dark text-white" style={{position: "fixed", bottom: "0", width: "100%", height: "60px"}}>
      <Container>
        <Row>
          <Col md={4}>
            <p style={{marginTop: "15px"}}>&copy; {new Date().getFullYear()} Fortuna. &nbsp; All Rights Reserved.</p>
          </Col>

          <Col md={4} >
            <p style={{marginTop: "15px"}}> Designed and Developed by Shubhranil Basak</p>
          </Col>


          <Col md={4} className="text-md-end" style={{marginTop: "10px"}}>
            <a href="https://github.com/Shubhranil-Basak" className="text-white me-4" style={{ fontSize: "1.5rem" }} target="_blank" rel="noreferrer">
              <AiFillGithub/>
            </a>
            <a href="https://www.instagram.com/shubhranil_21/" className="text-white me-4" style={{ fontSize: "1.5rem" }} target="_blank" rel="noreferrer">
              <AiFillInstagram/>
            </a>
            <a href="https://www.linkedin.com/in/shubhranil-basak/" className="text-white me-4" style={{ fontSize: "1.5rem" }} target="_blank" rel="noreferrer">
              <AiFillLinkedin/>
            </a>
          </Col>
        </Row>
      </Container>
    </footer>
    </>
  );
};

export default Footer;
