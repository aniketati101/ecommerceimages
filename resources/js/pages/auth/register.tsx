import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle, Mail, Lock, Github, Aperture, User} from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';


export default function Register() {
    return (
        <>
            <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-primary py-6 px-8 text-center">
                        <h1 className="text-2xl font-bold text-gray-900">Welcome</h1>
                        <p className="text-gray-700 mt-1">Sign in to your account</p> <i data-feather="mail" className="text-gray-400"></i>
                    </div>
                    <div className="p-8">
                        <Form
                            {...RegisteredUserController.store.form()}
                            resetOnSuccess={['password', 'password_confirmation']}
                            disableWhileProcessing
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="mb-6">
                                        <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">User Name</Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="text-gray-400" />
                                            </div>
                                            <Input 
                                                id="name"
                                                type="text"
                                                name="name"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary hovered-element"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="name"
                                                placeholder="Enter user name"
                                            />
                                            <InputError message={errors.name} className="mt-2" />
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="text-gray-400" />
                                            </div>
                                            <Input 
                                                id="email"
                                                type="email"
                                                name="email"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary hovered-element"
                                                required
                                                autoFocus
                                                tabIndex={2}
                                                autoComplete="email"
                                                placeholder="Enter your email"
                                            />
                                            <InputError message={errors.email} />
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="text-gray-400" />
                                            </div>
                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                                required
                                                tabIndex={3}
                                                autoComplete="new-password"
                                                placeholder="Enter New Password"
                                            />
                                            <InputError message={errors.password} />
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <Label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">Confirm password</Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="text-gray-400" />
                                            </div>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                name="password_confirmation"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                                required
                                                tabIndex={4}
                                                autoComplete="new-password"
                                                placeholder="Confirm password"
                                            />
                                            <InputError message={errors.password_confirmation} />
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full bg-primary text-gray-900 py-3 px-4 rounded-lg font-medium hover:bg-primary-dark transition duration-200" tabIndex={5} disabled={processing}>
                                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                        Create account
                                    </Button>

                                    <div className="mt-6 text-center">
                                        <p className="text-sm text-gray-600">
                                            Already have an account? 
                                            <TextLink className="text-primary font-medium hover:underline" href={login()} tabIndex={6}>
                                                 Log in
                                        </TextLink>
                                        </p>
                                    </div>
                                </>
                            )}
                        </Form>
                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                </div>
                            </div>
                            
                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <button type="button" className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    <Github className="mr-2" />
                                    GitHub
                                </button>
                                <button type="button" className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    <Aperture className="mr-2" />
                                    Google
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
