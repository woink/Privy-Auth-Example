"use client";

import AuthStatus from "./AuthStatus";

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md p-4">
      <div className="flex justify-end">
        <AuthStatus />
      </div>
    </nav>
  );
}
