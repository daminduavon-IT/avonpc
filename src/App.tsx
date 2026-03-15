import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QuoteProvider } from "@/context/QuoteContext";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteDrawer from "@/components/QuoteDrawer";
import AdminLayout from "@/components/AdminLayout";

import Index from "./pages/Index";
import About from "./pages/About";
import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import Brands from "./pages/Brands";
import Industries from "./pages/Industries";
import Contact from "./pages/Contact";
import RequestQuote from "./pages/RequestQuote";
import Quality from "./pages/Quality";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyAccount from "./pages/MyAccount";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Sitemap from "./pages/Sitemap";
import NotFound from "./pages/NotFound";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminBrands from "./pages/admin/AdminBrands";
import AdminQuotes from "./pages/admin/AdminQuotes";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminContent from "./pages/admin/AdminContent";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const WebsiteLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Header />
    <main className="min-h-[60vh]">{children}</main>
    <Footer />
    <QuoteDrawer />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <SettingsProvider>
          <QuoteProvider>
            <BrowserRouter>
              <Routes>
                {/* Admin routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="brands" element={<AdminBrands />} />
                  <Route path="quotes" element={<AdminQuotes />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="media" element={<AdminMedia />} />
                  <Route path="content" element={<AdminContent />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Website routes */}
                <Route path="/" element={<WebsiteLayout><Index /></WebsiteLayout>} />
                <Route path="/about" element={<WebsiteLayout><About /></WebsiteLayout>} />
                <Route path="/products" element={<WebsiteLayout><ProductListing /></WebsiteLayout>} />
                <Route path="/products/:category" element={<WebsiteLayout><ProductListing /></WebsiteLayout>} />
                <Route path="/product/:slug" element={<WebsiteLayout><ProductDetail /></WebsiteLayout>} />
                <Route path="/brands" element={<WebsiteLayout><Brands /></WebsiteLayout>} />
                <Route path="/industries" element={<WebsiteLayout><Industries /></WebsiteLayout>} />
                <Route path="/contact" element={<WebsiteLayout><Contact /></WebsiteLayout>} />
                <Route path="/request-quote" element={<WebsiteLayout><RequestQuote /></WebsiteLayout>} />
                <Route path="/quality" element={<WebsiteLayout><Quality /></WebsiteLayout>} />
                <Route path="/login" element={<WebsiteLayout><Login /></WebsiteLayout>} />
                <Route path="/register" element={<WebsiteLayout><Register /></WebsiteLayout>} />
                <Route path="/my-account" element={<WebsiteLayout><MyAccount /></WebsiteLayout>} />
                <Route path="/privacy-policy" element={<WebsiteLayout><PrivacyPolicy /></WebsiteLayout>} />
                <Route path="/terms" element={<WebsiteLayout><Terms /></WebsiteLayout>} />
                <Route path="/sitemap" element={<WebsiteLayout><Sitemap /></WebsiteLayout>} />
                <Route path="*" element={<WebsiteLayout><NotFound /></WebsiteLayout>} />
              </Routes>
            </BrowserRouter>
          </QuoteProvider>
        </SettingsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
