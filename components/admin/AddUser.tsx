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
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { UserFormData } from "@/utils/types/DataTypes";
import Select from "react-select";
import { City, Country, State } from "country-state-city";
import { selectClassNames, selectStyles } from "@/utils/selectStyles";
import { insertUser } from "@/lib/actions/users";
import { useRouter } from "next/navigation";

type Option = {
    label: string;
    value: string;
};

const AddUser = () => {

    const [open, setOpen] = useState(false);

    const initialUserFormData: UserFormData = {
        name: "",
        email: "",
        mobile: "",
        type: "admin",
        address: "",
        city: "",
        state: "",
        pincode: "",
        password: "",
    };
    const [data, setData] = useState<UserFormData>(initialUserFormData);

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
        { label: "Warehouse", value: "warehouse" },
        { label: "Checker", value: "checker" },
        { label: "Reviewer", value: "reviewer" },
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const res = await insertUser(data);

        if (!res.success) {
            SetMsg(res.message)
            setAlertBox(true);
            return;
        }

        setData(initialUserFormData);
        setOpen(false);
        router.refresh();
    }

    return (
        <div>
            <Button onClick={() => { setOpen(true) }}><Plus /> Add User</Button>

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
                            <DialogTitle className="text-xl">Add User Details</DialogTitle>
                            <DialogDescription>
                                Enter the details below to register a new user in the system.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-2">

                            <FieldLabel className="text-lg mt-4 text-primary">
                                User Details
                            </FieldLabel>
                            <FieldGroup className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">

                                <Field>
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" name="name" placeholder="Name" required
                                        className="h-10"
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                name: e.target.value
                                            }))
                                        }
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" placeholder="ex@example.com"
                                        className="h-10"
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                email: e.target.value
                                            }))
                                        }
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="mobile">Mobile</Label>
                                    <Input id="mobile" name="mobile" placeholder="999999XXXX" required
                                        className="h-10"
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                mobile: e.target.value
                                            }))
                                        }
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" name="password" placeholder="Password" required
                                        className="h-10"
                                        minLength={8}
                                        value={data.password}
                                        onChange={(e) =>
                                            setData(prev => ({
                                                ...prev,
                                                password: e.target.value
                                            }))
                                        }
                                    />
                                </Field>

                                <Field>
                                    <Label htmlFor="mobile">User Type</Label>
                                    <Select<Option>
                                        required
                                        instanceId={"tax-id"}
                                        options={userTypeOptions}
                                        defaultValue={{ value: "admin", label: "Admin" }}
                                        placeholder="User Account Type"
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
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Submit</Button>
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