import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserSafe } from "@/lib/sessionCheck";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/account/sidebar";
import { RoleProvider } from "@/components/UserContext";
export default async function ProtectedLayout({
    children,
}: {
    children: ReactNode;
}) {
    const user = await getCurrentUserSafe();

    if (!user || user.type !== "account" || user.iss !== "pharmacube") {
        redirect("/");
    }

    return (
        <div className="min-h-screen flex flex-col">
            <RoleProvider role={user?.type || ""}>
                <SidebarProvider className="flex flex-1 flex-col">
                    {/* Header */}
                    <header className="h-12 fixed z-50 w-full bg-primary backdrop-blur-md px-4 flex items-center justify-between border-b border-muted-foreground/20">
                        <SidebarTrigger className="text-primary-foreground scale-150" />
                    </header>

                    {/* Body */}
                    <div className="flex flex-1">

                        {/* Sidebar */}
                        <AppSidebar />

                        {/* Content */}
                        <main className="flex-1 mt-12 overflow-auto">
                            <div className="mx-auto w-full max-w-7xl px-0 flex flex-col min-h-full">
                                {children}
                            </div>
                        </main>
                    </div>
                </SidebarProvider>
            </RoleProvider>
        </div>
    );
}