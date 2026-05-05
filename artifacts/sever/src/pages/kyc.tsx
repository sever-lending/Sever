import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Upload, CheckCircle2, Clock, AlertCircle, IdCard, Camera } from "lucide-react";

type KycStatus = "none" | "pending" | "approved" | "rejected";

export function KYC() {
  const [status] = useState<KycStatus>("none");
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const steps = [
    { n: 1, label: "Personal Info" },
    { n: 2, label: "Identity Document" },
    { n: 3, label: "Selfie Verification" },
    { n: 4, label: "Review" },
  ];

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted || status === "pending") {
    return (
      <div className="container mx-auto py-16 px-4 max-w-lg text-center space-y-4">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 mb-2">
          <Clock className="h-8 w-8 text-yellow-400" />
        </div>
        <h1 className="text-2xl font-bold">Verification Under Review</h1>
        <p className="text-muted-foreground">Your identity documents have been submitted and are being reviewed. This typically takes 1–2 business days. You'll be notified once verified.</p>
        <Badge variant="outline" className="border-yellow-500/40 text-yellow-400">PENDING REVIEW</Badge>
      </div>
    );
  }

  if (status === "approved") {
    return (
      <div className="container mx-auto py-16 px-4 max-w-lg text-center space-y-4">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 border border-primary/30 mb-2">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Identity Verified</h1>
        <p className="text-muted-foreground">Your identity has been verified. You have full access to all lending and borrowing features.</p>
        <Badge variant="outline" className="border-primary/40 text-primary">VERIFIED</Badge>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="container mx-auto py-16 px-4 max-w-lg text-center space-y-4">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10 border border-destructive/30 mb-2">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Verification Failed</h1>
        <p className="text-muted-foreground">Your verification was unsuccessful. Please resubmit with clearer documents.</p>
        <Button onClick={() => setStep(1)}>Retry Verification</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-2xl space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Identity Verification</h1>
        </div>
        <p className="text-muted-foreground">KYC verification is required to lend or borrow on Sever. This process is secure and takes about 5 minutes.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                step > s.n ? "bg-primary border-primary text-black" : step === s.n ? "border-primary text-primary" : "border-border text-muted-foreground"
              }`}>
                {step > s.n ? <CheckCircle2 className="h-4 w-4" /> : s.n}
              </div>
              <span className={`text-xs hidden md:block ${step === s.n ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`h-0.5 flex-1 mx-1 ${step > s.n ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-xs">Legal First Name</Label><Input placeholder="John" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Legal Last Name</Label><Input placeholder="Smith" /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Date of Birth</Label><Input type="date" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Residential Address</Label><Input placeholder="123 Main St, City, State, ZIP" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Social Security Number (last 4)</Label><Input placeholder="••••" maxLength={4} type="password" /></div>
            <Button className="w-full" onClick={() => setStep(2)}>Continue →</Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><IdCard className="h-4 w-4" />Identity Document</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Upload a clear photo of a government-issued ID. Accepted: Driver's License, State ID, Passport.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors p-6 text-center cursor-pointer space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <div className="text-xs text-muted-foreground">Front of ID</div>
                <Button variant="outline" size="sm" className="text-xs">Upload</Button>
              </div>
              <div className="rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors p-6 text-center cursor-pointer space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <div className="text-xs text-muted-foreground">Back of ID</div>
                <Button variant="outline" size="sm" className="text-xs">Upload</Button>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>← Back</Button>
              <Button className="flex-1" onClick={() => setStep(3)}>Continue →</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Camera className="h-4 w-4" />Selfie Verification</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Take a selfie or upload a recent photo of yourself holding your ID. Make sure your face and the document are clearly visible.</p>
            <div className="rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors p-12 text-center cursor-pointer space-y-3">
              <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Tap to take photo or upload</div>
              <Button variant="outline" size="sm">Upload Selfie</Button>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>← Back</Button>
              <Button className="flex-1" onClick={() => setStep(4)}>Continue →</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Review & Submit</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              {[
                { label: "Personal Info", done: true },
                { label: "Government ID", done: true },
                { label: "Selfie Photo", done: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {item.label} — collected
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
              By submitting, you authorize Sever to verify your identity using the information and documents provided. Your data is encrypted and processed securely.
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>← Back</Button>
              <Button className="flex-1" onClick={handleSubmit}>Submit for Verification</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
