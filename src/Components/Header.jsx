import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";

const Header = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        {/* Brand Name (on the left) */}
        <Navbar.Brand href="/home">Fortuna&trade;</Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {/* Navigation Links (aligned to the right) */}
          <Nav className="ms-auto">
            <Nav.Link href="/home">Home</Nav.Link>
            <Nav.Link href="/games">Games</Nav.Link>
            <Nav.Link href="/account">Account</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
