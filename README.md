## Lucky Machines

Create and run provably fair betting machines using Chainlink VRM for on-chain random numbers. This project includes a factory for quickly creating a lucky machine, to which any profits can be claimed by the owner. Each machine must be funded with enough to pay out any potential winnings before play is available. Once play is enabled, any user with an ethereum address can place a bet through direct interaction with the contract or through the provided UI. Lucky Machines can also be shut down and all funds cashed out to the owner at any time, although if any unplayed bets remain, this cannot be withdrawn, except as a refund to the player who placed the bet.

The number of pickable values and payout amounts are set on a machine by machine basis, and can be customized to the owner's specification. These values may be altered once the machine is generated and will be easily inspectable through public variables in the machine contract.
