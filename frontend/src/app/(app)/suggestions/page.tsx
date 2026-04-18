import { redirect } from "next/navigation";

import { NAV_ROUTES } from "@/lib/constants";

export default function SuggestionsRedirectPage() {
  redirect(NAV_ROUTES.SUGGESTIONS);
}
