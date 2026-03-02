import Link from 'next/link';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import Image from 'next/image';

export function Footer() {
    return (
        <footer className="bg-neutral-900 text-neutral-400 pt-20 pb-10 px-4">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                <div className="space-y-6">
                    <Link href="/" className="flex items-center gap-2 group text-white">
                        <Image src="/images/logo.png" alt="Hill Tourism Logo" width={140} height={40} className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
                    </Link>
                    <p className="text-neutral-500 leading-relaxed">
                        Elegance in every stay. Experience premium homestays curated for your comfort and peace of mind across India's most scenic locations.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="p-2 bg-neutral-800 rounded-full hover:bg-primary-600 transition-colors text-white">
                            <Instagram className="w-5 h-5" />
                        </a>
                        <a href="#" className="p-2 bg-neutral-800 rounded-full hover:bg-primary-600 transition-colors text-white">
                            <Facebook className="w-5 h-5" />
                        </a>
                        <a href="#" className="p-2 bg-neutral-800 rounded-full hover:bg-primary-600 transition-colors text-white">
                            <Twitter className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-6">Quick Links</h4>
                    <ul className="space-y-4">
                        <li><Link href="/properties" className="text-base font-medium hover:text-primary-500 transition-colors">Find a Stay</Link></li>
                        <li><Link href="/tours" className="text-base font-medium hover:text-primary-500 transition-colors">Tours</Link></li>
                        <li><Link href="/about" className="text-base font-medium hover:text-primary-500 transition-colors">Our Story</Link></li>
                        <li><Link href="/contact" className="text-base font-medium hover:text-primary-500 transition-colors">Contact Us</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-6">Support</h4>
                    <ul className="space-y-4">
                        <li><Link href="/terms" className="text-base font-medium hover:text-primary-500 transition-colors">Terms of Service</Link></li>
                        <li><Link href="/privacy" className="text-base font-medium hover:text-primary-500 transition-colors">Privacy Policy</Link></li>
                        <li><Link href="/refund" className="text-base font-medium hover:text-primary-500 transition-colors">Cancellation Policy</Link></li>
                        <li><Link href="/help" className="text-base font-medium hover:text-primary-500 transition-colors">FAQs</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-6">Office Location</h4>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-primary-500 shrink-0" />
                            <span>Deshbandhupara, Beside Dada Bhai Club Premises, Siliguri, WB-734003</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-primary-500 shrink-0" />
                            <span>+91 82936 74862 <br /> +91 62976 7414 </span>

                        </li>
                        <li className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-primary-500 shrink-0" />
                            <span>hilltourism2025@gmail.com

                            </span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-10 border-t border-neutral-800 text-center text-sm">
                <p>&copy; {new Date().getFullYear()} Hill Tourism. All rights reserved.</p>
            </div>
        </footer>
    );
}
