// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ProjectToken.sol";
import "./lib/openzeppelin/security/ReentrancyGuard.sol";
import "./lib/openzeppelin/security/Pausable.sol";
import "./lib/openzeppelin/access/Ownable.sol";

contract Campaign is ReentrancyGuard, Pausable, Ownable {
    ProjectToken public projectToken;
    
    string public title;
    string public description;
    uint256 public goal;
    uint256 public deadline;
    uint256 public totalRaised;
    uint256 public tokenPrice; // BNB per token (in wei)
    
    bool public goalReached = false;
    bool public fundsWithdrawn = false;
    bool public campaignEnded = false;
    
    mapping(address => uint256) public contributions;
    mapping(address => uint256) public tokensClaimed;
    
    event Contribution(address indexed contributor, uint256 amount, uint256 tokens);
    event TokensClaimed(address indexed contributor, uint256 amount);
    event FundsWithdrawn(address indexed creator, uint256 amount);
    event RefundClaimed(address indexed contributor, uint256 amount);
    event CampaignEnded(bool goalReached, uint256 totalRaised);
    
    modifier campaignActive() {
        require(block.timestamp < deadline, "Campaign has ended");
        require(!campaignEnded, "Campaign has ended");
        _;
    }
    
    modifier whenCampaignEnded() {
        require(block.timestamp >= deadline || campaignEnded, "Campaign is still active");
        _;
    }
    
    modifier onlyCreator() {
        require(msg.sender == owner(), "Only creator can call this function");
        _;
    }
    
    constructor(
        string memory _title,
        string memory _description,
        uint256 _goal,
        uint256 _duration,
        uint256 _tokenPrice,
        address _tokenAddress
    ) Ownable(msg.sender) {
        title = _title;
        description = _description;
        goal = _goal;
        deadline = block.timestamp + _duration;
        tokenPrice = _tokenPrice;
        projectToken = ProjectToken(_tokenAddress);
    }
    
    function contribute() external payable campaignActive nonReentrant {
        require(msg.value > 0, "Contribution must be greater than 0");
        
        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;
        
        uint256 tokensToMint = (msg.value * 10**18) / tokenPrice;
        
        // Mint tokens to the contributor
        projectToken.mint(msg.sender, tokensToMint);
        
        emit Contribution(msg.sender, msg.value, tokensToMint);
        
        // Check if goal is reached
        if (totalRaised >= goal && !goalReached) {
            goalReached = true;
        }
    }
    
    function withdrawFunds() external onlyCreator whenCampaignEnded nonReentrant {
        require(goalReached, "Goal not reached");
        require(!fundsWithdrawn, "Funds already withdrawn");
        
        fundsWithdrawn = true;
        uint256 amount = address(this).balance;
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit FundsWithdrawn(owner(), amount);
    }
    
    function claimRefund() external whenCampaignEnded nonReentrant {
        require(!goalReached, "Goal was reached, no refunds available");
        require(contributions[msg.sender] > 0, "No contribution to refund");
        
        uint256 refundAmount = contributions[msg.sender];
        contributions[msg.sender] = 0;
        
        // Burn tokens if any were claimed
        if (tokensClaimed[msg.sender] > 0) {
            projectToken.burn(tokensClaimed[msg.sender]);
            tokensClaimed[msg.sender] = 0;
        }
        
        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "Transfer failed");
        
        emit RefundClaimed(msg.sender, refundAmount);
    }
    
    function endCampaign() external onlyCreator {
        require(!campaignEnded, "Campaign already ended");
        campaignEnded = true;
        emit CampaignEnded(goalReached, totalRaised);
    }
    
    function getCampaignInfo() external view returns (
        string memory _title,
        string memory _description,
        uint256 _goal,
        uint256 _deadline,
        uint256 _totalRaised,
        uint256 _tokenPrice,
        bool _goalReached,
        bool _fundsWithdrawn,
        bool _campaignEnded
    ) {
        return (
            title,
            description,
            goal,
            deadline,
            totalRaised,
            tokenPrice,
            goalReached,
            fundsWithdrawn,
            campaignEnded
        );
    }
    
    function getContribution(address contributor) external view returns (uint256) {
        return contributions[contributor];
    }
    
    function getTokenBalance(address contributor) external view returns (uint256) {
        return projectToken.balanceOf(contributor);
    }
    
    // Emergency functions
    function pause() external onlyCreator {
        _pause();
    }
    
    function unpause() external onlyCreator {
        _unpause();
    }
    
    // Allow contract to receive BNB
    receive() external payable {
        // This allows the contract to receive BNB
    }
} 