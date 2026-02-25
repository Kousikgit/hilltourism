"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    MapPin, Calendar, TrendingUp, Sparkles, Clock,
    ArrowLeft, CheckCircle2, ChevronRight, Mountain,
    Wind, Coffee, Utensils, Hotel, Car, ShieldCheck,
    Wifi, Home, Users, Search, Loader2, Compass,
    X, ChevronLeft, Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tour, homestayService } from '@/lib/services';
import { Navbar } from '@/components/Navbar';
import { cn } from '@/lib/utils';
import { TourBookingFlow } from '@/components/TourBookingFlow';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function TourDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [tour, setTour] = useState<Tour | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    const generatePDF = () => {
        if (!tour) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Add Logo/Header
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129); // Emerald-500
        doc.text('HILL TOURISM', 14, 22);

        // Tour Name
        doc.setFontSize(18);
        doc.setTextColor(33, 33, 33);
        doc.text(tour.name.toUpperCase(), 14, 35);

        // Simple Info Row
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Duration: ${tour.duration}`, 14, 45);
        doc.text(`Difficulty: ${tour.difficulty}`, 60, 45);
        doc.text(`Category: ${tour.category}`, 110, 45);

        // Locations
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(33, 33, 33);
        doc.text('Key Locations & Stops', 14, 55);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const locationsText = tour.locations.join(' -> ');
        const splitLocations = doc.splitTextToSize(locationsText, pageWidth - 28);
        doc.text(splitLocations, 14, 62);

        let currentY = 62 + (splitLocations.length * 5) + 10;

        // Amenities
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Tour Amenities', 14, currentY);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        currentY += 7;
        const amenitiesText = tour.amenities?.join(', ') || 'Not specified';
        const splitAmenities = doc.splitTextToSize(amenitiesText, pageWidth - 28);
        doc.text(splitAmenities, 14, currentY);
        currentY += (splitAmenities.length * 5) + 10;

        // Itinerary Table
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Expedition Roadmap', 14, currentY);
        currentY += 5;

        const tableData = tour.itinerary.map(day => [
            `Day 0${day.day}`,
            day.title,
            day.activities.join('\n')
        ]);

        autoTable(doc, {
            startY: currentY,
            head: [['Day', 'Title', 'Activities']],
            body: tableData,
            headStyles: { fillColor: [16, 185, 129] },
            styles: { fontSize: 9, cellPadding: 5 },
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 40 },
                2: { cellWidth: 'auto' }
            }
        });

        doc.save(`${tour.name.replace(/\s+/g, '_')}_Roadmap.pdf`);
    };

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setIsLightboxOpen(true);
    };

    const nextLightboxImage = () => {
        setLightboxIndex((prev) => (prev + 1) % (tour?.images?.length || 1));
    };

    const prevLightboxImage = () => {
        setLightboxIndex((prev) => (prev - 1 + (tour?.images?.length || 0)) % (tour?.images?.length || 1));
    };

    useEffect(() => {
        const fetchTour = async () => {
            try {
                if (typeof id === 'string') {
                    const data = await homestayService.getTourById(id);
                    setTour(data);
                }
            } catch (error) {
                console.error('Error fetching tour:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTour();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-stone-50 dark:bg-neutral-950">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                <p className="text-neutral-400 font-black uppercase tracking-[0.4em] text-[10px]">Assembling Expedition</p>
            </div>
        );
    }

    if (!tour) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-stone-50 dark:bg-neutral-950">
                <Compass className="w-20 h-20 text-neutral-200 dark:text-neutral-800" />
                <h2 className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Expedition Not Found</h2>
                <Button onClick={() => router.push('/')} variant="primary" className="rounded-2xl px-8">Back to Discoveries</Button>
            </div>
        );
    }

    const showPrice = tour.category === "Domestic Tour" || tour.category === "Religious Tour";

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-neutral-950 pb-24">

            {/* Immersive Gallery Section - Full Width at Top */}
            <div className="relative pt-16">
                <div className="max-w-[1600px] mx-auto px-4 lg:px-12">
                    <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[500px]">
                        {/* Main Image Container - Left Side */}
                        <div
                            className="relative lg:w-2/3 h-[300px] md:h-[450px] lg:h-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-emerald-900/10 group cursor-zoom-in"
                            onClick={() => openLightbox(activeImage)}
                        >
                            {tour.images.length > 0 ? (
                                <Image
                                    src={tour.images[activeImage]}
                                    alt={tour.name}
                                    fill
                                    className="object-cover transition-all duration-700 group-hover:scale-105"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                    <Compass className="w-20 h-20 text-neutral-300 dark:text-neutral-700" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-transparent to-transparent" />

                            {/* Back Button */}
                            <div className="absolute top-8 left-8">
                                <button
                                    onClick={(e) => { e.stopPropagation(); router.back(); }}
                                    className="p-3 bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl text-white hover:bg-white/30 transition-all group"
                                >
                                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                </button>
                            </div>

                            {/* Zoom Indicator */}
                            <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="p-3 bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl text-white">
                                    <Maximize2 className="w-5 h-5" />
                                </div>
                            </div>

                            {/* Floating Stats */}
                            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500 rounded-full text-[10px] font-black text-white uppercase tracking-widest w-fit">
                                        {tour.category}
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-tight">
                                        {tour.name}
                                    </h1>
                                </div>
                            </div>
                        </div>

                        {/* Side Thumbnails - Right Side (2 Columns on Large) */}
                        <div className="lg:w-1/3 flex flex-row lg:grid lg:grid-cols-2 gap-4 lg:gap-3 overflow-x-auto lg:overflow-y-auto lg:h-full shrink-0 scrollbar-hide py-2">
                            {tour.images.map((img, idx) => {
                                const isLastVisible = idx === 3 && tour.images.length > 4;
                                const remainingCount = tour.images.length - 4;

                                if (idx > 3 && typeof window !== 'undefined' && window.innerWidth > 1024) return null;

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => idx === 3 && tour.images.length > 4 ? openLightbox(3) : setActiveImage(idx)}
                                        className={cn(
                                            "relative h-24 lg:h-auto lg:aspect-square w-40 lg:w-full shrink-0 rounded-3xl overflow-hidden border-2 transition-all",
                                            activeImage === idx
                                                ? "border-emerald-500 scale-[1.02] shadow-xl shadow-emerald-500/20"
                                                : "border-transparent opacity-70 hover:opacity-100"
                                        )}
                                    >
                                        <Image src={img} alt="" fill className="object-cover" unoptimized />
                                        {isLastVisible && (
                                            <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                                                <span className="text-2xl font-black">+{remainingCount}</span>
                                                <span className="text-[8px] font-bold uppercase tracking-widest">Photos</span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Sections - Positioned Below Gallery */}
            <div className="max-w-7xl mx-auto px-4 mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Details Column */}
                    <div className="lg:col-span-8 space-y-16">
                        {/* Quick Info Bar */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="flex items-center gap-2.5 bg-white dark:bg-neutral-900 p-4 rounded-[1.5rem] border border-neutral-100 dark:border-white/5">
                                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-500">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Duration</div>
                                    <div className="text-xs font-black text-neutral-900 dark:text-white uppercase">{tour.duration}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 bg-white dark:bg-neutral-900 p-4 rounded-[1.5rem] border border-neutral-100 dark:border-white/5">
                                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-500">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Difficulty</div>
                                    <div className="text-xs font-black text-neutral-900 dark:text-white uppercase">{tour.difficulty}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 bg-white dark:bg-neutral-900 p-4 rounded-[1.5rem] border border-neutral-100 dark:border-white/5">
                                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-500">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Starts At</div>
                                    <div className="text-xs font-black text-neutral-900 dark:text-white uppercase truncate">{tour.locations[0] || 'Multiple'}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 bg-white dark:bg-neutral-900 p-4 rounded-[1.5rem] border border-neutral-100 dark:border-white/5">
                                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-500">
                                    <Users className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Capacity</div>
                                    <div className="text-xs font-black text-neutral-900 dark:text-white uppercase">12 Pax</div>
                                </div>
                            </div>
                        </div>


                        {/* Tour Amenities */}
                        {(tour.amenities?.length ?? 0) > 0 && (
                            <div className="space-y-6 p-8 bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-100 dark:border-white/5">
                                <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-emerald-500" /> Tour Amenities
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {tour.amenities.map((amenity, idx) => {
                                        // Simple mapping or default icon
                                        const Icon = amenity.includes('Wi-Fi') ? Wifi : CheckCircle2;
                                        return (
                                            <div key={idx} className="bg-neutral-50 dark:bg-white/5 px-6 py-4 rounded-2xl border border-neutral-100 dark:border-white/5 flex items-center gap-3 group hover:border-emerald-500/30 transition-all">
                                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-500">
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <span className="text-[10px] font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-widest">{amenity}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Key Locations */}
                        <div className="space-y-6 p-8 bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-100 dark:border-white/5">
                            <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-emerald-500" /> Key Locations & Stops
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {tour.locations.map((loc, idx) => (
                                    <div key={idx} className="bg-neutral-50 dark:bg-white/5 px-6 py-3 rounded-2xl border border-neutral-100 dark:border-white/5 flex items-center gap-3 group hover:border-emerald-500/30 transition-all">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span className="text-xs font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-widest">{loc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Itinerary */}
                        <div className="space-y-12">
                            <h2 className="text-3xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">The <span className="text-emerald-500">Expedition</span> Roadmap</h2>
                            <div className="space-y-6">
                                {tour.itinerary.map((day, idx) => (
                                    <div key={idx} className="group relative pl-12 pb-12 last:pb-0">
                                        <div className="absolute left-6 top-0 bottom-0 w-px bg-neutral-200 dark:bg-white/10 group-last:bottom-auto group-last:h-8" />
                                        <div className="absolute left-[1.125rem] top-0 w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 z-10" />

                                        <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-6 md:p-8 border border-neutral-100 dark:border-white/5 transition-all hover:shadow-2xl hover:shadow-emerald-900/5">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                                <div className="flex items-center gap-6">
                                                    <div className="text-3xl font-black text-emerald-500/20 uppercase tracking-tighter shrink-0 flex flex-col items-center leading-none">
                                                        <span className="text-[10px] tracking-[0.2em] mb-1">Day</span>
                                                        <span>0{day.day}</span>
                                                    </div>
                                                    <h3 className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tight leading-tight">{day.title}</h3>
                                                </div>
                                            </div>
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {day.activities.map((act, aIdx) => (
                                                    <li key={aIdx} className="flex items-start gap-4 p-3 bg-neutral-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-emerald-500/20 transition-all">
                                                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-500 mt-0.5">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-neutral-600 dark:text-neutral-400 font-bold text-sm leading-tight">{act}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Overview */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Expedition <span className="text-emerald-500">Overview</span></h2>
                            {(() => {
                                let sections = [];
                                try {
                                    sections = tour.description ? JSON.parse(tour.description) : [];
                                    if (!Array.isArray(sections)) throw new Error('Not an array');
                                } catch (e) {
                                    sections = tour.description ? [{ title: '', content: tour.description }] : [];
                                }

                                if (sections.length === 0) return (
                                    <p className="text-neutral-500 dark:text-neutral-400 text-xl leading-relaxed font-medium">
                                        No description available.
                                    </p>
                                );

                                return (
                                    <div className="space-y-6">
                                        {sections.map((section: any, idx: number) => (
                                            <div key={idx} className="space-y-2">
                                                {section.title && <h3 className="text-lg font-black text-neutral-900 dark:text-white uppercase tracking-tight">{section.title}</h3>}
                                                <p className="text-neutral-500 dark:text-neutral-400 text-xl leading-relaxed font-medium whitespace-pre-wrap">
                                                    {section.content}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Booking Sidebar Column */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="sticky top-32 space-y-8">
                            {/* Primary Action Card */}
                            <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 border border-neutral-100 dark:border-white/5 shadow-2xl shadow-emerald-900/10 space-y-6">
                                {showPrice && (
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Investment starts from</div>
                                        <div className="flex items-baseline gap-2">
                                            {tour.discount_percent && tour.discount_percent > 0 ? (
                                                <>
                                                    <span className="text-3xl lg:text-4xl font-black text-neutral-900 dark:text-white tracking-tighter">
                                                        ₹{Math.round(tour.price * (1 - tour.discount_percent / 100)).toLocaleString()}
                                                    </span>
                                                    <span className="text-lg font-bold text-neutral-400 line-through decoration-rose-500/50">₹{tour.price.toLocaleString()}</span>
                                                </>
                                            ) : (
                                                <span className="text-3xl lg:text-4xl font-black text-neutral-900 dark:text-white tracking-tighter">₹{tour.price.toLocaleString()}</span>
                                            )}
                                            <span className="text-neutral-500 text-xs font-bold uppercase tracking-widest">/ Guest</span>
                                        </div>
                                        {(tour.discount_percent ?? 0) > 0 && (
                                            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-500 text-white text-[8px] font-black uppercase tracking-widest rounded-md mt-1 italic">
                                                Special {tour.discount_percent}% Off
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {tour.category === "Domestic Tour" ? (
                                        <Button
                                            onClick={() => setIsBookingOpen(true)}
                                            className="w-full rounded-2xl py-6 h-auto font-black uppercase text-sm tracking-widest shadow-xl shadow-emerald-600/20"
                                        >
                                            Review & Pay
                                        </Button>
                                    ) : (
                                        <a
                                            href={`https://wa.me/918293674862?text=${encodeURIComponent(`Hi! I'm interested in the ${tour.name} expedition (${tour.category}). Could you provide more details?`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full"
                                        >
                                            <Button className="w-full rounded-2xl py-6 h-auto font-black uppercase text-sm tracking-widest bg-[#25D366] hover:bg-[#128C7E] text-white border-none shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2">
                                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                                </svg>
                                                Enquire on WhatsApp
                                            </Button>
                                        </a>
                                    )}
                                    <Button
                                        onClick={generatePDF}
                                        variant="glass"
                                        className="w-full rounded-2xl py-5 h-auto font-black uppercase text-[10px] tracking-widest text-emerald-600"
                                    >
                                        Download PDF Roadmap
                                    </Button>
                                </div>
                                <div className="space-y-3 pt-6 border-t border-neutral-100 dark:border-white/5">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Guaranteed Best Experience</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Sparkles className="w-5 h-5 text-emerald-500" />
                                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Expert Local Guidance</span>
                                    </div>
                                </div>
                            </div>

                            {/* Inclusions */}
                            <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 border border-neutral-100 dark:border-white/5 space-y-6">
                                <h3 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Package <span className="text-emerald-500">Inclusions</span></h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {tour.package_includes.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-emerald-500/20 transition-all">
                                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-500">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                            <span className="text-[10px] font-black text-neutral-600 dark:text-neutral-300 uppercase tracking-widest">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-[100] bg-neutral-950 flex flex-col items-center justify-center animate-in fade-in duration-300">
                    {/* Top Bar */}
                    <div className="absolute top-0 inset-x-0 p-8 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
                        <div className="text-white">
                            <h3 className="text-sm font-black uppercase tracking-widest">{tour.name}</h3>
                            <p className="text-[10px] text-white/60 font-medium uppercase tracking-[0.2em]">Image {lightboxIndex + 1} of {tour.images.length}</p>
                        </div>
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all hover:rotate-90"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Main Image View */}
                    <div className="relative w-full h-[70vh] flex items-center justify-center p-4">
                        <button
                            onClick={prevLightboxImage}
                            className="absolute left-8 p-6 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all z-20 group"
                        >
                            <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
                        </button>

                        <div className="relative w-full h-full max-w-6xl">
                            <Image
                                src={tour.images[lightboxIndex]}
                                alt=""
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </div>

                        <button
                            onClick={nextLightboxImage}
                            className="absolute right-8 p-6 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all z-20 group"
                        >
                            <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Bottom Thumbnail Strip */}
                    <div className="absolute bottom-8 inset-x-0 px-8">
                        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide py-4">
                            {tour.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setLightboxIndex(idx)}
                                    className={cn(
                                        "relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all",
                                        lightboxIndex === idx ? "border-emerald-500 scale-110" : "border-transparent opacity-50 hover:opacity-100"
                                    )}
                                >
                                    <Image src={img} alt="" fill className="object-cover" unoptimized />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* Tour Booking Flow Modal */}
            {isBookingOpen && (
                <TourBookingFlow
                    tour={tour}
                    onClose={() => setIsBookingOpen(false)}
                />
            )}
            {/* Sticky Mobile Navbar - Added for Mobile Functionality */}
            <div className="fixed bottom-6 inset-x-6 z-[60] lg:hidden">
                <div className="bg-neutral-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 flex items-center justify-between shadow-2xl shadow-black/50">
                    <div className="space-y-0.5">
                        <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                            {showPrice ? 'Investment' : 'Get Quote'}
                        </div>
                        {showPrice && (
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-black text-white italic-none">
                                    ₹{tour.discount_percent && tour.discount_percent > 0
                                        ? Math.round(tour.price * (1 - tour.discount_percent / 100)).toLocaleString()
                                        : tour.price.toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>

                    {tour.category === "Domestic Tour" ? (
                        <Button
                            size="sm"
                            onClick={() => setIsBookingOpen(true)}
                            className="rounded-xl px-6 h-12 shadow-xl shadow-emerald-600/20 font-bold text-[10px] uppercase tracking-widest"
                        >
                            Reserve This Tour
                        </Button>
                    ) : (
                        <a
                            href={`https://wa.me/918293674862?text=${encodeURIComponent(`Hi! I'm interested in the ${tour.name} expedition (${tour.category}). Could you provide more details?`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button size="sm" className="rounded-xl px-6 h-12 shadow-xl shadow-emerald-600/20 font-bold text-[10px] uppercase tracking-widest bg-[#25D366] hover:bg-[#128C7E] text-white border-none flex gap-2">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                                Enquire
                            </Button>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
