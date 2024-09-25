import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface TransactionsProps {
  className?: string;
  data: {
    id: string;
    customer: string;
    email: string;
    amount: number;
  }[];
}

export function Transactions({ data, className }: TransactionsProps) {

  return (
    <Table className={cn(className)}>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>
              <div className="font-medium">{transaction.customer}</div>
              <div className="hidden text-sm text-muted-foreground md:inline">
                {transaction.email}
              </div>
            </TableCell>
            <TableCell>
              <div className="font-medium">${transaction.amount}</div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
