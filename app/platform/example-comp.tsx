import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React from "react";

interface ExampleCompProps {
  name?: string;
  age?: number;
  birthDate?: Date;
  married?: boolean;
  work?: "developer" | "designer" | "manager";
  children?: React.ReactNode;
}

export const ExampleComp = ({ name, age, birthDate, married, work, children }: ExampleCompProps) => {
  
  return (
    <div className="flex flex-col gap-4 border border-border rounded-md p-4">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Birth Date</TableHead>
          <TableHead>Married</TableHead>
          <TableHead>Work</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
      <TableRow >
              <TableCell>{name ?? "N/A"}</TableCell>
              <TableCell>{age ?? "N/A"}</TableCell>
              <TableCell>{birthDate ? birthDate.toString(): "N/A"}</TableCell>
              <TableCell>{married !== undefined ? married.toString() : "N/A"}</TableCell>
              <TableCell>{work ?? "N/A"}</TableCell>
            </TableRow>
      </TableBody>
    </Table>
    {children && <div className="mt-4 border border-border rounded-md p-4">{children}</div>}
    </div>
  );
};