import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { leaderboard } from "@/lib/mock-data";
import { Trophy } from "lucide-react";

const Leaderboard = () => (
  <div className="min-h-screen">
    <Navbar />
    <div className="container mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="font-heading text-3xl md:text-4xl font-bold">Leaderboard 🏆</h1>
        <p className="text-muted-foreground mt-2">Lihat siapa yang paling rajin belajar!</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Tabs defaultValue="weekly">
          <TabsList className="w-full rounded-xl">
            <TabsTrigger value="weekly" className="flex-1 rounded-xl">Minggu Ini</TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1 rounded-xl">Bulan Ini</TabsTrigger>
            <TabsTrigger value="alltime" className="flex-1 rounded-xl">All Time</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="mt-6">
            {/* Top 3 podium */}
            <div className="flex items-end justify-center gap-4 mb-8">
              {[leaderboard[1], leaderboard[0], leaderboard[2]].map((user, i) => {
                const heights = ["h-28", "h-36", "h-24"];
                const medals = ["🥈", "🥇", "🥉"];
                return (
                  <div key={user.rank} className="text-center flex-1 max-w-[140px]">
                    <div className="w-14 h-14 mx-auto rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg mb-2">
                      {user.name.charAt(0)}
                    </div>
                    <p className="font-semibold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.points.toLocaleString()} pts</p>
                    <div className={`${heights[i]} gradient-primary rounded-t-2xl mt-3 flex items-start justify-center pt-3`}>
                      <span className="text-2xl">{medals[i]}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full list */}
            <Card className="overflow-hidden">
              {leaderboard.map((user, i) => (
                <div key={user.rank} className={`flex items-center gap-4 p-4 ${i < leaderboard.length - 1 ? "border-b" : ""}`}>
                  <span className="font-heading font-bold text-lg w-8 text-center text-muted-foreground">
                    {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${user.rank}`}
                  </span>
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">Level {user.level} · {user.badges} badges</p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-bold text-primary">{user.points.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">points</p>
                  </div>
                </div>
              ))}
            </Card>
          </TabsContent>
          <TabsContent value="monthly"><Card className="p-10 text-center text-muted-foreground">Data bulanan segera hadir 🚧</Card></TabsContent>
          <TabsContent value="alltime"><Card className="p-10 text-center text-muted-foreground">Data all-time segera hadir 🚧</Card></TabsContent>
        </Tabs>
      </div>
    </div>
    <Footer />
  </div>
);

export default Leaderboard;
