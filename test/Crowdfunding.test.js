const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BNB Crowdfunding Platform", function () {
  let factory;
  let campaign;
  let token;
  let owner;
  let creator;
  let contributor1;
  let contributor2;

  beforeEach(async function () {
    [owner, creator, contributor1, contributor2] = await ethers.getSigners();

    // Deploy factory
    const CrowdfundFactory = await ethers.getContractFactory("CrowdfundFactory");
    factory = await CrowdfundFactory.deploy();
    await factory.waitForDeployment();
  });

  describe("Factory Contract", function () {
    it("Should deploy factory contract", async function () {
      expect(factory.address).to.not.equal(ethers.constants.AddressZero);
    });

    it("Should create a new campaign", async function () {
      const title = "Test Campaign";
      const description = "A test campaign description";
      const goal = ethers.utils.parseEther("1"); // 1 BNB
      const duration = 30 * 24 * 60 * 60; // 30 days
      const tokenPrice = ethers.utils.parseEther("0.001"); // 0.001 BNB per token
      const tokenName = "Test Token";
      const tokenSymbol = "TEST";

      const tx = await factory.connect(creator).createCampaign(
        title,
        description,
        goal,
        duration,
        tokenPrice,
        tokenName,
        tokenSymbol
      );

      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "CampaignCreated");
      
      expect(event).to.not.be.undefined;
      expect(event.args.campaignAddress).to.not.equal(ethers.constants.AddressZero);
      expect(event.args.creator).to.equal(creator.address);
      expect(event.args.title).to.equal(title);
    });

    it("Should track deployed campaigns", async function () {
      // Create a campaign first
      const title = "Test Campaign";
      const description = "A test campaign description";
      const goal = ethers.utils.parseEther("1");
      const duration = 30 * 24 * 60 * 60;
      const tokenPrice = ethers.utils.parseEther("0.001");
      const tokenName = "Test Token";
      const tokenSymbol = "TEST";

      await factory.connect(creator).createCampaign(
        title,
        description,
        goal,
        duration,
        tokenPrice,
        tokenName,
        tokenSymbol
      );

      const campaigns = await factory.getCampaigns();
      expect(campaigns.length).to.equal(1);
    });
  });

  describe("Campaign Contract", function () {
    beforeEach(async function () {
      // Create a campaign for testing
      const title = "Test Campaign";
      const description = "A test campaign description";
      const goal = ethers.utils.parseEther("1");
      const duration = 30 * 24 * 60 * 60;
      const tokenPrice = ethers.utils.parseEther("0.001");
      const tokenName = "Test Token";
      const tokenSymbol = "TEST";

      const tx = await factory.connect(creator).createCampaign(
        title,
        description,
        goal,
        duration,
        tokenPrice,
        tokenName,
        tokenSymbol
      );

      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "CampaignCreated");
      const campaignAddress = event.args.campaignAddress;
      const tokenAddress = event.args.tokenAddress;

      campaign = await ethers.getContractAt("Campaign", campaignAddress);
      token = await ethers.getContractAt("ProjectToken", tokenAddress);
    });

    it("Should accept contributions", async function () {
      const contributionAmount = ethers.utils.parseEther("0.1");
      
      await campaign.connect(contributor1).contribute({ value: contributionAmount });
      
      const contribution = await campaign.getContribution(contributor1.address);
      expect(contribution).to.equal(contributionAmount);
    });

    it("Should mint tokens to contributors", async function () {
      const contributionAmount = ethers.utils.parseEther("0.1");
      const expectedTokens = contributionAmount.mul(ethers.utils.parseEther("1")).div(ethers.utils.parseEther("0.001"));
      
      await campaign.connect(contributor1).contribute({ value: contributionAmount });
      
      const tokenBalance = await token.balanceOf(contributor1.address);
      expect(tokenBalance).to.equal(expectedTokens);
    });

    it("Should track total raised", async function () {
      const contributionAmount = ethers.utils.parseEther("0.1");
      
      await campaign.connect(contributor1).contribute({ value: contributionAmount });
      
      const totalRaised = await campaign.totalRaised();
      expect(totalRaised).to.equal(contributionAmount);
    });

    it("Should reach goal when sufficient contributions are made", async function () {
      const goal = await campaign.goal();
      
      await campaign.connect(contributor1).contribute({ value: goal });
      
      const goalReached = await campaign.goalReached();
      expect(goalReached).to.be.true;
    });
  });

  describe("Token Contract", function () {
    beforeEach(async function () {
      // Create a campaign for testing
      const title = "Test Campaign";
      const description = "A test campaign description";
      const goal = ethers.utils.parseEther("1");
      const duration = 30 * 24 * 60 * 60;
      const tokenPrice = ethers.utils.parseEther("0.001");
      const tokenName = "Test Token";
      const tokenSymbol = "TEST";

      const tx = await factory.connect(creator).createCampaign(
        title,
        description,
        goal,
        duration,
        tokenPrice,
        tokenName,
        tokenSymbol
      );

      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "CampaignCreated");
      const tokenAddress = event.args.tokenAddress;

      token = await ethers.getContractAt("ProjectToken", tokenAddress);
    });

    it("Should have correct name and symbol", async function () {
      const name = await token.name();
      const symbol = await token.symbol();
      
      expect(name).to.equal("Test Token");
      expect(symbol).to.equal("TEST");
    });

    it("Should have initial supply", async function () {
      const totalSupply = await token.totalSupply();
      const expectedSupply = ethers.utils.parseEther("1000000"); // 1 million tokens
      
      expect(totalSupply).to.equal(expectedSupply);
    });

    it("Should allow burning tokens", async function () {
      const burnAmount = ethers.utils.parseEther("100");
      
      await token.connect(owner).burn(burnAmount);
      
      const totalSupply = await token.totalSupply();
      const expectedSupply = ethers.utils.parseEther("999900"); // 1 million - 100
      
      expect(totalSupply).to.equal(expectedSupply);
    });
  });
}); 