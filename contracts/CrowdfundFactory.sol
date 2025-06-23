// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Campaign.sol";
import "./ProjectToken.sol";
import "./lib/openzeppelin/access/Ownable.sol";

contract CrowdfundFactory is Ownable {
    Campaign[] public campaigns;
    mapping(address => bool) public isCampaign;
    mapping(address => uint256) public campaignIndex;
    
    event CampaignCreated(
        address indexed campaignAddress,
        address indexed creator,
        string title,
        uint256 goal,
        uint256 deadline,
        address tokenAddress
    );
    
    constructor() Ownable(msg.sender) {}
    
    function createCampaign(
        string memory title,
        string memory description,
        uint256 goal,
        uint256 duration,
        uint256 tokenPrice,
        string memory tokenName,
        string memory tokenSymbol
    ) external returns (address campaignAddress, address tokenAddress) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(goal > 0, "Goal must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");
        require(tokenPrice > 0, "Token price must be greater than 0");
        require(bytes(tokenName).length > 0, "Token name cannot be empty");
        require(bytes(tokenSymbol).length > 0, "Token symbol cannot be empty");
        
        // Deploy the project token first
        ProjectToken token = new ProjectToken(tokenName, tokenSymbol, address(this));
        
        // Deploy the campaign contract
        Campaign campaign = new Campaign(
            title,
            description,
            goal,
            duration,
            tokenPrice,
            address(token)
        );
        
        // Transfer token ownership to the campaign
        token.transferOwnership(address(campaign));
        
        // Transfer campaign ownership to the creator
        campaign.transferOwnership(msg.sender);
        
        // Add to campaigns array
        campaigns.push(campaign);
        isCampaign[address(campaign)] = true;
        campaignIndex[address(campaign)] = campaigns.length - 1;
        
        emit CampaignCreated(
            address(campaign),
            msg.sender,
            title,
            goal,
            campaign.deadline(),
            address(token)
        );
        
        return (address(campaign), address(token));
    }
    
    function getCampaigns() external view returns (address[] memory) {
        address[] memory campaignAddresses = new address[](campaigns.length);
        for (uint256 i = 0; i < campaigns.length; i++) {
            campaignAddresses[i] = address(campaigns[i]);
        }
        return campaignAddresses;
    }
    
    function getCampaignsCount() external view returns (uint256) {
        return campaigns.length;
    }
    
    function getCampaignByIndex(uint256 index) external view returns (address) {
        require(index < campaigns.length, "Index out of bounds");
        return address(campaigns[index]);
    }
    
    function getCampaignInfo(address campaignAddress) external view returns (
        string memory title,
        string memory description,
        uint256 goal,
        uint256 deadline,
        uint256 totalRaised,
        uint256 tokenPrice,
        bool goalReached,
        bool fundsWithdrawn,
        bool campaignEnded,
        address creator,
        address tokenAddress
    ) {
        require(isCampaign[campaignAddress], "Not a valid campaign");
        Campaign campaign = Campaign(payable(campaignAddress));
        
        (
            title,
            description,
            goal,
            deadline,
            totalRaised,
            tokenPrice,
            goalReached,
            fundsWithdrawn,
            campaignEnded
        ) = campaign.getCampaignInfo();
        
        creator = campaign.owner();
        tokenAddress = address(campaign.projectToken());
    }
    
    function getActiveCampaigns() external view returns (address[] memory) {
        uint256 activeCount = 0;
        
        // Count active campaigns
        for (uint256 i = 0; i < campaigns.length; i++) {
            Campaign campaign = campaigns[i];
            if (block.timestamp < campaign.deadline() && !campaign.campaignEnded()) {
                activeCount++;
            }
        }
        
        // Create array with active campaigns
        address[] memory activeCampaigns = new address[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < campaigns.length; i++) {
            Campaign campaign = campaigns[i];
            if (block.timestamp < campaign.deadline() && !campaign.campaignEnded()) {
                activeCampaigns[currentIndex] = address(campaign);
                currentIndex++;
            }
        }
        
        return activeCampaigns;
    }
    
    function getSuccessfulCampaigns() external view returns (address[] memory) {
        uint256 successfulCount = 0;
        
        // Count successful campaigns
        for (uint256 i = 0; i < campaigns.length; i++) {
            Campaign campaign = campaigns[i];
            if (campaign.goalReached()) {
                successfulCount++;
            }
        }
        
        // Create array with successful campaigns
        address[] memory successfulCampaigns = new address[](successfulCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < campaigns.length; i++) {
            Campaign campaign = campaigns[i];
            if (campaign.goalReached()) {
                successfulCampaigns[currentIndex] = address(campaign);
                currentIndex++;
            }
        }
        
        return successfulCampaigns;
    }
} 