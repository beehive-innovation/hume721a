// SPDX-License-Identifier: CAL

pragma solidity 0.8.14;

import "./Hume721A.sol";

contract Hume721AFactory {
    event NewChild(address newChild, address sender);

    mapping(address => bool) public children;

    function createChild(DeployConfig memory config_) public returns (address) {
        Hume721A child = new Hume721A(config_, msg.sender);
        address newChild = address(child);
        children[newChild] = true;
        emit NewChild(newChild, msg.sender);
        return (newChild);
    }

    function isChild(address child) public view returns (bool) {
        return children[child];
    }
}
