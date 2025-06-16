import React from 'react'
import { Outlet } from 'react-router-dom'
import { AuthProvider } from './ProtectedRoute/AuthContext'

function RbacLayout() {
  return (
    <AuthProvider>
      <div className="bg-gray-900 text-white min-h-[calc(100vh-60px)] -m-5">
        <Outlet />
      </div>

    </AuthProvider>
  )
}

export default RbacLayout