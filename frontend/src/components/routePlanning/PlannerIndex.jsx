import { Link, Outlet } from 'react-router-dom';
import {
  FiUser,
  FiPlusCircle,
  FiCompass,
  FiClipboard,
  FiPauseCircle,
  FiBookmark,
  FiMapPin
} from "react-icons/fi";
import { useSelector } from "react-redux";
import NotFound from "../pages/NotFound";

const cards = [
  {
    id: 'track-fe',
    to: 'track/fe',
    requiredPermission: 'track_field_executive',
    title: 'Track Field Executive',
    description:
      'Monitor real-time locations, completed visits and delays across your field force to keep the day on track.',
    label: 'Live',
    icon: FiMapPin,
    footerLeft: 'Live map & status',
    footerRight: 'Open tracker ›',
    variant: 'primary',
  },
  {
    id: 'add-visit',
    to: 'client/add/visit',
    requiredPermission: 'add_visit',
    title: 'Add New Client Visit',
    description:
      'Capture upcoming meetings, preferred timeslots and visit objectives in just a few clicks.',
    label: 'Pipeline',
    icon: FiPlusCircle,
    gradientFrom: 'from-emerald-100/70',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    footerLeft: 'New client / existing',
    footerRight: 'Schedule ›',
    variant: 'default',
  },
  {
    id: 'assign-clients',
    to: 'assign-clients',
    requiredPermission: 'assign_clients',
    title: 'Assign Clients to FE',
    description:
      'Distribute visits intelligently across your field team to minimize travel and idle time.',
    label: 'Routing',
    icon: FiCompass,
    gradientFrom: 'from-indigo-100/70',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    footerLeft: 'Smart suggestions',
    footerRight: 'Assign ›',
    variant: 'default',
  },
  {
    id: 'unassigned',
    to: 'client/view/unassigned',
    requiredPermission: 'view_unassigned_clients',
    title: 'Show Unassigned Client',
    description:
      "Review all clients that are pending assignment and quickly move them into an FE's queue.",
    label: 'Backlog',
    icon: FiClipboard,
    gradientFrom: 'from-amber-100/70',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    footerLeft: 'Always up to date',
    footerRight: 'View list ›',
    variant: 'default',
  },
  {
    id: 'on-hold',
    to: 'client/view/onhold',
    requiredPermission: 'view_onhold_clients',
    title: 'Show On-Hold Clients',
    description:
      'Track temporarily paused relationships and decide when to reactivate visits or follow-ups.',
    label: 'Status',
    icon: FiPauseCircle,
    gradientFrom: 'from-fuchsia-100/70',
    badgeBg: 'bg-fuchsia-50',
    badgeText: 'text-fuchsia-700',
    footerLeft: 'Reason & timeline',
    footerRight: 'Review ›',
    variant: 'default',
  },
  {
    id: 'assigned-details',
    to: 'view/plan-details',
    requiredPermission: 'view_planner_details',
    title: 'Show Assigned Details',
    description:
      'See a consolidated view of which executive owns which clients, upcoming visits and status.',
    label: 'Overview',
    icon: FiBookmark,
    gradientFrom: 'from-cyan-100/70',
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-700',
    footerLeft: 'Filter by FE / client',
    footerRight: 'Open ›',
    variant: 'default',
  },
  {
    id: 'create-fe',
    to: 'fe/add',
    requiredPermission: 'create_field_executive',
    title: 'Create New Field Executive',
    description:
      'Add new executives, define coverage regions and manage their activity status.',
    label: 'Setup',
    icon: FiUser,
    gradientFrom: 'from-sky-100/70',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    footerLeft: 'Click to create',
    footerRight: 'Details ›',
    variant: 'default',
  },
  {
    id: 'create-temp-client',
    to: 'client/tempAdd',
    requiredPermission: 'create_temporary_client',
    title: 'Create Temporary Client',
    description:
      'Add Temporary clients, define coverage regions and manage their activity status.',
    label: 'Setup',
    icon: FiUser,
    gradientFrom: 'from-sky-100/70',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    footerLeft: 'Click to create',
    footerRight: 'Details ›',
    variant: 'default',
  }
];

const PlannerIndex = () => {
    const permissions = useSelector(
      (state) => state.user.userData?.permissions || []
    );

    const allowedCards = cards.filter(
      (card) =>
        !card.requiredPermission ||
        permissions.includes(card.requiredPermission)
    );

    if (allowedCards.length === 0) {
      return <NotFound />;
    }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 lg:px-6">
      {/* Page header */}
      <header className="mb-8 md:mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
          Route Optimization Planner
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          Plan, assign &amp; track client visits
        </h1>
      </header>

      {/* Cards grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allowedCards.map((card) => {
          const Icon = card.icon;
          const isPrimary = card.variant === 'primary';

          const baseClassesDefault =
            'group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)] backdrop-blur transition hover:-translate-y-1 hover:border-sky-300/80 hover:bg-white hover:shadow-[0_22px_50px_rgba(15,23,42,0.14)]';

          const baseClassesPrimary =
            'group relative flex flex-col justify-between rounded-2xl border border-slate-900 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-5 text-slate-50 shadow-[0_24px_60px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 hover:border-sky-500 hover:shadow-[0_28px_70px_rgba(15,23,42,0.65)]';

          return (
            <Link
              key={card.id}
              to={card.to}
              className={isPrimary ? baseClassesPrimary : baseClassesDefault}
            >
              {/* overlay / gradient */}
              {isPrimary ? (
                <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_55%)]" />
              ) : (
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.gradientFrom} to-transparent opacity-0 transition group-hover:opacity-100`}
                />
              )}

              <div className="relative flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div
                    className={
                      isPrimary
                        ? 'flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-lg text-sky-300'
                        : `flex h-9 w-9 items-center justify-center rounded-xl text-lg ${card.badgeBg.replace(
                            'bg-',
                            'bg-'
                          )} ${card.badgeText.replace('text-', 'text-').replace('700', '600')}`
                    }
                  >
                    <Icon />
                  </div>
                  <div>
                    <h2
                      className={
                        isPrimary
                          ? 'text-sm font-semibold text-slate-50'
                          : 'text-sm font-semibold text-slate-900'
                      }
                    >
                      {card.title}
                    </h2>
                    <p
                      className={
                        isPrimary
                          ? 'mt-1 text-xs leading-relaxed text-slate-200/80'
                          : 'mt-1 text-xs leading-relaxed text-slate-500'
                      }
                    >
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Badge */}
                {isPrimary ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    {card.label}
                  </span>
                ) : (
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${card.badgeBg} ${card.badgeText}`}
                  >
                    {card.label}
                  </span>
                )}
              </div>

              {/* Footer */}
              <div
                className={`relative mt-3 flex items-center justify-between text-[11px] ${
                  isPrimary ? 'text-slate-300' : 'text-slate-400'
                }`}
              >
                <span>{card.footerLeft}</span>
                <span
                  className={`translate-x-0 transition group-hover:translate-x-0.5 ${
                    isPrimary ? 'group-hover:text-sky-300' : ''
                  }`}
                >
                  {card.footerRight}
                </span>
              </div>
            </Link>
          );
        })}
      </section>

      {/* Nested routes */}
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
};

export default PlannerIndex;
