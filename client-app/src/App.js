import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

import TwoFaContract from "./contracts/TwoFaContract.json";

const App = () => {
  const CONTRACT_ADDRESS = "0xa2b3879E01092d027E381b2680e78b390446988A";

  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [network, setNetwork] = useState("");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSeed, setOtpSeed] = useState("");
  const [userRegistrationMessage, setUserRegistrationMessage] = useState("");
  const [otpGeneratedMessage, setOtpGeneratedMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initializeProvider = async () => {
      try {
        if (window.ethereum) {
          let accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          setAccount(accounts[0]);

          const provider = new ethers.BrowserProvider(window.ethereum);

          setProvider(provider);
        }
      } catch (error) {
        console.log(error);
      }
    };
    initializeProvider();
  }, []);

  useEffect(() => {
    const getNetwork = async () => {
      if (provider) {
        const network = await provider.getNetwork();
        setNetwork(network.name);
      }
    };

    const instantiateContract = async () => {
      if (provider) {
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          TwoFaContract.abi,
          signer
        );
        setContract(contract);
      }
    };

    getNetwork();
    instantiateContract();
  }, [provider]);

  const userRegistration = async (e) => {
    setUserRegistrationMessage("");
    try {
      e.preventDefault();
      let txResponse = await contract.userRegistration(
        username,
        otpSeed,
        account
      );
      await txResponse.wait();
      setUserRegistrationMessage("User registered successfully!");
    } catch (error) {
      console.error("Error while registering user: ", error);
      setUserRegistrationMessage("Error occurred while registering user");
    }
  };

  const generateOtp = async (e) => {
    setOtpGeneratedMessage("");
    try {
      e.preventDefault();
      const txResponse = await contract.generateOtp(username);
      const receipt = await txResponse.wait();
      console.log("Transaction receipt: ", receipt);
      setOtpGeneratedMessage("OTP Generated");
    } catch (error) {
      console.error("Error while generating OTP: ", error);
      setOtpGeneratedMessage("Error occurred while generating OTP");
    }
  };

  const checkAuthentication = async (e) => {
    try {
      e.preventDefault();
      const txResponse = await contract.authenticate(username, account, otp);
      setIsAuthenticated(txResponse);
    } catch (error) {
      console.error("Error while authenticating: ", error);
      setIsAuthenticated(false);
    }
  };

  return (
    <div>
      <div className="text-center p-4">
        <h1 className="text-2xl font-bold">Smart contract Integration</h1>
        <div>Connected Acc: {account}</div>
        <div className="text-center">Network : {network}</div>
      </div>
      <hr />
      <div className="text-center p-5">
        <div className="mt-20">
          <h1 className="font-bold">User Registration</h1>
          <form onSubmit={userRegistration}>
            <InputField
              type="text"
              placeholder="username"
              onChange={setUsername}
              value={username}
            />
            <InputField
              type="text"
              placeholder="OTP Seed"
              onChange={setOtpSeed}
              value={otpSeed}
            />
            <InputField
              type="text"
              placeholder="Public key"
              onChange={setAccount}
              value={account}
            />

            <Button />
          </form>
          <div className="mt-5 text-orange-400">{userRegistrationMessage}</div>
        </div>

        <div className="mt-20">
          <h1 className="font-bold">Generate OTP</h1>
          <form onSubmit={generateOtp}>
            <InputField
              type="text"
              placeholder="username"
              onChange={setUsername}
              value={username}
            />
            <Button />
          </form>
          <div className="mt-5 text-orange-400">{otpGeneratedMessage}</div>
        </div>

        <div className="mt-20">
          <h1 className="font-bold">Authenticate</h1>
          <form onSubmit={checkAuthentication}>
            <InputField
              type="text"
              placeholder="username"
              onChange={setUsername}
              value={username}
            />
            <InputField
              type="text"
              placeholder="Public key"
              onChange={setAccount}
              value={account}
            />
            <InputField
              type="text"
              placeholder="OTP"
              onChange={setOtp}
              value={otp}
            />
            <Button />
          </form>
          <div className="mt-5">
            <span>IsAuthenticated: </span>
            {isAuthenticated ? (
              <span className="text-green-500">True</span>
            ) : (
              <span className="text-red-500">False</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ type, placeholder, value, onChange }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded-md p-2 mr-2"
    />
  );
};

const Button = () => {
  return (
    <button type="submit" className="border rounded-md p-2 mr-2 bg-lime-400">
      Send Tx
    </button>
  );
};

export default App;
