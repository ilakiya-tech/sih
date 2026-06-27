import { NavLink } from 'react-router-dom'
import { 
  HomeIcon, 
  UserIcon, 
  SparklesIcon, 
  ChatBubbleLeftRightIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'

export default function BottomNav() {
  return (
    <nav className="bg-white border-t border-gray-200 sticky bottom-0 z-50">
      <div className="max-w-md mx-auto px-2 py-2 grid grid-cols-5 gap-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl ${
              isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`
          }
        >
          <HomeIcon className="h-5 w-5" />
          <span className="text-[10px]">Home</span>
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl ${
              isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`
          }
        >
          <Squares2X2Icon className="h-5 w-5" />
          <span className="text-[10px]">Dashboard</span>
        </NavLink>

        <NavLink
          to="/recommendations"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl ${
              isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`
          }
        >
          <SparklesIcon className="h-5 w-5" />
          <span className="text-[10px]">Matches</span>
        </NavLink>

        <NavLink
          to="/feedback"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl ${
              isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`
          }
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
          <span className="text-[10px]">Feedback</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl ${
              isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`
          }
        >
          <UserIcon className="h-5 w-5" />
          <span className="text-[10px]">Profile</span>
        </NavLink>
      </div>
    </nav>
  )
}
