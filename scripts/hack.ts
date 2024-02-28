// import { ethers } from "hardhat";

// async function main() {
//   const [owner] = await ethers.getSigners();
//   const multiSig = await ethers.deployContract("MultiSig",[[owner.address,"0x9d4C3166c59412CEdBe7d901f5fDe41903a1d6Fc"],2]);
// await   multiSig.waitForDeployment()
//   console.log("multisig deployed at ", multiSig.target)
//   console.log("Current owner is ", await multiSig.getCurrentOwner())

//   console.log("hack deployed at ", owner.address)
//   const hack = await ethers.deployContract("Hack",[multiSig.target,"0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5"]);
//   await hack.waitForDeployment();

  

//   console.log("Current owner is ", await multiSig.getCurrentOwner())

  
// }

// // We recommend this pattern to be able to use async/await everywhere
// // and properly handle errors.
// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });
