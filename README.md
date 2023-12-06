# Algo Bulls

NOTE: This was the first time I worked with so many new technologies. I did internships on MERN stack and had worked with laravel,php but this project was new to me and all the other technologies were overwhelming but I tried to complete as much as I can. I will also improve the website.

## Overview

This is a web application which works as a repilca of facebook. Still there are alot of things that can be improved. I still might need 2-3 days to work on it .  

the deployed site: [Algo Bulls](https://algo-bulls2-n9oi.vercel.app/)

## Getting Started

To run the project locally, follow these steps:

1. Clone the repository: `git clone https://github.com/your-username/your-repository.git`
2. Navigate to the project directory: `cd your-repository`
3. Install dependencies: `npm install`
4. Start the development server: `npm start`

## Features

- Create id and post your thoughts
- Work your way around likes and bookmarks
- Comment on your fav posts
- User authentication with Firebase Authentication.
- Creation of posts with content, author, and comments.
- Like and bookmark functionality with separate collections for MyLikes and MyBookmarks.
- State management using Redux, storing currentUser details for easy access.
- Pages for MyPosts, MyBookmarks, MyLikes, MyProfile, and Posts.
- Integration of ANT Design and Styled Components for UI enhancements.

## How It Works

Algo Bulls 2.0 is a social platform where users can sign up, log in, create posts, and interact with other users' content. The application relies on Firebase for user authentication and Firestore for data storage.

1. **User Authentication**: Users sign up, and their information is stored in the Firestore collection. Logging in is only possible if the user's email is present in the collection.

2. **Post Creation**: Users can create posts with various details such as content, author, and comments.

3. **Likes and Bookmarks**: The application includes functionalities for liking and bookmarking posts. This information is stored in separate collections (MyLikes and MyBookmarks).

4. **State Management with Redux**: The state management is handled by Redux, with the currentUser details stored in the state for easy access throughout the application.

5. **Pages and Components**: Different pages are designed for MyPosts, MyBookmarks, MyLikes, MyProfile, and Posts. Each page corresponds to a specific component.

6. **Technologies Used**: The application employs Reactjs, TypeScript (Ts and Tsx), Firebase, Redux, ANT Design, Styled Components, and Toastify for a seamless user experience.

## Technologies Used

- Reactjs
- TypeScript (Ts and Tsx)
- Firebase (Authentication and Firestore)
- Redux
- ANT Design
- Styled Components
- Toastify
