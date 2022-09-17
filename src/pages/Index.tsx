import { Sidebar } from "@/components/Layout/Sidebar";
import { Header } from "@/components/Layout/Header";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { NetworkChart } from "@/components/Dashboard/NetworkChart";
import { ProcessList } from "@/components/Dashboard/ProcessList";
import { ConnectionsTable } from "@/components/Dashboard/ConnectionsTable";
import { AlertsList } from "@/components/Dashboard/AlertsList";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import { useAuth } from "@/components/Auth/AuthProvider";
import { 
  Activity, 
  Monitor, 
  Shield, 
  Wifi,
  TrendingUp,
  Users
} from "lucide-react";

const Index = () => {
  const { user, signOut } = useAuth();
  const {
    hosts,
    processes,
    connections,
    alerts,
    networkStats,
    loading,
    error,
    selectedHostId,
    setSelectedHostId,
    refreshData
  } = useRealTimeData();

  // Calculate stats from real data
  const activeHosts = hosts.filter(h => h.status === 'online').length;
  const totalConnections = connections.length;
  const activeAlerts = alerts.filter(a => a.status === 'active').length;
  
  // Calculate bandwidth from network stats (last hour)
  const recentStats = networkStats.slice(0, 60); // Last hour of 1-minute intervals
  const totalBandwidth = recentStats.reduce((sum, stat) => 
    sum + stat.bytes_in + stat.bytes_out, 0
  ) / (1024 * 1024 * 1024); // Convert to GB

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={handleLogout} />
        
        <main className="flex-1 overflow-auto p-6 space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
              <p className="text-destructive text-sm">Error: {error}</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Active Hosts"
              value={activeHosts.toString()}
              change={`${hosts.length} total hosts`}
              changeType={activeHosts > 0 ? "positive" : "neutral"}
              icon={Monitor}
            />
            <StatsCard
              title="Total Connections"
              value={totalConnections.toString()}
              change={`Across ${activeHosts} hosts`}
              changeType="positive"
              icon={Wifi}
            />
            <StatsCard
              title="Bandwidth Usage"
              value={`${totalBandwidth.toFixed(2)} GB/h`}
              change="Last hour total"
              changeType="neutral"
              icon={TrendingUp}
            />
            <StatsCard
              title="Security Alerts"
              value={activeAlerts.toString()}
              change={activeAlerts > 0 ? "Requires attention" : "All clear"}
              changeType={activeAlerts > 0 ? "negative" : "positive"} 
              icon={Shield}
            />
          </div>

          {/* Charts & Activity */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <NetworkChart 
                data={networkStats} 
                loading={loading}
                selectedHostId={selectedHostId}
              />
            </div>
            <AlertsList 
              alerts={alerts}
              loading={loading}
              onRefresh={refreshData}
            />
          </div>

          {/* Process & Connections */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ProcessList 
              processes={processes}
              hosts={hosts}
              selectedHostId={selectedHostId}
              onHostChange={setSelectedHostId}
              loading={loading}
            />
            <ConnectionsTable 
              connections={connections}
              processes={processes}
              loading={loading}
              onRefresh={refreshData}
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card/50 px-6 py-3">
          <p className="text-xs text-muted-foreground text-center">
            SaaS Zero Monitoring Traffic Network - Copyright © github.com/odaysec
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
