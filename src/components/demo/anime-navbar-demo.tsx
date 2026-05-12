"use client";

import React from "react";
import { Home, Video, Users, Info } from "lucide-react";
import { AnimeNavBar } from "@/components/ui/anime-navbar";

const navItems = [
  {
    name: "Home",
    url: "/",
    icon: "Home",
  },
  {
    name: "Fun 1v1",
    url: "/fun",
    icon: "Video",
  },
  {
    name: "Mentors",
    url: "/mentors",
    icon: "Users",
  },
  {
    name: "How It Works",
    url: "/how-it-works",
    icon: "Info",
  },
];

export function AnimeNavBarDemo() {
  return (
    <AnimeNavBar items={navItems} defaultActive="Home" />
  );
}
