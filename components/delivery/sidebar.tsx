"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import Link from "next/link";
import { FileText, LogOut, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import { logout } from "@/lib/logout";

export function AppSidebar() {

    const { toggleSidebar } = useSidebar();

    return (
        <Sidebar
            className="mt-12 h-[calc(100vh-3rem)] flex flex-col "
        >
            {/* Header */}
            <SidebarHeader className="px-4 text-lg font-semibold hover:cursor-default">
                <div className="flex items-center">

                    <Image
                        src="/logo.png"
                        alt="logo"
                        height={50}
                        width={50}
                    />
                    <p>
                        Pharma Cube
                    </p>
                </div>
            </SidebarHeader>

            {/* Content */}
            <SidebarContent className="flex-1 px-2">

                <SidebarGroup>
                    <SidebarMenu>

                        <SidebarMenuItem
                            onClick={() => { toggleSidebar() }}
                        >
                            <Link
                                href="/rider/dashboard"
                                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition"
                            >
                                <LayoutDashboard size={18} />
                                <span className="text-base font-medium">Dashboard</span>
                            </Link>
                        </SidebarMenuItem>
                        {/* Invoices */}

                        <SidebarMenuItem
                            onClick={toggleSidebar}
                        >
                            <Link href="/rider/dashboard/invoices"
                                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition"
                            >
                                <FileText size={18} />
                                <span className="text-base font-medium">All Invoices</span>
                            </Link>
                        </SidebarMenuItem>

                        {/* Logout */}
                        <SidebarMenuItem>
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition text-left"
                            >
                                <LogOut size={18} />
                                <span className="text-base font-medium">Logout</span>
                            </button>
                        </SidebarMenuItem>

                    </SidebarMenu>
                </SidebarGroup>

            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="px-4 text-sm text-muted-foreground">
                © Pharma Cube
            </SidebarFooter>
        </Sidebar>
    )
}