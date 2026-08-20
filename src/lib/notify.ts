// src/lib/notify.ts
import { toast } from 'sonner';

export function createNotifier(t: (key: string) => string){
    return {
    connectionLost: () => toast.error(t("system.connection_lost")),
    connectionBack: () => toast.success(t("system.connection_back")),
    ServerError: () => toast.error(t("system.server_error")),
    actionError: () => toast.error(t("system.action_error")),
    };
}