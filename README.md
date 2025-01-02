# Real-Time Collaborative Code Editor

A real-time collaborative code editor built with Next.js and Socket.IO that allows two developers to code together in the same session with turn-based editing.

## Features

- **Real-time Collaboration**: Two developers can join the same coding session
- **Turn-based Editing**: Developers take turns editing the code, with automatic turn switching
- **Session Timer**: 30-minute total session time with 5-minute turns
- **Monaco Editor**: Professional code editor with TypeScript support
- **Real-time Updates**: Code changes are instantly synced between developers
- **Room Management**: Create or join rooms with unique codes
- **Session Control**: Automatic session ending when time expires or a developer disconnects

## Tech Stack

- **Frontend**:
  - Next.js
  - React
  - Monaco Editor
  - TailwindCSS
  - Socket.IO Client

- **Backend**:
  - Node.js
  - Socket.IO Server
  - Express (via Next.js)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ahlyab/turn-based-collab-room.git
   cd turn-based-collab-room
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. **Create a Room**:
   - Click "Create New Room" on the homepage
   - You'll be assigned as Developer 1 and get a room code

2. **Join a Room**:
   - Enter the room code in the input field
   - Click "Join Room"
   - You'll be assigned as Developer 2

3. **Coding Session**:
   - The session starts when both developers join
   - Each developer gets 5-minute turns
   - Total session time is 30 minutes
   - Code is automatically synced between developers
   - Session ends when time expires or a developer leaves

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:3000
```



## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
