
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface BulkClientImportProps {
  onAddClient: (client: {
    name: string;
    email: string;
    phone: string;
    package: string;
    price: number;
    regularSlot: string;
    location: string;
    paymentType: string;
    birthday?: string;
  }) => void;
}

const BulkClientImport = ({ onAddClient }: BulkClientImportProps) => {
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const clientsData = [
    {
      name: "Alex Poll",
      email: "apoll@gmx.com",
      phone: "(929) 444-1403",
      location: "Hawthorn Park"
    },
    {
      name: "Amir Shaviv",
      email: "amir@jdcny.org",
      phone: "917-741-3519",
      birthday: "1950-06-08"
    },
    {
      name: "Anne Solomon",
      email: "agksolomon18@gmail.com",
      phone: "(202) 997-7443",
      location: "The Regent",
      birthday: "08-15"
    },
    {
      name: "Barbara Sharp",
      email: "blsharp@me.com",
      phone: "904-504-2587",
      location: "The Encore"
    },
    {
      name: "Beth Brodsky/Shaviv",
      email: "brodsky.beth@gmail.com",
      phone: "(917) 940-3973"
    },
    {
      name: "Bruce Casino",
      email: "bcasino13@gmail.com",
      phone: "9172976699",
      location: "The Encore"
    },
    {
      name: "Charles Wankel",
      email: "wankelc@verizon.net",
      phone: "908-334-7792",
      location: "Hawthorn Park"
    },
    {
      name: "Christina Choi",
      email: "ceng66@gmail.com",
      phone: "(917) 348-0946",
      location: "The Regent"
    },
    {
      name: "Daniel Regan",
      email: "regandp@tcd.ie",
      phone: "9147202555",
      location: "The Regent"
    },
    {
      name: "Eugenia Foxworth",
      email: "eugenia@foxworthrealtyonline.com",
      phone: "(212) 799-8323",
      location: "The Grand Tier",
      birthday: "1969-05-21"
    },
    {
      name: "Frederic Ohringer",
      email: "shadowfo@gmail.com",
      phone: "9702096598",
      birthday: "1963-02-28"
    },
    {
      name: "Jane Krenach",
      email: "marigold7654@gmail.com",
      phone: "(914) 659-1963",
      location: "Hawthorn Park"
    },
    {
      name: "Jeff Soref",
      email: "Jeff@jsoref.com",
      phone: "(917) 623-7661",
      location: "Hawthorn Park"
    },
    {
      name: "Judy Gurland",
      email: "drjudyg@yahoo.com",
      phone: "(917) 270-8478"
    },
    {
      name: "Lesley Hirshberg Miller",
      email: "3lesley@gmail.com",
      phone: "2017878729",
      location: "The Regent"
    },
    {
      name: "Lily Friedman",
      email: "Lilyann3250@yahoo.com",
      phone: "(614) 554-1953",
      location: "The Grand Tier"
    },
    {
      name: "Lisa Revson",
      email: "Lisarevson@gmail.com",
      phone: "9179294206",
      location: "The Regent"
    },
    {
      name: "Lisa Edelmann",
      email: "lisa.edelmann@mssm.edu",
      phone: "17185303412"
    },
    {
      name: "Marilyn Bach",
      email: "marbach78@gmail.com",
      phone: "718-796-8456"
    },
    {
      name: "Mark Roberts",
      email: "drmlroberts@gmail.com",
      phone: "(212) 787-3128"
    },
    {
      name: "Mary Cramer",
      email: "cramer.mary@gmail.com",
      phone: "6174597620",
      location: "The Regent"
    },
    {
      name: "Mary Kocy",
      email: "mlkocy@gmail.com",
      phone: "(917) 843-4710"
    },
    {
      name: "Nicholas Langworth",
      email: "nicholas.langworth@gmail.com",
      phone: "9145224771"
    },
    {
      name: "Racheli Water - Shamir",
      email: "racheliwater14@gmail.com",
      phone: "13109905543"
    },
    {
      name: "Reid Ashinoff",
      email: "reid.ashinoff@dentons.com",
      phone: "9145520070",
      location: "The Encore",
      birthday: "06-06"
    },
    {
      name: "Reid Weppler",
      email: "greidweppler@gmail.com",
      phone: "(703) 638-8321",
      location: "The Regent"
    },
    {
      name: "Rikki Chiba",
      email: "Rikki.chiba@gmail.com",
      phone: "(617) 956-2976",
      location: "Hawthorn Park"
    },
    {
      name: "Sandra Roberts",
      email: "reeseroberts@optimum.net",
      phone: "9179214686",
      birthday: "06-22"
    },
    {
      name: "Scott Church",
      email: "sacldn@gmail.com",
      phone: "3236171982",
      location: "The Encore"
    },
    {
      name: "Tiffany Bakker",
      email: "tiffany.bakker@gmail.com",
      phone: "347-610-3143"
    },
    {
      name: "Winfried Edelmann",
      email: "edelmann@aecom.yu.edu",
      phone: "917-280-6694"
    }
  ];

  const formatBirthday = (birthday: string) => {
    if (!birthday) return undefined;
    
    // Handle MM-DD format
    if (birthday.match(/^\d{2}-\d{2}$/)) {
      const currentYear = new Date().getFullYear();
      return `${currentYear}-${birthday}`;
    }
    
    // Handle YYYY-MM-DD format
    if (birthday.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return birthday;
    }
    
    return undefined;
  };

  const handleBulkImport = async () => {
    setImporting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const clientData of clientsData) {
      try {
        await onAddClient({
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          package: "10x 30MIN Basic",
          price: 120,
          regularSlot: "TBD",
          location: clientData.location || "TBD",
          paymentType: "Cash",
          birthday: formatBirthday(clientData.birthday || "")
        });
        successCount++;
        
        // Add a small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error adding client ${clientData.name}:`, error);
        errorCount++;
      }
    }

    setImporting(false);
    
    toast({
      title: "Bulk Import Complete",
      description: `Successfully imported ${successCount} clients. ${errorCount > 0 ? `${errorCount} clients had errors.` : ''}`,
    });
  };

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="font-semibold text-blue-900 mb-2">Bulk Import Clients</h3>
      <p className="text-sm text-blue-700 mb-4">
        Import all {clientsData.length} clients from your list at once.
      </p>
      <Button 
        onClick={handleBulkImport}
        disabled={importing}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {importing ? "Importing..." : `Import ${clientsData.length} Clients`}
      </Button>
    </div>
  );
};

export default BulkClientImport;
