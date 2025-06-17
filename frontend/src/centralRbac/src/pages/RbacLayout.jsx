import { Outlet } from 'react-router-dom'

function RbacLayout() {
  return (
      <div className="bg-gray-900 text-white min-h-[calc(100vh-60px)] -m-5">
        <Outlet />
      </div>
  )
}

export default RbacLayout