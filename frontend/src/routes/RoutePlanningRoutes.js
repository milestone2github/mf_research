import PlannerIndex from "../components/routePlanning/PlannerIndex";
import { CreateFE } from "../components/routePlanning/CreateFE";
import { CreateClient } from "../components/routePlanning/CreateClient";
import { AddVisit } from "../components/routePlanning/AddVisit";
import { ViewPlanner } from "../components/routePlanning/ViewPlanner";
import { ViewUnassignedClients } from "../components/routePlanning/ViewUnassignedClients";
import { ViewOnHoldClients } from "../components/routePlanning/ViewOnHoldClients";
import { AssignClients } from "../components/routePlanning/AssignClients";

export const RoutePlanningRoutes = [
	{ to: "", element: <PlannerIndex /> },
	{ to: "fe/add", element: <CreateFE /> },
	{ to: "client/add", element: <CreateClient /> },
	{ to: "client/add/visit", element: <AddVisit /> },
	{ to: "client/view/unassigned", element: <ViewUnassignedClients /> },
	{ to: "client/view/onhold", element: <ViewOnHoldClients /> },
	{ to: "assign-clients", element: <AssignClients /> },
	{ to: "view/plan-details", element: <ViewPlanner /> },
	// { to: 'edit/:id', element: <AddEditAsset /> },
	// { to: 'assigned', element: <AssignedAssetsList /> },
];