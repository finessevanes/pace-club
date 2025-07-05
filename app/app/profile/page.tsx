"use client";
import React, { useEffect, useState } from "react";

// Types
interface Athlete {
  firstname?: string;
  username?: string;
  profile?: string;
  city?: string;
  bio?: string;
}

interface Run {
  distance: number;
  time: string;
  pace: string;
  ago: string;
}

interface Achievement {
  label: string;
  icon: string;
}

interface CrewMember {
  name: string;
  avatar: string;
}

interface Badge {
  label: string;
  icon: string;
}

interface Stats {
  totalDistance: number;
  totalRuns: number;
  longestRun: number;
  elevationGain: number;
  pace: string;
  bestTime: string;
  metro: string;
}

interface PointEvent {
  points: number;
  label: string;
}

// Theme constants
const THEME = {
  colors: {
    primary: '#D6FF00',
    background: '#1A1A1A',
    card: '#2A2A2A',
    border: '#333333',
    text: {
      primary: '#FFFFFF',
      secondary: '#999999',
      tertiary: '#666666',
      muted: '#cccccc',
      accent: '#757575'
    }
  },
  styles: {
    card: 'bg-[#2A2A2A] rounded-2xl shadow-lg border border-[#333333]',
    cardHeader: 'p-6 border-b border-[#333333]',
    cardContent: 'p-6',
    statValue: 'text-3xl font-bold text-white mb-1',
    statLabel: 'text-sm text-[#999999] font-medium uppercase tracking-wide',
    button: 'bg-[#D6FF00] text-[#1A1A1A] py-3 px-6 rounded-xl font-semibold hover:bg-[#D6FF00]/90 transition-colors',
    accentBg: 'bg-[#D6FF00]/20'
  }
} as const;

