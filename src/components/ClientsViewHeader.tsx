import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Upload, Plus } from "lucide-react";
import AddClientDialog from "./AddClientDialog";
import BulkClientImport from "./BulkClientImport";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { format, parseISO } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface ClientsViewHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  clients: any[];
  onAddClient: (client: any) => void;
  onImportSuccess: () => void;
}

const ClientsViewHeader = ({ 
  searchTerm, 
  setSearchTerm, 
  clients, 
  onAddClient, 
  onImportSuccess 
}: ClientsViewHeaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
            await onAddClient({
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

      onImportSuccess();

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

  if (isMobile) {
    return (
      <div className="space-y-4">
        <BulkClientImport onAddClient={onAddClient} />
        
        {/* Mobile Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Mobile Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
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
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button
            onClick={exportToExcel}
            variant="outline"
            size="sm"
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
            disabled={clients.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        
        {/* Mobile Add Client Button */}
        <div className="flex justify-center">
          <AddClientDialog onAddClient={onAddClient} />
        </div>
      </div>
    );
  }

  // Desktop version - keep existing code
  return (
    <div className="space-y-4">
      <BulkClientImport onAddClient={onAddClient} />
      
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
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
          <AddClientDialog onAddClient={onAddClient} />
        </div>
      </div>
    </div>
  );
};

export default ClientsViewHeader;
