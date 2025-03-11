const { expect } = require("chai")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}



describe("Organiser", function () {

    let deployer,user;
    let organiser;

    this.beforeEach(async()=>{
        [deployer,user] = await ethers.getSigners();
        const Organiser = await ethers.getContractFactory("Organizers");
        organiser = await Organiser.deploy();
    })

    describe("Registration",  ()=> {

        this.beforeEach(async()=>{
           const transaction= await organiser.connect(user).register("NFT_Ticketing");
           await transaction.wait();
        })

        it("Checking the Organizer",async()=>{
            const result = await organiser.members(user.address);
            expect(result.orgAddress).to.equal(user.address);
        })

        it("Checking the Organizer Name",async()=>{
            const result = await organiser.members(user.address);
            expect(result.organizationName).to.equal("NFT_Ticketing");
        })

    })
})