// Constants
const PLACEHOLDER_DATA = {
  achievements: [
    { label: "First 10K", icon: "🏅" },
    { label: "Early Bird", icon: "🌅" },
    { label: "Consistency", icon: "📅" },
  ] as Achievement[],
  
  crew: [
    { name: "Alex", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
    { name: "Sam", avatar: "https://randomuser.me/api/portraits/men/45.jpg" },
    { name: "Taylor", avatar: "https://randomuser.me/api/portraits/women/65.jpg" },
    { name: "Jordan", avatar: "https://randomuser.me/api/portraits/men/76.jpg" },
    { name: "Morgan", avatar: "https://randomuser.me/api/portraits/women/12.jpg" },
  ] as CrewMember[],
  
  recentRuns: [
    { distance: 4.2, time: "47:12", pace: "11:13/mi", ago: "2d ago" },
    { distance: 2.9, time: "31:05", pace: "10:43/mi", ago: "5d ago" },
    { distance: 5.0, time: "51:30", pace: "10:18/mi", ago: "1w ago" },
  ] as Run[],
  
  pointEvents: [
    { points: 5, label: "Met with a new running partner" },
    { points: 2, label: "Logged a run" },
  ] as PointEvent[]
};

const INITIAL_STATS: Stats = {
  totalDistance: 0,
  totalRuns: 0,
  longestRun: 0,
  elevationGain: 0,
  pace: "-",
  bestTime: "-",
  metro: "-",
};

// Utility functions
const formatPace = (totalPaceSeconds: number, paceCount: number): string => {
  if (paceCount === 0) return "-";
  const avgPaceSec = totalPaceSeconds / paceCount;
  const min = Math.floor(avgPaceSec / 60);
  const sec = Math.round(avgPaceSec % 60).toString().padStart(2, "0");
  return `${min}:${sec}/mi`;
};

const formatBestTime = (timeBuckets: Record<string, number>): string => {
  if (Object.keys(timeBuckets).length === 0) return "-";
  
  let maxCount = 0;
  let bestBucket = "";
  for (const [bucket, count] of Object.entries(timeBuckets)) {
    if (count > maxCount) {
      maxCount = count;
      bestBucket = bucket;
    }
  }
  
  if (!bestBucket) return "-";
  
  const [h, m] = bestBucket.split(":");
  const date = new Date();
  date.setHours(Number(h), Number(m), 0, 0);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const roundToNearest15Min = (date: Date): string => {
  let hour = date.getHours();
  let min = date.getMinutes();
  min = Math.round(min / 15) * 15;
  if (min === 60) { hour += 1; min = 0; }
  return `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
};

// Custom hooks
const useStravaData = () => {
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [recentRuns, setRecentRuns] = useState<Run[]>([]);

  useEffect(() => {
    const stravaAthlete = localStorage.getItem("stravaAthlete");
    if (stravaAthlete) setAthlete(JSON.parse(stravaAthlete));
    const stravaRuns = localStorage.getItem("stravaRuns");
    if (stravaRuns) setRecentRuns(JSON.parse(stravaRuns));
  }, []);

  return { athlete, recentRuns };
};

const useStravaStats = (athlete: Athlete | null) => {
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);

  useEffect(() => {
    const fetchStravaStats = async () => {
      const accessToken = localStorage.getItem("stravaAccessToken");
      if (!accessToken) return;
      
      try {
        const res = await fetch("https://www.strava.com/api/v3/athlete/activities?per_page=100", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) return;
        
        const activities = await res.json();
        if (!Array.isArray(activities) || activities.length === 0) return;

        let totalDistance = 0;
        let totalRuns = 0;
        let longestRun = 0;
        let elevationGain = 0;
        let totalPaceSeconds = 0;
        let paceCount = 0;
        const timeBuckets: Record<string, number> = {};

        activities.forEach((act) => {
          if (act.type === "Run") {
            totalRuns++;
            const miles = act.distance / 1609.34;
            totalDistance += miles;
            if (miles > longestRun) longestRun = miles;
            elevationGain += act.total_elevation_gain || 0;
            
            if (act.moving_time && miles > 0) {
              totalPaceSeconds += act.moving_time / miles;
              paceCount++;
            }
            
            const bucket = roundToNearest15Min(new Date(act.start_date_local));
            timeBuckets[bucket] = (timeBuckets[bucket] || 0) + 1;
          }
        });

        setStats({
          totalDistance,
          totalRuns,
          longestRun,
          elevationGain: Math.round(elevationGain),
          pace: formatPace(totalPaceSeconds, paceCount),
          bestTime: formatBestTime(timeBuckets),
          metro: athlete?.city || "-",
        });
      } catch (err) {
        console.error("Error fetching Strava stats:", err);
      }
    };

    fetchStravaStats();
  }, [athlete]);

  return stats;
};

const useBadges = (athlete: Athlete | null, pace: string) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [cityList, setCityList] = useState<string[]>([]);

  useEffect(() => {
    const computeBadges = async () => {
      const accessToken = localStorage.getItem("stravaAccessToken");
      if (!accessToken) {
        setBadges([]);
        setCityList([athlete?.city || "Phoenix"]);
        return;
      }
      
      try {
        const res = await fetch("https://www.strava.com/api/v3/athlete/activities?per_page=100", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) {
          setBadges([]);
          setCityList([athlete?.city || "Phoenix"]);
          return;
        }
        
        const activities = await res.json();
        if (!Array.isArray(activities) || activities.length === 0) {
          setBadges([]);
          setCityList([athlete?.city || "Phoenix"]);
          return;
        }
        
        const citySet = new Set<string>();
        let trailRuns = 0, roadRuns = 0;
        let longestRun = 0;
        
        activities.forEach((act) => {
          if (act.type === "Run") {
            if (act.location_city) citySet.add(act.location_city);
            if (act.workout_type === 1 || (act.name && /trail/i.test(act.name))) trailRuns++;
            else roadRuns++;
            const miles = act.distance / 1609.34;
            if (miles > longestRun) longestRun = miles;
          }
        });
        
        let surface = "";
        if (trailRuns > roadRuns && trailRuns > 0) surface = "Trail Lover";
        else if (roadRuns > trailRuns && roadRuns > 0) surface = "Road Warrior";
        
        let badgeArr: Badge[] = [];
        if (surface) badgeArr.push({ label: surface, icon: surface === 'Trail Lover' ? '🌲' : '🛣️' });
        if (longestRun > 0) badgeArr.push({ label: `Longest Run: ${longestRun.toFixed(1)} mi`, icon: '🏃‍♀️' });
        if (citySet.size > 1) badgeArr.push({ label: `Cities Run: ${citySet.size}`, icon: '🌎' });
        if (badgeArr.length < 3 && pace && pace !== '-') badgeArr.push({ label: `Avg Pace: ${pace}`, icon: '⏱️' });
        
        setBadges(badgeArr.slice(0, 3));
        setCityList(Array.from(citySet));
      } catch {
        setBadges([]);
        setCityList([athlete?.city || "Phoenix"]);
      }
    };
    
    computeBadges();
  }, [athlete, pace]);

  return { badges, cityList };
};

// Components
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`${THEME.styles.card} ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={THEME.styles.cardHeader}>
    {children}
  </div>
);

const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={THEME.styles.cardContent}>
    {children}
  </div>
);

const StatCard: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
  <Card className="text-center">
    <CardContent>
      <div className={THEME.styles.statValue}>{value}</div>
      <div className={THEME.styles.statLabel}>{label}</div>
    </CardContent>
  </Card>
);

