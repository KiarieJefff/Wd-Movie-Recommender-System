# Movie Recommender System

A modern web application built with Next.js that provides personalized movie recommendations using Firebase authentication and real-time data.

## Screenshots

#  Home Page

![Home Page](Movie-Recommender-System/Images/Screenshot%202026-04-23%20122446.png)

# Movie Details Page

![Movie Details Page](Movie-Recommender-System/Images/Screenshot%202026-04-23%20122824.png)

# User Profile Page

![User Profile Page](Movie-Recommender-System/Images/Screenshot%202026-04-23%20123006.png)

# Movie Wishlist Page

![Movie Wishlist Page](Movie-Recommender-System/Images/Screenshot%202026-04-23%20123206.png)

# Movie Recommendations Page

![Movie Recommendations Page](Movie-Recommender-System/Images/Screenshot%202026-04-23%20123036.png)


## Features

- **User Authentication**: Secure login/signup with Firebase
- **Movie Discovery**: Browse and search through extensive movie database
- **Personalized Recommendations**: AI-powered movie suggestions based on user preferences
- **Rating System**: Rate and review movies
- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark/Light Theme**: Toggle between themes for comfortable viewing

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore)
- **Styling**: CSS Modules, Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📁 Project Structure

```
Movie-Recommender-System/
├── app/                    # Next.js app router pages
│   ├── components/         # Reusable UI components
│   ├── movie/             # Movie detail pages
│   ├── profile/           # User profile page
│   └── layout.js          # Root layout
├── context/               # React context providers
├── lib/                   # Utility functions and Firebase config
├── public/                # Static assets
└── Images/                # Screenshots and images
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/KiarieJefff/Wd-Movie-Recommender-System.git
cd Wd-Movie-Recommender-System/Movie-Recommender-System
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a new Firebase project
   - Enable Authentication and Firestore
   - Copy your Firebase config to `lib/firebase.js`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 Usage

1. **Sign Up/Login**: Create an account or sign in with existing credentials
2. **Browse Movies**: Explore the movie collection with search and filter options
3. **Get Recommendations**: View personalized movie suggestions
4. **Rate Movies**: Rate movies you've watched to improve recommendations
5. **Manage Profile**: Update your preferences and viewing history

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **GitHub Repository**: https://github.com/KiarieJefff/Wd-Movie-Recommender-System

---

Built with ❤️ using Next.js and Firebase
