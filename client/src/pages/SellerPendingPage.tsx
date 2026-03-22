import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, Mail, Store } from 'lucide-react';

const SellerPendingPage = () => {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
          <Clock className="h-8 w-8 text-yellow-600" />
        </div>
        
        <h1 className="font-heading text-2xl font-bold mb-4">Account Pending Approval</h1>
        
        <p className="text-muted-foreground mb-6">
          Your seller account is currently under review by our admin team. 
          You'll receive an email once your account is approved.
        </p>

        <div className="rounded-lg border border-border bg-card p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            <Store className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">What happens next?</h3>
          <ul className="text-sm text-muted-foreground text-left space-y-2">
            <li>• Admin team reviews your store information</li>
            <li>• Verification process typically takes 1-2 business days</li>
            <li>• You'll receive an approval email</li>
            <li>• Then you can access your seller dashboard</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link to="/login">Check Status</Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link to="/">
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Need help? Email us at support@marktora.com
        </p>
      </div>
    </div>
  );
};

export default SellerPendingPage;
