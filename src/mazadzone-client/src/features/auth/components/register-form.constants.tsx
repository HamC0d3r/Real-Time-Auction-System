import React from "react";
import { User, Mail, Phone, IdCard, Map, MapPin, Building, Navigation } from "lucide-react";
import { MainFieldConfig, AddressFieldConfig } from "../types/auth.types";

export const MAIN_FIELDS: MainFieldConfig[] = [
  {
    id: "fullName",
    label: "Full Name",
    placeholder: "Enter your full name",
    type: "text",
    icon: <User className="h-5 w-5" />,
  },
  {
    id: "email",
    label: "Email",
    placeholder: "Enter your email",
    type: "email",
    icon: <Mail className="h-5 w-5" />,
  },
  {
    id: "password",
    label: "Password",
    placeholder: "Create a password",
    type: "password",
  },
  {
    id: "confirmPassword",
    label: "Confirm Password",
    placeholder: "Confirm your password",
    type: "password",
  },
  {
    id: "phoneNumber",
    label: "Phone Number",
    placeholder: "Enter your phone Number",
    type: "tel",
    icon: <Phone className="h-5 w-5" />,
    maxLength: 10,
    isNumeric: true,
  },
  {
    id: "nationalId",
    label: "National Id",
    placeholder: "Enter your national id",
    type: "text",
    icon: <IdCard className="h-5 w-5" />,
    maxLength: 10,
    isNumeric: true,
  },
];

export const ADDRESS_FIELDS: AddressFieldConfig[] = [
  {
    id: "city",
    label: "City",
    placeholder: "Enter City",
    icon: <Map className="h-5 w-5" />,
  },
  {
    id: "street",
    label: "Street",
    placeholder: "Enter Street",
    icon: <MapPin className="h-5 w-5" />,
  },
  {
    id: "building",
    label: "Building No.",
    placeholder: "Enter Building Number or Name",
    icon: <Building className="h-5 w-5" />,
  },
  {
    id: "landmark",
    label: "Landmark",
    placeholder: "e.g., Near City Mall",
    icon: <Navigation className="h-5 w-5" />,
  },
];
