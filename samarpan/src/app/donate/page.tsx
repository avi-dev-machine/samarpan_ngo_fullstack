"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, CreditCard, Wallet, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useStore } from "@/store/useStore";

function DonateForm() {
  const searchParams = useSearchParams();
  const campaignQueryId = searchParams.get("campaign");
  const { user } = useStore();

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaignQueryId || "");
  const [amount, setAmount] = useState<number | "">(2000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [donorName, setDonorName] = useState(user?.full_name || "");
  const [donorEmail, setDonorEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [showThankYou, setShowThankYou] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [txnId, setTxnId] = useState("");

  // Sync user details if loaded late
  useEffect(() => {
    if (user) {
      setDonorName(user.full_name);
      setDonorEmail(user.email);
    }
  }, [user]);

  // Load campaigns list for selection
  useEffect(() => {
    async function loadCampaigns() {
      try {
        const res = await api.getCampaigns({ status: "ACTIVE" });
        setCampaigns(res.data || []);
      } catch (err: any) {
        console.error("Failed to load campaigns list", err);
      }
    }
    loadCampaigns();
  }, []);

  const finalAmount = amount ? Number(amount) : Number(customAmount);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalAmount || finalAmount <= 0) {
      setError("Please select or enter a valid donation amount.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.createDonation({
        campaign_id: selectedCampaignId || null,
        amount: finalAmount,
        currency: "INR",
        is_anonymous: isAnonymous,
        donor_name: isAnonymous ? "Anonymous" : donorName,
        donor_email: donorEmail || undefined,
        message: message || undefined,
        payment_method: paymentMethod,
      });

      setTxnId(res.transaction_id || "TXN-SUCCESS");
      setShowThankYou(true);
    } catch (err: any) {
      setError(err.message || "Failed to process donation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-secondary/30 dark:bg-black/20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold font-outfit mb-4">
            Make a <span className="text-primary">Difference</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            100% of your donation goes directly to the causes you care about.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!showThankYou ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-2xl"
            >
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleDonate} className="space-y-8">
                {/* Select Campaign Option */}
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-2">
                    Choose Campaign (Optional)
                  </label>
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="">General Donation (Support all causes)</option>
                    {campaigns.map((camp) => (
                      <option key={camp.id} value={camp.id}>
                        {camp.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount Selection */}
                <div>
                  <h3 className="text-xl font-bold font-outfit mb-4">Select Amount (INR)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    {[500, 1000, 2000, 5000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          setAmount(val);
                          setCustomAmount("");
                        }}
                        className={`py-3 rounded-2xl font-bold transition-all ${
                          amount === val
                            ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)] ring-2 ring-primary ring-offset-2 ring-offset-background"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        ₹{val}
                      </button>
                    ))}
                    <div className="col-span-2 md:col-span-1">
                      <input
                        type="number"
                        placeholder="Other"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setAmount("");
                        }}
                        className="w-full h-full py-3 px-4 rounded-2xl bg-secondary text-secondary-foreground font-bold border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Donor Details */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold font-outfit">Your Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required={!isAnonymous}
                        disabled={isAnonymous}
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Message / Words of Support
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Leave a message for the team or public feed..."
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none h-24 resize-none"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer mt-4">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                    />
                    <span className="text-sm font-medium">
                      Donate anonymously (Your name won't appear on the public feed)
                    </span>
                  </label>
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="text-xl font-bold font-outfit mb-4">Payment Method</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      onClick={() => setPaymentMethod("card")}
                      className={`border-2 rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                        paymentMethod === "card"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <CreditCard className="w-6 h-6" />
                      <span className="font-semibold">Credit/Debit Card</span>
                    </div>
                    <div
                      onClick={() => setPaymentMethod("upi")}
                      className={`border-2 rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                        paymentMethod === "upi"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Wallet className="w-6 h-6" />
                      <span className="font-semibold">UPI / Wallet</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 text-blue-500 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm">
                    Your payment is secure and encrypted. Samarpan is a registered non-profit and
                    donations are tax-exempt under section 80G.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      Donate ₹{(finalAmount || 0).toLocaleString("en-IN")} Now{" "}
                      <Heart className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-3xl p-10 text-center shadow-2xl max-w-2xl mx-auto"
            >
              <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 fill-current" />
              </div>
              <h2 className="text-4xl font-extrabold font-outfit mb-4">Thank You!</h2>
              <p className="text-lg text-muted-foreground mb-4">
                Your donation of ₹{finalAmount.toLocaleString("en-IN")} has been processed successfully.
              </p>
              <div className="bg-secondary/50 rounded-2xl p-4 max-w-md mx-auto mb-8 border border-border text-left">
                <div className="text-sm text-muted-foreground mb-1">Receipt Transaction ID</div>
                <div className="font-mono font-bold select-all">{txnId}</div>
              </div>
              <button
                onClick={() => {
                  setShowThankYou(false);
                  setAmount(2000);
                  setCustomAmount("");
                  setMessage("");
                }}
                className="px-8 py-3 rounded-full bg-secondary text-secondary-foreground font-bold hover:bg-secondary/80 transition-colors"
              >
                Donate Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function DonatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 text-center">Loading donation system...</div>}>
      <DonateForm />
    </Suspense>
  );
}
