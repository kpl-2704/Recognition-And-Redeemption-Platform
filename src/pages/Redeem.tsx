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
    vendors,
    vouchers,
    getUserPoints,
    getVouchersByVendor,
    purchaseVoucher,
    getUserVouchers,
    redeemVoucher,
    addPointsToUser,
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

    // Give user some demo points based on their kudos
    if (currentUser) {
      const kudosPoints =
        currentUser.totalKudosReceived * 50 + currentUser.totalKudosSent * 30;
      addPointsToUser(currentUser.id, kudosPoints, "Kudos activity bonus");
    }
  }, [setCurrentPage, currentUser, addPointsToUser]);

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

  const userPoints = getUserPoints(currentUser.id);
  const userVouchers = getUserVouchers(currentUser.id);

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

  const handlePurchaseVoucher = async () => {
    if (!selectedVoucher || !currentUser) return;

    const success = await purchaseVoucher(currentUser.id, selectedVoucher.id);

    if (success) {
      addNotification({
        type: "success",
        message: `Successfully purchased ${selectedVoucher.title}!`,
      });
      setShowPurchaseModal(false);
      setSelectedVoucher(null);
    } else {
      addNotification({
        type: "error",
        message: "Insufficient points to purchase this voucher.",
      });
    }
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
    const minPrice = Math.min(...vendorVouchers.map((v) => v.pointsCost));

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
                <span className="font-medium">{voucher.pointsCost} points</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                Valid until {new Date(voucher.validUntil).toLocaleDateString()}
              </div>
            </div>

            <Button
              onClick={() => {
                setSelectedVoucher(voucher);
                setShowPurchaseModal(true);
              }}
              disabled={userPoints < voucher.pointsCost}
              className="w-full"
            >
              {userPoints < voucher.pointsCost
                ? "Insufficient Points"
                : "Purchase Voucher"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Redeem Center</h1>
          <p className="text-gray-600 mt-2">
            Exchange your points for amazing vouchers and rewards
          </p>
        </div>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Coins className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600">Your Points</p>
              <p className="text-2xl font-bold text-gray-900">
                {userPoints.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="marketplace" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="my-vouchers">
            My Vouchers ({userVouchers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-6">
          {!selectedVendor ? (
            <>
              {/* Search and Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search vendors..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={
                            selectedCategory === category
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vendors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVendors.map((vendor) => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Vendor Details */}
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="outline"
                  onClick={() => setSelectedVendor(null)}
                >
                  ← Back to Vendors
                </Button>
                <div className="flex items-center gap-4">
                  <img
                    src={selectedVendor.logo}
                    alt={selectedVendor.name}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${selectedVendor.name}&background=random`;
                    }}
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
              </div>

              {/* Vouchers for Selected Vendor */}
              <div className="grid gap-4">
                {getVouchersByVendor(selectedVendor.id).map((voucher) => (
                  <VoucherCard key={voucher.id} voucher={voucher} />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="my-vouchers" className="space-y-6">
          {userVouchers.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No vouchers yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Purchase vouchers from the marketplace to see them here
                </p>
                <Button onClick={() => setSelectedVendor(null)}>
                  Browse Marketplace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {userVouchers.map((userVoucher) => (
                <Card key={userVoucher.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          src={userVoucher.voucher.image}
                          alt={userVoucher.voucher.title}
                          className="w-12 h-12 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${userVoucher.voucher.vendor.name}&background=random`;
                          }}
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-lg">
                            {userVoucher.voucher.title}
                          </h4>
                          <Badge
                            variant={
                              userVoucher.status === "active"
                                ? "default"
                                : userVoucher.status === "redeemed"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {userVoucher.status}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">
                          {userVoucher.voucher.description}
                        </p>

                        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                          <span>
                            Purchased{" "}
                            {formatDistanceToNow(userVoucher.purchasedAt, {
                              addSuffix: true,
                            })}
                          </span>
                          {userVoucher.redeemedAt && (
                            <span>
                              Redeemed{" "}
                              {formatDistanceToNow(userVoucher.redeemedAt, {
                                addSuffix: true,
                              })}
                            </span>
                          )}
                        </div>

                        <Button
                          onClick={() => handleViewVoucherDetails(userVoucher)}
                          variant="outline"
                          size="sm"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Purchase Confirmation Modal */}
      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent className="sm:max-w-md">
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
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${selectedVoucher.vendor.name}&background=random`;
                  }}
                />
                <div>
                  <h4 className="font-medium">{selectedVoucher.title}</h4>
                  <p className="text-sm text-gray-600">
                    {selectedVoucher.description}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Cost:</span>
                  <span className="font-medium">
                    {selectedVoucher.pointsCost} points
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Your Balance:</span>
                  <span className="font-medium">{userPoints} points</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>After Purchase:</span>
                  <span className="font-medium">
                    {userPoints - selectedVoucher.pointsCost} points
                  </span>
                </div>
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
                  onClick={() => setShowPurchaseModal(false)}
                  variant="outline"
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Voucher Details</DialogTitle>
          </DialogHeader>

          {selectedUserVoucher && (
            <div className="space-y-6">
              <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <img
                  src={selectedUserVoucher.voucher.image}
                  alt={selectedUserVoucher.voucher.title}
                  className="w-16 h-16 object-contain mx-auto mb-4"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${selectedUserVoucher.voucher.vendor.name}&background=random`;
                  }}
                />
                <h3 className="text-xl font-bold mb-2">
                  {selectedUserVoucher.voucher.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  Value: ₹{selectedUserVoucher.voucher.value}
                </p>

                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-sm text-gray-600 mb-2">Voucher Code</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-3 py-2 rounded font-mono text-lg flex-1">
                      {selectedUserVoucher.code}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyCode(selectedUserVoucher.code)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">How to Use</h4>
                  <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                    <li>Visit {selectedUserVoucher.voucher.vendor.website}</li>
                    <li>Add items to your cart</li>
                    <li>Enter the voucher code at checkout</li>
                    <li>Enjoy your purchase!</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Terms & Conditions</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {selectedUserVoucher.voucher.termsAndConditions.map(
                      (term, index) => (
                        <li key={index}>{term}</li>
                      ),
                    )}
                  </ul>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>
                    Purchased:{" "}
                    {selectedUserVoucher.purchasedAt.toLocaleDateString()}
                  </span>
                  <span>
                    Expires:{" "}
                    {new Date(
                      selectedUserVoucher.voucher.validUntil,
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
