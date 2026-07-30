import { Suspense } from "react";
import TradesContent from "./TradesContent";

export default function TradesPage() {
  return (
    <Suspense fallback={<div>Loading trades...</div>}>
      <TradesContent />
    </Suspense>
  );
}