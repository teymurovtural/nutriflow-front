import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Skeleton } from "../../components/ui/skeleton";
import { Search, Plus, ToggleLeft, ToggleRight, Trash2, Loader2, ChevronLeft, ChevronRight, Eye, EyeOff, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  getDietitians, searchDietitians, createDietitian, toggleDietitianStatus, deleteDietitian, updateDietitian,
  type AdminDietitian,
} from "../../services/adminService";

export default function AdminDietitians() {
  const [dietitians, setDietitians] = useState<AdminDietitian[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rowLoadingMap, setRowLoadingMap] = useState<Record<number, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phoneNumber: "", specialization: "", password: "",
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDietitian, setEditingDietitian] = useState<AdminDietitian | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "", lastName: "", email: "", phoneNumber: "", specialization: "", password: "",
  });
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchController = useRef<AbortController | null>(null);

  const fetchDietitians = async (query?: string, page = 0) => {
    fetchController.current?.abort();
    const controller = new AbortController();
    fetchController.current = controller;
    setLoading(true);
    try {
      const { data } = query?.trim()
        ? await searchDietitians(query, page)
        : await getDietitians(page);
      if (!controller.signal.aborted) {
        setDietitians(data.content ?? []);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        setCurrentPage(data.number);
      }
    } catch (err: unknown) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        toast.error("Failed to load dietitians");
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  useEffect(() => { fetchDietitians(); }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery.trim()) { fetchDietitians(); return; }
    searchTimeout.current = setTimeout(() => fetchDietitians(searchQuery, 0), 400);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleToggle = async (id: number) => {
    setDietitians((prev) => prev.map((d) => d.id === id ? { ...d, active: !d.active } : d));
    setRowLoadingMap((prev) => ({ ...prev, [id]: true }));
    try {
      await toggleDietitianStatus(id);
      toast.success("Status updated");
      await fetchDietitians(searchQuery || undefined, currentPage);
    } catch (err: unknown) {
      setDietitians((prev) => prev.map((d) => d.id === id ? { ...d, active: !d.active } : d));
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "Failed to update status");
    } finally {
      setRowLoadingMap((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDietitian(id);
      toast.success("Dietitian deleted");
      await fetchDietitians(searchQuery || undefined, currentPage);
    } catch { toast.error("Failed to delete dietitian"); }
  };

  const openEditDialog = (dietitian: AdminDietitian) => {
    setEditingDietitian(dietitian);
    setEditForm({
      firstName: dietitian.firstName ?? "",
      lastName: dietitian.lastName ?? "",
      email: dietitian.email ?? "",
      phoneNumber: dietitian.phone ?? "",
      specialization: dietitian.specialization ?? "",
      password: "",
    });
    setShowEditPassword(false);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingDietitian) return;
    setEditSubmitting(true);
    try {
      const payload: Record<string, string> = {};
      if (editForm.firstName) payload.firstName = editForm.firstName;
      if (editForm.lastName) payload.lastName = editForm.lastName;
      if (editForm.email) payload.email = editForm.email;
      if (editForm.phoneNumber) payload.phoneNumber = editForm.phoneNumber;
      if (editForm.specialization) payload.specialization = editForm.specialization;
      if (editForm.password) payload.password = editForm.password;
      await updateDietitian(editingDietitian.id, payload);
      toast.success("Dietitian updated");
      setEditDialogOpen(false);
      fetchDietitians(searchQuery || undefined, currentPage);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "Failed to update dietitian");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (!form.firstName || !form.email || !form.password) {
      toast.error("First name, email, and password are required");
      return;
    }
    setSubmitting(true);
    try {
      await createDietitian(form);
      toast.success("Dietitian created");
      setCreateDialogOpen(false);
      setForm({ firstName: "", lastName: "", email: "", phoneNumber: "", specialization: "", password: "" });
      fetchDietitians(searchQuery || undefined, 0);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "Failed to create dietitian");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Dietitians</h1>
          <p className="text-muted-foreground mt-1">Manage dietitian accounts</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="size-4 mr-2" />
          Add Dietitian
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search dietitians..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative rounded-lg border">
            {loading && dietitians.length > 0 && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/60 backdrop-blur-[1px]">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Patients</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && dietitians.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : dietitians.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No dietitians found
                    </TableCell>
                  </TableRow>
                ) : (
                  dietitians.map((dietitian) => (
                    <TableRow key={dietitian.id}>
                      <TableCell className="font-mono text-sm">{dietitian.id}</TableCell>
                      <TableCell className="font-medium">
                        {dietitian.firstName} {dietitian.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{dietitian.email}</TableCell>
                      <TableCell>{dietitian.specialization ?? "—"}</TableCell>
                      <TableCell>{dietitian.patientCount ?? 0}</TableCell>
                      <TableCell>
                        <Badge className={dietitian.active ? "bg-success text-success-foreground" : ""}>
                          {dietitian.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(dietitian)}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon" disabled={rowLoadingMap[dietitian.id] === true} onClick={() => handleToggle(dietitian.id)}>
                            {rowLoadingMap[dietitian.id] ? (
                              <Loader2 className="size-4 animate-spin text-muted-foreground" />
                            ) : dietitian.active ? (
                              <ToggleRight className="size-4 text-success" />
                            ) : (
                              <ToggleLeft className="size-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(dietitian.id)}>
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {(totalPages > 1 || totalElements > 0) && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                {totalElements} dietitian{totalElements !== 1 ? "s" : ""} total
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={currentPage === 0 || loading} onClick={() => fetchDietitians(searchQuery || undefined, currentPage - 1)}>
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-sm">Page {currentPage + 1} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={currentPage >= totalPages - 1 || loading} onClick={() => fetchDietitians(searchQuery || undefined, currentPage + 1)}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dietitian Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Dietitian</DialogTitle>
            <DialogDescription>Update dietitian account details</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input placeholder="Jane" value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input placeholder="Smith" value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="jane@nutriflow.com" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input type="tel" placeholder="+994XXXXXXXXX" value={editForm.phoneNumber} onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Specialization</Label>
              <Input placeholder="Clinical Nutrition" value={editForm.specialization} onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>New Password <span className="text-muted-foreground text-xs">(leave blank to keep current)</span></Label>
              <div className="relative">
                <Input
                  type={showEditPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground"
                  onClick={() => setShowEditPassword((v) => !v)}
                >
                  {showEditPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} disabled={editSubmitting}>
              {editSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dietitian Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Dietitian</DialogTitle>
            <DialogDescription>Create a new dietitian account</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input placeholder="Jane" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input placeholder="Smith" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="jane@nutriflow.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input type="tel" placeholder="+994XXXXXXXXX" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Specialization</Label>
              <Input placeholder="Clinical Nutrition" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? "Creating..." : "Create Dietitian"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

