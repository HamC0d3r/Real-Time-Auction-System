export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "right" | "left" | "center";
}

export interface DropdownItem {
  label: string;
  className: string;
}

export const MODERATE_USER_COLUMNS: TableColumn[] = [
  { key: "user", label: "User" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "status", label: "Account Status" },
  { key: "joinedDate", label: "Joined Date", sortable: true },
  { key: "lastActive", label: "Last Active" },
  { key: "actions", label: "Actions", align: "center" },
];

export const PAGE_SIZE_OPTIONS: number[] = [10, 15, 25, 50];

export const DROPDOWN_ITEMS: DropdownItem[] = [
  { label: "Edit Details", className: "" },
  { label: "Send Email", className: "" },
  { label: "Delete User", className: "text-destructive focus:text-destructive" },
];
