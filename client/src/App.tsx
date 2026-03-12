/**
 * Project STRIKE — App Router v2.1
 * Routes: / (Landing) → /login → /dashboard → /targets → /sync → /settings
 *         + /subscriptions + /net-worth + /multiplayer + /notifications
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider } from "./contexts/AppContext";
import { PlaidLinkModal } from "./components/PlaidLinkModal";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Targets from "./pages/Targets";
import Sync from "./pages/Sync";
import SettingsPage from "./pages/SettingsPage";
import Subscriptions from "./pages/Subscriptions";
import NetWorth from "./pages/NetWorth";
import Multiplayer from "./pages/Multiplayer";
import Notifications from "./pages/Notifications";
import Spending from "./pages/Spending";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/targets" component={Targets} />
      <Route path="/sync" component={Sync} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/subscriptions" component={Subscriptions} />
      <Route path="/net-worth" component={NetWorth} />
      <Route path="/multiplayer" component={Multiplayer} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/spending" component={Spending} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <PlaidLinkModal />
            <Router />
          </TooltipProvider>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
