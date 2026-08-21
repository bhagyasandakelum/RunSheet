"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar } from "@/components/ui/avatar";
import { Dropdown } from "@/components/ui/dropdown";
import { useRouter } from "next/navigation";

export const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const fullName = `${user.firstName} ${user.lastName}`;

  const dropdownItems = [
    {
      label: "My Profile",
      onClick: () => router.push("/profile"),
    },
    {
      label: "Account Settings",
      onClick: () => router.push("/settings"),
    },
    {
      label: "Sign Out",
      danger: true,
      onClick: () => {
        logout();
        router.push("/login");
      },
    },
  ];

  return (
    <Dropdown
      align="right"
      trigger={
        <button className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none select-none">
          <Avatar src={user.profilePhotoUrl} name={fullName} size="sm" />
          <svg
            className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      }
      items={dropdownItems}
    />
  );
};
