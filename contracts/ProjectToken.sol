// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./lib/openzeppelin/token/ERC20/ERC20.sol";
import "./lib/openzeppelin/access/Ownable.sol";

contract ProjectToken is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18; // 1 million tokens
    bool public mintingFinished = false;

    event MintingFinished();

    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {
        _mint(initialOwner, INITIAL_SUPPLY);
    }

    modifier canMint() {
        require(!mintingFinished, "Minting is finished");
        _;
    }

    function mint(address to, uint256 amount) external onlyOwner canMint {
        _mint(to, amount);
    }

    function finishMinting() external onlyOwner {
        mintingFinished = true;
        emit MintingFinished();
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
} 