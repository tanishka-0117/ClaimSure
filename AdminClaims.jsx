import { useEffect, useMemo, useState } from 'react';
import { Clock3, MapPin, ShieldCheck, UserRound } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AdminSideNav from '@/components/claimsure/AdminSideNav';
import AppHeader from '@/components/claimsure/AppHeader';
import { useAuth } from '@/lib/AuthContext';

export default function AdminClaims() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadClaims = async () => {
      setLoading(true);
      try {
        const data = await base44.entities.Claim.list('-created_date', 100);
        if (mounted) {
          setClaims(data);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadClaims();
    return () => {
      mounted = false;
    };
  }, []);

  const sortedClaims = useMemo(
    () =>
      [...claims].sort((a, b) => {
        const aTime = new Date(a.created_date || a.createdDate || 0).getTime();
        const bTime = new Date(b.created_date || b.createdDate || 0).getTime();
        return bTime - aTime;
      }),
    [claims]
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#08090a] font-inter text-[#f0f0f2]">


      <AppHeader 
        user={user}
        title="Admin Claims Feed"
        showSync={true}
        syncStatus="global online"
      />


      <div className="flex flex-1 overflow-hidden">
        <div className="hidden w-[65px] border-r border-[#1e2025] md:block">
          <AdminSideNav />
        </div>

        <main className="flex-1 overflow-y-auto p-3 scrollbar-custom sm:p-5">
          <section className="rounded-xl border border-[#1e2025] bg-[#0f1012] p-4">

            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#1e2025] pb-3">
              <h1 className="text-2xl">Live Claims Feed</h1>
              <span className="rounded border border-[#1e2025] bg-[#141618] px-2 py-1 text-[10px] uppercase tracking-wider text-[#5a5d6a]">
                {loading ? 'loading...' : `${sortedClaims.length} records`}
              </span>
            </div>

            {loading && <div className="text-sm text-[#5a5d6a]">Loading claim records...</div>}

            {!loading && sortedClaims.length === 0 && (
              <div className="rounded-lg border border-[#252830] bg-[#141618] p-4 text-sm text-[#a0a3b0]">
                No claims found yet.
              </div>
            )}

            {!loading && sortedClaims.length > 0 && (
              <div className="space-y-2">
                {sortedClaims.map((claim) => {
                  const isApproved = claim.status === 'AUTO_APPROVED';
                  const created = claim.created_date || claim.createdDate;

                  return (
                    <article key={claim.id || claim.claimId} className="rounded-lg border border-[#1e2025] bg-[#141618] p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-md border px-2 py-1 text-[10px] uppercase tracking-wider ${
                            isApproved
                              ? 'border-[#0891b2]/30 bg-[#06b6d4]/10 text-[#06b6d4]'
                              : claim.status === 'FLAGGED'
                                ? 'border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#3b82f6]'
                                : 'border-[#6366f1]/30 bg-[#6366f1]/10 text-[#6366f1]'
                          }`}
                        >
                          {claim.status || 'UNKNOWN'}
                        </span>
                        <span className="text-sm text-[#a0a3b0]">{claim.claimId || 'Claim'}</span>
                        <span className="ml-auto text-lg text-[#06b6d4]">₹{claim.payoutAmount || 0}</span>
                      </div>

                      <div className="mt-3 grid gap-2 text-xs text-[#a0a3b0] md:grid-cols-2 xl:grid-cols-4">
                        <div className="flex items-center gap-2"><UserRound className="h-3.5 w-3.5 text-[#5a5d6a]" /> {claim.workerName || 'Unknown worker'}</div>
                        <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-[#5a5d6a]" /> {(claim.city || 'Unknown city').toLowerCase()}</div>
                        <div className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-[#06b6d4]" /> CPS {claim.cpsScore || 0}</div>
                        <div className="flex items-center gap-2 xl:justify-end"><Clock3 className="h-3.5 w-3.5 text-[#5a5d6a]" /> {created ? new Date(created).toLocaleString() : 'Unknown time'}</div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>

      <div className="md:hidden">
        <AdminSideNav />
      </div>
    </div>
  );
}

