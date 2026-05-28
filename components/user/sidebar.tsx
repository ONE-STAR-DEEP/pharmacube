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
import { Users, FileText, LogOut, Home, LayoutDashboard, FileX, FileUser } from "lucide-react";
import Image from "next/image";
import { logout } from "@/lib/logout";
import { usePathname } from "next/navigation";

export function AppSidebar() {

    const pathname = usePathname();

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
                                href="/user/dashboard"
                                className={`${pathname === "/admin/dashboard" ? "text-[#008dbc] font-semibold border-l-3 scale-110 border-[#008dbc]" : "hover:bg-primary/50 hover:text-white"} flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition`}
                            >
                                <LayoutDashboard size={18} />
                                <span>Dashboard</span>
                            </Link>
                        </SidebarMenuItem>
                        {/* Users */}
                        <SidebarMenuItem>
                            <Link
                                href="/user/dashboard/users"
                                className={`${pathname === "/admin/dashboard/users" ? "text-[#008dbc] font-semibold border-l-3 scale-110 border-[#008dbc]" : "hover:bg-primary/50 hover:text-white"} flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition`}
                            >
                                <Users size={18} />
                                <span>Users</span>
                            </Link>
                        </SidebarMenuItem>

                        {/* Invoices */}
                        <SidebarMenuItem>
                            <Link
                                href="/user/dashboard/invoices"
                                className={`${pathname === "/admin/dashboard/invoices" ? "text-[#008dbc] font-semibold border-l-3 scale-110 border-[#008dbc]" : "hover:bg-primary/50 hover:text-white"} flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition`}
                            >
                                <FileText size={18} />
                                <span>Invoices</span>
                            </Link>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <Link
                                href="/user/dashboard/clientDelivery"
                                className={`${pathname === "/admin/dashboard/clientDelivery" ? "text-[#008dbc] font-semibold border-l-3 scale-110 border-[#008dbc]" : "hover:bg-primary/50 hover:text-white"} flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition`}
                            >
                                <FileUser size={18} />
                                <span>CDC</span>
                            </Link>
                        </SidebarMenuItem>

                        {/* Invoices */}
                        <SidebarMenuItem>
                            <Link
                                href="/user/dashboard/discrepancy"
                                className={`${pathname === "/admin/dashboard/discrepancy" ? "text-[#008dbc] font-semibold border-l-3 scale-110 border-[#008dbc]" : "hover:bg-primary/50 hover:text-white"} flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition`}
                            >
                                <FileX size={18} />
                                <span>Discrepancy</span>
                            </Link>
                        </SidebarMenuItem>

                        {/* Logout */}
                        <SidebarMenuItem>
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-md transition text-left hover:bg-red-300 hover:cursor-pointer"
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