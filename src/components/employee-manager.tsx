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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { PlusCircle, MoreHorizontal, CalendarIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Employee } from "@/lib/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const initialEmployees: Employee[] = [
  { id: "EMP001", name: "John Doe", role: "Admin", status: "Clocked In", email: "john.doe@example.com", phone: "0712345678", dateJoined: "2023-01-15" },
  { id: "EMP002", name: "Jane Smith", role: "Manager", status: "Clocked Out", email: "jane.smith@example.com", phone: "0723456789", dateJoined: "2022-05-20" },
  { id: "EMP003", name: "Peter Jones", role: "Cashier", status: "Clocked In", email: "peter.jones@example.com", phone: "0734567890", dateJoined: "2023-08-01" },
  { id: "EMP004", name: "Maryanne Bee", role: "Support Staff", status: "On Leave", email: "maryanne.bee@example.com", phone: "0745678901", dateJoined: "2024-02-10" },
];

export function EmployeeManager() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Partial<Employee> | null>(null);
  const [date, setDate] = useState<Date>()

  const handleAddNew = () => {
    setEditingEmployee({});
    setIsDialogOpen(true);
  };
  
  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setDate(new Date(employee.dateJoined));
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    // In a real app, you would handle form submission logic here
    setIsDialogOpen(false);
    setEditingEmployee(null);
  };

  const toggleClockStatus = (id: string) => {
    setEmployees(employees.map(emp => 
        emp.id === id ? { ...emp, status: emp.status === 'Clocked In' ? 'Clocked Out' : 'Clocked In' } : emp
    ));
  };
  
  const getStatusBadgeVariant = (status: Employee['status']) => {
    switch (status) {
      case 'Clocked In': return 'bg-emerald-600 text-emerald-50 hover:bg-emerald-600/80';
      case 'On Leave': return 'bg-blue-500 text-blue-50 hover:bg-blue-500/80';
      default: return 'secondary';
    }
  }


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
                <TableHead>Contact</TableHead>
                <TableHead>Date Joined</TableHead>
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
                      <div className="text-sm">{employee.email}</div>
                      <div className="text-xs text-muted-foreground">{employee.phone}</div>
                    </TableCell>
                  <TableCell>{format(new Date(employee.dateJoined), "PPP")}</TableCell>
                  <TableCell>
                    <Badge variant={'default'} className={getStatusBadgeVariant(employee.status)}>
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
            <DialogTitle className="font-headline">{editingEmployee?.id ? "Edit Employee" : "Add New Employee"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" defaultValue={editingEmployee?.name} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" type="email" defaultValue={editingEmployee?.email} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Phone</Label>
              <Input id="phone" defaultValue={editingEmployee?.phone} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Role</Label>
              <Select defaultValue={editingEmployee?.role}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Cashier">Cashier</SelectItem>
                  <SelectItem value="Support Staff">Support Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="dateJoined" className="text-right">Date Joined</Label>
               <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
