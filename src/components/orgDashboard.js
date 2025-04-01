import { useState, useEffect } from "react";
import { useNavigate,useLocation } from "react-router-dom";
import { ethers } from "ethers";
import NFTminting from "../abis/NFTminting.json"; // Import ABI
import config from "../config.json"; // Ensure this has the contract address
import "./css/events.css";

const OrgDashboard = () => {
  const [events, setEvents] = useState([]);
  const [nft, setNft] = useState(null);
  const [organiser, setOrganiser] = useState(null);

  const location = useLocation();
  const { acc } = location.state || {}; // ✅ Extract acc
 
  const Navigate = useNavigate();

  useEffect(() => {
    const loadContract = async () => {
      if (!window.ethereum) {
        console.error("MetaMask is not installed!");
        return;
      }

      if (!acc) {
        console.log("No wallet address provided.");
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId); // Convert BigInt to Number

        console.log("Network Chain ID:", chainId);
        console.log("Configured Chains:", config);
        console.log("Selected Contract Address:", config[chainId]?.organiser?.address);

        if (!config[chainId]?.organiser?.address) {
          console.error("Contract address not found for this network!");
          return;
        }

        const contract = new ethers.Contract(
          config[chainId].organiser.address,
          NFTminting.abi,
          signer
        );

        console.log("Contract Instance:", contract);
        setNft(contract);
      } catch (error) {
        console.error("Error loading contract:", error);
      }
    };

    loadContract();
  }, []);

  useEffect(() => {
    if (!nft) {
      console.log("NFT contract is not loaded yet.");
      return;
    }

    if (!acc) {
      console.log("No wallet address provided.");
      return;
    }

    const loadEvents = async () => {
      try {
        console.log("Fetching organiser details for:", acc);
        const org = await nft.getOrgDetails(acc);
        setOrganiser(org);

        if (!org || !org.eventIds.length) {
          console.log("No event IDs found.");
          return;
        }

        const eventsArray = [];
        for (const eventId of org.eventIds) {
          console.log("Fetching event ID:", eventId);
          const event = await nft.getevent(eventId);
          eventsArray.push(event);
        }

        console.log("Fetched Events:", eventsArray);
        setEvents(eventsArray);
      } catch (error) {
        console.error("Error loading events:", error);
      }
    };

    loadEvents();
  }, [nft, acc]);
 
  const createTicket= async()=>{
    Navigate('/addEvent',{state:{acc}});
  }
 
  return (
    <>
      <h2 className="events-title">Organiser Dashboard</h2>
    
      <p className="wallet-addr">Wallet Address: {acc}</p>
      
      <button className="create-event" onClick={createTicket}>Create Event</button>
      <div className="events-container">
          {events.map((event, index) => (
            <div className="event-card" key={index}>
              <div className="event-content">
                <h3 className="event-name">Event Name: {event.eventName}</h3>
                <p className="event-venue">{event.venue}</p>
                <p className="event-price">
                  <strong>Price: {event.ticketPrice.toString()}</strong>
                </p>
                <p className="event-price">
                  <strong>Tickets Sold: {event.ticketsSold.toString()}</strong>
                </p>
                <p className="event-tickets">Tickets: {event.totalTickets.toString()}</p>
                <p className="event-price-cap">Price Cap: {event.resalePrice.toString()}</p>
                <p className="event-description">{event.eventDescription}</p>
              </div>
              <button className="buy-btn">VIEW TICKETS</button>
            </div>
          ))}
        </div>
    </>
  );
};

export default OrgDashboard;
