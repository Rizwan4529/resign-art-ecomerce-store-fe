import React, { useState } from 'react';
import { Package, TrendingDown, History, FileText, Download, Calendar, Search } from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetInventoryQuery,
  useUpdateInventoryMutation,
  useLazyGetInventoryHistoryQuery,
  useLazyGetSalesReportQuery,
  useDownloadSalesPDFMutation,
  InventoryItem,
  InventoryLog,
} from '../../services/api/inventoryApi';
import { extractErrorMessage } from '../../utils/authHelpers';
import { getFirstImageUrl } from '../../utils/imageUtils';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';

const CATEGORIES = [
  'ALL',
  'JEWELRY',
  'HOME_DECOR',
  'COASTERS',
  'KEYCHAINS',
  'WALL_ART',
  'TRAYS',
  'BOOKMARKS',
  'PHONE_CASES',
  'CLOCKS',
  'CUSTOM',
];

export const InventoryManagement = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);

  // Inventory query
  const { data: inventoryData, isLoading, refetch } = useGetInventoryQuery({
    page,
    limit: 20,
    search: search || undefined,
    category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
    lowStock: lowStockOnly,
  });

  // Mutations and lazy queries
  const [updateInventory, { isLoading: isUpdating }] = useUpdateInventoryMutation();
  const [getHistory, { data: historyData, isLoading: isLoadingHistory }] = useLazyGetInventoryHistoryQuery();
  const [getSalesReport, { data: salesReportData, isLoading: isLoadingReport }] = useLazyGetSalesReportQuery();
  const [downloadPDF, { isLoading: isDownloadingPDF }] = useDownloadSalesPDFMutation();

  // Update stock form state
  const [updateForm, setUpdateForm] = useState({
    quantity: 0,
    operation: 'set' as 'set' | 'add' | 'subtract',
    reason: '',
  });

  // Sales report form state
  const [reportForm, setReportForm] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Stock badge color
  const getStockBadgeColor = (stock: number) => {
    if (stock === 0) return 'bg-red-500 text-white';
    if (stock <= 5) return 'bg-orange-500 text-white';
    if (stock <= 10) return 'bg-yellow-500 text-black';
    return 'bg-green-500 text-white';
  };

  // Open update stock dialog
  const openUpdateDialog = (product: InventoryItem) => {
    setSelectedProduct(product);
    setUpdateForm({
      quantity: product.stock,
      operation: 'set',
      reason: '',
    });
    setIsUpdateDialogOpen(true);
  };

  // Open history dialog
  const openHistoryDialog = async (product: InventoryItem) => {
    setSelectedProduct(product);
    setIsHistoryDialogOpen(true);
    try {
      await getHistory({ productId: product.id }).unwrap();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  // Handle stock update
  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) return;

    if (!updateForm.reason.trim()) {
      toast.error('Please provide a reason for the stock update');
      return;
    }

    if (updateForm.operation === 'subtract' && updateForm.quantity > selectedProduct.stock) {
      toast.error('Cannot subtract more than available stock');
      return;
    }

    try {
      await updateInventory({
        productId: selectedProduct.id,
        data: updateForm,
      }).unwrap();

      toast.success(`Stock updated successfully for ${selectedProduct.name}`);
      setIsUpdateDialogOpen(false);
      setUpdateForm({ quantity: 0, operation: 'set', reason: '' });
      setSelectedProduct(null);
      refetch();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  // Handle sales report generation
  const handleGenerateReport = async () => {
    try {
      await getSalesReport({
        startDate: reportForm.startDate,
        endDate: reportForm.endDate,
      }).unwrap();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  // Handle PDF download
  const handleDownloadPDF = async () => {
    try {
      const blob = await downloadPDF({
        startDate: reportForm.startDate,
        endDate: reportForm.endDate,
      }).unwrap();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-report-${reportForm.startDate}-to-${reportForm.endDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Sales report downloaded successfully');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory Management</h2>
          <p className="text-muted-foreground">Manage product stock levels and track changes</p>
        </div>
        <Button onClick={() => setIsReportDialogOpen(true)}>
          <FileText className="w-4 h-4 mr-2" />
          Generate Sales Report
        </Button>
      </div>

      {/* Summary Cards */}
      {inventoryData?.summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventoryData.summary.totalProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventoryData.summary.totalStock}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{inventoryData.summary.lowStockCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{inventoryData.summary.outOfStockCount}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="lowStock"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="lowStock" className="text-sm font-medium">
                Show low stock only
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading inventory...</div>
          ) : inventoryData?.data && inventoryData.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryData.data.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <ImageWithFallback
                          src={getFirstImageUrl(product.images)}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{product.category.replace('_', ' ')}</TableCell>
                    <TableCell>
                      <Badge className={getStockBadgeColor(product.stock)}>
                        {product.stock === 0 ? 'OUT OF STOCK' : `${product.stock} units`}
                      </Badge>
                    </TableCell>
                    <TableCell>PKR {product.price}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openUpdateDialog(product)}
                      >
                        Update Stock
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openHistoryDialog(product)}
                      >
                        <History className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No products found
            </div>
          )}

          {/* Pagination */}
          {inventoryData?.pagination && inventoryData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {inventoryData.pagination.currentPage} of {inventoryData.pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!inventoryData.pagination.hasPrevPage}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!inventoryData.pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Stock Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock - {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Current Stock: <strong>{selectedProduct?.stock} units</strong>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateStock}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="operation">Operation</Label>
                <Select
                  value={updateForm.operation}
                  onValueChange={(value: 'set' | 'add' | 'subtract') =>
                    setUpdateForm({ ...updateForm, operation: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="set">Set to value</SelectItem>
                    <SelectItem value="add">Add to stock</SelectItem>
                    <SelectItem value="subtract">Subtract from stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={updateForm.quantity}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, quantity: parseInt(e.target.value) || 0 })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="reason">Reason *</Label>
                <Textarea
                  id="reason"
                  value={updateForm.reason}
                  onChange={(e) => setUpdateForm({ ...updateForm, reason: e.target.value })}
                  placeholder="Why are you updating the stock? (e.g., New shipment received, damaged items, inventory correction)"
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUpdateDialogOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update Stock'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Stock Change History - {historyData?.data?.product?.name}</DialogTitle>
            <DialogDescription>
              Complete audit trail of all stock changes
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {isLoadingHistory ? (
              <div className="text-center py-8">Loading history...</div>
            ) : historyData?.data?.history && historyData.data.history.length > 0 ? (
              <div className="space-y-4">
                {historyData.data.history.map((log: InventoryLog) => (
                  <Card key={log.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{log.changeType.replace('_', ' ')}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(log.createdAt)}
                            </span>
                          </div>
                          <div className="mt-2">
                            <span className="font-medium">
                              {log.previousStock} → {log.newStock} units
                            </span>
                            <span
                              className={`ml-2 ${
                                log.changeAmount >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              ({log.changeAmount >= 0 ? '+' : ''}
                              {log.changeAmount})
                            </span>
                          </div>
                          {log.reason && (
                            <p className="mt-1 text-sm text-muted-foreground">{log.reason}</p>
                          )}
                        </div>
                        <div className="text-sm text-right">
                          <div className="font-medium">{log.changedBy.name}</div>
                          <div className="text-muted-foreground">{log.changedBy.email}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No history available
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Sales Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Generate Sales Report</DialogTitle>
            <DialogDescription>
              Select date range to generate detailed sales report with revenue and profit margins
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Date Range Picker */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={reportForm.startDate}
                  onChange={(e) => setReportForm({ ...reportForm, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={reportForm.endDate}
                  onChange={(e) => setReportForm({ ...reportForm, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleGenerateReport} disabled={isLoadingReport}>
                {isLoadingReport ? 'Generating...' : 'Generate Report'}
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={isDownloadingPDF}
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloadingPDF ? 'Downloading...' : 'Download PDF'}
              </Button>
            </div>

            {/* Report Preview */}
            {salesReportData?.data && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Report Summary</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        PKR {salesReportData.data.summary.totalRevenue.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {salesReportData.data.summary.totalOrders}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {salesReportData.data.summary.totalProductsSold}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {salesReportData.data.profitMargins.profitMargin.toFixed(2)}%
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h4 className="text-md font-semibold mb-2">Top Products</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Quantity Sold</TableHead>
                        <TableHead>Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesReportData.data.productsSold.slice(0, 10).map((product) => (
                        <TableRow key={product.productId}>
                          <TableCell>{product.productName}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.quantitySold}</TableCell>
                          <TableCell>PKR {product.revenue.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
