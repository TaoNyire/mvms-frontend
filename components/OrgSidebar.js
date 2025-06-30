import Link from "next/link";
import { useRouter } from "next/router";
import { Briefcase, LayoutDashboard, MessageSquare, ClipboardList, Settings } from "lucide-react";

export default function OrgSidebar() {
  const router = useRouter();

  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, path: "/organization/dashboard" },
    { name: "Opportunities", icon: <Briefcase className="w-5 h-5" />, path: "/organization/opportunities" },
    { name: "Applications", icon: <ClipboardList className="w-5 h-5" />, path: "/organization/applications" },
    { name: "Messages", icon: <MessageSquare className="w-5 h-5" />, path: "/organization/messages" },
    { name: "Profile", icon: <Settings className="w-5 h-5" />, path: "/organization/profile" },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r shadow-sm p-4">
      <h2 className="text-xl font-bold text-purple-600 mb-6 flex items-center">
        <Briefcase className="w-6 h-6 mr-2" />
        Organization Panel
      </h2>
      <ul className="space-y-2">
        {menuItems.map((item, index) => (
          <li key={index}>
            <Link href={item.path}>
              <div
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-purple-100 cursor-pointer ${
                  router.pathname === item.path ? "bg-purple-100 text-purple-700" : "text-gray-700"
                }`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.name}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
