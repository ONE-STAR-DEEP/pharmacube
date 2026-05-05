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

export function AppSidebar({ plus }: { plus: boolean }) {

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

                        <SidebarMenuItem
                            onClick={() => { toggleSidebar() }}
                        >
                            <Link
                                href="/rider/dashboard/delivery"
                                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition"
                            >
                                <LayoutDashboard size={18} />
                                <span className="text-base font-medium">Delivery</span>
                            </Link>
                        </SidebarMenuItem>

                        {/* Invoices */}

                        <SidebarMenuItem>
                            <Accordion type="single" collapsible className="w-full hover:bg-muted border-none bg-transparent ">
                                <AccordionItem value="invoices" className="border-none bg-transparent data-open:bg-transparent">

                                    <AccordionTrigger className="p-0 decoration-transparent items-center" >
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-transparent hover:bg-muted transition w-full decoration-transparent">
                                            <FileText size={18} />
                                            <span className="text-base font-medium">Invoices</span>
                                        </div>
                                    </AccordionTrigger>

                                    <AccordionContent className="pl-8 v space-y-1 bg-transparent">
                                        <Link href="/rider/dashboard/invoices" className="block px-3 py-1 hover:bg-muted rounded-md no-underline decoration-transparent"
                                            onClick={toggleSidebar}
                                        >
                                            <span>All Invoices</span>
                                        </Link>
                                        <Link href="/rider/dashboard/invoices/accepted" className="block px-3 py-1 hover:bg-muted rounded-md no-underline decoration-transparent"
                                            onClick={toggleSidebar}
                                        >
                                            Accepted Invoices
                                        </Link>
                                        <Link href="/rider/dashboard/invoices/delivered" className="block px-3 py-1 hover:bg-muted rounded-md no-underline decoration-transparent"
                                            onClick={toggleSidebar}
                                        >
                                            Delivered
                                        </Link>
                                    </AccordionContent>

                                </AccordionItem>
                            </Accordion>
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