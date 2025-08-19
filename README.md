# LOLI HUNTER ASSOCIATION - Our Private Hub

Welcome to LHA! This is our own private corner of the internet, built from the ground up just for our group of friends. It's a place to hang out, see what everyone's up to, chat, and dive into our favorite comics and manga without any outside noise.

This isn't a public app—it's our custom-built community hub, powered by React Native and packed with features and animations to make it feel uniquely ours.

![Project Banner](https://user-images.githubusercontent.com/1093128/200049015-4e78441a-a131-4d7a-874b-014e3b1c6e1c.png) 
*(Note: A GIF of the app in action would be perfect here!)*

---

## ✨ What's Inside?

Everything here is designed for us.

#### The Core Hub
- **Activity Feed:** See what comics everyone is reading in real-time. The perfect excuse to start a conversation.
- **Community Feed:** A central spot for announcements, discussions, fan art, or whatever else is on our minds.
- **Integrated Chat:** Direct and group messaging is built right in, so we don't have to switch apps.
- **Custom Profiles:** Personalized profiles with our stats, a custom bio, and a "Trophy Case" to show off the cool badges we've unlocked.

#### The Reading Experience
- **Modern Reader:** A clean, immersive reader with both **page-turning (horizontal)** and **webtoon-style (vertical)** modes.
- **Offline Mode:** Download chapters and read anywhere, anytime.
- **Reader Settings:** Customize the page fit to your liking.

#### Personal Touches
- **XP & Rank System:** As we read and participate, we earn XP and level up through custom ranks—from `凡` (Mortal) all the way to `神` (God).
- **Achievement Badges:** Unique, inside-joke badges for hitting milestones, like `Night Owl` for reading late or `Supreme Racist` for... well, you know.
- **"The Anomaly" Rank:** A secret, hidden rank (`？`) for special members that triggers a unique visual glitch effect on their profile.
- **App Themes:** Change the entire app's color scheme with multiple built-in themes to match your style.

---

## 🚀 The Tech

- **Framework:** React Native & Expo
- **Navigation:** React Navigation
- **Animation:** React Native Reanimated
- **State Management:** React Context API (`Auth`, `Modal`, `Theme`, `Library`, `Download`).
- **UI & Styling:** `expo-blur`, `expo-linear-gradient`, `react-native-svg`.
- **Offline Storage:** `expo-file-system` & `expo-storage`.

---

## 📁 Project Structure

The code is organized to be easy to build upon as we come up with new ideas.

```
.
├── assets/              # Images, fonts, etc.
├── components/          # Shared UI components (Buttons, Tab Bar)
├── constants/           # Global constants (Colors, Themes, Mock Data)
├── context/             # Our global state managers
├── navigation/          # Navigation setup
├── screens/             # All the different screens for the app
└── App.js               # The root of the app
```

---

## 🏁 How to Run It

To get this running on your phone, just follow these steps.

### What You Need
- Node.js (LTS version)
- The Expo Go app on your phone (iOS or Android)

### Installation
1.  **Clone the repo:**
    ```sh
    git clone <your-repo-url>
    ```
2.  **Go into the folder:**
    ```sh
    cd <project-folder>
    ```
3.  **Install everything:**
    ```sh
    npm install
    ```
4.  **Start the server:**
    ```sh
    npx expo start
    ```
5.  Scan the QR code that appears in the terminal with your phone's camera (or the Expo Go app), and you're in.
