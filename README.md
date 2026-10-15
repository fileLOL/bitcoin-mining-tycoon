# Bitcoin Mining Tycoon — Data Center Empire

A playable browser-based mining-farm management tycoon with Google Auth cloud saves and a guided tutorial. Requires Node.js 18+.

## Run
1. Extract the ZIP.
2. Open a terminal in the project folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env` and set your `GOOGLE_CLIENT_ID`.
5. Run `npm start`.
6. Open http://localhost:3000.

## Google Auth setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create an OAuth 2.0 Client ID (Web application).
3. Add `http://localhost:3000` to authorized JavaScript origins.
4. Copy the Client ID to your `.env` file.

Without a Google Client ID the game runs in local-save mode.

## Tutorial
The first time you play, a guided tutorial walks you through the game mechanics: building placement, energy management, research, missions, and cloud saving.

## Gameplay
Place ASIC rigs, cooling systems, power infrastructure and server racks on the farm grid. Balance simulated hashrate, energy costs and cooling, research technologies, expand the facility and save progress to the cloud.

## Bitcoin safety notice
The requested wallet address is prefilled in the Wallet panel. This is a game prototype: it does not mine real BTC, receive payments or send payouts. Game credits are simulated and are not Bitcoin. Real payouts require a secure backend, verified mining accounting and payment infrastructure. Do not disable dry-run safeguards until real-payment flows have been reviewed and tested.
