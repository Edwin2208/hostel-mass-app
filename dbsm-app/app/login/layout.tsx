import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Don Bosco Skill Mission Center",
  description: "Login to the DBSM Hostel Management Portal",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
