import { redirect } from "next/navigation";

export default function RootRedirect() {
  // Default entry point — goes to login (NextAuth will redirect to /home if logged in)
  redirect("/login");
}
