const hre = require("hardhat");

async function main() {
  const TwoFaContract = await hre.ethers.getContractFactory("TwoFaContract");
  const contract = await TwoFaContract.deploy(30);
  console.log(contract.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// 0xE1043012936b8a877D37bd64839544204638d035
