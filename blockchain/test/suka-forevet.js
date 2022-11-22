const SukaNFT = artifacts.require("SukaNFT");

contract("SukaNFT", (accounts) => {
  it("mint token and read the URI", async function () {
    const sukaNFT = await SukaNFT.new();
    await sukaNFT.mintNFT(accounts[0], "ipfs://QmZD3o5HmeKYCsuFBknp1bWfcS48EMKRWPMrvWPhKNT6Y6/1");
    assert.equal(await sukaNFT.tokenURI(1), "ipfs://QmZD3o5HmeKYCsuFBknp1bWfcS48EMKRWPMrvWPhKNT6Y6/1");
  });
  it("mint token and the owner", async function () {
    const sukaNFT = await SukaNFT.new();
    await sukaNFT.mintNFT(accounts[0], "ipfs://QmZD3o5HmeKYCsuFBknp1bWfcS48EMKRWPMrvWPhKNT6Y6/1");
    assert.equal(await sukaNFT.ownerOf(1), accounts[0]);
  });  

  it("mint token and transfer to new owner", async function () {
    const sukaNFT = await SukaNFT.new();
    await sukaNFT.mintNFT(accounts[0],"ipfs://QmZD3o5HmeKYCsuFBknp1bWfcS48EMKRWPMrvWPhKNT6Y6/1");
    await sukaNFT.safeTransferFrom(accounts[0], accounts[1], 1);
    assert.equal(await sukaNFT.ownerOf(1), accounts[1]);
  });    

  it("mint token and transfer to and check royalitfyfees", async function () {
    const sukaNFT = await SukaNFT.new();
    await sukaNFT.mintNFT(accounts[0],"ipfs://QmZD3o5HmeKYCsuFBknp1bWfcS48EMKRWPMrvWPhKNT6Y6/1");
    const royality = await sukaNFT.royaltyInfo(1, 10000);
    assert.equal(royality["0"],accounts[0]);
    assert.equal(royality["1"],0xc8);

  });  
});
