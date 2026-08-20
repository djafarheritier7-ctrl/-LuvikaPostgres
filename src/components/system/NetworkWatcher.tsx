// src/components/system/NetworkWatcher.tsx
'use client';

import { useTranslations } from "next-intl";
import { useNetworkStatus } from "../../../src/hooks/useNetworkStatus";
import { toast } from 'sonner';
import { useEffect, useRef } from "react";

export function NetworkWatcher() {
  const t = useTranslations();
  const online = useNetworkStatus();
  const prevStatus = useRef<boolean | null>(null);
  const toastId = 'network-status-toast';

  useEffect(() => {
    // Ne rien afficher au premier rendu; n'afficher que sur changement réel
    if (prevStatus.current === null) {
      prevStatus.current = online;
      return;
    }

    if (online !== prevStatus.current) {
      // Ferme le toast précédent et remplace par un unique toast (même id)
      toast.dismiss(toastId);

      if (!online) {
        toast.error(t('system.connection_lost'), { id: toastId, duration: Infinity });
      } else {
        toast.success(t('system.connection_back'), { id: toastId, duration: 9000 });
      }

      prevStatus.current = online;
    }
  }, [online, t]);

  return null;
}