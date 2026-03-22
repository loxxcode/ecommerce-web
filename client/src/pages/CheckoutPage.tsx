import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { CheckCircle, CreditCard, Wallet, ArrowLeft, Lock, MapPin, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { formatFRW } from "@/lib/currency";

interface FormErrors { [key: string]: string; }

interface SavedAddress {
  id: string; label: string; firstName: string; lastName: string; email: string; address: string; city: string; zip: string; phone: string;
}

const savedAddresses: SavedAddress[] = [
  { id: "addr1", label: "Home", firstName: "Jean", lastName: "Mutoni", email: "jean@email.com", address: "KG 11 Ave, Kigali Heights", city: "Kigali", zip: "00100", phone: "+250 788 123 456" },
  { id: "addr2", label: "Office", firstName: "Jean", lastName: "Mutoni", email: "jean@work.com", address: "KN 4 Ave, Norrsken House", city: "Kigali", zip: "00200", phone: "+250 788 789 012" },
];

const CheckoutPage = () => {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);
  const [payment, setPayment] = useState("card");
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", address: "", city: "", zip: "", phone: "", cardNumber: "", expiry: "", cvc: "", momoNumber: "" });
  const [errors, setErrors] = useState<FormErrors>({});

  const shipping = total >= 50000 ? 0 : 2500;
  const tax = total * 0.18;
  const grandTotal = total + shipping + tax;

  const updateField = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => { const n = { ...p }; delete n[field]; return n; });
  };

  const handleSelectAddress = (addr: SavedAddress) => {
    setSelectedAddress(addr.id);
    setShowNewAddress(false);
    setForm(p => ({ ...p, firstName: addr.firstName, lastName: addr.lastName, email: addr.email, address: addr.address, city: addr.city, zip: addr.zip, phone: addr.phone }));
    setErrors({});
  };

  const validateShipping = () => {
    if (selectedAddress && !showNewAddress) return true;
    const e: FormErrors = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Valid email required";
    if (!form.address.trim()) e.address = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.zip.trim()) e.zip = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePayment = () => {
    const e: FormErrors = {};
    if (payment === "card") {
      if (!form.cardNumber.trim() || form.cardNumber.replace(/\s/g, "").length < 16) e.cardNumber = "Valid card number required";
      if (!form.expiry.trim()) e.expiry = "Required";
      if (!form.cvc.trim() || form.cvc.length < 3) e.cvc = "Valid CVC required";
    }
    if (payment === "momo") {
      if (!form.momoNumber.trim() || form.momoNumber.length < 10) e.momoNumber = "Valid mobile number required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = () => {
    if (!validatePayment()) return;
    setSubmitted(true);
    clearCart();
    toast.success("Order placed successfully!");
  };

  if (submitted) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-success/10">
          <CheckCircle size={40} className="text-success" />
        </div>
        <h1 className="mt-5 font-heading text-2xl font-bold">Order Placed Successfully!</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">Thank you for your purchase. You'll receive a confirmation email with tracking details shortly.</p>
        <p className="mt-1 text-xs text-muted-foreground">Order #ORD-{Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
        <div className="mt-6 flex gap-3">
          <Link to="/"><Button className="rounded-xl">Continue Shopping</Button></Link>
          <Link to="/dashboard/orders"><Button variant="outline" className="rounded-xl">View Orders</Button></Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const InputField = ({ label, field, type = "text", placeholder, span2 = false }: { label: string; field: string; type?: string; placeholder: string; span2?: boolean }) => (
    <div className={span2 ? "sm:col-span-2" : ""}>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        value={(form as any)[field]}
        onChange={e => updateField(field, e.target.value)}
        placeholder={placeholder}
        className={`mt-1 w-full rounded-lg border ${errors[field] ? "border-destructive" : "border-input"} bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30 transition-all`}
      />
      {errors[field] && <p className="mt-0.5 text-[11px] text-destructive">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <Link to="/cart" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5">
        <ArrowLeft size={14} /> Back to Cart
      </Link>

      <div className="flex items-center justify-center gap-4 mb-8">
        {[{ n: 1, label: "Shipping" }, { n: 2, label: "Payment" }].map(s => (
          <div key={s.n} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${step >= s.n ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{s.n}</div>
            <span className={`text-sm font-medium ${step >= s.n ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
            {s.n < 2 && <div className={`h-px w-12 ${step > s.n ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h2 className="font-heading text-lg font-semibold mb-4">Shipping Information</h2>

              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Saved Addresses</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {savedAddresses.map(addr => (
                    <label
                      key={addr.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all ${selectedAddress === addr.id && !showNewAddress ? "border-primary bg-primary/5 shadow-sm" : "border-input hover:bg-secondary/50"}`}
                      onClick={() => handleSelectAddress(addr)}
                    >
                      <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selectedAddress === addr.id && !showNewAddress ? "border-primary bg-primary" : "border-muted-foreground/40"}`}>
                        {selectedAddress === addr.id && !showNewAddress && <Check size={10} className="text-primary-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-muted-foreground" />
                          <span className="text-sm font-semibold">{addr.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{addr.address}</p>
                        <p className="text-xs text-muted-foreground">{addr.city} · {addr.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <button
                  className={`mt-2 inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${showNewAddress ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => { setShowNewAddress(true); setSelectedAddress(null); setForm(p => ({ ...p, firstName: "", lastName: "", email: "", address: "", city: "", zip: "", phone: "" })); }}
                >
                  <Plus size={12} /> Use a new address
                </button>
              </div>

              {showNewAddress && (
                <div className="grid gap-3 sm:grid-cols-2 border-t border-border pt-4">
                  <InputField label="First Name" field="firstName" placeholder="Jean" />
                  <InputField label="Last Name" field="lastName" placeholder="Mutoni" />
                  <InputField label="Email" field="email" type="email" placeholder="jean@example.com" span2 />
                  <InputField label="Phone" field="phone" placeholder="+250 788 000 000" span2 />
                  <InputField label="Address" field="address" placeholder="KG 11 Ave, Kigali" span2 />
                  <InputField label="City" field="city" placeholder="Kigali" />
                  <InputField label="ZIP Code" field="zip" placeholder="00100" />
                </div>
              )}

              <Button className="mt-5 rounded-xl" onClick={() => { if (validateShipping()) setStep(2); }}>Continue to Payment</Button>
            </div>
          )}

          {step === 2 && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h2 className="font-heading text-lg font-semibold">Payment Method</h2>
              <div className="mt-4 space-y-2.5">
                {[
                  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
                  { id: "momo", label: "Mobile Money (MTN / Airtel)", icon: Wallet },
                  { id: "cod", label: "Cash on Delivery", icon: Lock },
                ].map(m => (
                  <label key={m.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all ${payment === m.id ? "border-primary bg-primary/5 shadow-sm" : "border-input hover:bg-secondary/50"}`}>
                    <input type="radio" name="payment" value={m.id} checked={payment === m.id} onChange={() => { setPayment(m.id); setErrors({}); }} className="accent-primary" />
                    <m.icon size={18} className={payment === m.id ? "text-primary" : "text-muted-foreground"} />
                    <span className="text-sm font-medium">{m.label}</span>
                  </label>
                ))}
              </div>
              {payment === "card" && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <InputField label="Card Number" field="cardNumber" placeholder="4242 4242 4242 4242" span2 />
                  <InputField label="Expiry (MM/YY)" field="expiry" placeholder="12/26" />
                  <InputField label="CVC" field="cvc" placeholder="123" />
                </div>
              )}
              {payment === "momo" && (
                <div className="mt-4">
                  <InputField label="Mobile Money Number" field="momoNumber" placeholder="0788 123 456" span2 />
                </div>
              )}
              <div className="mt-5 flex gap-3">
                <Button variant="outline" className="rounded-xl" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1 gap-2 rounded-xl" onClick={handlePlaceOrder}><Lock size={14} /> Place Order · {formatFRW(grandTotal)}</Button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-card h-fit lg:sticky lg:top-24">
          <h2 className="font-heading text-lg font-bold">Order Summary</h2>
          <div className="mt-4 space-y-3 max-h-48 overflow-y-auto pr-1">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[9px] font-bold">{item.quantity}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground">{formatFRW(item.price)} each</p>
                </div>
                <span className="text-xs font-medium">{formatFRW(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 text-sm border-t border-border pt-3">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatFRW(total)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className={shipping === 0 ? "text-success" : ""}>{shipping === 0 ? "FREE" : formatFRW(shipping)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax (18%)</span><span>{formatFRW(tax)}</span></div>
            <div className="h-px bg-border" />
            <div className="flex justify-between font-heading text-lg font-bold"><span>Total</span><span>{formatFRW(grandTotal)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
