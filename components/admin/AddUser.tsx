"use client";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Edit, Plus, Trash } from 'lucide-react'
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { UserFormData } from "@/utils/types/DataTypes";
import Select from "react-select";
import { City, Country, State } from "country-state-city";
import { selectClassNames, selectStyles } from "@/utils/selectStyles";
import { fetchUserByID, insertUser, updateUser } from "@/lib/actions/users";
import { useRouter } from "next/navigation";

type Option = {
    label: string;
    value: string;
};

const AddUser = ({ mode, id }: {
    mode: "edit" | "add";
    id?: number
}) => {

    const [open, setOpen] = useState(false);

    const initialUserFormData: UserFormData = {
        name: "",
        email: null,
        mobile: "",
        type: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        password: "",
        plus: false
    };
    const [data, setData] = useState<UserFormData>(initialUserFormData);
    const [loading, setLoading] = useState(false);

    const [country, setCountry] = useState<Option | null>(null);
    const [state, setState] = useState<Option | null>(null);
    const [city, setCity] = useState<Option | null>(null);

    const [countries, setCountries] = useState<Option[]>([]);
    const [states, setStates] = useState<Option[]>([]);
    const [cities, setCities] = useState<Option[]>([]);

    const [alertBox, setAlertBox] = useState(false);
    const [msg, SetMsg] = useState("");

    const router = useRouter();

    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])

    const userTypeOptions: Option[] = [
        { label: "Admin", value: "admin" },
        { label: "User (view only)", value: "user" },
        { label: "Warehouse", value: "warehouse" },
        { label: "Full Access", value: "fullAccess" },
        { label: "Reviewer", value: "reviewer" },
        { label: "Account", value: "account" },
        { label: "Rider", value: "rider" },
        { label: "Delivery", value: "delivery" }
    ]

    useEffect(() => {
        const allCountries = Country.getAllCountries().map((c) => ({
            label: c.name,
            value: c.isoCode,
        }));
        setCountries(allCountries);

        const india = allCountries.find((c) => c.value === "IN");
        if (india) setCountry(india);
    }, []);

    useEffect(() => {
        if (!country) return;

        const allStates = State.getStatesOfCountry(country.value).map((s) => ({
            label: s.name,
            value: s.isoCode,
        }));

        setStates(allStates);
        setState(null);
        setCities([]);
        setCity(null);
    }, [country]);

    useEffect(() => {
        if (!country || !state) return;

        const allCities = City.getCitiesOfState(
            country.value,
            state.value
        ).map((c) => ({
            label: c.name,
            value: c.name,
        }));

        setCities(allCities);
        setCity(null);
    }, [state, country]);

    useEffect(() => {
        if (!open || mode !== "edit" || !id) return;
        const loadData = async () => {
            const res = await fetchUserByID(id);
            if (!res.success) {
                alert("Failed to fetch")
                return
            }

            const data = res.data;

            setData({
                name: data?.name || "",
                email: data?.email || null,
                mobile: data?.mobile || "",
                type: data?.type || "",
                address: data?.address || "",
                city: data?.city || "",
                state: data?.state || "",
                pincode: data?.pincode || "",
                password: data?.password || "",
                plus: data?.plus || false
            });
            const matchedState = states.find(
                (s) => s.label === data?.state
            );

            setState(matchedState || null);

            const matchedCity = cities.find(
                (s) => s.label === data?.city
            );

            setCity(matchedCity || null);
        }
        loadData()

    }, [mode, id, open]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (loading) return;
        setLoading(true);

        try {
            let newData: UserFormData = { ...data };

            if (data.type === "warehouse+") {
                newData.type = "warehouse";
                newData.plus = true;
            } else if (data.type === "rider+") {
                newData.type = "rider";
                newData.plus = true;
            }

            if (mode === "add") {
                const res = await insertUser(newData);
                if (!res.success) {
                    SetMsg(res.message)
                    setAlertBox(true);
                    return;
                }
            }
            else if (mode === "edit" && id) {
                const res = await updateUser(id, newData);
                if (!res.success) {
                    SetMsg(res.message)
                    setAlertBox(true);
                    return;
                }
            }

            setData(initialUserFormData);
            router.refresh();
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
        setOpen(false);
        router.refresh();
    }

    return (
        <div>
            {mode === "add" ?
                <Button onClick={() => { setOpen(true) }}><Plus /> Add User</Button>
                :
                <Button onClick={() => { setOpen(true) }} className="flex items-center justify-start gap-2 w-full h-8 hover:bg-white/10!" variant={"ghost"}><Edit />Edit</Button>
            }

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    className="
                        w-full
                            max-w-[95vw]
                            sm:max-w-md
                            lg:max-w-[60vw]
                            lg:h-[70vh]
                            h-[80vh] 
                            flex flex-col
                            p-0
                            overflow-y-auto
                            "
                >
                    <form onSubmit={handleSubmit}>
                        <DialogHeader className="p-6 pb-2">
                            <DialogTitle className="text-xl">{mode === "add" ? "Add" : "Edit"} User Details</DialogTitle>
                            <DialogDescription>
                                {mode === "add" ? "Enter the details below to register a new user in the system." : "Edit the details below to update user data in the system."}
                            </DialogDescription>
                        </DialogHeader>

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-2">

                            <FieldLabel className="text-lg mt-4 text-primary">
                                User Details
                            </FieldLabel>
                            <FieldGroup className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">

                                <Field className="gap-0">
                                    <div className="flex ">
                                        <Label htmlFor="name" className="">Name</Label>
                                        <span className="text-red-500 ">*</span>
                                    </div>
                                    <Input id="name" name="name" placeholder="Name" required
                                        className="h-10"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                name: e.target.value
                                            }))
                                        }
                                    />
                                </Field>

                                <Field className="gap-0">
                                    <div className="flex">
                                        <Label htmlFor="mobile">Mobile</Label>
                                        <span className="text-red-500 ">*</span>
                                    </div>
                                    <Input id="mobile" name="mobile" placeholder="999999XXXX" required
                                        className="h-10"
                                        value={data.mobile}

                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                mobile: e.target.value
                                            }))
                                        }
                                    />
                                </Field>

                                <Field >
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" placeholder="ex@example.com"
                                        className="h-10"
                                        value={data.email || ""}

                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                email: e.target.value
                                            }))
                                        }
                                    />
                                </Field>

                                <Field className="gap-0">
                                    <div className="flex">
                                        <Label htmlFor="password">Password</Label><span className="text-red-500 ">*</span>
                                    </div>
                                    <Input id="password" type="password" name="password" placeholder="Password" required
                                        className="h-10"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                password: e.target.value
                                            }))
                                        }
                                    />
                                </Field>

                                <Field className="gap-0">
                                    <div className="flex">
                                        <Label htmlFor="mobile">User Type</Label><span className="text-red-500 ">*</span>
                                    </div>
                                    <Select<Option>
                                        required
                                        instanceId={"tax-id"}
                                        value={
                                            data.type
                                                ? { label: data.type, value: data.type }
                                                : null
                                        }
                                        options={userTypeOptions}
                                        placeholder="Select User Account Type"
                                        onChange={(val) => {
                                            if (!val) return;

                                            setData(prev => ({
                                                ...prev,
                                                type: val.value as UserFormData["type"]
                                            }));

                                        }}
                                        menuPortalTarget={mounted ? document.body : undefined}
                                        menuPosition="fixed"
                                        menuShouldBlockScroll={false}
                                        unstyled
                                        styles={selectStyles}
                                        classNames={selectClassNames}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" name="address" placeholder="Address"
                                        value={data.address}
                                        className="h-10"
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                address: e.target.value
                                            }))
                                        }
                                    />
                                </Field>

                                <Field>
                                    <Label>State</Label>
                                    <Select
                                        instanceId={"state"}
                                        options={states}
                                        value={state}
                                        placeholder="Select State"
                                        onChange={(val) => {
                                            setState(val);

                                            setData((prev) => ({
                                                ...prev,
                                                state: val?.label || "",
                                                city: "",
                                            }));
                                        }}

                                        menuPortalTarget={mounted ? document.body : undefined}
                                        menuPosition="fixed"
                                        menuShouldBlockScroll={false}

                                        unstyled
                                        styles={selectStyles}
                                        classNames={selectClassNames}
                                    />
                                </Field>

                                <Field>
                                    <Label>City</Label>
                                    <Select
                                        instanceId={"city"}
                                        options={cities}
                                        value={city}
                                        placeholder="Select City"
                                        isDisabled={!state}
                                        onChange={(val) => {
                                            setCity(val);

                                            setData((prev) => ({
                                                ...prev,
                                                city: val?.label || "",
                                            }));
                                        }}

                                        menuPortalTarget={mounted ? document.body : undefined}
                                        menuPosition="fixed"
                                        menuShouldBlockScroll={false}

                                        unstyled
                                        styles={selectStyles}
                                        classNames={selectClassNames}
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="pincode">Pincode</Label>
                                    <Input id="pincode" name="pincode" placeholder="000000"
                                        className="h-10"
                                        value={data.pincode}
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                pincode: e.target.value
                                            }))
                                        }
                                    />
                                </Field>
                            </FieldGroup>
                        </div>

                        {/* Clean Footer */}
                        <div className="p-6 pt-4 flex justify-end gap-3">
                            <DialogClose asChild>
                                <Button variant="outline" type="button">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={loading}>Submit</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={alertBox} onOpenChange={setAlertBox}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Failed to insert the new user!</AlertDialogTitle>
                        <AlertDialogDescription>
                            {msg}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction>Close</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    )
}

export default AddUser