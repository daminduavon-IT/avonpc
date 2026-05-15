import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FlaskConical, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center">
            <FlaskConical className="h-12 w-12 text-muted-foreground/30" />
          </div>
        </div>
        <h1 className="text-7xl font-black text-foreground mb-2">404</h1>
        <h2 className="text-xl font-bold text-foreground mb-3">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button variant="accent" className="gap-2 w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Search className="h-4 w-4" /> Browse Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
