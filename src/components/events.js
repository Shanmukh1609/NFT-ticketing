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
        console.log(count);
        const size = Number(count);

        for (let i = 1; i <size+1; i++) {
          const event = await nft.getevent(i);
          eventsArray.push(event);
          console.log(event.uri);
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

  const verifyUser = async () => {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const acc = ethers.getAddress(accounts[0]);
      setAccount(acc);
  
      if (!acc&&!nft) {
        toast.error("Problem in wallet login");
        return;
      }
  
      try {
        const value = await nft.getBuyer(acc);
        if (value) {
          toast.success("Valid User");
          navigate('/user', { state: { acc } });
        } else {
          toast.error("No NFTs are minted");
        }
      } catch (contractError) {
        console.error("Contract call error:", contractError);
        toast.error("Error verifying user. Try again later.");
      }
    } catch (walletError) {
      console.error("Wallet error:", walletError);
      toast.error("Wallet connection failed");
    }
  };
  

  return (
    <>

      <div className="container">
        <header className="header">
          <h4 className="logo">NFTix</h4>
          <div className="buttons">
            <button className="user-btn" onClick={verifyUser}>User</button>
            <button className="organiser-btn" onClick={verifyOrganiser}>
              Organiser
            </button>
          </div>
        </header>

        <h2 className="events-title">EVENTS:</h2>

        <div className="events-container">
      {events.map((event, index) => (
        <div className="event-card" key={index}>
          <h3 className="event-name">{event.eventName}</h3>
          <img
            src={`https://gateway.pinata.cloud/ipfs/${event.uri}`}
            alt={event.eventName}
            className="event-image"
          />
          <button className="buy-btn" onClick={() => buyHandle(event)}>BUY</button>
        </div>
      ))}
      {selectedEvent && <BuyTicket event={selectedEvent} onClose={() => setSelectedEvent(null) } nft={nft} account={account} />}
    </div>
      </div>

      
      <Toaster />
    </>
  );
};

export default NFTEvents;
