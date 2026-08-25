import { Metadata } from "next";
import { ProfileView } from "@/features/profile";

export const metadata: Metadata = {
  title: "My Profile | RunSheet",
  description: "View and manage your RunSheet personal profile and account credentials.",
};

export default function ProfilePage() {
  return <ProfileView />;
}
