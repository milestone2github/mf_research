import AllLinks from '../components/links/AllLinks'
import AboutUs from '../components/links/AboutUs'
import AppLink from '../components/links/AppLink'

export const internalLinkRoutes = [
  { to: '', element: <AllLinks /> },
  { to: 'about_us', element: <AboutUs /> },
  { to: 'app_link', element: <AppLink /> },
]