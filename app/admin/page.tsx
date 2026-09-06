import { redirect } from "next/navigation";

// Redirect bare /admin to /admin/dashboard
export default function AdminRoot() {
  redirect("/admin/dashboard");
}
