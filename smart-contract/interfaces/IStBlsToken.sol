// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IStBlsToken {

    function mint(uint256 _value) external;

    function updateBlsContract(address _blsContract) external;

}