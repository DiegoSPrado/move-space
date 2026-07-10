# DrMove

A React and Electron desktop application for DrMove - controlling a conveyor belt system with temperature and pressure sensors through serial communication.

## Features

- Serial port connection interface
- Conveyor belt speed and inclination control
- Temperature and pressure monitoring and control
- Manual and automatic operation modes
- Control of peripheral devices (lamp, LEDs, neon, aromatizer)
- Real-time communication logging

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Installation

1. Clone this repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

## Running the Application

### Development Mode

To run the application in development mode:

```bash
npm run electron:dev
```

This will start both the React development server and Electron application.

### Production Build

To create a production build:

```bash
npm run electron:build
```

This will create a distributable package in the `dist` folder.

### Running the Built Application

After building, you can run the packaged application directly:

```bash
npm run electron:start
```

## Serial Communication Protocol

The application uses a specific protocol to communicate with the ESP32 controller:

- Message format: `[STX][MASTER_ID][COMANDO_ID][VALOR][ETX]`
- STX (Start of Text): 0x02
- MASTER_ID: 0x08
- COMANDO_ID: Command identifier byte
- VALOR: 1 or 2 bytes depending on the command
- ETX (End of Text): 0x03

### Available Commands

- Conveyor Speed: 0x01 (range 0-169)
- Conveyor Inclination: 0x05 (range 0-30)
- Temperature Setpoint: 0x06 (value = temperature \* 10)
- Pressure Setpoint: 0x04 (value = pressure \* 10)
- Operation Mode: 0x0F (0 = Manual, 1 = Automatic)
- Heater Power: 0x10 (range 0-100%)
- Vacuum Pump Power: 0x11 (range 0-100%)
- Lamp Control: 0x12 (0 = Off, 1 = On)
- LED RGB Control: 0x13 (6 bytes: Rext, Gext, Bext, Rint, Gint, Bint)
- LED On/Off: 0x15 (0 = Off, 1 = On)
- Neon On/Off: 0x16 (0 = Off, 1 = On)
- Aromatizer: 0x17 (activates for 300ms)

## Troubleshooting

- If you encounter permission errors when accessing serial ports, you may need to run the application with administrator privileges.
- On Linux, you may need to add your user to the `dialout` group to access serial ports without sudo.

## License

This project is licensed under the MIT License.
