"use client";

import { useEffect, useRef } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function UserSyncTrigger() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const syncUser = useMutation(api.users.syncUser);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !isLoading && !syncedRef.current) {
      syncedRef.current = true;
      let storedLead: { name?: string; whatsapp?: string; tag?: string } = {};
      try {
        const raw = localStorage.getItem("kriativa_prelaunch_lead");
        if (raw) {
          storedLead = JSON.parse(raw);
        }
      } catch {
        // ignore
      }

      syncUser({
        tag: storedLead.tag,
        whatsapp: storedLead.whatsapp,
        nameOverride: storedLead.name,
      }).catch((err) => {
        console.error("Falha ao sincronizar usuário no Convex:", err);
      });
    }
  }, [isAuthenticated, isLoading, syncUser]);

  return null;
}
