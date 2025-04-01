const { expect } = require("chai");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether');
};

describe("NFTminting", ()=>{

    let nft;
    let deployer, user1, user2, user3,user4,user5;
    let array;


    beforeEach(async()=>{
        [deployer, user1, user2, user3,user4,user5] = await ethers.getSigners();
        const NFT = await ethers.getContractFactory("NFTminting");
        nft = await NFT.deploy();
        
        array = [user1,user2,user3];
        for(let i = 0; i < array.length; i++){
            const transaction = await nft.connect(array[i]).newOrganiser();
            await transaction.wait();
        }

    })

    describe("verfying the organisers", ()=>{
           it("checking the organisers", async()=>{
                // let orgCount = await nft.getOrgDetails();
                for(let i = 0; i < array.length; i++){
                    const result = await nft.connect(array[i]).getOrgDetails();
                    console.log("Address:", result);
                    expect(result.orgAddress).to.equal(array[i].address)
                }

                console.log("deployer",deployer)
            })   
    })

    describe("Creation of Event",()=>{
        beforeEach(async()=>{

            for(let i=0;i<array.length;i++){
                const transaction = await nft.connect(array[i]).newEvent("Event"+i,"ipfs","Event Description"+i,"Veneava"+i,20,100,70);
                await transaction.wait();
            }

             let k=0;
            for(let i=array.length-1;i>=0;i--){
                const tx = await nft.connect(array[i]).createNFTticket(i,i,30);
                await tx.wait();
            }
        })

        it("Checking the Event Details", async()=>{
            const eventCount = await nft.eventId();
            console.log("Total Events Created:", eventCount.toString());
            
            for(let i = 0; i < eventCount; i++){
                const result = await nft.getevent(i);
                console.log("Event ID:", result.eventId.toString());
            }

        })


        it("Checking the NFT Details", async()=>{

            const eventCount = await nft.eventId();
            console.log("Total Events Created:", eventCount.toString());
            
            const ticketCount = await nft.ticketId();
            console.log("Total Tickets Created:", ticketCount.toString());
            
            for(let i=0;i<ticketCount;i++){
                const result = await nft.getTicket(i);
                console.log("ticket Details",result);
            }
        })
    })

  

})