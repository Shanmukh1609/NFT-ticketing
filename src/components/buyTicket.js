import React, { useState ,useEffect} from "react";
import "./css/buyTicket.css";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import toast, { Toaster } from "react-hot-toast";

const BuyTicket = ({ event, onClose, nft }) => {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [resaleTickets,setResaleTickets] = useState(null);
  const [history, setHistory] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);



  useEffect(()=>{
 
   const resaleOfTickets= async ()=>
    { 
      
      try{
  
    
   
    let tkts = [];
    const historyData = {};

    for (const tid of event.ticketIds){
      const reticket = await nft.getTicket(tid);
      if(reticket.isAvailablebid)
       {  const owner = await nft.ownerOf(tid);
        console.log(owner);
        const ticket = {
          ticketId:reticket.ticketId,
          seatNum:reticket.seatNum,
          Price:reticket.Price,
          Owner:owner
        }
        
        tkts.push(ticket); 
        const transferEvents = await nft.queryFilter(nft.filters.TransferNFTresale(null, null, tid));
        console.log(transferEvents.map(event => event.args));
        const owners = transferEvents.map(event => event.args.from);
        const prices = transferEvents.map(event => ethers.formatEther(event.args.price)); // Convert from wei to ETH

        historyData[tid] = { owners, prices };
      }
    }
    setResaleTickets(tkts);
    console.log(historyData);
        setHistory(historyData);
  }
  catch(error){
    console.log("There is an error", error);
  }
}

resaleOfTickets();
  },[]);

  const buyHandlerOrg = async () => {
    try {
      if (!nft) {
        toast.error("Problem in loading the SC");
        return;
      }

      // Check if Metamask is installed
      if (!window.ethereum) {
        toast.error("Please install Metamask to continue!");
        return;
      }
      console.log("fjg");
      // Request account from Metamask
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const acc = accounts[0]; // Correct way to get the address
      setAccount(acc);
      console.log(event);

      const ticketPriceInETH = ethers.parseEther(event.ticketPrice.toString());

      // Send ETH along with the transaction
      const tx = await nft.createNFTticket(acc, event.eventId, {
        from: acc, // Ensures transaction is from the buyer
        value: ticketPriceInETH, // Sends ETH from the user’s wallet
      });

      await tx.wait();
      toast.success("Ticket successfully purchased!");
    } catch (error) {
      toast.error("Problem in buying the NFT");
      console.error("Error:", error);
    }
  };
  
  const buyResaleTicket = async (ticket) => {
    try {
        if (!ticket) {
            console.log("Error in ticket");
            toast.error("Invalid ticket data!");
            return;
        }

        // Get current user (buyer) wallet address
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const buyer = accounts[0]; // Buyer Address
        
        // Get the current owner of the ticket
        const ticketOwner = await nft.ownerOf(ticket.ticketId);
        
        if (buyer.toLowerCase() === ticketOwner.toLowerCase()) {
            toast.error("You already own this ticket!");
            return;
        }

        const ticketPriceInETH = ticket.Price;

        // Ensure the owner has approved this transfer
        const approvedAddress = await nft.approveForResale(buyer,ticket.ticketId);
        console.log(approvedAddress);
        // if (approvedAddress.toLowerCase() !== buyer.toLowerCase()) {
        //     toast.error("Ticket owner must approve the transfer!");
        //     return;
        // }

        // Execute the transfer transaction
        const tx = await nft.transferNFT(buyer, ticket.ticketId, {
            value: ticketPriceInETH, // Sends ETH to the contract
        });

        await tx.wait();
        toast.success("Ticket successfully purchased!");
    } catch (error) {
        console.error("Resale Error:", error);
        toast.error(`Resale failed: ${error.reason || "Unknown Error"}`);
    }
};

const handleShowHistory = (ticket) => {
  setSelectedTicket(ticket);
  setShowHistory(true);
};


  if (!event) return null; // Prevents errors if no event is selected

  return (
    <div className="popup">
    <div className="popup-inner">
      <button className="close-btn" onClick={onClose}>✖</button>
      <h1 className="popup-event-title">{event.eventName}</h1>
      <div className="popup-content">
        {/* LEFT COLUMN - Event Image & Details */}
        <div className="popup-left">
          <img
            src={`https://gateway.pinata.cloud/ipfs/${event.uri}`}
            alt={event.eventName}
            className="popup-event-image"
          />
          
          <p className="popup-event-details">
         <span> <strong>Org Address:</strong>{event.orgAddress}</span>
         <span> <strong>Venue:</strong> {event.venue} </span>
         <span> <strong>Tickets Available:</strong> {event.totalTickets - event.ticketsSold} </span>
         <span> <strong>Description:</strong>{event.eventDescription} </span>

          </p>
          
        </div>

        {/* RIGHT COLUMN - Prices */}
        <div className="popup-right">
          <h3 className="pop-right-head">Organiser</h3>
             <div  className="resale-ticket">
               
                <p>Price: {event.ticketPrice} ETH</p>
                <button className="resale-buy-btn" onClick={buyHandlerOrg}>BUY</button>
              </div>

          <h3 className="pop-right-head">Resale Tickets</h3>
          <div className="resale-tickets">
            {resaleTickets?.map((ticket, i) => (
              <div key={i} className="resale-ticket">
                {/* <p>Seller: {ticket.seller}</p> */}
                <p>Owner:<strong> {ticket.Owner ? `${ticket.Owner.slice(0, 10)}...${ticket.Owner.slice(-10)}` : "Loading..."}</strong></p>
                <p>Price: <strong>{ethers.formatEther(ticket.Price)} ETH</strong></p>
                <p>Seat No:<strong>{ticket.seatNum}</strong></p>
                
                <button className="resale-buy-btn" onClick={()=>buyResaleTicket(ticket)}>BUY</button>
                <button className="history-button" onClick={() => handleShowHistory(ticket)}>
                <strong>History</strong>  
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    
     {/* Pop-up for Ownership History */}
     {showHistory && selectedTicket && (
        <div className="popup">
          <div className="popup-inner-owner">
            <div className="popup-header">
              <h2>Ownership History</h2>
              <button className="close-btn" onClick={() => setShowHistory(false)}>X</button>
            </div>
            <div className="history-list">
            {history[selectedTicket.ticketId]?.owners.length > 0 ? (
          history[selectedTicket.ticketId].owners.map((owner, index) => (
            <p className="showOwners" key={index}>
              <strong>Previous Owner:</strong> {owner} <br />
              <strong>Price Bought:</strong> {history[selectedTicket.ticketId].prices[index]} ETH
            </p>
          ))
        ) : (
          <p>No previous owners found</p>
        )}
            </div>
          </div>
        </div>
      )}

  </div>
);
};

export default BuyTicket;
