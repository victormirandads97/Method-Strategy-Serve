import { Switch, Route } from "wouter";
import Landing from "@/pages/landing";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
    </Switch>
  );
}
