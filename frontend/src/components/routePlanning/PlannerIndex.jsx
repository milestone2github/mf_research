import { Link, Outlet } from 'react-router-dom'

const PlannerIndex = () => {
	return (
		<>
			<h1>Route Optimization Planner</h1>
			<ul className="flex flex-wrap gap-4">
				<Link
					to="fe/add"
					className="border px-6 py-8 rounded text-2xl basis-64 grow shrink"
				>
					Create New Field Executive
				</Link>
				<Link
					to="client/add"
					className="border px-6 py-8 rounded text-2xl basis-64 grow shrink"
				>
					Create New Client
				</Link>
				<Link
					to="client/add/visit"
					className="border px-6 py-8 rounded text-2xl basis-64 grow shrink"
				>
					Add New Client Visit
				</Link>
				<Link
					to="assign-clients"
					className="border px-6 py-8 rounded text-2xl basis-64 grow shrink"
				>
					Assign Clients to FE
				</Link>
				<Link
					to="client/view/unassigned"
					className="border px-6 py-8 rounded text-2xl basis-64 grow shrink"
				>
					Show Unassigned Client
				</Link>
				<Link
					to="client/view/onhold"
					className="border px-6 py-8 rounded text-2xl basis-64 grow shrink"
				>
					Show On-Hold Clients
				</Link>
				<Link
					to="view/plan-details"
					className="border px-6 py-8 rounded text-2xl basis-64 grow shrink"
				>
					Show Assigned Details
				</Link>
				<Outlet />
			</ul>
		</>
	);
};

export default PlannerIndex;
