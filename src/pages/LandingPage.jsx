import Header from "../components/landing/Header"
import Hero from "../components/landing/Hero"
import Stats from "../components/landing/Stats"
import Features from "../components/landing/Features"
import HowItWorks from "../components/landing/HowItWorks"
import CTA from "../components/landing/CTA"
import Footer from "../components/landing/Footer"

export default function LandingPage({ session }) {
  return (
    <>
      <div className="min-h-screen w-full bg-white relative font-montserrat">
        {/* Grid Background */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at 70% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
              linear-gradient(to right, #f3f4f6 1px, transparent 1px),
              linear-gradient(to bottom, #f3f4f6 1px, transparent 1px)
            `,
            backgroundSize: "100% 100%, 40px 40px, 40px 40px",
          }}
        />
        <div className="relative flex flex-col z-10">
          <Header session={session} />
          <Hero />
          <Stats />
          <Features />
          <HowItWorks />
          <CTA />
          <Footer />
        </div>
      </div>
    </>
  )
}