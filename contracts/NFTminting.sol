//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";


contract NFTminting is  ERC721URIStorage{

    
    //Define a Ticket
    struct ticket{
    uint256 ticketId;
    uint256 eventId;
    uint256 seatNum;
    uint256 Price;
    bool isAvailablebid;
  }

    //define Event
    struct Event{
        address orgAddress;
        uint256 eventId;
        string eventName;
        string eventDescription;
        string venue;
        string uri;
        uint256 ticketPrice;
        uint256 totalTickets;
        uint256 ticketsSold;
        uint256 resalePrice;
        uint256 [] ticketIds;
    }

  //struct defintition for organisers
  struct organiser{
    address orgAddress;
    uint256 []eventIds;
    string logo;
    string orgName;
  }

  //Defining the Buyer

  struct buyer{
    address buyerAddress;
    uint256 []ticketIds;
    uint256 []pastEventIds;
  }

   mapping(address => organiser) private organisers; 
   mapping(uint256 => Event) private events;
   mapping(uint256 => ticket) private tickets;
   mapping(address => buyer) private buyers;

    uint256 private eventId = 0;
    uint256 public ticketId = 0;

    constructor() ERC721("NFT_MINTING", "NFTM") {
       
    }

    event newEventCreated(uint256 eventId, string eventName, string eventDescription, string venue, uint256 ticketPrice, uint256 totalTickets, uint256 resalePrice);
    event newTicketCreated(uint256 ticketId, uint256 eventId, uint256 seatNum, uint256 Price,uint256 ntickets);
  
   modifier isOrganiser(address addr){
     require(organisers[addr].orgAddress == addr, "You are not an organiser");
     _;
   }

   modifier isEvent(uint256 id){
        require(events[id].eventId == id, "Event does not exist");
        _;
   }

   function newOrganiser(address addr) public  {
       require(organisers[addr].orgAddress != addr, "Already an Organiser");
        
       organiser memory neworg;
       neworg.orgAddress = addr;
       organisers[addr] = neworg;
   }

   function updateOrgDetails(address addr,string memory _logo, string memory _orgName) public isOrganiser(addr){
       organisers[addr].logo = _logo;
       organisers[addr].orgName = _orgName;
   }

   function getOrgDetails(address addr) public view isOrganiser(addr) returns(organiser memory){
       return organisers[addr];
   }


   function newEvent(address addr ,string memory _eventName, string memory uri,string memory _eventDescription, string memory _venue, uint256 _ticketPrice, uint256 _totalTickets, uint256 _resalePrice) public  isOrganiser(addr){
       eventId++;
       Event memory newevent;

      
       newevent.orgAddress = addr;
       newevent.eventId = eventId; 
       newevent.eventName = _eventName;
       newevent.eventDescription = _eventDescription; 
       newevent.venue = _venue;
       newevent.uri = uri;
       newevent.ticketPrice = _ticketPrice; 
       newevent.totalTickets = _totalTickets; 
       newevent.resalePrice = _resalePrice;
       newevent.ticketsSold = 0;

       events[eventId] = newevent;
       organisers[addr].eventIds.push(eventId);


    emit newEventCreated(eventId, _eventName, _eventDescription, _venue, _ticketPrice, _totalTickets, _resalePrice);
       
   }

function getevent(uint256 _eventId)  public view  returns (Event memory) {
    return events[_eventId];
}

  function getEventCount() public view returns(uint256){
    return eventId;
}
event DebugTicketCount(uint256 ticketId);

function getTicketCount() public  returns (uint256) {
    emit DebugTicketCount(ticketId);  // Debugging log
    return ticketId;
}


    function mintNFT(uint256 _ticketId,uint256  _eventId, address to) public {
        // require(events[_eventId].totalTickets > events[_eventId].ticketsSold, "Tickets are sold out");
        _mint(to, _ticketId);
        _setTokenURI(_ticketId, events[_eventId].uri);
    }

    function createNFTticket(address addr, uint256 _eventId) public payable  isEvent(_eventId){
    
        require(events[_eventId].totalTickets >= events[_eventId].ticketsSold, "Tickets are sold out");
        require(events[_eventId].ticketPrice <= msg.value, "Price is too low");
         
 (bool success, ) = payable(events[_eventId].orgAddress).call{value: events[_eventId].ticketPrice}("");
require(success, "Transfer failed");

        ticketId++;
        ticket memory newTicket;
        newTicket.ticketId = ticketId;
        newTicket.eventId = _eventId;
        
        newTicket.Price = events[_eventId].ticketPrice;
        newTicket.isAvailablebid = false;

       uint256 num= events[_eventId].ticketIds.length;
       newTicket.seatNum = num+1;

        tickets[ticketId] = newTicket;
        events[_eventId].ticketIds.push(ticketId);

       
        events[_eventId].ticketsSold++;
        
        mintNFT(ticketId, _eventId,addr);

        if(buyers[addr].buyerAddress!=addr){
           buyer memory customer;
      customer.buyerAddress=addr;
      buyers[addr]=customer;
        }

     
      buyers[addr].ticketIds.push(ticketId);

        emit newTicketCreated(ticketId, _eventId, num, events[_eventId].ticketPrice,buyers[addr].ticketIds.length);
        emit TransferNFTresale(events[_eventId].orgAddress,addr,ticketId,events[_eventId].ticketPrice);

    }

    function getTicket(uint256 _ticketId) public view returns(ticket memory){
        return tickets[_ticketId];
    }

event TransferNFTresale(address indexed from, address indexed to, uint256 indexed tokenId,uint256 price);

  function transferNFT(address _to, uint256 _ticketId) public payable {
    address from = ownerOf(_ticketId);
    uint256 price = tickets[_ticketId].Price;

    require(msg.value >= price, "Insufficient ETH sent");
    require(from == msg.sender, "Only the owner can transfer");

    // Pay the seller
    (bool success, ) = payable(from).call{value: price}("");
    require(success, "Transfer failed");

    // Transfer NFT ownership
    _transfer(from, _to, _ticketId);

    if(buyers[_to].buyerAddress!=_to){
        buyer memory newbuyer;
        newbuyer.buyerAddress=_to;
        buyers[_to]=newbuyer;
    }
    buyers[_to].ticketIds.push(_ticketId);
    buyers[from].pastEventIds.push(tickets[_ticketId].eventId);

    //Remove id

    for(uint256 i=0;i < buyers[from].ticketIds.length;){
       if (buyers[from].ticketIds[i] == _ticketId) {
        buyers[from].ticketIds[i] = buyers[from].ticketIds[buyers[from].ticketIds.length- 1];
        buyers[from].ticketIds.pop();
    } else {
        i++; // Only increment i if no removal occurred
    }

    }

    emit TransferNFTresale(from,_to,_ticketId,price);

    // Mark ticket as not listed anymore
    
}

function approveForResale(address _buyer, uint256 _ticketId) public {
    // require(ownerOf(_ticketId) == msg.sender, "Only the ticket owner can approve resale");
    approve(_buyer, _ticketId);
}


event Debug(uint256 id, uint256 storedId, address caller, address owner, uint256 price);

function resaleNFT(uint256 id, uint256 _price, address addr) public {
    emit Debug(id, tickets[id].ticketId, addr, ownerOf(id), _price);
    
    require(tickets[id].ticketId == id, "Ticket does not exist");
    require(ownerOf(id) == addr, "You are not the owner");
    require(_price > 0, "Price must be greater than zero");

    tickets[id].Price = _price;
    tickets[id].isAvailablebid = true;

}

    function isBuyer(address addr) public view returns(bool){
    if (buyers[addr].ticketIds.length > 0) { 
        return true;
    } else {
        return false;
    }
}


    function getBuyer(address addr)public view returns(buyer memory){

        require(buyers[addr].buyerAddress==addr,"Did not buy any NFTs");
        return buyers[addr];

    }

}

