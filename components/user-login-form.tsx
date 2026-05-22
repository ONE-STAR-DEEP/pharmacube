"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { FormEvent, useState } from "react"
import { loginUser } from "@/lib/actions/auth"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const [data, setData] = useState({
    identifier: "",
    password: "",
  })
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    setMsg("")

    e.preventDefault()
    try {

      const res = await loginUser(data);

      if (!res.success) {
        setMsg(res.message)
        return;
      }

      router.push(`/${res?.user?.type}/dashboard`);
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="">
        <CardHeader className="flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="logo"
            height={100}
            width={100}
            className="mx-auto"
          />
          <h1 className="text-xl font-bold uppercase">Pharma Cube</h1>
          <CardTitle>Welcom to Pharma Cube</CardTitle>
          <CardDescription>
            Enter your mobile below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>

              <Field>
                <FieldLabel htmlFor="mobile">Mobile</FieldLabel>

                <Input
                  id="mobile"
                  type="tel"
                  value={data.identifier}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ""); // remove non-digits
                    setData((prev) => ({
                      ...prev,
                      identifier: e.target.value
                    }));
                  }}
                  maxLength={15}
                  placeholder="Enter mobile number"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={data.password}
                    placeholder="Password"
                    required
                    onChange={(e) => {
                      setData((prev) => ({
                        ...prev,
                        password: e.target.value
                      }));
                    }}
                    className="pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Field>
              <p className="text-red-600 font-semibold">{msg}</p>
              <Field>
                <Button type="submit">Login</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
