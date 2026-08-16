"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Cloud,
  CloudRain,
  Activity,
  Eye,
  MapPin,
  Search,
  ChevronDown,
  Compass,
  Check,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/animations/page-transition";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { climateData as defaultDailyData } from "@/data/mock-data";
import { ClimateChart } from "@/components/charts/climate-chart";
import {
  getClimateMonitorData,
  type ClimateMonitorResponse,
  type KarnatakaDistrictInfo,
} from "@/lib/api-client";
import { useLocalizedText } from "@/lib/localization";

// All 31 Karnataka Districts list as static baseline
const ALL_KARNATAKA_DISTRICTS: KarnatakaDistrictInfo[] = [
  { name: "Bagalkote", region: "North Karnataka", mangoZone: "Alphonso / Kesar Belt", lat: 16.18, lon: 75.66 },
  { name: "Ballari (Bellary)", region: "Central Karnataka", mangoZone: "Dry Zone Mangoes", lat: 15.14, lon: 76.92 },
  { name: "Belagavi (Belgaum)", region: "North Karnataka", mangoZone: "Pairi / Alphonso Belt", lat: 15.85, lon: 74.50 },
  { name: "Bengaluru Rural", region: "South Karnataka", mangoZone: "Raspuri / Banganapalli", lat: 13.23, lon: 77.56 },
  { name: "Bengaluru Urban", region: "South Karnataka", mangoZone: "Urban Orchard Belt", lat: 12.97, lon: 77.59 },
  { name: "Bidar", region: "North Karnataka", mangoZone: "Semi-Arid Fruit Zone", lat: 17.91, lon: 77.52 },
  { name: "Chamarajanagar", region: "South Karnataka", mangoZone: "Southern Foothills", lat: 11.92, lon: 76.94 },
  { name: "Chikkaballapur", region: "South Karnataka", mangoZone: "Major Totapuri / Banganapalli Belt", lat: 13.43, lon: 77.73 },
  { name: "Chikkamagaluru", region: "Malnad", mangoZone: "High Rainfall Agro-Zone", lat: 13.32, lon: 75.77 },
  { name: "Chitradurga", region: "Central Karnataka", mangoZone: "Central Dry Agro-Zone", lat: 14.23, lon: 76.40 },
  { name: "Dakshina Kannada (Mangaluru)", region: "Coastal Karnataka", mangoZone: "Coastal High-Humidity Belt", lat: 12.87, lon: 74.88 },
  { name: "Davanagere", region: "Central Karnataka", mangoZone: "Central Basin", lat: 14.47, lon: 75.92 },
  { name: "Dharwad", region: "North Karnataka", mangoZone: "Famous Alphonso / Kari Ishad", lat: 15.46, lon: 75.01 },
  { name: "Gadag", region: "North Karnataka", mangoZone: "Northern Plains", lat: 15.43, lon: 75.63 },
  { name: "Hassan", region: "Malnad / South", mangoZone: "Primary Mango Belt (Raspuri / Mallika)", lat: 13.00, lon: 76.10 },
  { name: "Haveri", region: "Central Karnataka", mangoZone: "Transitional Agro-Zone", lat: 14.80, lon: 75.40 },
  { name: "Kalaburagi (Gulbarga)", region: "North Karnataka", mangoZone: "North Dry Mango Agro-Zone", lat: 17.33, lon: 76.83 },
  { name: "Kodagu (Madikeri)", region: "Malnad", mangoZone: "Western Ghats Micro-Climate", lat: 12.42, lon: 75.74 },
  { name: "Kolar", region: "South Karnataka", mangoZone: "Highest Mango Yield Belt (Totapuri / Raspuri)", lat: 13.14, lon: 78.13 },
  { name: "Koppal", region: "North Karnataka", mangoZone: "Tungabhadra Basin", lat: 15.35, lon: 76.15 },
  { name: "Mandya", region: "South Karnataka", mangoZone: "Cauvery Irrigated Belt", lat: 12.52, lon: 76.90 },
  { name: "Mysuru (Mysore)", region: "South Karnataka", mangoZone: "Historic Heritage Orchards", lat: 12.30, lon: 76.65 },
  { name: "Raichur", region: "North Karnataka", mangoZone: "Doab Fruit Plains", lat: 16.20, lon: 77.36 },
  { name: "Ramanagara", region: "South Karnataka", mangoZone: "Silk & Mango Heartland (Raspuri Special)", lat: 12.72, lon: 77.28 },
  { name: "Shivamogga (Shimoga)", region: "Malnad", mangoZone: "Gateway to Western Ghats", lat: 13.93, lon: 75.57 },
  { name: "Tumakuru (Tumkur)", region: "South Karnataka", mangoZone: "Commercial Totapuri / Banganapalli", lat: 13.34, lon: 77.10 },
  { name: "Udupi", region: "Coastal Karnataka", mangoZone: "Coastal Humid Tropical Belt", lat: 13.34, lon: 74.74 },
  { name: "Uttara Kannada (Karwar)", region: "Coastal Karnataka", mangoZone: "GI-tagged Kari Ishad Belt", lat: 14.81, lon: 74.13 },
  { name: "Vijayanagara (Hosapete)", region: "Central Karnataka", mangoZone: "Tungabhadra Heritage Belt", lat: 15.27, lon: 76.39 },
  { name: "Vijayapura (Bijapur)", region: "North Karnataka", mangoZone: "Dry Arid Zone Mangoes", lat: 16.83, lon: 75.71 },
  { name: "Yadgir", region: "North Karnataka", mangoZone: "Krishna Basin Semi-Arid", lat: 16.77, lon: 77.14 },
];

