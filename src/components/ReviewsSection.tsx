"use client";

import { useState, useEffect } from 'react';
import { Star, CheckCircle2, Quote, Loader2 } from 'lucide-react';
import Image from 'next/image';

const MOCK_REVIEWS = [
    {
        id: "1",
        author_name: "Ananya Sharma",
        rating: 5,
        text: "Hill Tourism made our Siliguri stay unforgettable. The homestay was pristine, and the local recommendations were spot on. Truly a premium experience!",
        relative_time_description: "2 weeks ago",
        profile_photo_url: ""
    },
    {
        id: "2",
        author_name: "Rahul Mehra",
        rating: 5,
        text: "The best travel service in Siliguri. Professional staff and beautiful properties. We felt right at home. Highly recommended for family trips.",
        relative_time_description: "1 month ago",
        profile_photo_url: ""
    },
    {
        id: "3",
        author_name: "Priyanka Das",
        rating: 5,
        text: "Exceptional service! They handled everything from pickup to our stay in Darjeeling. The homestay near Deshbandhupara was very convenient.",
        relative_time_description: "3 days ago",
        author_initials: "PD"
    }
];

export function ReviewsSection() {
    const [reviews, setReviews] = useState<any[]>(MOCK_REVIEWS);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ rating: 4.9, total: 150 });

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch('/api/reviews');
                if (!response.ok) throw new Error('API not configured');

                const data = await response.json();
                if (data.reviews && data.reviews.length > 0) {
                    setReviews(data.reviews);
                    setStats({
                        rating: data.rating || 4.9,
                        total: data.user_ratings_total || 150
                    });
                }
            } catch (error) {
                console.log('Using mock data as fallback');
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, []);

    return (
        <section className="relative py-16 px-4 bg-neutral-900 overflow-hidden">
            {/* Soft decorative glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 blur-[120px] rounded-full opacity-50" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest w-fit">
                            Guest Experiences
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight leading-tight">
                            What Our <span className="text-primary-600 dark:text-primary-400">Travelers</span> Say
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-400 max-w-xl text-lg md:text-xl">
                            Real stories from travelers who explored the hills with Hill Tourism.
                        </p>
                    </div>

                    {/* Google Rating Card */}
                    <div className="flex items-center gap-4 bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-[2rem] border border-neutral-100 dark:border-white/5 shadow-sm">
                        <div className="w-16 h-16 bg-white dark:bg-neutral-800 rounded-2xl flex flex-col items-center justify-center shadow-md border border-neutral-100 dark:border-white/10">
                            <span className="text-2xl font-black text-neutral-900 dark:text-white">{stats.rating}</span>
                            <div className="flex gap-0.5">
                                {[...Array(Math.floor(stats.rating))].map((_, i) => (
                                    <Star key={i} className="w-2.5 h-2.5 text-accent-500 fill-current" />
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-neutral-900 dark:text-white">Excellent</span>
                                <CheckCircle2 className="w-4 h-4 text-primary-500" />
                            </div>
                            <p className="text-sm text-neutral-500 font-medium">{stats.total}+ Google Reviews</p>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {reviews.slice(0, 3).map((review, idx) => (
                            <div
                                key={review.id || idx}
                                className="group relative bg-white dark:bg-neutral-800/40 p-8 rounded-[2.5rem] border border-neutral-100 dark:border-white/5 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                            >
                                <Quote className="absolute -top-4 -right-4 w-24 h-24 text-primary-500/5 rotate-12 transition-transform group-hover:rotate-0" />

                                <div className="flex items-center gap-4 mb-8">
                                    {review.profile_photo_url ? (
                                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-lg ring-4 ring-primary-50 dark:ring-primary-900/20">
                                            <Image src={review.profile_photo_url} alt={review.author_name} fill className="object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-primary-50 dark:ring-primary-900/20">
                                            {review.author_initials || review.author_name.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="font-bold text-neutral-900 dark:text-white text-lg">{review.author_name}</h4>
                                        <p className="text-sm text-neutral-500 font-medium">Verified Local Guide</p>
                                    </div>
                                </div>

                                <div className="flex gap-1 mb-4">
                                    {[...Array(review.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-accent-500 fill-current" />
                                    ))}
                                </div>

                                <p className="text-neutral-700 dark:text-neutral-300 text-lg leading-relaxed italic mb-8 relative z-10 line-clamp-4">
                                    "{review.text}"
                                </p>

                                <div className="flex justify-between items-center pt-6 border-t border-neutral-50 dark:border-white/5">
                                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{review.relative_time_description}</span>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-tighter">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                        Google Map Review
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
