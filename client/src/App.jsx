import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Home from "./pages/Home.jsx";
import GroupPage from "./pages/Group.jsx";

export default function App() {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <motion.h1
        className="text-3xl md:text-4xl font-bold mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Expense Splitter
      </motion.h1>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/group/:id" element={<GroupPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
