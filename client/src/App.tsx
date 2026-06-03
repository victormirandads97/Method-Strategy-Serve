import { Switch, Route } from "wouter";
import Landing from "@/pages/landing";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import LastHumanJobLanding from "@/pages/LastHumanJobLanding";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/last-human-job" component={LastHumanJobLanding} />
    </Switch>
  );
}
