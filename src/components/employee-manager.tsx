"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Employee } from "@/lib/types";

const initialEmployees: Employee[] = [
  { id: "EMP001", name: "John Doe", role: "Admin", status: "Clocked In" },
  { id: "EMP002", name: "Jane Smith", role: "Cashier", status: "Clocked Out" },
  { id: "EMP003", name: "Peter Jones", role: "Cashier", status: "Clocked In" },
];

export function EmployeeManager() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const handleAddNew = () => {
    setEditingEmployee(null);
    setIsDialogOpen(true);
  };
  
  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    setEditingEmployee(null);
  };

  const toggleClockStatus = (id: string) => {
    setEmployees(employees.map(emp => 
        emp.id === id ? { ...emp, status: emp.status === 'Clocked In' ? 'Clocked Out' : 'Clocked In' } : emp
    ));
  };


  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-bold tracking-tight">Employees</h2>
          <p className="text-muted-foreground">Manage your staff and track attendance.</p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Employee
        </Button>
      </div>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>
                    <Badge variant={employee.status === 'Clocked In' ? 'default' : 'secondary'} className={employee.status === 'Clocked In' ? 'bg-green-600' : ''}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toggleClockStatus(employee.id)}>Toggle Clock Status</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(employee)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" defaultValue={editingEmployee?.name} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Role</Label>
              <Select defaultValue={editingEmployee?.role}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Cashier">Cashier</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
