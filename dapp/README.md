## Lucky Machines

Create and run provably fair betting machines using Chainlink VRF for random numbers. This project includes a factory for quickly creating a lucky machine, of which any profits can be claimed by the owner.

Each machine must be funded with enough ETH to pay out any potential winnings plus enough LINK to request random numbers before play is available. Once play is enabled, any player with an Ethereum address can place a bet through the provided UI or through direct contract interaction. 

Lucky Machines can be shut down at any time and all funds cashed out to the owner, although any unplayed bets cannot be withdrawn. Unplayed bets may be refunded to the player who placed the bet upon request to the contract.

The minimum bet, maximum bet, number of pickable values, and payout amounts are set on a machine by machine basis, and can initially be customized to the owner's specification. Once the machine is created these values cannot be changed. All machine properties are easily inspectable through public variables in the machine contract.

Currently running on the Kovan test network at http://luckymachines.io
