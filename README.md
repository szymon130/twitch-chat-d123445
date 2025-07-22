# Twitch Multi-Chat Terminal

A web-based terminal application for interacting with multiple Twitch chats in real-time.

## Features

* **Terminal-style Interface**: All interactions are done through a command line.
* **Multi-channel Support**: Ability to join and chat in multiple Twitch channels simultaneously.
* **Real-time Messages**: The chat is updated live thanks to a WebSocket connection.
* **Command System**: Supports commands like `/say`, `/join`, `/exit`, `/help`, and many more.
* **Suggestions**: Automatic suggestions for commands, channels, emotes, and mentions.
* **Reply Functionality**: Ability to reply to specific messages in the chat.
* **Message History**: Stores and allows loading of older messages.
* **Customization**: User nickname colors and badges are fetched and displayed just like on Twitch.
* **Emote Support**: Emotes from 7TV and other popular services are displayed in the chat.

## Technologies Used

* **React**: A library for building the user interface.
* **JavaScript (ES6+)**: The main programming language for the project.
* **WebSocket**: For real-time communication with the chat server.
* **Tailwind CSS**: A CSS framework for styling components.

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/szymon130/twitch-chat-d123445.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd ./twitch-chat-d123445
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

## Usage

1.  Run the application:
    ```bash
    npm start
    ```
    or
    ```bash
    yarn start
    ```
2.  Open your browser and go to `http://localhost:3000`.
3.  Use the `/connect` command to connect to the server.
4.  Type `/help` to see a list of available commands.

---
I hope you find this `README.md` file useful! Let me know if you need any further modifications.