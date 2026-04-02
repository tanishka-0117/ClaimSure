import { Activity, FileText, LayoutGrid, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutGrid, label: 'Dashboard', end: true },
  { to: '/admin/claims', icon: FileText, label: 'Claims' },
  { to: '/admin/analytics', icon: Activity, label: 'Analytics' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminSideNav() {
  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-around border-t border-[#1e2025] bg-[#08090a]/95 px-3 backdrop-blur md:static md:h-auto md:flex-col md:justify-start md:gap-1 md:border-r md:border-t-0 md:bg-transparent md:px-0 md:py-3">
      {NAV_ITEMS.map((item, index) => {
        const Icon = item.icon;
        const isDividerAfterClaims = index === 2;

        return (
          <div key={item.to} className="contents">
            <NavLink
              to={item.to}
              end={item.end}
              title={item.label}
              className={({ isActive }) =>
                `grid h-9 w-9 place-items-center rounded-lg border text-[#5a5d6a] transition md:h-9 md:w-9 ${
                  isActive
                    ? 'border-[#0891b2]/30 bg-[#06b6d4]/10 text-[#06b6d4]'
                    : 'border-transparent hover:border-[#252830] hover:bg-[#0f1012] hover:text-[#f0f0f2]'
                }`
              }
            >
              <Icon className="h-4 w-4" />
            </NavLink>
            {isDividerAfterClaims && <div className="my-1 hidden h-px w-6 bg-[#1e2025] md:block" />}
          </div>
        );
      })}
    </aside>
  );
}
