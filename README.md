# ECDSA Node Project

This project demonstrates using a client and server to facilitate transfers between different addresses using public key cryptography.

The repository contains two implementations:
1. **Original Implementation**: Separate client (React/Vite) and server (Express)
2. **Next.js Implementation**: Combined full-stack Next.js TypeScript application

## Project Overview

This project shows how to implement secure transfers between addresses using Elliptic Curve Digital Signatures. By using ECDSA, the server only allows transfers that have been signed by the person who owns the associated address.

## Original Implementation Setup

### Client

The client folder contains a React app using Vite. To get started:

1. Open up a terminal in the `/client` folder
2. Run `npm install` to install all the dependencies
3. Run `npm run dev` to start the application 
4. Visit the app at http://localhost:5173/

### Server

The server folder contains a Node.js server using Express. To run the server:

1. Open a terminal within the `/server` folder 
2. Run `npm install` to install all the dependencies 
3. Run `node index` to start the server

**Tip**: Run `npm i -g nodemon` and then use `nodemon index` to automatically restart the server on changes.

The application connects to the default server port (3042) automatically.

## Next.js Implementation Setup

The Next.js implementation combines both frontend and backend into a single TypeScript application.

### Prerequisites

- Node.js 16.x or later
- npm, yarn, or pnpm

### Installation

1. Navigate to the Next.js app directory:
   ```
   cd ecdsa-node/next-app
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Run the development server:
   ```
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Next.js Project Structure

- `/src/app` - Next.js app router pages and API routes
- `/src/components` - React components for the UI
- `/src/db` - Database handling for wallet balances and transactions
- `/src/lib` - Utility functions and API client

## API Endpoints (Next.js Version)

- `GET /api/balance/[address]` - Get balance for a specific address
- `POST /api/send` - Send transaction between addresses

## Implementation Goals

Your project goal is to set up a secure ECDSA-based web application:

1. Incorporate public key cryptography so transfers can only be completed with a valid signature
2. The person sending the transaction should verify they own the private key corresponding to the sending address

## Recommended Approach

### Phase 1: Basic Setup
- Clone the project and install dependencies
- Run the client and server
- Verify basic functionality (viewing balances, sending funds)

### Phase 2: Private Key Implementation
- Install ethereum-cryptography: `npm i ethereum-cryptography@1.2.0` in both client and server
- Replace placeholder addresses with actual public keys
- Generate key pairs using secp256k1
- Update server to use real public keys for balances

### Phase 3: Secure Implementation
- Implement transaction signing on the client-side
- Add signature verification on the server-side
- Recover the public address from signatures
- Validate transactions against the server's record

## Next.js Improvements

The Next.js TypeScript implementation offers several advantages:

1. **Integrated Architecture**: Frontend and backend in one codebase
2. **TypeScript Support**: Enhanced type safety and developer experience
3. **Modern Structure**: Cleaner organization with Next.js App Router
4. **Improved UX**: Better error handling and loading states

## Security Considerations

While working through this project, consider:
- What happens if someone intercepts a valid signature?
- Could they replay that transfer by sending it back to the server?
- How to prevent signature reuse?

## Sample Solution

For a reference implementation of the original version, check [this repo](https://github.com/AlvaroLuken/exchange-secp256k1).

## License

[MIT](LICENSE)