const POPULAR_MANGO_DISTRICTS = [
  "Hassan",
  "Kolar",
  "Ramanagara",
  "Chikkaballapur",
  "Dharwad",
  "Belagavi (Belgaum)",
  "Mysuru (Mysore)",
  "Mandya",
  "Dakshina Kannada (Mangaluru)",
  "Kalaburagi (Gulbarga)",
];

const defaultWeather: ClimateMonitorResponse = {
  currentWeather: {
    temp: 22,
    humidity: 84,
    rainfall: 0,
    windSpeed: 10,
    uvIndex: 8,
    visibility: 10,
    condition: "Partly Cloudy",
    location: "Hassan, Karnataka",
    region: "Malnad / South",
    latitude: 13.00,
    longitude: 76.10,
    mangoZone: "Primary Mango Belt (Raspuri / Mallika)",
  },
  forecast: [
    { day: "Today", temp: 28, condition: "Light Rain", rainfall: 0.0 },
    { day: "Mon", temp: 28, condition: "Light Rain", rainfall: 0.0 },
    { day: "Tue", temp: 28, condition: "Light Rain", rainfall: 0.0 },
    { day: "Wed", temp: 28, condition: "Light Rain", rainfall: 0.0 },
    { day: "Thu", temp: 28, condition: "Light Rain", rainfall: 0.0 },
    { day: "Fri", temp: 28, condition: "Partly Cloudy", rainfall: 0.0 },
    { day: "Sat", temp: 27, condition: "Light Rain", rainfall: 0.0 },
  ],
  dailyData: defaultDailyData,
  allDistricts: ALL_KARNATAKA_DISTRICTS,
};

