import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="glass-dark text-slate-300 mt-auto ">
      <div className="container py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm bg-gradient-to-br from-orange-500 to-orange-600">F</div>
              <span className="text-lg sm:text-xl font-bold text-white tracking-tight">Food Delivery</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">Delivering happiness, one meal at a time.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base tracking-tight">Company</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li><Link to="/" className="text-slate-400 hover:text-orange-400 transition-colors">About Us</Link></li>
              <li><Link to="/" className="text-slate-400 hover:text-orange-400 transition-colors">Careers</Link></li>
              <li><Link to="/" className="text-slate-400 hover:text-orange-400 transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base tracking-tight">Support</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li><Link to="/" className="text-slate-400 hover:text-orange-400 transition-colors">Help Center</Link></li>
              <li><Link to="/" className="text-slate-400 hover:text-orange-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/" className="text-slate-400 hover:text-orange-400 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base tracking-tight">Contact</h4>
            <p className="text-xs sm:text-sm text-slate-400">Kathmandu, Nepal</p>
            <p className="text-xs sm:text-sm text-slate-400">support@fooddelivery.com</p>
            <p className="text-xs sm:text-sm text-slate-400">+977 9800000000</p>
          </div>
        </div>
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-800 text-center text-xs sm:text-sm text-slate-500">
          © {new Date().getFullYear()} Food Delivery. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
