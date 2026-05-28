import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
            </Head>
            <div className="font-sans bg-[var(--light-color)] text-[var(--dark-color)]">
                {/* Navigation */}
                <nav className="bg-white shadow-sm py-4 sticky top-0 z-50">
                    <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <span
                        className="text-2xl font-bold mr-2"
                        style={{ color: "var(--primary-color)" }}
                        >
                        LogoAI
                        </span>
                        <span className="text-xl font-semibold">.ai</span>
                    </div>

                    <div className="hidden md:flex space-x-8">
                        <a href="#features" className="nav-link">
                        Features
                        </a>
                        <a href="#pricing" className="nav-link">
                        Pricing
                        </a>
                        <a href="#resources" className="nav-link">
                        Resources
                        </a>
                        <a href="#" className="nav-link">
                        About
                        </a>
                    </div>

                    <div className="flex items-center space-x-4">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="btn-primary px-6 py-2 rounded-md"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="px-4 py-2 rounded-md font-medium"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={register()}
                                    className="btn-primary px-6 py-2 rounded-md"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    <button className="md:hidden text-gray-700">
                        <i className="fas fa-bars text-xl"></i>
                    </button>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="hero-gradient py-20">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row items-center">
                            <div className="md:w-1/2 mb-10 md:mb-0">
                                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                    Transform Your Modeling with{" "}
                                    <span style={{ color: "var(--primary-color)" }}>AI Power</span>
                                </h1>
                                <p className="text-lg text-gray-600 mb-8">
                                    Create stunning AI models with our cutting-edge platform. Perfect
                                    for professionals and beginners alike.
                                </p>
                                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                                    <Link href={register()} className="btn-primary px-8 py-3 rounded-md text-center">Start Free Trial</Link>
                                    <a href="#" className="px-8 py-3 rounded-md border border-gray-300 font-medium text-center">See Demo</a>
                                </div>
                                <div className="mt-6 flex items-center">
                                    <div className="flex -space-x-2">
                                        <img
                                            src="https://randomuser.me/api/portraits/women/12.jpg"
                                            className="w-10 h-10 rounded-full border-2 border-white"
                                            alt="User"
                                        />
                                        <img
                                            src="https://randomuser.me/api/portraits/men/32.jpg"
                                            className="w-10 h-10 rounded-full border-2 border-white"
                                            alt="User"
                                        />
                                        <img
                                            src="https://randomuser.me/api/portraits/women/44.jpg"
                                            className="w-10 h-10 rounded-full border-2 border-white"
                                            alt="User"
                                        />
                                    </div>
                                    <p className="ml-4 text-gray-600">
                                    Trusted by <span className="font-semibold">10,000+</span>{" "}
                                    professionals
                                    </p>
                                </div>
                            </div>
                            <div className="md:w-1/2">
                                <div className="relative">
                                    <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full" style={{ backgroundColor: "var(--primary-color)", opacity: 0.2 }}></div>
                                    <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full" style={{ backgroundColor: "var(--primary-color)", opacity: 0.2 }}></div>
                                    <img src="/images/ai-model-banner.png" alt="AI Model" className="relative rounded-xl w-full max-w-lg mx-auto"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ... keep Clients, Features, Demo, Pricing, Testimonials, CTA here ... */}

                <section id="features" className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for <span style={{ color: "var(--primary-color)" }}>AI Modeling</span></h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Our platform offers everything you need to create, manage, and optimize your AI models with ease.</p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="feature-card bg-white p-8 rounded-xl">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(245, 205, 21, 0.1)" }} >
                                    <i className="fas fa-brain text-2xl" style={{color: "var(--primary-color)"}}></i>
                                </div>
                                <h3 className="text-xl font-bold mb-3">Advanced AI Models</h3>
                                <p className="text-gray-600">Access state-of-the-art AI models trained on diverse datasets for superior performance.</p>
                            </div>
                            
                            <div className="feature-card bg-white p-8 rounded-xl">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(245, 205, 21, 0.1);" }}>
                                    <i className="fas fa-sliders-h text-2xl" style={{ color: "var(--primary-color)" }}></i>
                                </div>
                                <h3 className="text-xl font-bold mb-3">Customizable Parameters</h3>
                                <p className="text-gray-600">Fine-tune every aspect of your models with intuitive controls and real-time previews.</p>
                            </div>
                            
                            <div className="feature-card bg-white p-8 rounded-xl">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{backgroundColor: "rgba(245, 205, 21, 0.1)"}}>
                                    <i className="fas fa-bolt text-2xl" style={{ color: "var(--primary-color);" }}></i>
                                </div>
                                <h3 className="text-xl font-bold mb-3">Lightning Fast Processing</h3>
                                <p className="text-gray-600">Our cloud infrastructure delivers results in seconds, not hours.</p>
                            </div>
                            
                            <div className="feature-card bg-white p-8 rounded-xl">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(245, 205, 21, 0.1)"}}>
                                    <i className="fas fa-shield-alt text-2xl" style={{ color: "var(--primary-color)" }}></i>
                                </div>
                                <h3 className="text-xl font-bold mb-3">Enterprise Security</h3>
                                <p className="text-gray-600">Military-grade encryption and privacy controls to protect your data.</p>
                            </div>
                            
                            <div className="feature-card bg-white p-8 rounded-xl">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(245, 205, 21, 0.1)" }}>
                                    <i className="fas fa-chart-line text-2xl" style={{ color: "var(--primary-color)" }}></i>
                                </div>
                                <h3 className="text-xl font-bold mb-3">Performance Analytics</h3>
                                <p className="text-gray-600">Detailed metrics and insights to optimize your model's performance.</p>
                            </div>
                            
                            <div className="feature-card bg-white p-8 rounded-xl">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(245, 205, 21, 0.1)"}}>
                                    <i className="fas fa-users text-2xl" style={{color: "var(--primary-color)"}}></i>
                                </div>
                                <h3 className="text-xl font-bold mb-3">Collaboration Tools</h3>
                                <p className="text-gray-600">Share, comment, and work together with your team in real-time.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row items-center">
                            <div className="md:w-1/2 mb-10 md:mb-0">
                                <div className="relative rounded-xl overflow-hidden shadow-xl">
                                    <img
                                            src="https://www.onmodel.ai/img/img_modelswap_screenshot.png"
                                            className="w-full"
                                            alt="Dashboard Demo"
                                        />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                                            <i className="fas fa-play text-2xl" style={{color: "var(--primary-color)"}}></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="md:w-1/2 md:pl-12">
                                <h2 className="text-3xl md:text-4xl font-bold mb-6">See ModelAI <span style={{color: "var(--primary-color)"}}>in Action</span></h2>
                                <p className="text-lg text-gray-600 mb-8">Watch our quick demo to see how easy it is to create stunning AI models with our platform. From setup to final output, we've streamlined the entire process.</p>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-start">
                                        <i className="fas fa-check-circle mt-1 mr-3" style={{color: "var(--primary-color)"}}></i>
                                        <span>No coding experience required</span>
                                    </li>
                                    <li className="flex items-start">
                                        <i className="fas fa-check-circle mt-1 mr-3" style={{color: "var(--primary-color)"}}></i>
                                        <span>Real-time preview of your changes</span>
                                    </li>
                                    <li className="flex items-start">
                                        <i className="fas fa-check-circle mt-1 mr-3" style={{ color: "var(--primary-color)"}}></i>
                                        <span>Export in multiple formats</span>
                                    </li>
                                </ul>
                                <a href="#" className="btn-primary px-8 py-3 rounded-md inline-block">Watch Full Demo</a>
                            </div>
                        </div>
                    </div>
                </section>


                <section id="pricing" className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent <span style={{color: "var(--primary-color)"}}>Pricing</span></h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Choose the plan that fits your needs. No hidden fees, cancel anytime.</p>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <div className="pricing-card bg-white p-8 rounded-xl border border-gray-200">
                                <h3 className="text-xl font-bold mb-2">Starter</h3>
                                <p className="text-gray-600 mb-6">Perfect for individuals getting started</p>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold">$19</span>
                                    <span className="text-gray-600">/month</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-start">
                                        <i className="fas fa-check mt-1 mr-3 text-gray-400"></i>
                                        <span>5 AI models per month</span>
                                    </li>
                                    <li className="flex items-start">
                                        <i className="fas fa-check mt-1 mr-3 text-gray-400"></i>
                                        <span>Basic customization</span>
                                    </li>
                                    <li className="flex items-start">
                                        <i className="fas fa-check mt-1 mr-3 text-gray-400"></i>
                                        <span>Email support</span>
                                    </li>
                                </ul>
                                <a href="#" className="block text-center px-6 py-3 rounded-md border border-gray-300 font-medium">Get Started</a>
                            </div>
                            
                            <div className="pricing-card bg-white p-8 rounded-xl border-2 highlighted relative" style={{borderColor: "var(--primary-color)" }}>
                                <div className="absolute top-0 right-0 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
                                    Most Popular
                                </div>
                                <h3 className="text-xl font-bold mb-2">Professional</h3>
                                <p className="text-gray-600 mb-6">For professionals and small teams</p>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold">$49</span>
                                    <span className="text-gray-600">/month</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-start">
                                        <i className="fas fa-check mt-1 mr-3" style={{color: "var(--primary-color)"}}></i>
                                        <span>20 AI models per month</span>
                                    </li>
                                    <li className="flex items-start">
                                        <i className="fas fa-check mt-1 mr-3" style={{color: "var(--primary-color)"}}></i>
                                        <span>Advanced customization</span>
                                    </li>
                                    <li className="flex items-start">
                                        <i className="fas fa-check mt-1 mr-3" style={{color: "var(--primary-color)"}}></i>
                                        <span>Priority support</span>
                                    </li>
                                    <li className="flex items-start">
                                        <i className="fas fa-check mt-1 mr-3" style={{color: "var(--primary-color)"}}></i>
                                        <span>Team collaboration</span>
                                    </li>
                                </ul>
                                <a href="#" className="btn-primary block text-center px-6 py-3 rounded-md">Get Started</a>
                            </div>
                            
                            <div className="pricing-card bg-white p-8 rounded-xl border border-gray-200">
                                <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                                <p className="text-gray-600 mb-6">For large organizations</p>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold">$99</span>
                                    <span className="text-gray-600">/month</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-start">
                                        <i className="fas fa-check mt-1 mr-3 text-gray-400"></i>
                                        <span>Unlimited AI models</span>
                                    </li>
                                    <li className="flex items-start">
                                        <i className="fas fa-check mt-1 mr-3 text-gray-400"></i>
                                        <span>Full customization</span>
                                    </li>
                                    <li className="flex items-start">
                                        <i className="fas fa-check mt-1 mr-3 text-gray-400"></i>
                                        <span>24/7 dedicated support</span>
                                    </li>
                                    <li className="flex items-start">
                                        <i className="fas fa-check mt-1 mr-3 text-gray-400"></i>
                                        <span>Advanced analytics</span>
                                    </li>
                                    <li className="flex items-start">
                                        <i className="fas fa-check mt-1 mr-3 text-gray-400"></i>
                                        <span>API access</span>
                                    </li>
                                </ul>
                                <a href="#" className="block text-center px-6 py-3 rounded-md border border-gray-300 font-medium">Get Started</a>
                            </div>
                        </div>
                        
                        <div className="mt-12 text-center">
                            <p className="text-gray-600">Need something custom? <a href="#" className="font-medium" style={{color: "var(--primary-color)"}}>Contact our sales team</a></p>
                        </div>
                    </div>
                </section>

                <section id="resources" className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our <span style={{color: "var(--primary-color);"}}>Clients Say</span></h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Don't just take our word for it. Here's what our customers have to say about ModelAI.</p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-xl shadow-sm">
                                <div className="flex items-center mb-6">
                                    <img
                                            src="https://randomuser.me/api/portraits/women/32.jpg"
                                            className="w-12 h-12 rounded-full mr-4"
                                            alt="Sarah Johnson"
                                        />
                                    <div>
                                        <h4 className="font-bold">Sarah Johnson</h4>
                                        <p className="text-gray-600 text-sm">Creative Director</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 mb-6">"ModelAI has completely transformed our workflow. The quality of the AI models is exceptional and the interface is so intuitive."</p>
                                <div className="flex" style={{color:"var(--primary-color)"}}>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                </div>
                            </div>
                            
                            <div className="bg-white p-8 rounded-xl shadow-sm">
                                <div className="flex items-center mb-6">
                                    <img
                                            src="https://randomuser.me/api/portraits/men/54.jpg"
                                            className="w-12 h-12 rounded-full mr-4"
                                            alt="Michael Chen"
                                        />
                                    <div>
                                        <h4 className="font-bold">Michael Chen</h4>
                                        <p className="text-gray-600 text-sm">Tech Startup Founder</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 mb-6">"As a small startup, we couldn't afford an in-house AI team. ModelAI gives us access to professional-grade models at a fraction of the cost."</p>
                                <div className="flex" style={{ color: "var(--primary-color)"}}>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                </div>
                            </div>
                            
                            <div className="bg-white p-8 rounded-xl shadow-sm">
                                <div className="flex items-center mb-6">
                                    <img
                                            src="https://randomuser.me/api/portraits/women/68.jpg"
                                            className="w-12 h-12 rounded-full mr-4"
                                            alt="Emma Rodriguez"
                                        />
                                    <div>
                                        <h4 className="font-bold">Emma Rodriguez</h4>
                                        <p className="text-gray-600 text-sm">Marketing Manager</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 mb-6">"The speed and quality of the models are unmatched. We've reduced our production time by 60% since switching to ModelAI."</p>
                                <div className="flex" style={{ color: "var(--primary-color)"}}>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star-half-alt"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20" style={{ backgroundColor: "var(--primary-color)" }}>
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Modeling Workflow?</h2>
                        <p className="text-lg mb-8 max-w-2xl mx-auto">Join thousands of professionals who are already creating stunning AI models with our platform.</p>
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <a href="#" className="px-8 py-3 rounded-md bg-black text-white font-medium">Start Free Trial</a>
                            <a href="#" className="px-8 py-3 rounded-md bg-white text-gray-900 font-medium">Schedule Demo</a>
                        </div>
                    </div>
                </section>

                <footer className="py-12 text-gray-300" style={{ backgroundColor: "var(--footer-color)" }}>
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-4 gap-10 text-left">
                            <div>
                                <div className="flex items-center mb-4">
                                    <span
                                    className="text-2xl font-bold mr-2"
                                    style={{ color: "var(--primary-color)" }}
                                    >
                                    LogoAI
                                    </span>
                                    <span className="text-xl font-semibold text-white">.ai</span>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    ModelAI is the next-gen AI modeling platform helping creators,
                                    brands, and businesses transform their workflows with intelligent
                                    automation.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-white">
                                    Quick Links
                                </h3>
                                <ul className="space-y-2">
                                    <li>
                                    <a href="#features" className="hover:text-yellow-400 transition">
                                        Features
                                    </a>
                                    </li>
                                    <li>
                                    <a href="#pricing" className="hover:text-yellow-400 transition">
                                        Pricing
                                    </a>
                                    </li>
                                    <li>
                                    <a href="#resources" className="hover:text-yellow-400 transition">
                                        Resources
                                    </a>
                                    </li>
                                    <li>
                                    <a href="#about" className="hover:text-yellow-400 transition">
                                        About
                                    </a>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-white">Support</h3>
                                <ul className="space-y-2">
                                    <li>
                                    <a href="#" className="hover:text-yellow-400 transition">
                                        Help Center
                                    </a>
                                    </li>
                                    <li>
                                    <a href="#" className="hover:text-yellow-400 transition">
                                        FAQs
                                    </a>
                                    </li>
                                    <li>
                                    <a href="#" className="hover:text-yellow-400 transition">
                                        Contact Us
                                    </a>
                                    </li>
                                    <li>
                                    <a href="#" className="hover:text-yellow-400 transition">
                                        API Docs
                                    </a>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-white">
                                    Stay Updated
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Subscribe to get the latest updates, tips, and offers.
                                </p>
                                <form className="flex">
                                    <input
                                    type="email"
                                    placeholder="Your email"
                                    className="w-full p-2 bg-white rounded-l-md focus:outline-none text-gray-900"
                                    />
                                    <button
                                    type="submit"
                                    className="px-4 py-2 rounded-r-md font-semibold"
                                    style={{
                                        backgroundColor: "var(--primary-color)",
                                        color: "var(--dark-color)",
                                    }}
                                    >
                                    Subscribe
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                            <p>© 2025 LogoAI. All rights reserved.</p>
                            <div className="flex space-x-4 mt-4 md:mt-0">
                            <a href="#" className="hover:text-yellow-400">
                                <i className="fab fa-facebook-f"></i>
                            </a>
                            <a href="#" className="hover:text-yellow-400">
                                <i className="fab fa-twitter"></i>
                            </a>
                            <a href="#" className="hover:text-yellow-400">
                                <i className="fab fa-linkedin-in"></i>
                            </a>
                            <a href="#" className="hover:text-yellow-400">
                                <i className="fab fa-instagram"></i>
                            </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
