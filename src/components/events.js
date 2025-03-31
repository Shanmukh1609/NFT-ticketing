import React from "react";
import "./css/events.css";

const NFTEvents = () => {
  const events = [1, 2, 3, 4]; // Placeholder for event data

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">NFTix</h1>
        <div className="buttons">
          <button className="user-btn">User</button>
          <button className="organiser-btn">Organiser</button>
        </div>
      </header>

      <h2 className="events-title">EVENTS:</h2>

      <div className="events-container">
        {events.map((_, index) => (
          <div className="event-card" key={index}>
            <div className="event-content"></div>
            <button className="buy-btn">BUY</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NFTEvents;
