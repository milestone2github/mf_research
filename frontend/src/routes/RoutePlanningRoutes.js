import PlannerIndex from "../components/routePlanning/PlannerIndex";
import { CreateFE } from "../components/routePlanning/CreateFE";
// import { CreateClient } from "../components/routePlanning/CreateClient";
import { AddVisit } from "../components/routePlanning/AddVisit";
import { ViewPlanner } from "../components/routePlanning/ViewPlanner";
import { ViewUnassignedClients } from "../components/routePlanning/ViewUnassignedClients";
import { ViewOnHoldClients } from "../components/routePlanning/ViewOnHoldClients";
import { AssignClients } from "../components/routePlanning/AssignClients";
import { TrackFERoute } from "../components/routePlanning/TrackFERoute";
import { CreateTemporaryClient } from "../components/routePlanning/CreateTempClient";

export const RoutePlanningRoutes = [
	{ to: "", element: <PlannerIndex />,protected:true },
	{ to: "fe/add",label: "Create Field Executive", element: <CreateFE />, requiredPermission: "create_field_executive", protected:true},
	// { to: "client/add", element: <CreateClient /> },
	{ to: "client/tempAdd", label: "Create Temporary Client", element: <CreateTemporaryClient />, requiredPermission: "create_temporary_client",protected:true },
	{ to: "client/add/visit", label: "Add Visit", element: <AddVisit />, requiredPermission: "add_visit",protected:true },
	{ to: "client/view/unassigned", label: "View Unassigned Clients", element: <ViewUnassignedClients />, requiredPermission: "view_unassigned_clients",protected:true },
	{ to: "client/view/onhold", label: "View Onhold Clients", element: <ViewOnHoldClients />, requiredPermission: "view_onhold_clients",protected:true },
	{ to: "assign-clients", label: "Assign Clients", element: <AssignClients />, requiredPermission: "assign_clients",protected:true },
	{ to: "view/plan-details", label: "View PlannerDetails", element: <ViewPlanner />, requiredPermission: "view_planner_details",protected:true },
	{ to: "track/fe", label: "Track Field Executive Route", element: <TrackFERoute />, requiredPermission: "track_field_executive",protected:true },
];