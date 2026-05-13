# 🧘‍♀️ FlowBuddy

![FlowBuddy Logo](https://flowbuddy.vercel.app/favicon.ico)

**FlowBuddy: Real-Time Yoga Pose Detection and Form Correction Assistant**

FlowBuddy is a privacy-first web application that uses AI-powered pose detection to help beginners practice yoga with real-time form feedback. All processing happens locally in your browser — no video ever leaves your device, and no account is required.

🔗 **Live Demo:** https://flowbuddy.vercel.app  
📁 **Repository:** https://github.com/twaainee/FlowBuddy  

---

## 📌 Table of Contents

- ✨ Features  
- 🧠 How It Works  
- 🛠️ Tech Stack  
- 🚀 Getting Started  
- 📖 Usage  
- 📁 Project Structure  
- 🔮 Future Development  
- 🔒 Privacy  
- 🤝 Contributing  
- 📄 License  
- 🙏 Acknowledgments  
- 📬 Contact  

---

## ✨ Features

- 🎯 **Real-Time Pose Detection** – Uses Google MediaPipe to track 33 body landmarks (shoulders, elbows, wrists, hips, knees, ankles) via webcam.
- 🧘 **3 Foundational Yoga Poses** – Mountain Pose (Tadasana), Downward Dog (Adho Mukha Svanasana), Warrior I (Virabhadrasana I).
- 📊 **Instant Alignment Feedback** – Visual indicators and alignment scores help you improve posture in real time.
- 💬 **Text Correction Tips** – Actionable suggestions like “Bend your front knee more” or “Keep your back straight”.
- ⏱️ **Session Timer & Progress Tracking** – Logs practice duration and average alignment scores using local storage.
- 🔐 **Privacy-First Design** – No uploads, no tracking, no accounts. Everything runs on-device.
- 📱 **Responsive UI** – Works across desktop, laptop, tablet, and mobile browsers (optimized for Chrome & Edge).

---

## 🧠 How It Works

FlowBuddy runs entirely in your browser using computer vision and geometry-based feedback:

1. User selects a yoga pose (e.g., Warrior I).
2. Webcam is activated after explicit permission.
3. MediaPipe Pose detects 33 body keypoints in real time.
4. Joint angles are calculated and compared to ideal pose ranges.
5. Feedback is generated:
   - 📈 Alignment score (0–100)
   - 🎨 Color-coded progress indicators
   - 💡 Text-based correction tips
6. Session summary is saved locally for progress tracking.

📌 No video frames are ever sent to a server — all processing is done on-device.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|--------|
| HTML5 / CSS3 / JavaScript | Core structure, styling, and logic |
| MediaPipe Pose (TensorFlow.js) | Real-time 33-point pose detection |
| WebRTC (getUserMedia) | Webcam access |
| LocalStorage / IndexedDB | Store session history and progress data |
| Vercel | Hosting and deployment |

---

## 🚀 Getting Started

### 📋 Prerequisites

- Modern web browser (Chrome, Edge, Firefox recommended)
- Webcam (built-in or external)
- No API keys or backend required

---

### 📥 Installation

Clone the repository:

```bash
git clone https://github.com/twaainee/FlowBuddy.git
cd FlowBuddy
