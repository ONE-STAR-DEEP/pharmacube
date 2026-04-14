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
                                href="/rider/dashboard"
                                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition"
                            >
                                <LayoutDashboard size={18} />
                                <span>Dashboard</span>
                            </Link>
                        </SidebarMenuItem>
                        {/* Invoices */}

                            <Accordion type="single" collapsible className="w-full border-none bg-none">
                                <AccordionItem value="invoices" className="border-none bg-none">

                                    <AccordionTrigger className="p-0  bg-none">
                                        <SidebarMenuItem>
                                            <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition w-full">
                                                <FileText size={18} />
                                                <span>Invoices</span>
                                            </div>
                                        </SidebarMenuItem>
                                    </AccordionTrigger>

                                    <AccordionContent className="pl-8 v space-y-1">
                                        <Link href="/rider/dashboard/invoices" className="block px-3 py-1 hover:bg-muted rounded-md no-underline decoration-transparent">
                                            <span>All Invoices</span>
                                        </Link>
                                        <Link href="/rider/dashboard/invoices/accepted" className="block px-3 py-1 hover:bg-muted rounded-md no-underline decoration-transparent">
                                            Accepted Invoices
                                        </Link>
                                    </AccordionContent>

                                </AccordionItem>
                            </Accordion>


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