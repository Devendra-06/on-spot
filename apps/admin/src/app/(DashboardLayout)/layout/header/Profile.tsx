"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";

import { useState, useEffect } from "react";
import { authService } from "@/app/services/auth.service";

const Profile = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authService.me();
        setUser(data);
      } catch (e) {
        console.error("Failed to fetch user for profile", e);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="relative group/menu">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span className="h-10 w-10 hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
            <Image
              src="/images/profile/user-1.jpg"
              alt="Profile"
              height={35}
              width={35}
              className="rounded-full"
            />
          </span>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-56 rounded-sm shadow-md p-2"
        >
          <div className="px-3 py-3 border-b mb-1">
            <p className="text-sm font-semibold text-dark truncate">
              {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email || '...'}</p>
          </div>
          <DropdownMenuItem asChild>
            <Link
              href="/profile"
              className="px-3 py-2 flex items-center w-full gap-3 text-darkLink hover:bg-lightprimary hover:text-primary"
            >
              <Icon icon="solar:user-circle-outline" height={20} />
              My Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/account"
              className="px-3 py-2 flex items-center w-full gap-3 text-darkLink hover:bg-lightprimary hover:text-primary"
            >
              <Icon icon="solar:letter-linear" height={20} />
              My Account
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/tasks"
              className="px-3 py-2 flex items-center w-full gap-3 text-darkLink hover:bg-lightprimary hover:text-primary"
            >
              <Icon icon="solar:checklist-linear" height={20} />
              My Task
            </Link>
          </DropdownMenuItem>

          <div className="p-3 pt-0">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="mt-2 w-full"
            >
              <Link href="/auth/login">Logout</Link>
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Profile;
