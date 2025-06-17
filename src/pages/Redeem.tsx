import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useUIStore } from "@/stores/useUIStore";
import { useUserStore } from "@/stores/useUserStore";
import { useVoucherStore } from "@/stores/useVoucherStore";
import {
  Gift,
  Search,
  Star,
  Coins,
  ExternalLink,
  Clock,
  Check,
  Calendar,
  Copy,
} from "lucide-react";
import { Vendor, Voucher, UserVoucher } from "@/types/vouchers";
import { formatDistanceToNow } from "date-fns";

export default function Redeem() {
  const { setCurrentPage, addNotification } = useUIStore();
  const { currentUser } = useUserStore();
  const {
    vouchers,
    userVouchers,
    fetchVouchers,
    redeemVoucher,
    getVouchersForUser,
    getVoucherStats,
  } = useVoucherStore();

  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showVoucherDetails, setShowVoucherDetails] = useState(false);
  const [selectedUserVoucher, setSelectedUserVoucher] =
    useState<UserVoucher | null>(null);

  useEffect(() => {
    setCurrentPage("redeem");

    // Fetch voucher data when component mounts
    if (currentUser) {
      fetchVouchers({ userId: currentUser.id });
    }
  }, [setCurrentPage, currentUser, fetchVouchers]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Redeem Center
          </h2>
          <p className="text-gray-600">
            Please log in to access the redeem center.
          </p>
        </div>
      </div>
    );
  }

  // Mock data for demo purposes
  const userPoints = 1500; // This would come from a points system
  const userVouchersForCurrentUser = getVouchersForUser(currentUser.id);
  const stats = getVoucherStats();

  // Extract unique vendors from vouchers
  const vendors = Array.from(
    new Map(vouchers.map((v) => [v.vendor.id, v.vendor])).values(),
  );

  const categories = [
    "All",
    ...Array.from(new Set(vendors.map((v) => v.category))),
  ];

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || vendor.category === selectedCategory;
    return matchesSearch && matchesCategory && vendor.isActive;
  });

  const getVouchersByVendor = (vendorId: string) => {
    return vouchers.filter((v) => v.vendorId === vendorId);
  };

  const handlePurchaseVoucher = async () => {
    if (!selectedVoucher || !currentUser) return;

    addNotification({
      type: "success",
      message: `Successfully purchased ${selectedVoucher.title}!`,
    });
    setShowPurchaseModal(false);
    setSelectedVoucher(null);
  };

  const handleViewVoucherDetails = (userVoucher: UserVoucher) => {
    setSelectedUserVoucher(userVoucher);
    setShowVoucherDetails(true);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    addNotification({
      type: "success",
      message: "Voucher code copied to clipboard!",
    });
  };

  const VendorCard = ({ vendor }: { vendor: Vendor }) => {
    const vendorVouchers = getVouchersByVendor(vendor.id);
    const minPrice =
      vendorVouchers.length > 0
        ? Math.min(...vendorVouchers.map((v) => v.pointsCost))
        : 0;

    return (
      <Card
        className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
        onClick={() => setSelectedVendor(vendor)}
      >
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src={vendor.logo}
                alt={vendor.name}
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${vendor.name}&background=random`;
                }}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{vendor.name}</h3>
              <p className="text-sm text-gray-600">{vendor.description}</p>
              <Badge variant="secondary" className="mt-2">
                {vendor.category}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Coins className="w-4 h-4" />
              From {minPrice} points
            </div>
            <div className="flex items-center gap-1 text-sm text-blue-600">
              <ExternalLink className="w-4 h-4" />
              {vendorVouchers.length} vouchers
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const VoucherCard = ({ voucher }: { voucher: Voucher }) => (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            <img
              src={voucher.image}
              alt={voucher.title}
              className="w-12 h-12 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${voucher.vendor.name}&background=random`;
              }}
            />
          </div>

          <div className="flex-1">
            <h4 className="font-medium text-lg mb-2">{voucher.title}</h4>
            <p className="text-sm text-gray-600 mb-3">{voucher.description}</p>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-blue-600">
                  {voucher.pointsCost} points
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Valid until{" "}
                  {new Date(voucher.validUntil).toLocaleDateString()}
                </span>
              </div>
            </div>

            <Button
              onClick={() => {
                setSelectedVoucher(voucher);
                setShowPurchaseModal(true);
              }}
              className="w-full"
              disabled={userPoints < voucher.pointsCost}
            >
              {userPoints >= voucher.pointsCost
                ? `Redeem for ${voucher.pointsCost} points`
                : `Need ${voucher.pointsCost - userPoints} more points`}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Redeem Center</h1>
        <p className="text-purple-100 text-lg">
          Exchange your hard-earned points for amazing rewards and vouchers!
        </p>
      </div>

      {/* Points Balance */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {userPoints} Points
              </h2>
              <p className="text-gray-600">Available for redemption</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-green-600">
                <Coins className="w-6 h-6" />
                <span className="text-lg font-semibold">Active Balance</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="vendors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="vouchers">All Vouchers</TabsTrigger>
          <TabsTrigger value="my-vouchers">
            My Vouchers ({stats.total})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vendors" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Vendors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vouchers" className="space-y-6">
          {selectedVendor ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedVendor.logo}
                    alt={selectedVendor.name}
                    className="w-12 h-12 rounded-lg"
                  />
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedVendor.name}
                    </h2>
                    <p className="text-gray-600">
                      {selectedVendor.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedVendor(null)}
                >
                  Back to Vendors
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getVouchersByVendor(selectedVendor.id).map((voucher) => (
                  <VoucherCard key={voucher.id} voucher={voucher} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Select a Vendor
              </h3>
              <p className="text-gray-600">
                Choose a vendor from the Vendors tab to see their available
                vouchers.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-vouchers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userVouchersForCurrentUser.map((userVoucher) => (
              <Card
                key={userVoucher.id}
                className="transition-all duration-200 hover:shadow-md"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={userVoucher.voucher.image}
                        alt={userVoucher.voucher.title}
                        className="w-12 h-12 object-contain"
                      />
                    </div>

                    <div className="flex-1">
                      <h4 className="font-medium text-lg mb-2">
                        {userVoucher.voucher.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {userVoucher.voucher.description}
                      </p>

                      <div className="flex items-center gap-2 mb-4">
                        <Badge
                          variant={
                            userVoucher.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {userVoucher.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Purchased{" "}
                          {formatDistanceToNow(
                            new Date(userVoucher.purchasedAt),
                            { addSuffix: true },
                          )}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <Button
                          onClick={() => handleViewVoucherDetails(userVoucher)}
                          className="w-full"
                          variant="outline"
                        >
                          View Details
                        </Button>
                        {userVoucher.status === "active" && (
                          <Button
                            onClick={() => handleCopyCode(userVoucher.code)}
                            className="w-full"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Code
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {userVouchersForCurrentUser.length === 0 && (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Vouchers Yet
              </h3>
              <p className="text-gray-600">
                Start earning points by giving kudos to your teammates!
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Purchase Modal */}
      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              Are you sure you want to purchase this voucher?
            </DialogDescription>
          </DialogHeader>
          {selectedVoucher && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={selectedVoucher.image}
                  alt={selectedVoucher.title}
                  className="w-16 h-16 rounded-lg"
                />
                <div>
                  <h4 className="font-medium">{selectedVoucher.title}</h4>
                  <p className="text-sm text-gray-600">
                    {selectedVoucher.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Coins className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-600">
                      {selectedVoucher.pointsCost} points
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <span className="font-medium">Your Balance:</span>
                <span className="font-bold text-blue-600">
                  {userPoints} points
                </span>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handlePurchaseVoucher}
                  className="flex-1"
                  disabled={userPoints < selectedVoucher.pointsCost}
                >
                  Confirm Purchase
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Voucher Details Modal */}
      <Dialog open={showVoucherDetails} onOpenChange={setShowVoucherDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voucher Details</DialogTitle>
          </DialogHeader>
          {selectedUserVoucher && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedUserVoucher.voucher.image}
                  alt={selectedUserVoucher.voucher.title}
                  className="w-20 h-20 rounded-lg"
                />
                <div>
                  <h4 className="text-xl font-semibold">
                    {selectedUserVoucher.voucher.title}
                  </h4>
                  <p className="text-gray-600">
                    {selectedUserVoucher.voucher.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium">{selectedUserVoucher.status}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Purchased</p>
                  <p className="font-medium">
                    {new Date(
                      selectedUserVoucher.purchasedAt,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedUserVoucher.status === "active" && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Voucher Code</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-white rounded border font-mono text-lg">
                      {selectedUserVoucher.code}
                    </code>
                    <Button
                      onClick={() => handleCopyCode(selectedUserVoucher.code)}
                      size="sm"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowVoucherDetails(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                {selectedUserVoucher.status === "active" && (
                  <Button
                    onClick={() => handleCopyCode(selectedUserVoucher.code)}
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
