import { Form, Head } from '@inertiajs/react';
import { Briefcase, User, UserCog, LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function Register() {
    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />
            <Form
                method="post"
                action={route('register')}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Full name"
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">Confirm password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirm password"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Select defaultValue="user" name="role">
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Roles</SelectLabel>
                                            <SelectItem value="user">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    User
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="manager">
                                                <div className="flex items-center gap-2">
                                                    <UserCog className="h-4 w-4 text-muted-foreground" />
                                                    Manager
                                                </div>
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>

                                <InputError message={errors.role} />
                            </div>

                            <Button type="submit" className="mt-2 w-full" tabIndex={5}>
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Create account
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href={route('login')} tabIndex={6}>
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
