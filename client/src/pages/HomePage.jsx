import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProblemCategories from '../components/ProblemCategories';
import HowItWorks from '../components/HowItWorks';
import StakeholderSection from '../components/StakeholderSection';
import Features from '../components/Features';
import ImpactSection from '../components/ImpactSection';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-civic-bg text-civic-text antialiased">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Sections */}
      <main className="flex-1">
        <Hero />
        <ProblemCategories />
        <HowItWorks />
        <StakeholderSection />
        <Features />
        <ImpactSection />
        <CallToAction />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
