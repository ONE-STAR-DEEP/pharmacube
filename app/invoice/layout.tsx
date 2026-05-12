import { getCurrentUserSafe } from "@/lib/sessionCheck";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {

    const user = await getCurrentUserSafe();

    if (!user || user.iss !== "pharmacube") {
        redirect("/");
    }

    return (
        <div className="">
            {children}
        </div>
    );
}