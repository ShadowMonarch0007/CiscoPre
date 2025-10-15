import { useState } from "react"
import { motion } from "framer-motion"
import Home from "./pages/Home.jsx"
import Group from "./pages/Group.jsx"

export default function App() {
  const [groupId, setGroupId] = useState(null)

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <motion.h1
        className="text-3xl md:text-4xl font-bold mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Expense Splitter
      </motion.h1>

      {!groupId ? (
        <Home onEnterGroup={(id) => setGroupId(id)} />
      ) : (
        <Group groupId={groupId} onBack={() => setGroupId(null)} />
      )}
    </div>
  )
}
