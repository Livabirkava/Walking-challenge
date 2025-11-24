import HabitTracker from './HabitTracker.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div style={{ padding: "16px", fontSize: "20px" }}>
        ✅ Walking Challenge – Habit Tracker
      </div>
      <HabitTracker />
    </div>
  );
}
