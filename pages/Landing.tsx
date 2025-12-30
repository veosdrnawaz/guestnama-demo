import React from 'react';
import { Users, Calendar, CheckCircle, Shield, ArrowRight } from 'lucide-react';

interface LandingProps {
  onStart: () => void;
  onLogin: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart, onLogin }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-20 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">G</div>
          <span className="text-xl font-bold tracking-tight text-[#0f172a]">Guest<span className="text-amber-500">Nama</span></span>
        </div>
        <button onClick={onLogin} className="text-sm font-semibold flex items-center gap-1 hover:text-amber-600 transition-colors">
          Get Started <ArrowRight className="w-4 h-4" />
        </button>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 lg:py-32 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold mb-8">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          Hospitality made simple
        </div>
        <h1 className="text-5xl lg:text-7xl font-serif text-[#0f172a] mb-6">
          Manage your guests <br />
          <span className="text-amber-500">with elegance</span>
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-2xl mx-auto">
          A sophisticated platform for organizing events, tracking RSVPs, and ensuring every guest feels welcome. From intimate gatherings to grand celebrations.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={onStart} className="px-8 py-3 bg-[#0f172a] text-white rounded-full font-semibold hover:bg-slate-800 transition-all flex items-center gap-2">
            Start Free <ArrowRight className="w-4 h-4" />
          </button>
          <button className="px-8 py-3 border border-slate-200 rounded-full font-semibold hover:bg-slate-50 transition-all">
            Learn More
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-[#0f172a] mb-4">Everything you need</h2>
            <p className="text-slate-500">Powerful features to make guest management effortless</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<Users className="w-6 h-6 text-amber-500" />}
              title="Guest Management"
              desc="Organize and track all your guests in one place"
            />
            <FeatureCard 
              icon={<Calendar className="w-6 h-6 text-amber-500" />}
              title="Event Tracking"
              desc="Manage multiple events with ease"
            />
            <FeatureCard 
              icon={<CheckCircle className="w-6 h-6 text-amber-500" />}
              title="RSVP Status"
              desc="Track confirmations and check-ins in real-time"
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-amber-500" />}
              title="Secure Access"
              desc="Role-based permissions for your team"
            />
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto bg-[#1e293b] rounded-[40px] p-12 lg:p-20 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-50"></div>
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-serif mb-6">Ready to streamline your <br /> guest management?</h2>
            <p className="text-slate-400 mb-10 max-w-lg mx-auto">Join thousands of event organizers who trust GuestNama for their hospitality needs.</p>
            <button onClick={onStart} className="inline-flex items-center gap-2 text-amber-500 font-bold hover:text-amber-400 transition-all">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 border-t border-slate-100 flex flex-col md:row items-center justify-between max-w-7xl mx-auto gap-4">
        <div className="flex items-center gap-2 opacity-80 scale-90">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">G</div>
          <span className="text-xl font-bold tracking-tight text-[#0f172a]">Guest<span className="text-amber-500">Nama</span></span>
        </div>
        <p className="text-slate-400 text-sm">© 2024 GuestNama. All rights reserved.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-[#0f172a] mb-2">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);