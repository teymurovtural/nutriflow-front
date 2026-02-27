import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Skeleton } from "../../components/ui/skeleton";
import { UserLifecycleBadge } from "../../components/StatusBadges";
import { Search, Plus, Trash2, ToggleLeft, ToggleRight, UserPlus, Eye, EyeOff, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  getUsers, searchUsers, createUser, toggleUserStatus, deleteUser,
  assignDietitian, assignCaterer, getDietitians, getCaterers,
  type AdminUser, type AdminDietitian, type AdminCaterer,
} from "../../services/adminService";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [dietitians, setDietitians] = useState<AdminDietitian[]>([]);
  const [caterers, setCaterers] = useState<AdminCaterer[]>([]);
  const [assignDietitianId, setAssignDietitianId] = useState("");
  const [assignCatererId, setAssignCatererId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rowLoadingMap, setRowLoadingMap] = useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Create form state
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phoneNumber: "", goal: "", password: "", confirmPassword: "",
  });

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchController = useRef<AbortController | null>(null);

  const fetchUsers = async (query?: string, page = 0) => {
    // Cancel any in-flight fetch
    fetchController.current?.abort();
    const controller = new AbortController();
    fetchController.current = controller;

    setLoading(true);
    try {
      const { data } = query?.trim()
        ? await searchUsers(query, page)
        : await getUsers(page);
      if (!controller.signal.aborted) {
        setUsers(data.content ?? []);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        setCurrentPage(data.number);
      }
    } catch (err: unknown) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        toast.error("Failed to load users");
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
    // Pre-fetch dietitians and caterers for assign dialog
    getDietitians(0, 100).then(({ data }) => setDietitians(data.content ?? [])).catch(() => {});
    getCaterers(0, 100).then(({ data }) => setCaterers(data.content ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery.trim()) {
      fetchUsers();
      return;
    }
    searchTimeout.current = setTimeout(() => fetchUsers(searchQuery, 0), 400);
  }, [searchQuery]);

  const handleToggleStatus = async (id: number) => {
    // Optimistic update
    setUsers((prev) =>
      prev.map((u) => (u.userId === id ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u))
    );
    setRowLoadingMap((prev) => ({ ...prev, [id]: true }));
    try {
      await toggleUserStatus(id);
      toast.success("User status updated");
      await fetchUsers(searchQuery || undefined, currentPage);
    } catch (err: unknown) {
      // Revert optimistic update
      setUsers((prev) =>
        prev.map((u) => (u.userId === id ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u))
      );
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "Failed to update status");
    } finally {
      setRowLoadingMap((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await deleteUser(id);
      toast.success("User deleted");
      await fetchUsers(searchQuery || undefined, currentPage);
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleCreateUser = async () => {
    if (!form.firstName || !form.email || !form.password) {
      toast.error("First name, email, and password are required");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      await createUser({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        phoneNumber: form.phoneNumber,
      });
      toast.success("User created successfully");
      setCreateDialogOpen(false);
      setForm({ firstName: "", lastName: "", email: "", phoneNumber: "", goal: "", password: "", confirmPassword: "" });
      fetchUsers(searchQuery || undefined, 0);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      if (assignDietitianId) await assignDietitian(selectedUser.userId, Number(assignDietitianId));
      if (assignCatererId) await assignCaterer(selectedUser.userId, Number(assignCatererId));
      toast.success("Staff assigned successfully");
      setAssignDialogOpen(false);
      setAssignDietitianId("");
      setAssignCatererId("");
      fetchUsers(searchQuery || undefined, currentPage);
    } catch {
      toast.error("Failed to assign staff");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Users</h1>
          <p className="text-muted-foreground mt-1">Manage platform users</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="size-4 mr-2" />
          Create User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search users for their names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative rounded-lg border overflow-x-auto">
            {/* Overlay loader — shown during any refresh when data already exists */}
            {loading && users.length > 0 && (
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
                  <TableHead>Status</TableHead>
                  <TableHead>Dietitian</TableHead>
                  <TableHead>Caterer</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && users.length === 0 ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell className="font-mono text-sm">{user.userId}</TableCell>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <UserLifecycleBadge status={user.status as Parameters<typeof UserLifecycleBadge>[0]["status"]} />
                      </TableCell>
                      <TableCell className="text-sm">{user.dietitianFullName ?? "—"}</TableCell>
                      <TableCell className="text-sm">{user.catererFullName ?? "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={rowLoadingMap[user.userId] === true}
                            onClick={() => handleToggleStatus(user.userId)}
                          >
                            {rowLoadingMap[user.userId] ? (
                              <Loader2 className="size-4 animate-spin text-muted-foreground" />
                            ) : user.status !== 'EXPIRED' ? (
                              <ToggleRight className="size-4 text-success" />
                            ) : (
                              <ToggleLeft className="size-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(user);
                              // Pre-fill with existing assignments
                              const matchedDietitian = dietitians.find(
                                (d) => `${d.firstName} ${d.lastName}`.trim() === user.dietitianFullName
                              );
                              const matchedCaterer = caterers.find(
                                (c) => c.name === user.catererFullName
                              );
                              setAssignDietitianId(matchedDietitian ? String(matchedDietitian.id) : "");
                              setAssignCatererId(matchedCaterer ? String(matchedCaterer.id) : "");
                              setAssignDialogOpen(true);
                            }}
                          >
                            <UserPlus className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUser(user.userId)}
                          >
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
          {/* Pagination */}
          {(totalPages > 1 || totalElements > 0) && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                {totalElements} user{totalElements !== 1 ? "s" : ""} total
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 0 || loading}
                  onClick={() => fetchUsers(searchQuery || undefined, currentPage - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages - 1 || loading}
                  onClick={() => fetchUsers(searchQuery || undefined, currentPage + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new user to the platform</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                placeholder="John"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                placeholder="Doe"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                placeholder="+994XXXXXXXXX"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
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
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateUser} disabled={submitting}>
              {submitting ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Staff</DialogTitle>
            <DialogDescription>
              Assign dietitian and caterer to {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Dietitian</Label>
              <Select value={assignDietitianId} onValueChange={setAssignDietitianId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dietitian" />
                </SelectTrigger>
                <SelectContent>
                  {dietitians.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.firstName} {d.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Caterer</Label>
              <Select value={assignCatererId} onValueChange={setAssignCatererId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select caterer" />
                </SelectTrigger>
                <SelectContent>
                  {caterers.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={submitting}>
              {submitting ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}