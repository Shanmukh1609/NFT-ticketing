import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "./css/events.css";
import BuyTicket from "./buyTicket";

const NFTEvents = ({ nft }) => {
  const [events, setEvents] = useState([]);
  const [account, setAccount] = useState(null);
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null); // Track selected event for BuyTicket pop-up

  useEffect(() => {
    if (!nft) return;

    const loadEvents = async () => {
      try {
        const count = await nft.getEventCount();
        const eventsArray = [];

        for (let i = 0; i < count; i++) {
          const event = await nft.getevent(i);
          eventsArray.push(event);
        }

        setEvents(eventsArray);
      } catch (error) {
        console.error("Error loading events:", error);
      }
    };

    loadEvents();
  }, [nft]);

  const verifyOrganiser = async () => {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const acc = ethers.getAddress(accounts[0]);
      setAccount(acc);

      if (!acc) {
        toast.error("Problem in wallet login");
        return;
      }

      const walletAddress = await nft.getOrgDetails(acc);
      if (!walletAddress) {
        toast.error("No organiser record found.");
      } else {
        toast.success("Successfully Logged In");
        navigate("/organiser", {
          state: { acc },
        });
      }
    } catch (error) {
      console.error("Error verifying organiser:", error);
      toast.error("Error verifying organiser");
    }
  };

  // Handle clicking the BUY button
  const buyHandle = (event) => {
    setSelectedEvent(event); // Store selected event
  };

  // Close BuyTicket pop-up
  const closePopup = () => {
    setSelectedEvent(null);
  };

  return (
    <>
      <h1>Welcome to NFT Ticketing</h1>
      <div className="container">
        <header className="header">
          <h1 className="logo">NFTix</h1>
          <div className="buttons">
            <button className="user-btn">User</button>
            <button className="organiser-btn" onClick={verifyOrganiser}>
              Organiser
            </button>
          </div>
        </header>

        <h2 className="events-title">EVENTS:</h2>

        <div className="events-container">
          {events.map((event, index) => (
            <div className="event-card" key={index}>
              <div className="event-content">
                <h3 className="event-name">Event Name: {event.eventName}</h3>
                <p className="event-venue">{event.venue}</p>
                <p className="event-price">
                  <strong>Price: {event.ticketPrice.toString()}</strong>
                </p>
                <p className="event-tickets">
                  Tickets: {event.totalTickets.toString()}
                </p>
                <p className="event-price-cap">
                  Price Cap: {event.resalePrice.toString()}
                </p>
                <p className="event-description">{event.eventDescription}</p>
              </div>
              <button className="buy-btn" onClick={() => buyHandle(event)}>BUY</button>
            </div>
          ))}
        </div>
      </div>

      {/* Show BuyTicket component as a pop-up */}
      {selectedEvent && <BuyTicket event={selectedEvent} onClose={closePopup} />}

      <Toaster />
    </>
  );
};

export default NFTEvents;
