import { Link } from "react-router-dom";
import {
  UtensilsCrossed,
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Heart,
} from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto overflow-hidden bg-[#0a0a0a] text-slate-300">
      {/* Orange glow accents */}
      <div className="pointer-events-none absolute -left-40 top-0 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-red-500/10 blur-3xl" />

      {/* Top orange border */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

      <div className="relative container py-12 sm:py-14">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 sm:gap-10">

          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 via-orange-500 to-red-500 text-white shadow-md shadow-orange-500/30">
                <UtensilsCrossed size={18} strokeWidth={2.5} />
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#0a0a0a] bg-yellow-300" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Khana<span className="text-orange-400">Go</span>
              </span>
            </div>

            <p className="text-sm leading-relaxed text-slate-400">
              Delivering happiness, one meal at a time.
            </p>

            <p className="mt-3 text-xs font-medium uppercase tracking-widest text-orange-400">
              Your Food · Your Way
            </p>

            {/* Socials */}
            <div className="mt-5 flex items-center gap-2">
              {[
                { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61558983760722", label: "Facebook" },
                { icon: Instagram, href: "https://www.instagram.com/canikisssssyou/", label: "Instagram" },
                { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/60 text-slate-400 transition hover:border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-400"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* ⬇️ MOBILE: Company + Support side-by-side grid */}
          <div className="grid grid-cols-2 gap-6 sm:contents">
            {/* Company */}
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
                Company
              </h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-slate-400 transition-colors hover:text-orange-400">About Us</Link></li>
                <li><Link to="/" className="text-slate-400 transition-colors hover:text-orange-400">Careers</Link></li>
                <li><Link to="/" className="text-slate-400 transition-colors hover:text-orange-400">Blog</Link></li>
                <li><Link to="/deals" className="text-slate-400 transition-colors hover:text-orange-400">Deals</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
                Support
              </h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-slate-400 transition-colors hover:text-orange-400">Help Center</Link></li>
                <li><Link to="/" className="text-slate-400 transition-colors hover:text-orange-400">Terms of Service</Link></li>
                <li><Link to="/" className="text-slate-400 transition-colors hover:text-orange-400">Privacy Policy</Link></li>
                <li><Link to="/" className="text-slate-400 transition-colors hover:text-orange-400">Refunds</Link></li>
              </ul>
            </div>
          </div>

          {/* Contact (always full width on mobile, own column on desktop) */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2 text-slate-400">
                <MapPin size={15} className="mt-0.5 shrink-0 text-orange-400" />
                <span>Kathmandu, Nepal</span>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <Mail size={15} className="mt-0.5 shrink-0 text-orange-400" />
                <a href="mailto:support@khanago.com" className="break-all transition-colors hover:text-orange-400">
                  support@khanago.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <Phone size={15} className="mt-0.5 shrink-0 text-orange-400" />
                <a href="tel:+9779815631275" className="transition-colors hover:text-orange-400">
                  +977 9815631275
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-zinc-900 pt-6 sm:flex-row">
          <p className="text-center text-xs text-slate-500 sm:text-left">
            © {year} <span className="font-semibold text-white">KhanaGo</span>. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            Made with <Heart size={12} className="text-orange-500" fill="currentColor" /> in Nepal
          </p>
        </div>
      </div>

      {/* Extra bottom padding for mobile bottom nav */}
      <div className="h-16 md:hidden" />
    </footer>
  );
}