import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./Pages/LandingPage"
import HomePage from "./Pages/HomePage";
import ProfilePage from "./Pages/ProfilePage";
import UserPage from "./Pages/UserPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile/:userPk" element={<ProfilePage />} />
        <Route path="/user/:userPk" element={<UserPage />} />
      </Routes>
    </Router>
  );
};

export default App;
