# Cancel idempotency for a double cancel and a filled order
Severity: normal
Area: contracts

## Steps to reproduce
1. Place a resting GTC 20% under the mark via placeOrderFor.
2. Cancel that id, then cancel it again.
3. Record IncorrectSender versus idempotency.

## Expected
A second cancel of a real id is a stable no-op or a named error, not a missing id.

## Actual
orderId 10311729937203650058363. First cancel success. Second: The contract function "cancelOrderFor" reverted.

Error: IncorrectSender(address sender, address expected)
                      (0xf9beA92fee8105aC59186dAced61910Fc1DE80f6, 0x0000

## Evidence
- Prior leg (kept): cancelOrder(orderId=1) as the bot signer reverted IncorrectSender twice. That was not a real resting id.
- resting tx 0xeca36df4a6b1d7949b8c4a97ac8515330f69889863e8376dcaf3f896536d3652 (https://explorer.testnet.somnia.network/tokyo/tx/0xeca36df4a6b1d7949b8c4a97ac8515330f69889863e8376dcaf3f896536d3652)
- open ids: 5423342757670618880163,10311729937203650058363
- orderId 10311729937203650058363
- first cancel 0x6202055b5ee0351f1241b13bf429912429f102beba3c9123435dbbb260c9abb9 (https://explorer.testnet.somnia.network/tokyo/tx/0x6202055b5ee0351f1241b13bf429912429f102beba3c9123435dbbb260c9abb9)
- second cancel: The contract function "cancelOrderFor" reverted.

Error: IncorrectSender(address sender, address expected)
                      (0xf9beA92fee8105aC59186dAced61910Fc1DE80f6, 0x0000000000000000000000000000000000000000)
 
Contract Call:
  add

## Environment
SDK version: @somnia-chain/markets-sdk@0.32.1
Network: Somnia Tokyo testnet (chain ID 50383)
Wallet address: 0x8AF6577a9ea6B9372Df5fD8762D8d9789E04275F
