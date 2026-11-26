import { lazy, Suspense } from "react";
import { Route, Router, Switch } from "wouter";
import Home from "./pages/Home";

const Builder = lazy(() => import("./pages/Builder"));
const Order = lazy(() => import("./pages/Order"));
const Cart = lazy(() => import("./pages/Cart"));
const Contact = lazy(() => import("./pages/Contact"));
const Owner = lazy(() => import("./pages/owner/Owner"));
const TestCheckout = lazy(() => import("./pages/TestCheckout"));
const Outbox = lazy(() => import("./pages/Outbox"));

function NotFound() {
  return (
    <main className="wrap" style={{ padding: "64px var(--gutter)" }}>
      <h1 className="h2">That page has wandered off.</h1>
      <p style={{ marginTop: 12 }}><a href="/books/">Back to Little Plot Books</a></p>
    </main>
  );
}

export default function App() {
  return (
    <Router base="/books">
      <Suspense fallback={<p className="wrap" style={{ padding: 24 }} aria-live="polite">Loading…</p>}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/create" component={Builder} />
          <Route path="/order/:key" component={Order} />
          <Route path="/cart" component={Cart} />
          <Route path="/contact" component={Contact} />
          <Route path="/owner" component={Owner} />
          <Route path="/owner/*" component={Owner} />
          <Route path="/test-checkout/:key" component={TestCheckout} />
          <Route path="/dev/outbox" component={Outbox} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Router>
  );
}
