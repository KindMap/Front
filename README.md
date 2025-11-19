# Web Service for Accessibility (복사)

This is a code bundle for Web Service for Accessibility (복사). The original project is available at https://www.figma.com/design/TxD3XXzo193hu1MkjKjX6k/Web-Service-for-Accessibility--%EB%B3%B5%EC%82%AC-.

## Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your API keys:
   - `VITE_GOOGLE_MAPS_API_KEY`: Your Google Maps API key
   - `VITE_WS_BASE_URL`: WebSocket API URL (default: ws://35.92.117.143:8001)
   - `VITE_API_BASE_URL`: REST API URL (default: http://35.92.117.143:8001)

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.