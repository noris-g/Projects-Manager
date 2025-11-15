// NewProjectPopup.jsx
import React, { useState } from "react";
import apiClient from "../../lib/apiClient";

/**
 * Props:
 * - auth0Id: string (required, sent to backend)
 * - onProjectCreated?: (project) => void (optional callback)
 */
export default function NewProjectPopup({ auth0Id, onProjectCreated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState([]);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("");

  // NEW: roles as an array + input value
  const [roles, setRoles] = useState([]);
  const [rolesInput, setRolesInput] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setRoles([]);
    setRolesInput("");
    setError("");
  };
  async function createProject(payload) {
    const response = await apiClient.post("/projects", payload);
    return response.data; // project created (as returned by BE)
  }

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsOpen(false);
    resetForm();
  };

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleAddMember = () => {
    const email = memberEmail.trim();

    if (!email || !isValidEmail(email) || !memberRole) return;

    const alreadyExists = members.some(
      (m) => m.email.toLowerCase() === email.toLowerCase()
    );
    if (alreadyExists) {
      setError("This user is already in the list.");
      return;
    }

    setMembers((prev) => [...prev, { email, role: memberRole }]);
    setMemberEmail("");
    setMemberRole("");
    setError("");
  };

  const handleRemoveMember = (emailToRemove) => {
    setMembers((prev) =>
      prev.filter((m) => m.email.toLowerCase() !== emailToRemove.toLowerCase())
    );
  };

  const handleChangeMemberRole = (index, newRole) => {
    setMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, role: newRole } : m))
    );
  };

  // NEW: add role (letters only, no duplicates)
  const handleAddRole = () => {
    const value = rolesInput.trim();

    if (!value) return;

    // letters only A–Z
    if (!/^[A-Za-z]+$/.test(value)) {
      setError("Roles can only contain letters (no numbers or symbols).");
      return;
    }

    const normalized = value.toLowerCase();
    const alreadyExists = roles.some(
      (role) => role.toLowerCase() === normalized
    );

    if (alreadyExists) {
      setError("This role is already in the list.");
      return;
    }

    setRoles((prev) => [...prev, value]);
    setRolesInput("");
    setError("");
  };

  // NEW: remove role
  const handleRemoveRole = (roleToRemove) => {
    setRoles((prev) => prev.filter((role) => role !== roleToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        auth0Id,
        title: title.trim(),
        description: description.trim(),
        roles,
        members: members.map((m) => ({
          email: m.email,
          role: m.role,
        })),
      };

      const createdProject = await createProject(payload);

      console.log(createdProject);

      if (onProjectCreated) {
        onProjectCreated(createdProject);
      }

      setIsOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Something went wrong while creating the project."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <span className="i-lucide-plus text-base" />
        New project
      </button>

      {/* Popup / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Create new project
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Add a title, short description, roles, and members for this
                  project.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <span className="sr-only">Close</span>✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  placeholder="e.g. UniHack 2025 workspace"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="block w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  placeholder="Short summary of what this project is about..."
                />
              </div>

              {/* Roles */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Roles
                </label>

                {/* Existing roles as chips */}
                {roles.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-100"
                      >
                        <span className="capitalize">{role}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRole(role)}
                          className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-indigo-500 hover:bg-indigo-100 hover:text-indigo-700"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={rolesInput}
                    onChange={(e) => setRolesInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddRole();
                      }
                    }}
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    placeholder="Type a role (letters only)"
                  />
                  <button
                    type="button"
                    onClick={handleAddRole}
                    className="inline-flex items-center rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
                  >
                    Add
                  </button>
                </div>

                <p className="mt-1 text-xs text-gray-400">
                  Roles can only contain letters (A–Z). Press Enter or click Add
                  to add a role.
                </p>
              </div>

              {/* Members / Users */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Members
                </label>

                {members.length > 0 && (
  <div className="mb-3 space-y-2">
    {members.map((member, index) => (
      <div
        key={member.email}
        className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs shadow-sm"
      >
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">
            {member.email}
          </span>
          <span className="text-[11px] text-gray-500">
            Role:
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={member.role}
            onChange={(e) =>
              handleChangeMemberRole(index, e.target.value)
            }
            className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => handleRemoveMember(member.email)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] text-gray-500 transition hover:bg-red-50 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      </div>
    ))}
  </div>
)}


                {/* Add member input row */}
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="email"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      placeholder="user@example.com"
                    />

                    <select
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 sm:w-40"
                      disabled={roles.length === 0}
                    >
                      <option value="">Select role</option>
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleAddMember}
                      disabled={
                        !memberEmail ||
                        !isValidEmail(memberEmail) ||
                        !memberRole ||
                        roles.length === 0
                      }
                      className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
                    >
                      Add
                    </button>
                  </div>

                  <p className="text-[11px] text-gray-400">
                    Add members by email and assign them a role from the list
                    above. Roles must be defined first.
                  </p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating…
                    </span>
                  ) : (
                    "Create project"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
