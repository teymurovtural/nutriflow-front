import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { UserLifecycleBadge, MenuStatusBadge } from "../../components/StatusBadges";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Download,
  AlertCircle,
  Send,
  Trash2,
  Loader2,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import MonthlyMenuView from "../../components/MonthlyMenuView";
import {
  getPatientProfile,
  getMonthlyMenu,
  getBatchRejectionReason,
  submitBatch,
  deleteBatchContent,
  downloadPatientFile,
  extractErrorMessage,
  type PatientProfileData,
  type MonthlyMenuResponse,
  type MealType,
} from "../../services/dietitianService";

const MEAL_TYPES: MealType[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

export default function PatientProfile() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [patient, setPatient] = useState<PatientProfileData | null>(null);
  const [patientLoading, setPatientLoading] = useState(true);
  const [patientError, setPatientError] = useState("");

  const [monthlyMenu, setMonthlyMenu] = useState<MonthlyMenuResponse | null>(null);
  const [batchLoading, setBatchLoading] = useState(true);

  const [rejectionReasons, setRejectionReasons] = useState<Record<number, string>>({});

  const [submitLoadingId, setSubmitLoadingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState<number | null>(null);

  // Delete dialog
  const [deleteDialogBatchId, setDeleteDialogBatchId] = useState<number | null>(null);
  const [deleteDay, setDeleteDay] = useState("");
  const [deleteMealType, setDeleteMealType] = useState<string>("all");

  // Load patient profile
  useEffect(() => {
    if (!userId) return;
    setPatientLoading(true);
    setPatientError("");
    getPatientProfile(userId)
      .then(setPatient)
      .catch((err) => {
        const msg = extractErrorMessage(err, "Failed to load patient profile.");
        setPatientError(msg);
        toast.error(msg);
      })
      .finally(() => setPatientLoading(false));
  }, [userId]);

  // Load monthly menu
  const loadMenu = () => {
    if (!userId) return;
    setBatchLoading(true);
    getMonthlyMenu(userId, year, month)
      .then(async (menu) => {
        setMonthlyMenu(menu);
        if (!menu) return;
        // Load rejection reasons for all REJECTED batches in parallel
        const reasons: Record<number, string> = {};
        await Promise.allSettled(
          menu.batches
            .filter((b) => b.status === "REJECTED")
            .map((b) =>
              getBatchRejectionReason(b.batchId).then((r) => {
                if (r.rejectionReason) reasons[b.batchId] = r.rejectionReason;
              })
            )
        );
        setRejectionReasons(reasons);
      })
      .catch((err) => toast.error(extractErrorMessage(err, "Failed to load menu.")))
      .finally(() => setBatchLoading(false));
  };

  useEffect(() => {
    loadMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, year, month]);

  const handleSubmit = (batchId: number) => {
    setSubmitLoadingId(batchId);
    submitBatch(batchId)
      .then(() => {
        toast.success("Menu submitted to patient.");
        loadMenu();
      })
      .catch((err) => toast.error(extractErrorMessage(err, "Failed to submit batch.")))
      .finally(() => setSubmitLoadingId(null));
  };

  const handleDelete = () => {
    if (deleteDialogBatchId === null) return;
    const opts: { day?: number; mealType?: MealType } = {};
    const dayNum = parseInt(deleteDay);
    if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) opts.day = dayNum;
    if (deleteMealType !== "all" && opts.day) opts.mealType = deleteMealType as MealType;

    setDeleteLoading(true);
    deleteBatchContent(deleteDialogBatchId, opts)
      .then(() => {
        toast.success("Content deleted.");
        setDeleteDialogBatchId(null);
        setDeleteDay("");
        setDeleteMealType("all");
        loadMenu();
      })
      .catch((err) => toast.error(extractErrorMessage(err, "Failed to delete content.")))
      .finally(() => setDeleteLoading(false));
  };

  const handleOpenFile = (fileId: number, fileName: string) => {
    setFileLoading(fileId);
    downloadPatientFile(fileId, fileName)
      .catch((err) => toast.error(extractErrorMessage(err, "Could not download file.")))
      .finally(() => setFileLoading(null));
  };

  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const YEAR_OPTIONS = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (patientLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-9 rounded-md" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (patientError || !patient) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dietitian/patients"><ArrowLeft className="size-5" /></Link>
        </Button>
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="size-5 flex-shrink-0" />
              <p className="text-sm">{patientError || "Patient not found."}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dietitian/patients"><ArrowLeft className="size-5" /></Link>
        </Button>
        <div className="flex-1">
          <h1>{patient.firstName} {patient.lastName}</h1>
          <p className="text-muted-foreground mt-1">{patient.email}</p>
        </div>
        <UserLifecycleBadge status={patient.status} />
      </div>

      {/* Patient info */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Health Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Goal</p>
                <p className="font-semibold">{patient.goal ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">BMI</p>
                <p className="font-semibold">{patient.bmi != null ? patient.bmi.toFixed(1) : "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Height</p>
                <p className="font-semibold">{patient.height != null ? `${patient.height} cm` : "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weight</p>
                <p className="font-semibold">{patient.weight != null ? `${patient.weight} kg` : "—"}</p>
              </div>
            </div>
            {patient.restrictions && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Dietary Restrictions</p>
                <p className="text-sm">{patient.restrictions}</p>
              </div>
            )}
            {patient.notes && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Additional Notes</p>
                <p className="text-sm">{patient.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Medical Files
            </CardTitle>
            <CardDescription>Uploaded health documents</CardDescription>
          </CardHeader>
          <CardContent>
            {patient.files.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                <FileText className="size-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No files uploaded.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {patient.files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="size-5 text-primary" />
                      <span className="font-medium text-sm">{file.fileName}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenFile(file.id, file.fileName)}
                      disabled={fileLoading === file.id}
                      title="Download file"
                    >
                      {fileLoading === file.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Download className="size-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Menu */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5" />
                Monthly Menu
              </CardTitle>
              <CardDescription>View and manage the patient's menu batch</CardDescription>
            </div>
            {/* Month/Year picker */}
            <div className="flex items-center gap-2">
              <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEAR_OPTIONS.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={loadMenu}>
                <RefreshCw className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {batchLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : !monthlyMenu || monthlyMenu.batches.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground space-y-4">
              <Calendar className="size-10 mx-auto opacity-40" />
              <div>
                <p className="font-medium">No menu for {MONTHS[month - 1]} {year}</p>
                <p className="text-sm mt-1">Create a new menu for this patient.</p>
              </div>
              <Button asChild>
                <Link to={`/dietitian/menu-editor/${userId}`}>
                  <Calendar className="size-4 mr-2" />
                  Create Menu
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {monthlyMenu.batches.map((b, idx) => (
                <div key={b.batchId} className="space-y-4">
                  {idx > 0 && <div className="border-t" />}

                  {/* Batch status row */}
                  <div className="flex flex-wrap items-center gap-3 p-4 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Batch #{b.batchId}</p>
                      <p className="font-medium">
                        {MONTHS[monthlyMenu.month - 1]} {monthlyMenu.year}
                      </p>
                      {monthlyMenu.dietaryNotes && (
                        <p className="text-sm text-muted-foreground mt-1">{monthlyMenu.dietaryNotes}</p>
                      )}
                    </div>
                    <MenuStatusBadge status={b.status} />
                  </div>

                  {/* Rejection reason */}
                  {b.status === "REJECTED" && rejectionReasons[b.batchId] && (
                    <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/30">
                      <AlertCircle className="size-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm text-destructive">Rejection Reason</p>
                        <p className="text-sm text-muted-foreground mt-1">{rejectionReasons[b.batchId]}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    {b.status !== "APPROVED" && (
                      <Button asChild variant="outline">
                        <Link to={`/dietitian/menu-editor/${userId}/${b.batchId}`}>
                          <Calendar className="size-4 mr-2" />
                          {b.status === "DRAFT" || b.status === "REJECTED" ? "Edit Menu" : "View/Edit Menu"}
                        </Link>
                      </Button>
                    )}
                    {(b.status === "DRAFT" || b.status === "REJECTED") && (
                      <Button
                        onClick={() => handleSubmit(b.batchId)}
                        disabled={submitLoadingId === b.batchId}
                      >
                        {submitLoadingId === b.batchId ? (
                          <><Loader2 className="size-4 mr-2 animate-spin" />Submitting...</>
                        ) : (
                          <><Send className="size-4 mr-2" />Submit to Patient</>
                        )}
                      </Button>
                    )}
                    {b.status !== "APPROVED" && (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setDeleteDialogBatchId(b.batchId);
                          setDeleteDay("");
                          setDeleteMealType("all");
                        }}
                      >
                        <Trash2 className="size-4 mr-2" />
                        Delete Content
                        <ChevronDown className="size-4 ml-1" />
                      </Button>
                    )}
                  </div>

                  {/* Batch items */}
                  <div className="mt-2">
                    <MonthlyMenuView
                      batchId={b.batchId}
                      preloaded={{
                        items: b.items,
                        year: monthlyMenu.year,
                        month: monthlyMenu.month,
                        dietaryNotes: monthlyMenu.dietaryNotes,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Content Dialog */}
      <Dialog open={deleteDialogBatchId !== null} onOpenChange={(open) => { if (!open) setDeleteDialogBatchId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Batch Content</DialogTitle>
            <DialogDescription>
              Choose what to delete. Leave Day empty to delete all content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="deleteDay">Day (1–31, leave empty for all)</Label>
              <Input
                id="deleteDay"
                type="number"
                min={1}
                max={31}
                placeholder="e.g. 5"
                value={deleteDay}
                onChange={(e) => setDeleteDay(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Meal Type (only applies if Day is set)</Label>
              <Select value={deleteMealType} onValueChange={setDeleteMealType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All meals that day</SelectItem>
                  {MEAL_TYPES.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogBatchId(null)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? <><Loader2 className="size-4 mr-2 animate-spin" />Deleting...</> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
