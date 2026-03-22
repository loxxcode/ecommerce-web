import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center animate-fade-in">
    <span className="text-8xl font-heading font-bold text-gradient-primary">404</span>
    <h1 className="mt-4 font-heading text-2xl font-bold">Page Not Found</h1>
    <p className="mt-2 max-w-md text-muted-foreground">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link to="/">
      <Button className="mt-6 gap-2 rounded-full bg-gradient-hero hover:opacity-90">
        <Home size={16} /> Back to Home
      </Button>
    </Link>
  </div>
);

export default NotFound;