export default function ClimateMonitoringPage() {
  const { term } = useLocalizedText();
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Hassan");
  const [data, setData] = useState<ClimateMonitorResponse>(defaultWeather);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch live Open-Meteo data whenever selected district changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getClimateMonitorData(selectedDistrict)
      .then((res) => {
        if (isMounted && res && res.currentWeather) {
          setData(res);
        }
      })
      .catch((err) => {
        console.warn("Using local climate fallback for district:", err.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDistrict]);

  const districtList = data.allDistricts || ALL_KARNATAKA_DISTRICTS;

  const filteredDistricts = useMemo(() => {
    if (!searchQuery.trim()) return districtList;
    const q = searchQuery.toLowerCase();
    return districtList.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q) ||
        d.mangoZone.toLowerCase().includes(q)
    );
  }, [districtList, searchQuery]);

  const handleSelectDistrict = (districtName: string) => {
    setSelectedDistrict(districtName);
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  const getWeatherIcon = (cond: string) => {
    const c = cond.toLowerCase();
    if (c.includes("rain") || c.includes("drizzle")) return CloudRain;
    if (c.includes("cloud") || c.includes("fog")) return Cloud;
    if (c.includes("thunder")) return CloudRain;
    return Sun;
  };

  const curr = data.currentWeather;

  return (
    <PageTransition>
      <StaggerContainer className="space-y-6">
        
        {/* Top Header & District Switcher */}
        <StaggerItem>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#12161f] via-[#0f1a14] to-[#12161f] border border-white/[0.08] relative overflow-visible">
            {/* Background ambient light */}
            <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-cyan-500/[0.08] blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                <h2 className="text-white font-display font-bold text-2xl tracking-tight">
                  {term("Climate Intelligence")}
                </h2>
                <NeonBadge label={term("Live Satellite API")} variant="neon" size="sm" pulse />
              </div>
              <p className="text-gray-400 text-sm">
                {term("Real-time Open-Meteo meteorological feed for all 31 districts of Karnataka")}
              </p>
            </div>

            {/* Top Right District Toggle / Searchable Selector */}
            <div className="flex items-center gap-3 relative z-30" ref={dropdownRef}>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-cyan-500/30 hover:border-cyan-400/60 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-cyan-950/30 group"
                >
                  <MapPin className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="tracking-wide">
                    {curr.location || `${selectedDistrict}, Karnataka`}
                  </span>
                  {isLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 text-yellow-400 animate-spin ml-1" />
                  ) : (
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180 text-cyan-300" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Dropdown Menu Modal */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-[#0e131d]/95 backdrop-blur-xl border border-white/[0.12] shadow-2xl shadow-black/80 p-3 z-50 flex flex-col gap-2.5 max-h-[460px]"
                    >
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search 31 Karnataka Districts..."
                          autoFocus
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white/[0.05] border border-white/[0.08] focus:border-cyan-500/50 rounded-xl text-white placeholder-gray-500 outline-none transition-colors"
                        />
                      </div>

                      {/* Header info */}
                      <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
                        <span>Select District ({filteredDistricts.length} found)</span>
                        <span className="text-cyan-400 font-medium">All Karnataka</span>
                      </div>

                      {/* District List Scrollable Area */}
                      <div className="overflow-y-auto space-y-1 pr-1 custom-scrollbar max-h-[300px]">
                        {filteredDistricts.map((district) => {
                          const isSelected =
                            selectedDistrict.toLowerCase() === district.name.toLowerCase() ||
                            curr.location?.toLowerCase().includes(district.name.toLowerCase());
                          return (
                            <button
                              key={district.name}
                              type="button"
                              onClick={() => handleSelectDistrict(district.name)}
                              className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-all duration-150 ${
                                isSelected
                                  ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-200"
                                  : "hover:bg-white/[0.04] border border-transparent text-gray-300"
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className="font-semibold text-xs flex items-center gap-1.5 text-white">
                                  {district.name}
                                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                                </span>
                                <span className="text-[10px] text-gray-500 truncate max-w-[210px]">
                                  {district.mangoZone}
                                </span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-gray-400 font-mono">
                                  {district.region}
                                </span>
                                <span className="text-[9px] text-gray-500 font-mono mt-0.5">
                                  {district.lat}°N, {district.lon}°E
                                </span>
                              </div>
                            </button>
                          );
                        })}

                        {filteredDistricts.length === 0 && (
                          <div className="text-center py-6 text-xs text-gray-500">
                            No Karnataka district matching &ldquo;{searchQuery}&rdquo;
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Quick-Select Pills for Primary Mango Belts */}
        <StaggerItem>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-gray-400 flex items-center gap-1 shrink-0 mr-1">
              <Compass className="w-3.5 h-3.5 text-yellow-400" />
              {term("Key Districts")}:
            </span>
            {POPULAR_MANGO_DISTRICTS.map((dist) => {
              const isActive =
                selectedDistrict.toLowerCase() === dist.toLowerCase() ||
                curr.location?.toLowerCase().includes(dist.toLowerCase());
              return (
                <button
                  key={dist}
                  type="button"
                  onClick={() => handleSelectDistrict(dist)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all duration-200 border ${
                    isActive
                      ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-sm shadow-yellow-500/20 font-semibold"
                      : "bg-white/[0.03] text-gray-400 hover:text-white border-white/[0.06] hover:bg-white/[0.06]"
                  }`}
                >
                  {dist.replace(/ \(.*\)/, "")}
                </button>
              );
            })}
          </div>
        </StaggerItem>

        {/* District Agro-Zone Alert Banner */}
        <StaggerItem>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-gray-300 font-medium">
                <strong className="text-white">{curr.location || selectedDistrict}:</strong>{" "}
                {curr.mangoZone || "Karnataka Mango Cultivation Agro-Climatic Belt"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 shrink-0 font-mono text-[11px]">
              <span>Geo: {curr.latitude ? `${curr.latitude}°N, ${curr.longitude}°E` : "Karnataka"}</span>
              <span>•</span>
              <span className="text-green-400">Condition: {curr.condition}</span>
            </div>
          </div>
        </StaggerItem>

        {/* Current Live Weather Conditions */}
        <StaggerItem>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: term("Temperature"), value: curr.temp, unit: "°C", icon: Thermometer, color: "#f59e0b" },
              { label: term("Humidity"), value: curr.humidity, unit: "%", icon: Droplets, color: "#22d3ee" },
              { label: term("Rainfall"), value: curr.rainfall, unit: "mm", icon: CloudRain, color: "#8b5cf6" },
              { label: term("Wind Speed"), value: curr.windSpeed, unit: "km/h", icon: Wind, color: "#22c55e" },
              { label: term("UV Index"), value: curr.uvIndex, unit: "", icon: Sun, color: "#ef4444" },
              { label: term("Visibility"), value: curr.visibility, unit: "km", icon: Eye, color: "#6366f1" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="card-glass p-4 text-center transition-all duration-300 relative overflow-hidden"
              >
                <div
                  className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: `${item.color}15`, boxShadow: `0 0 15px ${item.color}20` }}
                >
                  <item.icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <div className="text-xl font-display font-bold text-white">
                  <AnimatedCounter value={item.value} duration={1000} suffix={item.unit} />
                </div>
                <div className="text-xs text-gray-400 mt-1 font-medium">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </StaggerItem>

        {/* 7-Day Live Daily Forecast */}
        <StaggerItem>
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-white font-semibold text-base">{term("7-Day Live Forecast")}</h3>
                <p className="text-gray-500 text-xs mt-0.5">
                  Live satellite telemetry for {curr.location || selectedDistrict}
                </p>
              </div>
              <NeonBadge label={term("Open-Meteo Live")} variant="violet" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {data.forecast.map((item, i) => {
                const WeatherIcon = getWeatherIcon(item.condition);
                const isToday = i === 0 || item.day.toLowerCase() === "today";
                const isRainy = item.condition.toLowerCase().includes("rain");
                return (
                  <motion.div
                    key={item.day + i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.04 }}
                    className={`flex flex-col items-center gap-2 p-3.5 rounded-xl transition-all duration-200 ${
                      isToday
                        ? "bg-yellow-500/10 border border-yellow-500/30 shadow-md shadow-yellow-500/5"
                        : "bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className={`text-xs font-semibold ${isToday ? "text-yellow-400" : "text-gray-400"}`}>
                      {term(item.day)}
                    </span>
                    <WeatherIcon
                      className="w-6 h-6 my-1"
                      style={{ color: isRainy ? "#22d3ee" : isToday ? "#f59e0b" : "#9ca3af" }}
                    />
                    <span className="text-white text-sm font-bold">{item.temp}°C</span>
                    <span className="text-[10px] text-gray-400 text-center leading-tight">
                      {term(item.condition)}
                    </span>
                    {item.rainfall > 0 && (
                      <span className="text-[9px] text-cyan-400 font-mono">
                        {item.rainfall}mm rain
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </StaggerItem>

        {/* Climate Analytics Chart (Dynamic for selected district) */}
        <StaggerItem>
          <ClimateChart
            location={curr.location || selectedDistrict}
            currentTemp={curr.temp}
            currentHumidity={curr.humidity}
          />
        </StaggerItem>

        {/* Daily Data Table for Farmers */}
        <StaggerItem>
          <GlassCard className="p-5" hover={false}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div>
                <h3 className="text-white font-semibold text-base">{term("Daily Climate Agronomic Data")}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Actionable farm environmental parameters for {curr.location || selectedDistrict}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">{term("Live Meteorological Telemetry")}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {[
                      term("Day"),
                      term("Temp (°C)"),
                      term("Rainfall (mm)"),
                      term("Humidity (%)"),
                      term("Wind (km/h)"),
                      term("Farm Agronomic Impact"),
                    ].map((col) => (
                      <th key={col} className="text-left text-xs text-gray-400 font-semibold py-2.5 px-3">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4">
                  {data.dailyData.map((row, i) => {
                    const impact =
                      row.temp > 35 || row.humidity > 88
                        ? { label: term("Stress Risk"), color: "mango" as const }
                        : row.rainfall > 25
                        ? { label: term("Disease Spore Risk"), color: "red" as const }
                        : { label: term("Optimal Growth"), color: "neon" as const };
                    return (
                      <motion.tr
                        key={row.day + i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.04 }}
                        className="hover:bg-white/[0.04] transition-colors"
                      >
                        <td className="py-3 px-3 text-white font-medium">{term(row.day)}</td>
                        <td className="py-3 px-3">
                          <span className={row.temp > 34 ? "text-red-400 font-semibold" : "text-gray-300"}>
                            {row.temp}°C
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={row.rainfall > 10 ? "text-cyan-400 font-semibold" : "text-gray-300"}>
                            {row.rainfall}mm
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-14 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${row.humidity}%`,
                                  background: row.humidity > 85 ? "#ef4444" : "#8b5cf6",
                                }}
                              />
                            </div>
                            <span className="text-gray-300 text-xs font-mono">{row.humidity}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-gray-300">{row.wind} km/h</td>
                        <td className="py-3 px-3">
                          <NeonBadge label={impact.label} variant={impact.color} size="sm" />
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </StaggerItem>
      </StaggerContainer>
    </PageTransition>
  );
}
