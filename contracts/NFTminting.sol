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
    event newTicketCreated(uint256 ticketId, uint256 eventId, uint256 seatNum, uint256 Price);
  
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


    function mintNFT(uint256 _ticketId,uint256  _eventId, address to) public {
        // require(events[_eventId].totalTickets > events[_eventId].ticketsSold, "Tickets are sold out");
        _mint(to, ticketId);
        _setTokenURI(_ticketId, events[_eventId].uri);
    }

    function createNFTticket(address addr, uint256 _eventId, uint256 _seatNum,uint256 _price) public isOrganiser(addr)payable  isEvent(_eventId){
    
        require(events[_eventId].totalTickets >= events[_eventId].ticketsSold, "Tickets are sold out");
        require(events[_eventId].ticketPrice <= _price, "Price is too low");
         
         payable(events[_eventId].orgAddress).transfer(events[_eventId].ticketPrice );


        ticketId++;
        ticket memory newTicket;
        newTicket.ticketId = ticketId;
        newTicket.eventId = _eventId;
        newTicket.seatNum = _seatNum;
        newTicket.Price = events[_eventId].ticketPrice;
        newTicket.isAvailablebid = false;

        tickets[ticketId] = newTicket;
        events[_eventId].ticketIds.push(ticketId);

       
        events[_eventId].ticketsSold++;
         mintNFT(ticketId, _eventId,addr);

        emit newTicketCreated(ticketId, _eventId, _seatNum, events[_eventId].ticketPrice);
    }

    function getTicket(uint256 _ticketId) public view returns(ticket memory){
        return tickets[_ticketId];
    }

    function transferNFT(address _to, uint256 _ticketId) public {

        address from = ownerOf(_ticketId);
        safeTransferFrom(from, _to, _ticketId);
    }

}

