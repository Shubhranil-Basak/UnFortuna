import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from "react-router-dom";
import "./style.css";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import Header from "./Components/Header";
import Footer from "./Components/Footer";
import GameDetails from "./Components/GameDetails"

import Account from "./Components/Account/Account"
import Games from "./Components/Games/Games"
import Home from "./Components/Home/Home"
import Login from "./Components/Login/Login"
import Trading from "./Components/Trading/Trading"
import Signup from "./Components/Signup/Signup"


import AddFunds from "./Components/Account/AddFunds";


function App() {

  return (
    <>
    <Header/>
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="/home" element={<Home/>} />
        <Route path="/games" element={<Games/>} />
        <Route path="/trading" element={<Trading/>} />
        <Route path="/account" element={<Account/>} />
        <Route path="/add-funds" element={<AddFunds/>} />
        <Route path="*" element={<h1>Page not found</h1>} />

        <Route path="/games/:gameName" element={<GameDetails/>} />

      </Routes>
    </Router>
    <Footer/>
    </>
  )
}

export default App
