import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Skeleton } from "../../components/ui/skeleton";
import { UserLifecycleBadge } from "../../components/StatusBadges";
import { Users, AlertCircle, Search, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import {
  getDashboardStats,
  getUrgentPatients,
  getMyUsers,
  extractErrorMessage,
  type DashboardStats,
  type UrgentPatient,
  type PatientSummary,
} from "../../services/dietitianService";

export default function DietitianDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [urgentPatients, setUrgentPatients] = useState<UrgentPatient[]>([]);
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [urgentLoading, setUrgentLoading] = useState(true);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setStatsLoading(true);
    getDashboardStats()
      .then(setStats)
      .catch((err) => toast.error(extractErrorMessage(err, "Failed to load stats.")))
      .finally(() => setStatsLoading(false));

    setUrgentLoading(true);
    getUrgentPatients()
      .then(setUrgentPatients)
      .catch((err) => toast.error(extractErrorMessage(err, "Failed to load urgent patients.")))
      .finally(() => setUrgentLoading(false));

    setPatientsLoading(true);
    getMyUsers()
      .then(setPatients)
      .catch((err) => toast.error(extractErrorMessage(err, "Failed to load patients.")))
      .finally(() => setPatientsLoading(false));
  }, []);

  const filteredPatients = patients.filter(
    (p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1>Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your patients
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3"><Skeleton className="h-4 w-28" /></CardHeader>
              <CardContent><Skeleton className="h-8 w-16" /></CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="pb-3"><CardDescription>Total Patients</CardDescription></CardHeader>
              <CardContent><div className="text-3xl font-bold">{stats?.totalPatients ?? 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardDescription>Pending Menus</CardDescription></CardHeader>
              <CardContent><div className="text-3xl font-bold text-warning">{stats?.pendingMenus ?? 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardDescription>Active Menus</CardDescription></CardHeader>
              <CardContent><div className="text-3xl font-bold text-success">{stats?.activeMenus ?? 0}</div></CardContent>
            </Card>
            {/* <Card>
              <CardHeader className="pb-3"><CardDescription>Rejected Menus</CardDescription></CardHeader>
              <CardContent><div className="text-3xl font-bold text-destructive">{stats?.rejectedMenus ?? 0}</div></CardContent>
            </Card> */}
          </>
        )}
      </div>

      {/* Urgent Patients */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5 text-warning" />
            <CardTitle>Urgent — Awaiting Menu</CardTitle>
          </div>
          <CardDescription>Patients who need menu creation priority</CardDescription>
        </CardHeader>
        <CardContent>
          {urgentLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : urgentPatients.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <AlertCircle className="size-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No urgent patients right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {urgentPatients.map((patient) => (
                <div key={patient.userId} className="flex flex-col gap-3 p-4 bg-warning-light rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-warning text-warning-foreground flex items-center justify-center font-semibold">
                      {[patient.firstName[0], patient.lastName[0]].join("")}
                    </div>
                    <div>
                      <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <UserLifecycleBadge status={patient.status} />
                        <span className="text-sm text-muted-foreground">• {patient.daysWaiting} days waiting</span>
                      </div>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link to={`/dietitian/menu-editor/${patient.userId}`}>
                      Create Menu
                      <ArrowRight className="size-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Patients preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            My Patients
          </CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {patientsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Users className="size-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No patients found.</p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Goal</TableHead>
                    <TableHead>Menu</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.slice(0, 5).map((patient) => (
                    <TableRow key={patient.userId}>
                      <TableCell className="font-medium">{patient.firstName} {patient.lastName}</TableCell>
                      <TableCell className="text-muted-foreground">{patient.email}</TableCell>
                      <TableCell><UserLifecycleBadge status={patient.status} /></TableCell>
                      <TableCell>{patient.goal ?? "—"}</TableCell>
                      <TableCell>{patient.menuStatus ?? "—"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/dietitian/patients/${patient.userId}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <Button variant="outline" className="w-full mt-4" asChild>
            <Link to="/dietitian/patients">View All Patients</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
