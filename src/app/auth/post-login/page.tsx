import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function PostLogin() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role === "OWNER") {
    redirect("/owner");
  }
  redirect("/staff");
}
