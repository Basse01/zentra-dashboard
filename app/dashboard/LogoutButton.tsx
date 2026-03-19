"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
  };

  return (
    <button
      onClick={logout}
      className="text-sm text-gray-400 hover:text-[#1a1a1a] transition-colors"
    >
      Logga ut
    </button>
  );
}
