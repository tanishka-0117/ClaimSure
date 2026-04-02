import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Logo({ className = '', iconOnly = false }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 ${className}`} aria-label="Go to landing page">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg flex items-center justify-center">
        <Shield className="w-4 h-4 text-white" />
      </div>
      {!iconOnly && (
        <span className="text-lg font-semibold tracking-tight text-white">
          Claim<span className="text-cyan-400">Sure</span>
        </span>
      )}
    </Link>
  );
}
