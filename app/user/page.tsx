import { LoginForm } from "@/components/admin/login-form"
import { getCurrentUserSafe } from "@/lib/sessionCheck";
import { redirect } from "next/navigation";

export default async function Page() {

  const user = await getCurrentUserSafe();
  
      if (user?.type === "admin" && user.iss === "pharmacube") {
          redirect("/admin/dashboard");
      }

  return (
    <div className="flex min-h-svh w-full items-center justify-center  p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
