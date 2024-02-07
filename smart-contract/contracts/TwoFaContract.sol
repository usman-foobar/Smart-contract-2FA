// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TwoFaContract {
    uint256 immutable coolDownPeriod;

    struct User {
        address userAddress;
        address publicKey;
        uint256 otpSeed;
        uint256 otpExpiresAt;
    }

    mapping (bytes32 => User) userDetails;
    mapping (bytes32 => bool) usernameExists;
    mapping (address => bool) isPublicKeyRegistered;

    event UserRegistered(address indexed userAddress, string username, uint256 timestamp);
    event OtpGenerated(address indexed userAddress, uint256 otp);

    constructor(uint256 _coolDownPeriodInSeconds) {
        coolDownPeriod = _coolDownPeriodInSeconds * 1 seconds;
    }

    function userRegistration(string memory _username, uint256 _otpSeed, address _publicKey) external {
        bytes32 _hashedUsername = _hashData(_username);

        require(!usernameExists[_hashedUsername], "Username already registered");
        require(!isPublicKeyRegistered[_publicKey], "Address already registered");

        userDetails[_hashedUsername] = User(msg.sender, _publicKey, _otpSeed, block.timestamp);
        usernameExists[_hashedUsername] = true;
        isPublicKeyRegistered[_publicKey] = true;

        emit UserRegistered(msg.sender, _username, block.timestamp);
    }

    function generateOtp(string memory _username) external returns (uint256) {
        bytes32 _hashedUsername = _hashData(_username);
        require(usernameExists[_hashedUsername], "Username is not registered");
        require(userDetails[_hashedUsername].userAddress == msg.sender, "Invalid user");

        User storage user = userDetails[_hashedUsername];
        require(block.timestamp > user.otpExpiresAt, "Wait for the cool down period");
        
        user.otpExpiresAt = block.timestamp + coolDownPeriod;
        uint256 _newOtp = uint256(keccak256(abi.encodePacked(user.otpSeed, user.publicKey, user.otpExpiresAt)));
        
        emit OtpGenerated(msg.sender, _newOtp);
        return _newOtp;
    }

    function authenticate(string memory _username, address _publicKey, uint256 _otp ) external view returns (bool) {
        bytes32 _hashedUsername = _hashData(_username);
        require(isPublicKeyRegistered[_publicKey], "Public key is not registered");
        User storage user = userDetails[_hashedUsername];
        require(block.timestamp < user.otpExpiresAt, "OTP expired");
        require(user.userAddress == msg.sender && user.publicKey == _publicKey , "Invalid user");

        if(_otp == uint256(keccak256(abi.encodePacked(user.otpSeed, user.publicKey, user.otpExpiresAt)))){
            return true;
        }

        return false;
    }

    function getCoolDownPeriod() public view returns (uint256) {
        return coolDownPeriod;
    }

    function getUserDetails(string memory _username) public view returns(User memory) {
        bytes32 _hashedUsername = _hashData(_username);
        return userDetails[_hashedUsername];
    }

    function _hashData(string memory _data) internal pure returns (bytes32) {
        bytes32 _hashedData = keccak256(abi.encodePacked(_data));
        return _hashedData;
    }
}