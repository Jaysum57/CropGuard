<!-- <p align="center">
   <img src="assets/images/icon.png" alt="icon" height="200">
</p> -->

# CropGuard 🌱

CropGuard is an AI-powered plant disease detection mobile application built with React Native and Expo. The app helps farmers and gardeners identify plant diseases through image analysis, providing early detection and treatment recommendations to protect crops and improve agricultural outcomes.

<p align="center">
  <img src="repo-assets/1.png" alt="screenshot 1"/>
</p>

## Features

🔍 **Plant Disease Scanning** - Capture or upload plant images for AI-powered disease detection using camera or gallery  
📊 **User Statistics** - Track scanning history, accuracy rates, and disease detection records  
👤 **User Authentication** - Secure login system with personalized user profiles  
🎯 **Disease Information** - Detailed information about detected diseases and treatment options  
📱 **Cross-Platform** - Available on both iOS and Android devices  
🎨 **Modern UI** - Clean, intuitive interface with onboarding experience  
🔄 **Real-time Processing** - Live camera feed with instant AI analysis results  

## Technology Stack

- **Frontend**: React Native with Expo (v54.0.12)
- **Navigation**: Expo Router (file-based routing v6.0.10)
- **UI Components**: React Native, Expo Vector Icons, React Native Vector Icons
- **Language**: TypeScript 5.9.2
- **Styling**: StyleSheet with responsive design and modern UI patterns
- **AI Integration**: FastAPI backend hosted on HuggingFace Spaces

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for macOS) or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jaysum57/CropGuard.git
   cd CropGuard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/emulator**
   - For iOS: Press `i` to open in iOS Simulator
   - For Android: Press `a` to open in Android Emulator
   - For physical device: Scan QR code with Expo Go app

## Project Structure

```
CropGuard/
├── app/                    # Main application screens
│   ├── _layout.tsx        # Root layout component
│   ├── auth.tsx           # Authentication screen
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── _layout.tsx    # Tab layout
│   │   ├── index.tsx      # Home/dashboard screen
│   │   ├── scan.tsx       # Plant scanning interface
│   │   └── account.tsx    # User profile and settings
│   └── details/           # Disease detail screens
│       ├── disease.tsx    # General disease information
│       └── rust.tsx       # Rust disease specifics
├── components/            # Reusable components
│   ├── AppStateProvider.tsx  # Global state management
│   ├── AuthScreen.tsx     # Authentication component
│   └── onboarding.tsx     # User onboarding flow
├── assets/                # Static assets
│   ├── fonts/            # Custom fonts
│   └── images/           # App icons, logos, and images
├── app-example/          # Example/template code
└── README.md
```

## Key Features Overview

### Authentication 
- Secure user authentication system
- User registration and login
- Profile management and data persistence

### Home Screen 
- Welcome dashboard with app branding
- Quick access to scanning functionality
- User statistics and recent activity
- Clean, modern UI with hero section

### User Account 
- Personal statistics and scanning history
- Account information management
- Settings and preferences
- Authentication state management

### Disease Details 
- Comprehensive disease information
- Treatment recommendations
- Educational content about plant health

## Development

### Available Scripts

```bash
# Start development server
npm start
# or
npx expo start

# Start with specific platform
npx expo start --ios
npx expo start --android
npx expo start --web

# Platform-specific shortcuts
npm run ios
npm run android
npm run web

# Code quality
npm run lint

# Build for production
npx expo build

# Reset project (removes example code)
npm run reset-project
```
## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Expo team for the excellent React Native framework
- HuggingFace for AI model infrastructure
- Open source community for various dependencies


