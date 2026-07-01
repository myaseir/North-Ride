import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowRight, BookOpen } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';

export const metadata = {
  title: 'Blog | North Ride - Travel Journal',
  description: 'Read our latest travel guides for Gilgit, Skardu, Hunza, and the Twin Cities.',
};

export default function BlogPage() {
  return (
    <main className="min-h-[100svh] bg-white text-slate-900 selection:bg-emerald-100 overflow-hidden">
      <Navbar />
      
    
      <Footer />
    </main>
  );
}