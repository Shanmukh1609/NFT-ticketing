//SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;


contract Organizers{

    struct organiser{

        address orgAddress;
        string organizationName;
        //password verification 
        //string image
    }

    mapping (address=>bool)isOrganiser;
    mapping (address=>organiser) public members;

    // struct NFTs

    function register(string memory name)public {
        //verify whether the organizer has registered.

        //Register them
        address orgAddress = msg.sender;

        require(isOrganiser[orgAddress]==false,"Already an Organiser");

        members[orgAddress]=organiser(orgAddress,name);
        isOrganiser[orgAddress]=true;
    }

    function getOrganiser() public view  returns (string memory organizationName){

        address orgAddress = msg.sender;

        require(isOrganiser[orgAddress]==true,"Not an Organiser");
        require(members[orgAddress].orgAddress==orgAddress,"No record found");

        organiser memory member = members[orgAddress];
        return (member.organizationName);

    }


}