const RunIcon: React.FC = () => (
  <div className={`w-10 h-10 ${THEME.styles.accentBg} rounded-xl flex items-center justify-center`}>
    <svg className={`w-5 h-5 text-[${THEME.colors.primary}]`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  </div>
);

export default function ProfilePage() {
  const { athlete, recentRuns } = useStravaData();
  const stats = useStravaStats(athlete);
  const { badges, cityList } = useBadges(athlete, stats.pace);
  const [points] = useState<number>(12);

  const displayRuns = recentRuns.length > 0 ? recentRuns : PLACEHOLDER_DATA.recentRuns;

  return (
    <div className={`min-h-screen bg-[${THEME.colors.background}] py-6 px-4`}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <Card className="rounded-3xl shadow-xl overflow-hidden">
          <div className="px-8 pt-12 pb-8">
            <div className="flex flex-col items-center text-center">
              <div className={`w-32 h-32 rounded-full overflow-hidden mb-6 shadow-lg ring-4 ring-[${THEME.colors.primary}]`}>
                {athlete?.profile ? (
                  <img src={athlete.profile} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#333333] to-[#666666]" />
                )}
              </div>
              
              <h1 className={`text-4xl font-bold text-[${THEME.colors.text.primary}] mb-2 tracking-tight`}>
                {athlete?.firstname || "Gemma"}
              </h1>
              
              <p className={`text-xl text-[${THEME.colors.text.secondary}] mb-6 font-medium`}>
                @{athlete?.username || "runner123"}
              </p>
              
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-6 justify-center">
                  {badges.map((badge, i) => (
                    <div 
                      key={i} 
                      className={`bg-[${THEME.colors.primary}] text-[${THEME.colors.background}] px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm`}
                    >
                      <span>{badge.icon}</span>
                      {badge.label}
                    </div>
                  ))}
                </div>
              )}
              
              {cityList.length > 0 && (
                <p className={`text-[${THEME.colors.text.accent}] text-base mb-4`}>
                  Running in {cityList.slice(0, 3).join(', ')}{cityList.length > 3 ? ` and ${cityList.length - 3} more` : ''}
                </p>
              )}
              
              <p className={`text-lg text-[${THEME.colors.text.muted}] max-w-md leading-relaxed`}>
                {athlete?.bio || "Here to meet new run pals"}
              </p>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard value={stats.totalDistance.toFixed(0)} label="Miles" />
          <StatCard value={stats.totalRuns} label="Runs" />
          <StatCard value={stats.longestRun.toFixed(1)} label="Longest" />
          <StatCard value={stats.pace} label="Avg Pace" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-semibold text-[${THEME.colors.text.primary}]`}>Recent Runs</h2>
                <button className={`text-[${THEME.colors.primary}] text-sm font-medium hover:text-[${THEME.colors.primary}]/80 transition-colors`}>
                  View All
                </button>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {displayRuns.slice(0, 3).map((run, i) => (
                  <div key={i} className={`flex items-center justify-between py-3 border-b border-[${THEME.colors.border}] last:border-0`}>
                    <div className="flex items-center gap-4">
                      <RunIcon />
                      <div>
                        <div className={`font-semibold text-[${THEME.colors.text.primary}]`}>{run.distance} miles</div>
                        <div className={`text-sm text-[${THEME.colors.text.secondary}]`}>{run.time} • {run.pace}</div>
                      </div>
                    </div>
                    <div className={`text-sm text-[${THEME.colors.text.tertiary}]`}>{run.ago}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <h2 className={`text-xl font-semibold text-[${THEME.colors.text.primary}]`}>Achievements</h2>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {PLACEHOLDER_DATA.achievements.map((achievement, i) => (
                  <div key={i} className="text-center">
                    <div className={`w-16 h-16 ${THEME.styles.accentBg} rounded-2xl flex items-center justify-center text-2xl mb-3 mx-auto`}>
                      {achievement.icon}
                    </div>
                    <div className={`text-sm font-medium text-[${THEME.colors.text.muted}]`}>{achievement.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
        </div>

        {/* Running Crew */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-semibold text-[${THEME.colors.text.primary}]`}>Running Crew</h2>
              <span className={`text-sm text-[${THEME.colors.text.secondary}]`}>{PLACEHOLDER_DATA.crew.length} members</span>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex -space-x-2">
                {PLACEHOLDER_DATA.crew.slice(0, 5).map((member, i) => (
                  <img 
                    key={i} 
                    src={member.avatar} 
                    alt={member.name} 
                    className={`w-12 h-12 rounded-full border-2 border-[${THEME.colors.card}] shadow-sm`}
                  />
                ))}
              </div>
              <div>
                <div className={`font-semibold text-[${THEME.colors.text.primary}]`}>5 active members</div>
                <div className={`text-sm text-[${THEME.colors.text.secondary}]`}>13 group runs completed</div>
              </div>
            </div>
            
            <button className={`w-full ${THEME.styles.button}`}>
              Invite to Crew
            </button>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardHeader>
            <h2 className={`text-xl font-semibold text-[${THEME.colors.text.primary}]`}>Progress</h2>
          </CardHeader>
          
          <CardContent>
            <div className="text-center mb-6">
              <div className={`text-4xl font-bold text-[${THEME.colors.text.primary}] mb-2`}>{points}</div>
              <div className={`text-[${THEME.colors.text.secondary}]`}>Points this month</div>
              
              <div className={`mt-4 bg-[${THEME.colors.border}] rounded-full h-2 overflow-hidden`}>
                <div 
                  className={`bg-[${THEME.colors.primary}] h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min(points * 2, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              {PLACEHOLDER_DATA.pointEvents.map((event, i) => (
                <div key={i} className={`flex items-center gap-4 p-3 bg-[${THEME.colors.border}] rounded-xl`}>
                  <div className={`w-8 h-8 bg-[${THEME.colors.primary}] rounded-full flex items-center justify-center`}>
                    <svg className={`w-4 h-4 text-[${THEME.colors.background}]`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold text-[${THEME.colors.text.primary}]`}>+{event.points} points</div>
                    <div className={`text-sm text-[${THEME.colors.text.secondary}]`}>{event.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
} 