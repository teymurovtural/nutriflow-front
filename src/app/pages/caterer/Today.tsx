import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { Skeleton } from "../../components/ui/skeleton";
import { DeliveryStatusBadge } from "../../components/StatusBadges";
import { Search, Clock, XCircle, RefreshCw, AlertCircle, Package, Loader2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import {
  getDeliveries,
  updateDeliveryStatus,
  setDeliveryEstimate,
  markDeliveryFailed,
  extractErrorMessage,
  type CatererDelivery,
  type CatererDeliveryStatus,
  type UpdateDeliveryStatusRequest,
} from "../../services/catererService";

const CATERER_NOTE_MAX = 255;
const HH_MM_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
const TODAY = new Date().toISOString().split("T")[0];

export default function CatererToday() {
  const [deliveries, setDeliveries] = useState<CatererDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Filters
  const [nameFilter, setNameFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(TODAY);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Per-row loading: deliveryId -> which action is loading
  const [rowLoading, setRowLoading] = useState<Record<number, string>>({});

  // Per-row status note inputs
  const [rowNotes, setRowNotes] = useState<Record<number, string>>({});
  const [rowStatuses, setRowStatuses] = useState<Record<number, CatererDeliveryStatus>>({});

  // Estimate time dialog
  const [estimateDelivery, setEstimateDelivery] = useState<CatererDelivery | null>(null);
  const [estimateTime, setEstimateTime] = useState("");
  const [estimateLoading, setEstimateLoading] = useState(false);

  // Meals dialog
  const [mealsDelivery, setMealsDelivery] = useState<CatererDelivery | null>(null);

  // Mark failed dialog
  const [failDelivery, setFailDelivery] = useState<CatererDelivery | null>(null);
  const [failReason, setFailReason] = useState("");
  const [failNote, setFailNote] = useState("");
  const [failLoading, setFailLoading] = useState(false);

  const fetchDeliveries = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    setLoadError("");
    const filters: { name?: string; district?: string; date?: string } = {};
    if (nameFilter.trim()) filters.name = nameFilter.trim();
    if (districtFilter.trim()) filters.district = districtFilter.trim();
    if (dateFilter) filters.date = dateFilter;
    getDeliveries(filters)
      .then((data) => {
        setDeliveries(data);
        // Seed row statuses from API
        const statuses: Record<number, CatererDeliveryStatus> = {};
        for (const d of data) statuses[d.deliveryId] = d.status;
        setRowStatuses(statuses);
      })
      .catch((err) => {
        const msg = extractErrorMessage(err, "Failed to load deliveries.");
        setLoadError(msg);
        if (!silent) toast.error(msg);
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameFilter, districtFilter, dateFilter]);

  // Debounce filter changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchDeliveries(), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [fetchDeliveries]);

  const setRowLoaded = (id: number, action: string) =>
    setRowLoading((prev) => ({ ...prev, [id]: action }));
  const clearRowLoading = (id: number) =>
    setRowLoading((prev) => { const n = { ...prev }; delete n[id]; return n; });

  const handleUpdateStatus = (delivery: CatererDelivery) => {
    const status = rowStatuses[delivery.deliveryId] ?? delivery.status;
    const catererNote = (rowNotes[delivery.deliveryId] ?? "").trim();
    if (catererNote.length > CATERER_NOTE_MAX) {
      toast.error(`Note must be at most ${CATERER_NOTE_MAX} characters.`);
      return;
    }
    const dto: UpdateDeliveryStatusRequest = { status };
    if (catererNote) dto.catererNote = catererNote;

    setRowLoaded(delivery.deliveryId, "status");
    updateDeliveryStatus(delivery.deliveryId, dto)
      .then(() => {
        toast.success(`Status updated to ${status}.`);
        fetchDeliveries(true);
      })
      .catch((err) => toast.error(extractErrorMessage(err, "Failed to update status.")))
      .finally(() => clearRowLoading(delivery.deliveryId));
  };

  const handleSetEstimate = () => {
    if (!estimateDelivery) return;
    if (!HH_MM_RE.test(estimateTime)) {
      toast.error("Please enter a valid time in HH:mm format.");
      return;
    }
    setEstimateLoading(true);
    setDeliveryEstimate(estimateDelivery.deliveryId, estimateTime)
      .then(() => {
        toast.success("Estimated time updated.");
        setEstimateDelivery(null);
        setEstimateTime("");
        fetchDeliveries(true);
      })
      .catch((err) => toast.error(extractErrorMessage(err, "Failed to set estimate.")))
      .finally(() => setEstimateLoading(false));
  };

  const handleMarkFailed = () => {
    if (!failDelivery) return;
    if (!failReason.trim()) {
      toast.error("Please provide a failure reason.");
      return;
    }
    setFailLoading(true);
    markDeliveryFailed({
      deliveryId: failDelivery.deliveryId,
      failureReason: failReason.trim(),
      ...(failNote.trim() ? { note: failNote.trim() } : {}),
    })
      .then(() => {
        toast.success("Delivery marked as failed.");
        setFailDelivery(null);
        setFailReason("");
        setFailNote("");
        fetchDeliveries(true);
      })
      .catch((err) => toast.error(extractErrorMessage(err, "Failed to mark delivery.")))
      .finally(() => setFailLoading(false));
  };

  const clearFilters = () => {
    setNameFilter("");
    setDistrictFilter("");
    setDateFilter(TODAY);
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64 mt-2" /></div>
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Card><CardContent className="pt-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full mb-2" />)}
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1>Deliveries</h1>
          <p className="text-muted-foreground mt-1">
            {new Date(dateFilter + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchDeliveries()}>
          <RefreshCw className="size-4 mr-2" />Refresh
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid md:grid-cols-4 gap-4">
        {(["PENDING", "IN_PROGRESS", "DELIVERED", "FAILED"] as CatererDeliveryStatus[]).map((s) => {
          const count = deliveries.filter((d) => d.status === s).length;
          const colors: Record<CatererDeliveryStatus, string> = {
            PENDING: "text-muted-foreground",
            IN_PROGRESS: "text-warning",
            DELIVERED: "text-success",
            FAILED: "text-destructive",
          };
          const labels: Record<CatererDeliveryStatus, string> = {
            PENDING: "Pending", IN_PROGRESS: "In Progress", DELIVERED: "Delivered", FAILED: "Failed",
          };
          return (
            <Card key={s}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{labels[s]}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${colors[s]}`}>{count}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by client name..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              placeholder="District..."
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-48"
            />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-44"
            />
            {(nameFilter || districtFilter || dateFilter !== TODAY) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loadError && (
            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg border border-destructive/50 text-destructive">
              <AlertCircle className="size-4 flex-shrink-0" />
              <p className="text-sm">{loadError}</p>
              <Button variant="ghost" size="sm" className="ml-auto" onClick={() => fetchDeliveries()}>Retry</Button>
            </div>
          )}
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Deleviry notes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Est. Time</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-16 text-center text-muted-foreground">
                      <Package className="size-10 mx-auto mb-3 opacity-40" />
                      <p className="font-medium">No deliveries found</p>
                      <p className="text-sm mt-1">Try adjusting the filters above.</p>
                      {(nameFilter || districtFilter || dateFilter !== TODAY) && (
                        <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                          Clear filters
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  deliveries.map((delivery) => {
                    const isRowLoading = !!rowLoading[delivery.deliveryId];
                    const rowAction = rowLoading[delivery.deliveryId];
                    return (
                      <TableRow key={delivery.deliveryId}>
                        <TableCell className="font-mono text-sm">#{delivery.deliveryId}</TableCell>
                        <TableCell className="font-medium">{delivery.clientFullName}</TableCell>
                        <TableCell>{delivery.district}</TableCell>
                        <TableCell className="text-muted-foreground text-sm max-w-40 truncate" title={delivery.fullAddress}>
                          {delivery.fullAddress}
                        </TableCell>
                        <TableCell>{delivery.deliveryDate}</TableCell>
                        <TableCell>{delivery.deliveryNotes ?? "—"}</TableCell>
                        <TableCell><DeliveryStatusBadge status={delivery.status} /></TableCell>
                        <TableCell>{delivery.estimatedTime ?? "—"}</TableCell>
                        <TableCell className="max-w-32">
                          <Input
                            placeholder="Note (optional)"
                            value={rowNotes[delivery.deliveryId] ?? ""}
                            onChange={(e) =>
                              setRowNotes((prev) => ({ ...prev, [delivery.deliveryId]: e.target.value }))
                            }
                            maxLength={CATERER_NOTE_MAX}
                            disabled={isRowLoading}
                            className="w-36 text-xs h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {/* Status selector + update */}
                            <Select
                              value={rowStatuses[delivery.deliveryId] ?? delivery.status}
                              onValueChange={(v) =>
                                setRowStatuses((prev) => ({ ...prev, [delivery.deliveryId]: v as CatererDeliveryStatus }))
                              }
                              disabled={isRowLoading}
                            >
                              <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="DELIVERED">Delivered</SelectItem>
                                <SelectItem value="FAILED">Failed</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs px-2"
                              onClick={() => handleUpdateStatus(delivery)}
                              disabled={isRowLoading}
                            >
                              {rowAction === "status" ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : "Save"}
                            </Button>
                            {/* Set estimate */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              title="Set estimated time"
                              onClick={() => { setEstimateDelivery(delivery); setEstimateTime(delivery.estimatedTime ?? ""); }}
                              disabled={isRowLoading}
                            >
                              <Clock className="size-4 text-muted-foreground" />
                            </Button>
                            {/* View Meals */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              title="View meals"
                              onClick={() => setMealsDelivery(delivery)}
                              disabled={isRowLoading}
                            >
                              <UtensilsCrossed className="size-4 text-primary" />
                            </Button>
                            {/* Mark failed */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              title="Mark as failed"
                              onClick={() => setFailDelivery(delivery)}
                              disabled={isRowLoading}
                            >
                              <XCircle className="size-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          {deliveries.length > 0 && (
            <p className="text-xs text-muted-foreground mt-3 text-right">
              {deliveries.length} delivery{deliveries.length !== 1 ? "ies" : ""}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Set Estimate Time Dialog */}
      <Dialog open={!!estimateDelivery} onOpenChange={(open) => { if (!open) { setEstimateDelivery(null); setEstimateTime(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Estimated Delivery Time</DialogTitle>
            <DialogDescription>
              Delivery #{estimateDelivery?.deliveryId} &mdash; {estimateDelivery?.clientFullName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="estimateTime">
                <Clock className="size-4 inline mr-1" />
                Estimated Time (HH:mm)
              </Label>
              <Input
                id="estimateTime"
                type="time"
                value={estimateTime}
                onChange={(e) => setEstimateTime(e.target.value)}
                disabled={estimateLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEstimateDelivery(null)} disabled={estimateLoading}>
              Cancel
            </Button>
            <Button onClick={handleSetEstimate} disabled={estimateLoading}>
              {estimateLoading ? <><Loader2 className="size-4 mr-2 animate-spin" />Saving...</> : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark Failed Dialog */}
      <Dialog open={!!failDelivery} onOpenChange={(open) => { if (!open) { setFailDelivery(null); setFailReason(""); setFailNote(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Delivery as Failed</DialogTitle>
            <DialogDescription>
              Delivery #{failDelivery?.deliveryId} &mdash; {failDelivery?.clientFullName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="failReason">Failure Reason <span className="text-destructive">*</span></Label>
              <Textarea
                id="failReason"
                placeholder="e.g., Customer not available, wrong address..."
                value={failReason}
                onChange={(e) => setFailReason(e.target.value)}
                rows={3}
                disabled={failLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="failNote">Internal Note (optional)</Label>
              <Textarea
                id="failNote"
                placeholder="Any additional notes..."
                value={failNote}
                onChange={(e) => setFailNote(e.target.value)}
                rows={2}
                disabled={failLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFailDelivery(null)} disabled={failLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleMarkFailed} disabled={failLoading}>
              {failLoading ? <><Loader2 className="size-4 mr-2 animate-spin" />Submitting...</> : "Mark as Failed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Meals Dialog */}
      <Dialog open={!!mealsDelivery} onOpenChange={(open) => { if (!open) setMealsDelivery(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Meals — {mealsDelivery?.clientFullName}</DialogTitle>
            <DialogDescription>Delivery #{mealsDelivery?.deliveryId} · {mealsDelivery?.deliveryDate}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {mealsDelivery?.meals?.length === 0 && <p className="text-muted-foreground text-sm">No meals info available.</p>}
            {mealsDelivery?.meals?.map((meal, i) => (
              <div key={i} className="rounded-lg border p-3">
                <p className="font-medium text-sm">{meal.type}</p>
                <p className="text-muted-foreground text-sm mt-1">{meal.description}</p>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMealsDelivery(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
