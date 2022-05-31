// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../Adminable.sol";

/// @title AdminableTest
/// @notice Very basic contract for testing Adminable functionality.
contract AdminableTest is Adminable {
    /// Assigns admin role
    /// @param admin_ The initial admin.
    constructor(address admin_) {
        // Setup role.
        _transferAdmin(admin_);
    }
}