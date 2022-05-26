// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./HumeAngelbabyCommunityEP1.sol";
import "@beehiveinnovation/rain-protocol/contracts/factory/Factory.sol";

contract Hume721AFactory is Factory, Ownable {
    /// @inheritdoc Factory
    function _createChild(bytes calldata data_)
        internal
        virtual
        override
        onlyOwner
        returns (address child_)
    {
        ConstructorConfig memory config_ = abi.decode(
            data_,
            (ConstructorConfig)
        );
        child_ = address(new HumeAngelbabyCommunityEP1(config_));
    }

    /// Typed wrapper around IFactory.createChild.
    function createChildTyped(ConstructorConfig calldata config_) external returns (HumeAngelbabyCommunityEP1 child_) {
        child_ = HumeAngelbabyCommunityEP1(this.createChild(abi.encode(config_)));
    }
}
