import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="container mx-auto py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-foreground/70">
        <p>Powered by AI • Fashion Photography Expert System</p>
        <nav className="flex items-center gap-4">
          <Link to="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link to="/support" className="hover:text-foreground">
            Support
          </Link>
        </nav>
      </div>
    </footer>
  );
}
