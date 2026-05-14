FlowBuddy: Real-Time Yoga Pose Detection and Form Correction Assistant
======================================================================

<https://flowbuddy.vercel.app/favicon.ico>  <!-- Replace with actual logo if available -->

FlowBuddy is a **privacy-first web application** that uses AI-powered pose detection to help beginners practice yoga with real-time form feedback. All processing happens locally in your browser -- no video ever leaves your device, no account required.

🔗 **Live Demo**: [flowbuddy.vercel.app](https://flowbuddy.vercel.app)\
📁 **Repository**: [github.com/twaainee/FlowBuddy](https://github.com/twaainee/FlowBuddy)

* * * * *

📌 Table of Contents
--------------------

-   Features

-   How It Works

-   Tech Stack

-   Getting Started

    -   Prerequisites

    -   Installation

    -   Running Locally

-   Usage

-   Project Structure

-   Future Development

-   Privacy

-   Contributing

-   License

-   Acknowledgments

* * * * *

✨ Features
----------

-   **Real-Time Pose Detection** -- Uses Google MediaPipe to track 33 body landmarks (shoulders, elbows, wrists, hips, knees, ankles) from your webcam.

-   **3 Foundational Yoga Poses** -- Mountain Pose (Tadasana), Downward Dog (Adho Mukha Svanasana), Warrior I (Virabhadrasana I).

-   **Instant Alignment Feedback** -- Visual indicators and alignment scores let you know when your form needs correction.

-   **Text Correction Tips** -- Actionable suggestions like *"Bend your front knee more"* or *"Keep your back straight"*.

-   **Session Timer & Progress Tracking** -- Logs practice duration and average alignment scores for each pose. Data stays in your browser's local storage.

-   **Privacy-First** -- No server uploads, no tracking, no accounts. Everything runs on-device using WebAssembly and JavaScript.

-   **Responsive Design** -- Works on desktop, laptop, tablet, and mobile browsers (optimized for Chrome and Edge).

* * * * *

🧠 How It Works
---------------

1.  **User selects a pose** (e.g., Warrior I).

2.  **Browser accesses webcam** after explicit permission.

3.  **MediaPipe Pose** detects 33 keypoints in real time.

4.  **Angle calculations** compare your joint angles against ideal ranges for that pose.

5.  **Feedback displays**:

    -   Alignment score (0--100)

    -   Color-coded progress bar

    -   Text correction tips

6.  **Session summary** saves to local storage for progress tracking.

All processing happens in your browser -- no video frames are ever sent to any server.

* * * * *

🛠️ Tech Stack
--------------

| Technology | Purpose |
| --- | --- |
| **HTML5 / CSS3 / JavaScript** | Core structure, styling, and logic |
| **MediaPipe Pose (TensorFlow.js)** | Real-time 33-point body landmark detection |
| **WebRTC (`getUserMedia`)** | Webcam access |
| **LocalStorage / IndexedDB** | Store session history and progress data |
| **Vercel** | Hosting and deployment |

* * * * *

🚀 Getting Started
------------------

### Prerequisites

-   A modern web browser (Chrome, Edge, Firefox recommended)

-   A webcam (built-in or external)

-   No server or API keys required -- everything runs locally.

### Installation

1.  **Clone the repository**

    bash

    git clone https://github.com/twaainee/FlowBuddy.git
    cd FlowBuddy

2.  **Open the project**

    -   Simply open `index.html` in your browser, or

    -   Use a local development server (e.g., Live Server extension in VS Code)

3.  **Allow camera access** when prompted.

### Running Locally

Because MediaPipe loads models via WebAssembly, it's best to serve the files from a local HTTP server:

bash

# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

Then open `http://localhost:8000` in your browser.

* * * * *

📖 Usage
--------

1.  **Home Page** -- Read the privacy notice and click *"Begin Flow"*.

2.  **Select a Pose** -- Choose from Mountain, Downward Dog, or Warrior I.

3.  **Practice Screen** -- Center yourself in the camera frame and follow the real-time feedback.

4.  **View Progress** -- See your session history and average alignment scores on the Progress page.

> 💡 **Tips for best results**
>
> -   Stand 1--2 meters from the camera.
>
>
> -   Ensure your full body is visible.
>
>
> -   Wear fitted, light-colored clothing.
>
>
> -   Practice in a well-lit room.

* * * * *

📁 Project Structure
--------------------

text

FlowBuddy/
├── index.html              # Home / Landing page
├── practice-select.html    # Pose selection screen
├── insession.html          # Main practice session with camera & feedback
├── progress.html           # Session history & alignment scores
├── privacy.html            # Privacy policy (detailed on-device processing note)
├── css/                    # Stylesheets
├── js/                     # JavaScript modules (MediaPipe integration, angle calculations)
├── assets/                 # Images, icons, pose reference images
└── README.md               # This file

* * * * *

🔮 Future Development
---------------------

Planned enhancements beyond the current MVP:

-   ✅ **Expand pose library** to 15+ common yoga poses (Warrior II, Triangle, Tree, Cobra, etc.)

-   ✅ **Audio cues** for hands‑free guidance ("Bend your front knee more")

-   ✅ **Skeleton color overlay** (green = good, yellow = needs work, red = incorrect)

-   ✅ **Wearable integration** (heart rate monitors, posture sensors via Web Bluetooth)

-   ✅ **User accounts & cloud sync** (optional, using Firebase)

-   ✅ **Personalized routines** based on past performance

* * * * *

🔒 Privacy
----------

FlowBuddy is designed with **privacy as a core principle**:

-   **No video or image data** is ever uploaded to any server.

-   **No personal information** is collected or stored.

-   **No analytics** or third-party tracking scripts.

-   Session history is stored **only on your device** using LocalStorage.

-   The privacy notice is prominently displayed before camera access.

For full details, see the [Privacy Policy](https://flowbuddy.vercel.app/privacy) page.

* * * * *

🤝 Contributing
---------------

Contributions are welcome! Since this is an open‑source student project, feel free to:

-   Report bugs or suggest features via [Issues](https://github.com/twaainee/FlowBuddy/issues)

-   Submit pull requests for bug fixes or new poses

-   Improve documentation or add translations

Please follow basic coding style (consistent indentation, meaningful variable names) and test your changes locally before submitting a PR.

* * * * *

📄 License
----------

This project is licensed under the **MIT License** -- see the [LICENSE](https://LICENSE) file for details.\
You are free to use, modify, and distribute this software for personal or commercial purposes, as long as you include the original copyright notice.

* * * * *

🙏 Acknowledgments
------------------

-   **Google MediaPipe** -- For providing an excellent, free, on‑device pose detection framework.

-   **TensorFlow.js** -- For making machine learning models runnable in the browser.

-   **Vercel** -- For free and easy hosting.

-   **Yoga instructors and testers** -- For validating angle thresholds and providing feedback.

-   **ICS -- 2nd Year BSCS** -- For support and encouragement.

* * * * *

📬 Contact
----------

**Developer**: Elijah Twaine Marquez\
**GitHub**: [@twaainee](https://github.com/twaainee)\
**Project Link**: <https://github.com/twaainee/FlowBuddy>

* * * * *

⭐ **If you find this project useful, please give it a star on GitHub!**\
🧘‍♀️ *Flow with confidence. Your form improves every breath.*
