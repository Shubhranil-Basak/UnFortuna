import React, { useEffect, useState } from "react";
import { db } from "../../config/firebase"; // Import Firestore database
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

const Home = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [popularGames, setPopularGames] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Fetch users and their balances, sorted in descending order of balance
        const usersCollection = collection(db, "users");
        const gamesCollection = collection(db, "games");

        const leaderboardQuery = query(
          usersCollection,
          orderBy("balance", "desc"),
          limit(10)
        ); // Top 10 users

        const GameQuery = query(
          gamesCollection,
          orderBy("pool", "desc"),
          limit(10)
        );

        const user_querySnapshot = await getDocs(leaderboardQuery);
        const game_querySnapshot = await getDocs(GameQuery);

        const leaderboardData_user = user_querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(), // Spread document data (e.g., name and balance)
        }));

        const leaderboardData_game = game_querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(), // Spread document data (e.g., name and balance)
        }));

        setLeaderboard(leaderboardData_user);
        setPopularGames(leaderboardData_game);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <>
      <div
        style={{
          position: "fixed",
          right: "20px",
          top: "25%",
          width: "250px",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "10px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          zIndex: 1000,
        }}
      >
        <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
          Leaderboard
        </h3>
        {leaderboard.length > 0 ? (
          <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
            {leaderboard.map((user, index) => (
              <li
                key={user.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 0",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                  color: user.balance > 10000 ? "goldenrod" : "white",
                }}
              >
                <span>
                  {index + 1}. {user.username || "Anonymous"}
                </span>
                <span>{user.balance || 0} Coins</span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ textAlign: "center" }}>Loading...</p>
        )}
      </div>

      <div
        style={{
          position: "fixed",
          left: "20px",
          top: "25%",
          width: "250px",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "10px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          zIndex: 1000,
        }}
      >
        <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
          Popular Games
        </h3>
        {popularGames.length > 0 ? (
          <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
            {popularGames.map((games, index) => (
              <li
                key={games.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 0",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <span>
                  {index + 1}. {games.id || "Anonymous"}
                </span>
                <span>{games.pool || 0} Coins</span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ textAlign: "center" }}>Loading...</p>
        )}
      </div>
    </>
  );
};

export default Home;
