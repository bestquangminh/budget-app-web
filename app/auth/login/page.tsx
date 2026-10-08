'use client'

import {Field, FieldError, FieldGroup, FieldLabel, FieldSet} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group";
import {EyeOffIcon} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod";
import {useForm, Controller} from "react-hook-form";
const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(25),
});
export default function LoginPage() {
    const [isText, setIsText] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    function onSubmit(data: z.infer<typeof formSchema>) {
        console.log(data);
    }
    return (
        <div className="flex flex-1 flex-col">
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-lg text-gray-700">Login to keep tracking your money</p>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="mt-3">
                <FieldSet className="w-full max-w-xs">
                    <FieldGroup>
                        <Controller render={({field, fieldState}) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input {...field} aria-invalid={fieldState.invalid} id="email" type="email" placeholder="Max Leiter" />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )} name="email" control={form.control} />
                        <Controller name="password" control={form.control} render={({field, fieldState}) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <InputGroup>
                                    <InputGroupInput
                                        {...field}
                                        aria-invalid={fieldState.invalid}
                                        id="password"
                                        type={isText ? "text" : "password"}
                                        placeholder="Enter password"
                                    />
                                    <InputGroupAddon onClick={() => setIsText(!isText)} align="inline-end">
                                        <EyeOffIcon />
                                    </InputGroupAddon>
                                </InputGroup>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )} />
                    </FieldGroup>
                    <div className="flex justify-end"><a className="text-primary font-bold underline" href="">Forget password ?</a></div>
                    <Button type="submit" size="lg">Login</Button>
                </FieldSet>
            </form>
            <p className="mt-auto text-center">New here ? <a className="text-primary font-bold underline" href="">Create an account</a></p>
        </div>
    )
}