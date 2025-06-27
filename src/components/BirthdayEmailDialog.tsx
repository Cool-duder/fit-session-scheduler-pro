
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Gift, Send, Sparkles } from 'lucide-react';
import { Client } from '@/hooks/useClients';

interface BirthdayEmailDialogProps {
  client: Client;
  trigger?: React.ReactNode;
}

const BirthdayEmailDialog = ({ client, trigger }: BirthdayEmailDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [emailData, setEmailData] = useState({
    subject: `🎉 Happy Birthday ${client.name}! 🎂`,
    message: `Dear ${client.name},\n\nWishing you a fantastic birthday filled with joy, laughter, and all your favorite things!\n\nThank you for being such an amazing client. Here's to another year of achieving your fitness goals together!\n\nHave a wonderful celebration!\n\nBest wishes,\nYour Training Team`,
    cardStyle: 'celebration'
  });

  const cardStyles = {
    celebration: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      title: '🎉 Happy Birthday! 🎂',
      emoji: '🎈🎁🎊'
    },
    fitness: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      title: '💪 Birthday Strength! 🏋️‍♀️',
      emoji: '💪🏃‍♀️⭐'
    },
    elegant: {
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      title: '✨ Special Day ✨',
      emoji: '🌟💎🦋'
    }
  };

  const handleSendEmail = async () => {
    try {
      setLoading(true);
      
      const selectedStyle = cardStyles[emailData.cardStyle as keyof typeof cardStyles];
      
      // Create HTML email with birthday card
      const birthdayCardHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${selectedStyle.background}; padding: 40px; border-radius: 15px; text-align: center; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <h1 style="color: white; font-size: 36px; margin: 0 0 20px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
              ${selectedStyle.title}
            </h1>
            <div style="font-size: 48px; margin: 20px 0;">
              ${selectedStyle.emoji}
            </div>
            <h2 style="color: white; font-size: 28px; margin: 20px 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">
              ${client.name}
            </h2>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
            <div style="white-space: pre-line; font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 30px;">
              ${emailData.message}
            </div>
            
            <div style="text-align: center; padding-top: 20px; border-top: 2px solid #f0f0f0;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                Sent with 💜 from your training team
              </p>
            </div>
          </div>
        </div>
      `;

      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: client.email,
          subject: emailData.subject,
          message: birthdayCardHtml,
          clientName: client.name,
          isHtml: true
        }
      });

      if (error) throw error;

      toast({
        title: "Birthday Email Sent! 🎉",
        description: `Birthday wishes sent to ${client.name}`,
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Error sending birthday email:', error);
      toast({
        title: "Error",
        description: "Failed to send birthday email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
            <Gift className="w-4 h-4 mr-2" />
            Send Birthday Wishes
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500" />
            Send Birthday Email to {client.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={emailData.subject}
                onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                placeholder="Birthday email subject"
              />
            </div>
            
            <div>
              <Label htmlFor="cardStyle">Birthday Card Style</Label>
              <Select value={emailData.cardStyle} onValueChange={(value) => setEmailData({...emailData, cardStyle: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose card style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="celebration">🎉 Celebration Style</SelectItem>
                  <SelectItem value="fitness">💪 Fitness Theme</SelectItem>
                  <SelectItem value="elegant">✨ Elegant Style</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="message">Personal Message</Label>
              <Textarea
                id="message"
                value={emailData.message}
                onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                placeholder="Write a personal birthday message..."
                rows={8}
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleSendEmail} 
                disabled={loading}
                className="bg-pink-500 hover:bg-pink-600"
              >
                {loading ? 'Sending...' : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Birthday Email
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
          
          {/* Email Preview */}
          <div className="space-y-4">
            <h3 className="font-semibold">Email Preview</h3>
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="p-4">
                <div 
                  className="rounded-lg p-6 text-center text-white mb-4"
                  style={{ 
                    background: cardStyles[emailData.cardStyle as keyof typeof cardStyles].background,
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <h2 className="text-2xl font-bold mb-3 text-shadow">
                    {cardStyles[emailData.cardStyle as keyof typeof cardStyles].title}
                  </h2>
                  <div className="text-3xl mb-3">
                    {cardStyles[emailData.cardStyle as keyof typeof cardStyles].emoji}
                  </div>
                  <h3 className="text-xl font-semibold">
                    {client.name}
                  </h3>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {emailData.message.length > 150 
                      ? emailData.message.substring(0, 150) + '...' 
                      : emailData.message
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BirthdayEmailDialog;
