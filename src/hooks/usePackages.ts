
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

export type Package = {
  id: string
  name: string
  sessions: number
  duration: number // in minutes (30 or 60)
  price: number
  type: '30MIN' | '60MIN'
}

export const usePackages = () => {
  const [packages, setPackages] = useState<Package[]>([
    { id: '1', name: '1x (30MIN)', sessions: 1, duration: 30, price: 80, type: '30MIN' },
    { id: '2', name: '5x PK 30MIN', sessions: 5, duration: 30, price: 400, type: '30MIN' },
    { id: '3', name: '10x PK 30MIN', sessions: 10, duration: 30, price: 800, type: '30MIN' },
    { id: '4', name: '1x (60MIN)', sessions: 1, duration: 60, price: 120, type: '60MIN' },
    { id: '5', name: '5x PK 60MIN', sessions: 5, duration: 60, price: 600, type: '60MIN' },
    { id: '6', name: '10x PK 60MIN', sessions: 10, duration: 60, price: 1200, type: '60MIN' }
  ])
  const { toast } = useToast()

  const addPackage = (packageData: {
    name: string
    sessions: number
    duration: number
    price: number
  }) => {
    const newPackage: Package = {
      id: Date.now().toString(),
      name: packageData.name,
      sessions: packageData.sessions,
      duration: packageData.duration,
      price: packageData.price,
      type: packageData.duration === 30 ? '30MIN' : '60MIN'
    }
    
    setPackages(prev => [...prev, newPackage])
    toast({
      title: "Success",
      description: "Package created successfully",
    })
  }

  const editPackage = (packageId: string, updatedData: {
    name: string
    sessions: number
    duration: number
    price: number
  }) => {
    setPackages(prev => prev.map(pkg => 
      pkg.id === packageId 
        ? { 
            ...pkg, 
            ...updatedData, 
            type: updatedData.duration === 30 ? '30MIN' : '60MIN' 
          }
        : pkg
    ))
    
    toast({
      title: "Success",
      description: "Package updated successfully",
    })
  }

  const deletePackage = (packageId: string) => {
    setPackages(prev => prev.filter(pkg => pkg.id !== packageId))
    toast({
      title: "Success",
      description: "Package deleted successfully",
    })
  }

  return { packages, addPackage, editPackage, deletePackage }
}
