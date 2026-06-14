import { RegisterFormValues } from "../validations/register.schema";

export interface MainFieldConfig {
  id: keyof RegisterFormValues;
  label: string;
  placeholder: string;
  type: "text" | "email" | "password" | "tel";
  icon?: React.ReactNode;
  maxLength?: number;
  isNumeric?: boolean;
}

export interface AddressFieldConfig {
  id: keyof RegisterFormValues;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
}
