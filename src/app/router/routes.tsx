import { createRootRoute, createRoute, lazyRouteComponent, redirect } from '@tanstack/react-router';

import MainLayout from '../../layouts/MainLayout';
import { requireAuth } from './guards.ts';

/* =========================================================
   Root layout
========================================================= */

export const rootRoute = createRootRoute({
	component: MainLayout,
});

/* =========================================================
   Index
========================================================= */

export const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/',
	beforeLoad: () => {
		throw redirect({ to: '/dashboard' });
	},
});

export const dashboardRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/dashboard',
	beforeLoad: ({ context }) => {
		requireAuth(context.auth, {
			authRequired: true,
			roles: ['admin', 'doctor', 'nurse', 'receptionist', 'billing', 'pharmacy'],
			permissions: ['view_dashboard'],
		});
	},
	component: lazyRouteComponent(() => import('../../pages/dashboard')),
});

/* =========================================================
   Core modules
========================================================= */

export const patientsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/patients',
	beforeLoad: ({ context }) => {
		requireAuth(context.auth, {
			roles: ['admin', 'doctor', 'nurse', 'receptionist'],
			permissions: ['view_patients'],
		});
	},
	component: lazyRouteComponent(() => import('../../pages/patients')),
});

export const doctorsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/doctors',
	component: lazyRouteComponent(() => import('../../pages/doctors')),
});

export const appointmentsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/appointments',
	component: lazyRouteComponent(() => import('../../pages/appointments')),
});
//
// export const reportsRoute = createRoute({
//     getParentRoute: () => rootRoute,
//     path: '/reports',
//     component: () => import('../../pages/Reports'),
// });
//
// /* =========================================================
//    Clinical
// ========================================================= */
//
// export const clinicalVitalsRoute = createRoute({
//     getParentRoute: () => rootRoute,
//     path: '/clinical/vitals',
//     component: () => import('../../pages/Vitals'),
// });
//
// export const clinicalEmrRoute = createRoute({
//     getParentRoute: () => rootRoute,
//     path: '/clinical/emr',
//     component: () => import('../../pages/EMR'),
// });
//
// export const clinicalPrescriptionsRoute = createRoute({
//     getParentRoute: () => rootRoute,
//     path: '/clinical/prescriptions',
//     component: () => import('../../pages/Prescriptions'),
// });
//
// export const clinicalLabRoute = createRoute({
//     getParentRoute: () => rootRoute,
//     path: '/clinical/lab',
//     component: () => import('../../pages/LabResults'),
// });
//
// /* =========================================================
//    Billing
// ========================================================= */
//
// export const billingInvoicesRoute = createRoute({
//     getParentRoute: () => rootRoute,
//     path: '/billing/invoices',
//     component: () => import('../../pages/Invoices'),
// });
//
// export const billingInsuranceRoute = createRoute({
//     getParentRoute: () => rootRoute,
//     path: '/billing/insurance',
//     component: () => import('../../pages/Insurance'),
// });
//
// /* =========================================================
//    Admin
// ========================================================= */
//
// export const adminUsersRoute = createRoute({
//     getParentRoute: () => rootRoute,
//     path: '/admin/users',
//     component: () => import('../../pages/UsersManagement'),
// });
//
// export const adminRolesRoute = createRoute({
//     getParentRoute: () => rootRoute,
//     path: '/admin/roles',
//     component: () => import('../../pages/RolesPermissions'),
// });
//
// export const adminSystemRoute = createRoute({
//     getParentRoute: () => rootRoute,
//     path: '/admin/system',
//     component: () => import('../../pages/SystemSettings'),
// });
//
/* =========================================================
   Auth & Not Found
========================================================= */

export const loginRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/login',
	component: () => import('../../pages/auth'),
});

export const notFoundRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '*',
	component: lazyRouteComponent(() => import('../../pages/not-found')),
});

/* =========================================================
   Route tree
========================================================= */

export const routeTree = rootRoute.addChildren([
	indexRoute,
	dashboardRoute,
	patientsRoute,
	doctorsRoute,
	loginRoute,
	appointmentsRoute,
	//
	// clinicalVitalsRoute,
	// clinicalEmrRoute,
	// clinicalPrescriptionsRoute,
	// clinicalLabRoute,
	//
	// billingInvoicesRoute,
	// billingInsuranceRoute,
	//
	// reportsRoute,
	//
	// adminUsersRoute,
	// adminRolesRoute,
	// adminSystemRoute,
	//
	// loginRoute,
	notFoundRoute,
]);
