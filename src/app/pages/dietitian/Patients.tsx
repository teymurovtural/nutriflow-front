import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
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
import { Search, Users, AlertCircle, Eye, FilePlus } from "lucide-react";
import { toast } from "sonner";
import {
  getMyUsers,
  searchPatients,
  extractErrorMessage,
  type PatientSummary,
} from "../../services/dietitianService";

const DEBOUNCE_MS = 400;

export default function DietitianPatients() {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial load
  useEffect(() => {
    setLoading(true);
    getMyUsers()
      .then(setPatients)
      .catch((err) => toast.error(extractErrorMessage(err, "Failed to load patients.")))
      .finally(() => setLoading(false));
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) {
      // Restore full list when query cleared
      setSearching(true);
      getMyUsers()
        .then(setPatients)
        .catch(() => {})
        .finally(() => setSearching(false));
      return;
    }
    debounceRef.current = setTimeout(() => {
      setSearching(true);
      searchPatients(searchQuery.trim())
        .then(setPatients)
        .catch((err) => toast.error(extractErrorMessage(err, "Search failed.")))
        .finally(() => setSearching(false));
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const isLoading = loading || searching;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Patients</h1>
          <p className="text-muted-foreground mt-1">Manage your assigned patients</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Patient List
          </CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : patients.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Users className="size-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No patients found</p>
              <p className="text-sm mt-1">
                {searchQuery ? "Try a different search term." : "No patients have been assigned yet."}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Goal</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.userId}>
                      <TableCell className="font-medium">
                        {patient.firstName} {patient.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{patient.email}</TableCell>
                      <TableCell>
                        <UserLifecycleBadge status={patient.status} />
                      </TableCell>
                      <TableCell>{patient.goal ?? "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/dietitian/patients/${patient.userId}`} title="View patient">
                              <Eye className="size-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="icon" asChild>
                            <Link to={`/dietitian/menu-editor/${patient.userId}`} title="Create menu">
                              <FilePlus className="size-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {!isLoading && patients.length > 0 && (
            <p className="text-xs text-muted-foreground mt-3 text-right">
              {patients.length} patient{patients.length !== 1 ? "s" : ""}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Error hint when empty after search */}
      {!isLoading && patients.length === 0 && searchQuery && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="size-4" />
          <span>No results for &quot;{searchQuery}&quot;.</span>
        </div>
      )}
    </div>
  );
}
