import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Skeleton } from "../../components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../components/ui/sheet";
import { MenuStatusBadge } from "../../components/StatusBadges";
import { Search, Eye } from "lucide-react";
import { toast } from "sonner";
import { getMenus, type AdminMenu } from "../../services/adminService";
import { getBatchItems, type BatchItemResponse } from "../../services/dietitianService";

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MEAL_TYPE_COLORS: Record<string, string> = {
  BREAKFAST: "bg-orange-100 text-orange-700",
  LUNCH:     "bg-blue-100 text-blue-700",
  DINNER:    "bg-purple-100 text-purple-700",
  SNACK:     "bg-green-100 text-green-700",
};

export default function AdminMenus() {
  const [menus, setMenus] = useState<AdminMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // View items sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<AdminMenu | null>(null);
  const [items, setItems] = useState<BatchItemResponse[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await getMenus(0, 100);
        setMenus(data.content ?? []);
      } catch {
        toast.error("Failed to load menus");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleViewItems = async (menu: AdminMenu) => {
    setSelectedMenu(menu);
    setSheetOpen(true);
    setItems([]);
    setItemsLoading(true);
    try {
      const result = await getBatchItems(menu.batchId);
      setItems(result.items ?? []);
    } catch {
      toast.error("Failed to load menu items");
    } finally {
      setItemsLoading(false);
    }
  };

  // batchId is a number — convert to string for safe search comparison
  const filtered = menus.filter(m =>
    String(m.menuId ?? "").includes(searchQuery) ||
    String(m.batchId ?? "").includes(searchQuery) ||
    m.userFullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.dietitianFullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group items by day for the sheet view
  const itemsByDay = items.reduce<Record<number, BatchItemResponse[]>>((acc, item) => {
    (acc[item.day] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1>Menus</h1>
        <p className="text-muted-foreground mt-1">Overview of all monthly menus</p>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by menu ID, batch ID, user or dietitian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Menu ID</TableHead>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Dietitian</TableHead>
                  <TableHead>Caterer</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 10 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      No menus found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((menu) => (
                    <TableRow key={`${menu.menuId}-${menu.batchId}`}>
                      <TableCell className="font-mono text-sm">{menu.menuId ?? "—"}</TableCell>
                      <TableCell className="font-mono text-sm">{menu.batchId}</TableCell>
                      <TableCell>{menu.userFullName ?? "—"}</TableCell>
                      <TableCell>{menu.dietitianFullName ?? "—"}</TableCell>
                      <TableCell>{menu.catererFullName ?? "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {menu.month && menu.year
                          ? `${MONTH_NAMES[menu.month]} ${menu.year}`
                          : "—"}
                      </TableCell>
                      <TableCell>{menu.totalItems ?? "—"}</TableCell>
                      <TableCell>
                        <MenuStatusBadge status={menu.status as Parameters<typeof MenuStatusBadge>[0]["status"]} />
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {menu.createdAt ? new Date(menu.createdAt).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleViewItems(menu)}
                          title="View items"
                        >
                          <Eye className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>
              Menu Items — Batch #{selectedMenu?.batchId}
            </SheetTitle>
            {selectedMenu && (
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span>{selectedMenu.userFullName}</span>
                <span>·</span>
                <span>
                  {selectedMenu.month && selectedMenu.year
                    ? `${MONTH_NAMES[selectedMenu.month]} ${selectedMenu.year}`
                    : ""}
                </span>
                <span>·</span>
                <MenuStatusBadge status={selectedMenu.status as Parameters<typeof MenuStatusBadge>[0]["status"]} />
              </div>
            )}
            {selectedMenu?.rejectionReason && (
              <div className="mt-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                <span className="font-medium">Rejection reason: </span>
                {selectedMenu.rejectionReason}
              </div>
            )}
          </SheetHeader>

          {itemsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No items found for this batch.</p>
          ) : (
            <div className="space-y-6 px-6">
              {Object.keys(itemsByDay)
                .map(Number)
                .sort((a, b) => a - b)
                .map((day) => (
                  <div key={day}>
                    <p className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                      Day {day}
                    </p>
                    <div className="space-y-2">
                      {itemsByDay[day]
                        .sort((a, b) => ["BREAKFAST","LUNCH","DINNER","SNACK"].indexOf(a.mealType) - ["BREAKFAST","LUNCH","DINNER","SNACK"].indexOf(b.mealType))
                        .map((item) => (
                          <div key={item.id} className="rounded-lg border p-3 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${MEAL_TYPE_COLORS[item.mealType] ?? ""}`}>
                                {item.mealType}
                              </span>
                              <span className="text-xs text-muted-foreground">{item.calories} kcal</span>
                            </div>
                            <p className="text-sm">{item.description}</p>
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span>Protein: <strong>{item.protein}g</strong></span>
                              <span>Carbs: <strong>{item.carbs}g</strong></span>
                              <span>Fats: <strong>{item.fats}g</strong></span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

