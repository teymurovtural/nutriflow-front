import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Skeleton } from "../../components/ui/skeleton";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getDietitianProfile,
  updateDietitianProfile,
  extractErrorMessage,
  type DietitianProfile,
  type DietitianProfileUpdateRequest,
} from "../../services/dietitianService";

const PHONE_PATTERN = /^\+?[0-9]{9,15}$/;

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  specialization: string;
  password: string;
};

const EMPTY_FORM: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  specialization: "",
  password: "",
};

export default function DietitianProfile() {
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [originalData, setOriginalData] = useState<FormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    setLoading(true);
    getDietitianProfile()
      .then((profile: DietitianProfile) => {
        const loaded: FormData = {
          firstName: profile.firstName ?? "",
          lastName: profile.lastName ?? "",
          email: profile.email ?? "",
          phoneNumber: profile.phoneNumber ?? "",
          specialization: profile.specialization ?? "",
          password: "",
        };
        setFormData(loaded);
        setOriginalData(loaded);
      })
      .catch((err) => toast.error(extractErrorMessage(err, "Failed to load profile.")))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};
    if (formData.phoneNumber && !PHONE_PATTERN.test(formData.phoneNumber)) {
      errors.phoneNumber = "Phone must be 9–15 digits, optionally starting with +.";
    }
    if (formData.password && formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const payload: DietitianProfileUpdateRequest = {};
    if (formData.firstName !== originalData.firstName) payload.firstName = formData.firstName;
    if (formData.lastName !== originalData.lastName) payload.lastName = formData.lastName;
    if (formData.email !== originalData.email) payload.email = formData.email;
    if (formData.phoneNumber !== originalData.phoneNumber) payload.phoneNumber = formData.phoneNumber;
    if (formData.specialization !== originalData.specialization) payload.specialization = formData.specialization;
    if (formData.password) payload.password = formData.password;

    if (Object.keys(payload).length === 0) {
      toast.info("No changes to save.");
      return;
    }

    setSaveLoading(true);
    updateDietitianProfile(payload)
      .then(() => {
        toast.success("Profile updated successfully!");
        setOriginalData({ ...formData, password: "" });
        setFormData((prev) => ({ ...prev, password: "" }));
      })
      .catch((err) => toast.error(extractErrorMessage(err, "Failed to update profile.")))
      .finally(() => setSaveLoading(false));
  };

  if (loading) {
    return (
      <div className="max-w-2xl space-y-6">
        <div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-56 mt-2" />
        </div>
        <Card>
          <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1>Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your professional profile</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
          <CardDescription>Update your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
              type="tel"
              placeholder="+994XXXXXXXXX"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
            />
            {formErrors.phoneNumber && (
              <p className="text-xs text-destructive">{formErrors.phoneNumber}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Specialization</Label>
            <Input
              placeholder="e.g. Clinical Nutrition & Weight Management"
              value={formData.specialization}
              onChange={(e) => handleChange("specialization", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Change Password</Label>
            <Input
              type="password"
              placeholder="Enter new password (min 8 characters)"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />
            {formErrors.password && (
              <p className="text-xs text-destructive">{formErrors.password}</p>
            )}
          </div>
          <Button onClick={handleSave} disabled={saveLoading}>
            {saveLoading ? (
              <><Loader2 className="size-4 mr-2 animate-spin" />Saving...</>
            ) : (
              <><Save className="size-4 mr-2" />Save Changes</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
