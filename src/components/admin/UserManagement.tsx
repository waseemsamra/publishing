'use client';

import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  UserPlus,
  Filter,
  Download,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlusCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useFirestore } from '@/firebase/provider';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  query,
  where 
} from 'firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const ROLES = [
  { value: 'admin', label: 'Admin', color: 'bg-purple-100 text-purple-800' },
  { value: 'editor', label: 'Editor', color: 'bg-blue-100 text-blue-800' },
  { value: 'viewer', label: 'Viewer', color: 'bg-green-100 text-green-800' },
  { value: 'customer', label: 'Customer', color: 'bg-gray-100 text-gray-800' },
];

const STATUS = [
  { value: 'active', label: 'Active', icon: CheckCircle, color: 'text-green-500' },
  { value: 'inactive', label: 'Inactive', icon: XCircle, color: 'text-red-500' },
  { value: 'pending', label: 'Pending', icon: AlertCircle, color: 'text-yellow-500' },
];

function EditUserDialog({ user, onUpdate, children }: { user: User, onUpdate: (id: string, data: Partial<User>) => void, children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [role, setRole] = useState(user.role);
    const [status, setStatus] = useState(user.status);

    const handleSave = () => {
        onUpdate(user.id, { role, status });
        setIsOpen(false);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>Update the role and status for {user.firstName} {user.lastName}.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={role} onValueChange={(value) => setRole(value as User['role'])}>
                            <SelectTrigger id="role">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={status} onValueChange={(value) => setStatus(value as User['status'])}>
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { user: currentUser, loading: authLoading } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  const fetchUsers = async () => {
    if (!db) {
        console.error("Attempted to fetch users but 'db' is not initialized.");
        setIsLoading(false);
        return;
    }
    try {
      setIsLoading(true);
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            role: data.roles?.includes('admin') ? 'admin' : 'customer',
            status: data.status || 'active',
            createdAt: data.createdAt?.toDate() || new Date(),
          } as User;
      });
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
       toast({
        variant: 'destructive',
        title: 'Error Fetching Users',
        description: 'Could not retrieve user data from the server.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if(!authLoading && db) {
        fetchUsers();
    }
  }, [authLoading, db]);

  const filteredUsers = useMemo(() => users.filter(user => {
    const searchName = `${user.firstName || ''} ${user.lastName || ''}`;
    const matchesSearch = 
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      searchName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  }), [users, searchTerm, roleFilter, statusFilter]);

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    if (!db) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Database not connected.',
      });
      return;
    }
    try {
      const newRoles = updates.role === 'admin' ? ['admin', 'customer'] : ['customer'];
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        roles: newRoles,
        updatedAt: serverTimestamp()
      });
      toast({
        title: 'User Updated',
        description: 'The user details have been successfully updated.',
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
       toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the user details.',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.uid) {
        toast({
            variant: 'destructive',
            title: 'Action Forbidden',
            description: 'You cannot delete your own account.',
        });
        return;
    }
    if (!db) {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'Database not connected.',
      });
      return;
    }
     try {
      await deleteDoc(doc(db, 'users', userId));
      toast({
        title: 'User Deleted',
        description: 'The user has been successfully deleted.',
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'Could not delete the user.',
      });
    }
  }
  
  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };

  const pageLoading = authLoading || isLoading;


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="font-headline text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage all users in the system.</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

       <Card>
        <CardHeader>
           <div className="flex flex-col md:flex-row gap-4 justify-between">
                <Input 
                    placeholder="Search users..." 
                    className="max-w-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex items-center gap-2">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            {ROLES.map(role => <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {STATUS.map(status => <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageLoading ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                   const roleInfo = ROLES.find(r => r.value === user.role);
                   const statusInfo = STATUS.find(s => s.value === user.status);
                   const StatusIcon = statusInfo?.icon;
                  return (
                    <TableRow key={user.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={user.photoURL} />
                                    <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            {roleInfo && <Badge className={`${roleInfo.color} hover:${roleInfo.color}`}>{roleInfo.label}</Badge>}
                        </TableCell>
                        <TableCell>
                           {statusInfo && StatusIcon && (
                             <div className="flex items-center gap-2">
                                <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                                <span className="text-sm">{statusInfo.label}</span>
                             </div>
                           )}
                        </TableCell>
                        <TableCell>
                           {format(new Date(user.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <EditUserDialog user={user} onUpdate={handleUpdateUser}>
                                    <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-left">
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>Edit</span>
                                    </button>
                                </EditUserDialog>
                                <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                )})
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
