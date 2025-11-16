import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";

export default function TodoPage({ auth0Id, selectedProject }) {
  const [projectMembers, setProjectMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Task Popup State
  const [showPopup, setShowPopup] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    deadline: "",
    priority: "medium",
    assignedUsers: [],   // FIXED NAME
  });

  useEffect(() => {
    if (!selectedProject?._id) return;

    setLoading(true);
    apiClient
      .get(`/projects/${selectedProject._id}`)
      .then((res) => {
        const members = res.data.project.members.map((m) => ({
          id: m.userId.auth0Id, 
          username: m.userId.username,
          email: m.userId.email,
        }));
        setProjectMembers(members);
      })
      .catch((err) => console.error("Error loading project details:", err))
      .finally(() => setLoading(false));
  }, [selectedProject]);

  // 🔥 Load tasks for this project
  useEffect(() => {
    if (!selectedProject?._id) return;
    apiClient
      .get(`/tasks/project/${selectedProject._id}`)
      .then((res) => {setTasks(res.data.tasks);console.log(res)})

      .catch((err) => console.error("Error loading tasks:", err));
  }, [selectedProject]);

  // Toggle members in popup
  const toggleAssignedUser = (userId) => {
    setNewTask((prev) => {
      const exists = prev.assignedUsers.includes(userId);
      return {
        ...prev,
        assignedUsers: exists
          ? prev.assignedUsers.filter((id) => id !== userId)
          : [...prev.assignedUsers, userId],
      };
    });
  };

  // 🔥 Correct Create Task function
  const createTask = () => {
    if (!selectedProject?._id) {
      console.error("No project selected!");
      return;
    }

    const payload = {
      title: newTask.title,
      deadline: newTask.deadline,
      priority: newTask.priority,
      assignedUsers: newTask.assignedUsers,
      createdBy: auth0Id,
      projectId: selectedProject._id,
    };

    apiClient
      .post("/tasks", payload)
      .then((res) => {
        setTasks((prev) => [...prev, res.data.task]);

        // Reset form
        setNewTask({
          title: "",
          deadline: "",
          priority: "medium",
          assignedUsers: [],
        });

        setShowPopup(false);
      })
      .catch((err) => {
        console.error("Error creating task:", err.response?.data || err);
        console.log("Payload sent:", payload);
      });
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-slate-500">
        Loading project members...
      </div>
    );
  }

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Tasks</h1>

        <button
          onClick={() => setShowPopup(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Create Task
        </button>
      </div>

      {/* TASK LIST */}
      <div className="space-y-3">
        {tasks.length === 0 && (
          <p className="text-slate-500">No tasks created yet.</p>
        )}

        {tasks.map((task) => (
          <div
            key={task._id}
            className="border p-4 rounded-lg bg-white shadow-sm"
          >
            <h2 className="font-semibold">{task.title}</h2>

            {task.deadline && (
              <p className="text-sm text-slate-500">
                Deadline: {new Date(task.deadline).toLocaleString()}
              </p>
            )}

            <div className="text-sm mt-2">
              Assigned to:{" "}
              {task.assignedUsers.length > 0
                ? task.assignedUsers
                    .map((id) => {
                      const member = projectMembers.find((m) => m.id === id);
                      return member ? member.username : "Unknown";
                    })
                    .join(", ")
                : "Nobody"}
            </div>

            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-xs ${
                task.priority === "high"
                  ? "bg-red-200 text-red-700"
                  : task.priority === "low"
                  ? "bg-green-200 text-green-700"
                  : "bg-yellow-200 text-yellow-700"
              }`}
            >
              {task.priority}
            </span>
          </div>
        ))}
      </div>

      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white w-[420px] rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Task</h2>

            {/* TITLE */}
            <div className="mb-4">
              <label className="block text-sm mb-1 font-medium">Title</label>
              <input
                type="text"
                className="w-full border rounded-lg p-2"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
              />
            </div>

            {/* DEADLINE */}
            <div className="mb-4">
              <label className="block text-sm mb-1 font-medium">Deadline</label>
              <input
                type="datetime-local"
                className="w-full border rounded-lg p-2"
                value={newTask.deadline}
                onChange={(e) =>
                  setNewTask({ ...newTask, deadline: e.target.value })
                }
              />
            </div>

            {/* PRIORITY */}
            <div className="mb-4">
              <label className="block text-sm mb-1 font-medium">Priority</label>
              <select
                className="w-full border rounded-lg p-2"
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask({ ...newTask, priority: e.target.value })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* USERS */}
            <div className="mb-4">
              <label className="block text-sm mb-2 font-medium">Assign To</label>

              <div className="max-h-32 overflow-y-auto border rounded-lg p-2">
                {projectMembers.map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center gap-2 mb-1 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={newTask.assignedUsers.includes(m.id)}
                      onChange={() => toggleAssignedUser(m.id)}
                    />
                    {m.username} ({m.email})
                  </label>
                ))}
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
              >
                Cancel
              </button>

              <button
                onClick={createTask}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
