import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import {
  ChevronDownIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

export default function Header({ user, logout }) {
  const router = useRouter();

  const handleProfile = () => router.push("/volunteer/profile");

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-black">
        Welcome, {user?.name || "User"}!
      </h1>

      {/* Dropdown Menu */}
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex items-center bg-indigo-600 text-white font-medium px-4 py-2 rounded-xl shadow-sm hover:bg-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <UserCircleIcon className="h-5 w-5 mr-2" />
            {user?.name?.split(" ").slice(0, 2).join(" ") || "User"}
            <ChevronDownIcon className="h-5 w-5 ml-1" />
          </Menu.Button>
        </div>

        {/* Animated Dropdown Items */}
        <Transition
          as={Fragment}
          enter="transition ease-out duration-150"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Menu.Items className="absolute right-0 mt-2 w-52 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
            {/* Header box */}
            <div className="bg-gray-100 px-4 py-3 text-sm text-gray-800 font-semibold border-b border-gray-200">
              {user?.name}
            </div>

            {/* Profile */}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleProfile}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-all ${
                    active ? "bg-indigo-50 text-indigo-600" : "text-gray-700"
                  }`}
                >
                  <UserCircleIcon className="w-4 h-4" />
                  Profile
                </button>
              )}
            </Menu.Item>

            {/* Settings (Optional: visible only to admin/org) */}
            {(user?.role === "admin" || user?.role === "organization") && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => router.push("/settings")}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-all ${
                      active ? "bg-indigo-50 text-indigo-600" : "text-gray-700"
                    }`}
                  >
                    <Cog6ToothIcon className="w-4 h-4" />
                    Settings
                  </button>
                )}
              </Menu.Item>
            )}

            {/* Logout */}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={logout}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-all ${
                    active ? "bg-red-50 text-red-600" : "text-gray-700"
                  }`}
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Logout
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
