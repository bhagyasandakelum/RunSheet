import { Metadata } from "next";
import { EditProfileForm } from "@/features/profile";

export const metadata: Metadata = {
  title: "Edit Profile | RunSheet",
  description: "Update your profile information, contact details, and avatar on RunSheet.",
};

export default function EditProfilePage() {
  return <EditProfileForm />;
}
