"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link";
import { Users, FileText, LogOut, Home, LayoutDashboard, FileX } from "lucide-react";
import Image from "next/image";
import { logout } from "@/lib/logout";

export function AppSidebar() {
    return (

        <Sidebar
            variant="sidebar"
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

                        <SidebarMenuItem>
                            <Link
                                href="/reviewer/dashboard"
                                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition"
                            >
                                <LayoutDashboard size={18} />
                                <span>Dashboard</span>
                            </Link>
                        </SidebarMenuItem>
                        {/* Invoices */}
                        <SidebarMenuItem>
                            <Link
                                href="/reviewer/dashboard/invoices"
                                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition"
                            >
                                <FileText size={18} />
                                <span>Invoices</span>
                            </Link>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <Link
                                href="/reviewer/dashboard/discrepancies"
                                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition"
                            >
                                <FileX size={18} />
                                <span>Discrepancies</span>
                            </Link>
                        </SidebarMenuItem>

                        {/* Logout */}
                        <SidebarMenuItem>
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition text-left"
                            >
                                <LogOut size={18} />
                                <span>Logout</span>
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