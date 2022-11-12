async function main() {
    const SukaNFT = await ethers.getContractFactory("SukaNFT")

    // Start deployment, returning a promise that resolves to a contract object
    const sukaNFT = await SukaNFT.deploy()
    await sukaNFT.deployed()
    console.log("Contract deployed to address:", sukaNFT.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
