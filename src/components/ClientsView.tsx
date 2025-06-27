import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, Phone, Mail, Calendar, Package, Trash2, Gift, Users, Download, Upload } from "lucide-react";
import AddClientDialog from "./AddClientDialog";
import EditClientDialog from "./EditClientDialog";
import PaymentStatusBadge from "./PaymentStatusBadge";
import BirthdayEmailDialog from "./BirthdayEmailDialog";
import { useClients } from "@/hooks/useClients";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

const ClientsView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clients, loading, addClient, editClient, deleteClient } = useClients();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  console.log("ClientsView rendered - clients:", clients, "loading:", loading);

  const exportToExcel = () => {
    const exportData = clients.map(client => ({
      'Name': client.name,
      'Email': client.email,
      'Phone': client.phone,
      'Package': client.package,
      'Price': `$${client.price || 120}`,
      'Sessions Left': client.sessions_left,
      'Total Sessions': client.total_sessions,
      'Monthly Count': client.monthly_count,
      'Regular Slot': client.regular_slot,
      'Location': client.location || 'TBD',
      'Payment Type': client.payment_type || 'Cash',
      'Join Date': client.join_date,
      'Birthday': client.birthday ? format(parseISO(client.birthday), 'yyyy-MM-dd') : 'Not set'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');

    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = colWidths;

    // Generate filename with current date
    const filename = `clients_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    
    XLSX.writeFile(workbook, filename);
  };

  const importFromExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let successCount = 0;
      let errorCount = 0;

      for (const row of jsonData) {
        try {
          const rowData = row as any;
          
          // Extract data from various possible column names
          const name = rowData.Name || rowData.name || rowData['Full Name'] || '';
          const email = rowData.Email || rowData.email || '';
          const phone = rowData.Phone || rowData.phone || rowData.M || rowData['Phone Number'] || '';
          const location = rowData.Location || rowData.location || 'TBD';
          let birthday = rowData.Birthday || rowData.birthday || rowData['Birth Date'] || '';
          
          // Parse birthday if it's in MM-DD format or other formats
          if (birthday) {
            if (birthday.toString().includes('/')) {
              // Handle MM/DD/YY or MM/DD/YYYY format
              const parts = birthday.toString().split('/');
              if (parts.length >= 2) {
                const month = parts[0].padStart(2, '0');
                const day = parts[1].padStart(2, '0');
                const year = parts[2] ? (parts[2].length === 2 ? `20${parts[2]}` : parts[2]) : new Date().getFullYear();
                birthday = `${year}-${month}-${day}`;
              }
            } else if (birthday.toString().includes('-') && birthday.toString().length <= 5) {
              // Handle MM-DD format
              const currentYear = new Date().getFullYear();
              birthday = `${currentYear}-${birthday}`;
            }
          }

          if (name && email) {
            await addClient({
              name: name.toString().trim(),
              email: email.toString().trim(),
              phone: phone.toString().trim(),
              package: rowData.Package || rowData.package || '10x 30MIN Basic',
              price: Number(rowData.Price?.toString().replace('$', '')) || 120,
              regularSlot: rowData['Regular Slot'] || rowData.regularSlot || 'TBD',
              location: location.toString().trim(),
              paymentType: rowData['Payment Type'] || rowData.paymentType || 'Cash',
              birthday: birthday || undefined
            });
            successCount++;
          } else {
            console.warn('Skipping row due to missing name or email:', rowData);
            errorCount++;
          }
        } catch (error) {
          console.error('Error importing row:', error);
          errorCount++;
        }
      }

      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} clients. ${errorCount > 0 ? `${errorCount} rows had errors.` : ''}`,
      });

    } catch (error) {
      console.error('Error reading Excel file:', error);
      toast({
        title: "Import Failed",
        description: "Failed to read the Excel file. Please check the format and try again.",
        variant: "destructive",
      });
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddClient = (newClient: {
    name: string;
    email: string;
    phone: string;
    package: string;
    price: number;
    regularSlot: string;
    location: string;
    paymentType: string;
    birthday?: string;
  }) => {
    addClient(newClient);
  };

  const handleEditClient = (clientId: string, updatedData: {
    name: string;
    email: string;
    phone: string;
    package: string;
    price: number;
    regularSlot: string;
    location: string;
    paymentType: string;
    birthday?: string;
  }) => {
    editClient(clientId, updatedData);
  };

  const handleDeleteClient = (clientId: string, clientName: string) => {
    deleteClient(clientId, clientName);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading clients...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900">Client Management</CardTitle>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={importFromExcel}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import from Excel
              </Button>
              <Button
                onClick={exportToExcel}
                variant="outline"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                disabled={clients.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export to Excel
              </Button>
              <AddClientDialog onAddClient={handleAddClient} />
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {clients.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No clients added yet</p>
              <p className="text-sm text-gray-400">Add your first client to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <Card key={client.id} className="hover:shadow-md transition-shadow border border-gray-100">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-6">
                      {/* Left section - Avatar and basic info */}
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm flex-shrink-0">
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="space-y-3 flex-1 min-w-0">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{client.name}</h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{client.email}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4 flex-shrink-0" />
                                <span>{client.phone}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="w-4 h-4 flex-shrink-0" />
                              <span>Regular slot: {client.regular_slot}</span>
                            </div>
                            {client.birthday && (
                              <div className="flex items-center gap-1 text-sm text-pink-600">
                                <Gift className="w-4 h-4 flex-shrink-0" />
                                <span>Birthday: {format(parseISO(client.birthday), 'MMM dd, yyyy')}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <PaymentStatusBadge 
                              status="completed" 
                              paymentType={client.payment_type || 'Cash'} 
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Right section - Package info and actions */}
                      <div className="flex items-start gap-4">
                        <div className="text-right space-y-3">
                          <Badge 
                            variant={client.package.includes('60MIN Premium') ? 'default' : 'secondary'}
                            className="mb-2"
                          >
                            <Package className="w-3 h-3 mr-1" />
                            {client.package}
                          </Badge>
                          
                          <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-4 text-right">
                              <span className="text-gray-600">Sessions left:</span>
                              <span className="font-medium">{client.sessions_left}/{client.total_sessions}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-right">
                              <span className="text-gray-600">This month:</span>
                              <span className="font-medium text-blue-600">{client.monthly_count}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-right">
                              <span className="text-gray-600">Package price:</span>
                              <span className="font-medium text-green-600">${client.price || 120}</span>
                            </div>
                          </div>
                          
                          <div className="w-32">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all" 
                                style={{ 
                                  width: `${((client.total_sessions - client.sessions_left) / client.total_sessions) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-1">
                            <EditClientDialog client={client} onEditClient={handleEditClient} />
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Client</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {client.name}? This will also delete all their scheduled sessions. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteClient(client.id, client.name)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                          
                          {client.birthday && (
                            <BirthdayEmailDialog 
                              client={client} 
                              trigger={
                                <Button 
                                  size="sm" 
                                  className="bg-pink-500 hover:bg-pink-600 text-xs px-2 py-1 h-8"
                                >
                                  <Gift className="w-3 h-3 mr-1" />
                                  Birthday
                                </Button>
                              }
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientsView;
